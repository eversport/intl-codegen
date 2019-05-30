import * as Fluent from "fluent-syntax";
import MessageFormat from "intl-messageformat-parser";
import { LocaleGenerator, MainGenerator, MainTypesGenerator } from "./codegen";
import { Locale } from "./locale";
import { Message } from "./message";
import { LocaleId, MessageId, ParamId, Params, ParamType, TypeDefs, validateMessageId } from "./types";
import { validateCollection, validateParams } from "./validation";
import { CodegenError, ErrorId } from "./errors";

export const templateId = "template" as LocaleId;

// a "real" parser would be nice, but I will take my chances with
// regexp for now…
const PARAM_RE = /^\s*\$(\w+)(\s+\((\w+)\))?/g;
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
  errors: Array<any>;
}

/**
 * A `Bundle` is a collection of multiple locales and their messages.
 */
export class Bundle {
  public typeDefs: TypeDefs = new Map();
  public errors: Array<CodegenError> = [];
  public locales = new Map<LocaleId, Locale>([[templateId, new Locale(templateId)]]);

  public addType(name: ParamType, variants: Array<string>) {
    // TODO: error on duplicate definition?
    this.typeDefs.set(name, variants);
    return this;
  }

  public addFluentMessages(locale: LocaleId, sourceText: string) {
    const { messages } = this.getLocale(locale);

    const ast = Fluent.parse(sourceText);

    for (const node of ast.body) {
      if (node.type === "Message") {
        try {
          const id = validateMessageId(node.id.name);
          const params = parseFluentParams(node.comment ? node.comment.content : "");

          const msg = new Message(locale, id, params).withParseResult(sourceText, node);
          messages.set(id, msg);
        } catch (error) {
          // TODO: report invalid id error?
        }
      } else if (node.type === "Comment") {
      } else {
        // TODO: report parse error
      }
    }

    return this;
  }

  public addMessageFormat(locale: LocaleId, id: MessageId, sourceText: string, params?: Params) {
    try {
      const ast = MessageFormat.parse(sourceText);
      const msg = new Message(locale, id, params).withParseResult(sourceText, ast);
      this.getLocale(locale).messages.set(id, msg);
    } catch (error) {
      this.raiseSyntaxError("parse-error", error.message);
    }

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

  public async generate(sep: string): Promise<GenerateResult> {
    // run some validation
    validateCollection(this);
    validateParams(this);

    // lower all the messages to IR
    for (const locale of this.locales.values()) {
      for (const msg of locale.messages.values()) {
        msg.lower();
      }
    }

    const files: Array<File> = [];

    // generate all the locale definitions
    for (const locale of this.locales.values()) {
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

    return {
      files,
      errors: this.errors,
    };
  }

  public raiseSyntaxError(id: ErrorId, msg: string) {
    const error = new SyntaxError(`[${id}]: ${msg}`) as CodegenError;
    error.id = id;
    error.locations = [];

    this.errors.push(error);
    return this;
  }

  public raiseReferenceError(id: ErrorId, msg: string) {
    const error = new ReferenceError(`[${id}]: ${msg}`) as CodegenError;
    error.id = id;
    error.locations = [];

    this.errors.push(error);
    return this;
  }

  public raiseTypeError(id: ErrorId, msg: string) {
    const error = new TypeError(`[${id}]: ${msg}`) as CodegenError;
    error.id = id;
    error.locations = [];

    this.errors.push(error);
    return this;
  }
}
