import { codeFrameColumns } from "@babel/code-frame";
import * as Fluent from "@fluent/syntax";
import * as MessageFormat from "@formatjs/icu-messageformat-parser";
import {
  CodegenTypes,
  LocaleGenerator,
  MainGenerator,
  MainTypesGenerator,
  ReactGenerator,
  ReactTypesGenerator,
} from "./codegen";
import { CodegenError, ErrorContext, ErrorId, ErrorLocation, ERROR_CLASSES } from "./errors";
import { createFakePattern } from "./fake-pattern";
import { Locale } from "./locale";
import { Message } from "./message";
import { LocaleId, MessageId, ParamId, Params, ParamType, TypeDefs, validateMessageId } from "./types";
import { validateCollection, validateParams } from "./validation";

export const templateId = "template" as LocaleId;

// a "real" parser would be nice, but I will take my chances with
// regexp for now…
const PARAM_RE = /^\s*\$(\w+)(\s+\((\w+)\))?/gm;
function parseFluentParams(comment: string): Params {
  const params: Params = new Map();

  let matches;
  while ((matches = PARAM_RE.exec(comment)) !== null) {
    const name = matches[1] as ParamId;
    const type = matches[3] as ParamType;
    params.set(name, { name, type });
  }

  return params;
}

interface File {
  path: string;
  content: string;
}

export interface GenerateResult {
  files: Array<File>;
  errors: Array<CodegenError>;
}

export interface CodegenOptions {
  fallbackLocale?: string;
}

/**
 * A `Bundle` is a collection of multiple locales and their messages.
 */
export class Bundle {
  public typeDefs: TypeDefs = new Map();
  public errors: Array<CodegenError> = [];
  public locales = new Map<LocaleId, Locale>([[templateId, new Locale(templateId)]]);
  private codeFrame?: typeof codeFrameColumns;

  constructor(public options: CodegenOptions) {}

  public skipTemplate(locale: LocaleId) {
    const { fallbackLocale } = this.options;
    return locale === templateId && fallbackLocale && fallbackLocale !== templateId;
  }

  public addType(name: ParamType, variants: Array<string>) {
    // TODO: error on duplicate definition?
    this.typeDefs.set(name, variants);
    return this;
  }

  public addFluentMessages(locale: LocaleId, sourceText: string) {
    const { messages } = this.getLocale(locale);

    const ast = Fluent.parse(sourceText, { withSpans: true });

    for (const node of ast.body) {
      if (node.type === "Message") {
        const id = validateMessageId(node.id.name);
        if (id) {
          const params = parseFluentParams(node.comment ? node.comment.content : "");

          const msg = new Message(locale, id, params).withParseResult(sourceText, node);
          messages.set(id, msg);
        } else {
          this.raiseError("reserved-id", `Message \`${node.id.name}\` is reserved for internal use`, {
            localeId: locale,
            messageId: id,
          });
        }
        for (const attr of node.attributes) {
          this.raiseError(
            "unsupported-syntax",
            `Fluent \`${attr.type}\` is not yet supported.`,
            { localeId: locale, messageId: node.id.name },
            { sourceText, node: attr },
          );
        }
      } else if (node.type === "Comment") {
      } else if (node.type === "Junk") {
        const annotation = node.annotations[0];
        this.raiseError(
          "parse-error",
          `${annotation.code}: ${annotation.message}`,
          { localeId: locale },
          { sourceText, node: annotation },
        );
      } else {
        this.raiseError(
          "unsupported-syntax",
          `Fluent \`${node.type}\` is not yet supported.`,
          { localeId: locale },
          { sourceText, node },
        );
      }
    }

    return this;
  }

  public addMessageFormat(locale: LocaleId, id: MessageId, sourceText: string, params?: Params) {
    let msg: Message;
    try {
      const ast = MessageFormat.parse(sourceText, { captureLocation: true });
      msg = new Message(locale, id, params).withParseResult(sourceText, ast);
    } catch (error) {
      this.raiseError("parse-error", error.message, { localeId: locale, messageId: id }, { sourceText, node: error });

      // put in the message anyway, but only its id
      msg = new Message(locale, id, params).withParseResult(id, createFakePattern(id));
    }
    this.getLocale(locale).messages.set(id, msg);

    return this;
  }

  public getLocale(locale: LocaleId) {
    let localeDef = this.locales.get(locale);
    if (!localeDef) {
      localeDef = new Locale(locale);
      this.locales.set(locale, localeDef);
    }
    return localeDef;
  }

  public async generate(output: Set<CodegenTypes>, sep: string): Promise<GenerateResult> {
    this.codeFrame = await import("@babel/code-frame").then(
      m => m.codeFrameColumns,
      () => undefined,
    );

    // run some validation
    validateCollection(this);
    validateParams(this);

    // lower all the messages to IR
    for (const locale of this.locales.values()) {
      if (this.skipTemplate(locale.locale)) {
        continue;
      }

      for (const msg of locale.messages.values()) {
        msg.lower(this);
      }
    }

    const files: Array<File> = [];

    if (output.has(CodegenTypes.Js)) {
      // generate all the locale definitions
      for (const locale of this.locales.values()) {
        if (this.skipTemplate(locale.locale)) {
          continue;
        }
        const content = new LocaleGenerator(locale).generate();

        files.push({
          path: `locales${sep}${locale.locale}.js`,
          content,
        });
      }

      // generate the main entry file
      files.push({
        path: `index.js`,
        content: new MainGenerator(this).generate(),
      });
      files.push({
        path: `index.d.ts`,
        content: new MainTypesGenerator(this).generate(),
      });
    }

    // generate react types
    if (output.has(CodegenTypes.React)) {
      files.push({
        path: `react.js`,
        content: new ReactGenerator(this).generate(),
      });
      files.push({
        path: `react.d.ts`,
        content: new ReactTypesGenerator(this).generate(),
      });
    }

    return {
      files,
      errors: this.errors,
    };
  }

  public raiseError(id: ErrorId, msg: string, context: ErrorContext, loc?: ErrorLocation) {
    const Klass = ERROR_CLASSES[id];
    let ctx = [context.localeId, context.messageId].filter(Boolean).join("/");
    ctx = ctx ? ": " + ctx : "";
    const error = new Klass(`[${id}${ctx}]: ${msg}`) as CodegenError;
    error.id = id;
    error.context = context;
    let location: Range;
    if (loc && loc.node) {
      if ("location" in loc.node) {
        location = loc.node.location as Range;
      } else {
        const span = (loc.node as any).span as Fluent.Span;
        location = {
          start: getLineCol(loc.sourceText, span.start),
          end: getLineCol(loc.sourceText, span.end),
        };
      }
    }
    error.getFormattedMessage = () => {
      let msg = error.message;
      if (this.codeFrame && loc) {
        msg += "\n";
        msg += this.codeFrame(loc.sourceText, location);
      }
      return msg;
    };

    this.errors.push(error);
  }
}

interface Location {
  line: number;
  column: number;
}
interface Range {
  start: Location;
  end: Location;
}

function getLineCol(sourceText: string, offset: number) {
  const lines = sourceText.split("\n");
  let idx = 0,
    line: string;
  for ([idx, line] of lines.entries()) {
    if (line.length + 1 <= offset) {
      offset -= line.length + 1;
    } else {
      break;
    }
  }
  return { line: idx + 1, column: offset + 1 };
}
