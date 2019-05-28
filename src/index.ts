import { CodegenError, ErrorCollector } from "./errors";
import { parseMsgFmt, parseFluent } from "./parsing";
import { validateCollection, validateParams } from "./validation";
import { TypeDefs, validateType } from "./validation/validate-params";
import { LocaleId, Bundle, MessageDefinitions } from "./types";

interface InputParameter {
  /** Name of the parameter */
  name: string;
  /**
   * The type of parameter.
   * This can be either the builtin `"string"`, `"number"`, `"datetime"`, `"monetary"`, `"element"`,
   * or any of the custom types defined using `defineType`.
   * It will default to `"string"`, which is strongly type-checked.
   */
  type?: string;
}

interface File {
  name: string;
  content: string;
}

interface GenerateResult {
  files: Array<File>;
  errors: Array<CodegenError>;
}

function validateLocale(locale: string): LocaleId {
  if (locale === "template") {
    throw new ReferenceError('Locale "template" is reserved for internal use');
  }
  return locale;
}

export class IntlCodegen {
  private errors = new ErrorCollector();
  private typeDefs: TypeDefs = new Map();
  private bundle: Bundle = new Map([["template", { locale: "template", messages: new Map() }]]);

  private addParseResult(locale: LocaleId, definitions: MessageDefinitions) {
    let localeDefs = this.bundle.get(locale);
    if (!localeDefs) {
      localeDefs = { locale, messages: new Map() };
      this.bundle.set(locale, localeDefs);
    }
    for (const [id, def] of definitions) {
      // TODO: error on duplicate definition?
      localeDefs.messages.set(id, def);
    }
  }

  /**
   * Define a custom enum type with `name` and `variants` for use inside selectors.
   */
  defineType(name: string, variants: Array<string>): IntlCodegen {
    validateType(name);
    // TODO: error on duplicate definition?
    this.typeDefs.set(name, variants);
    return this;
  }

  /**
   * Define a single message with `id` and `params`, with the fallback template in
   * `MessageFormat` syntax.
   */
  defineMessageUsingMessageFormat(id: string, messageFormat: string, params: Array<InputParameter> = []): IntlCodegen {
    const parsedParams = new Map(
      params.map(p => [
        p.name,
        {
          name: p.name,
          type: p.type || "string",
        },
      ]),
    );
    const { errors } = this;
    errors.setContext({ locale: "template", messageId: id });
    this.addParseResult(
      "template",
      parseMsgFmt({
        errors,
        locale: "template",
        id,
        sourceText: messageFormat,
        params: parsedParams,
      }),
    );
    return this;
  }

  /**
   * Defines multiple messages at once using `fluent` syntax.
   * Message `id`s and `params` are extracted directly from the `fluent` syntax
   * using a tsdoc-like comments.
   * See https://github.com/projectfluent/fluent/issues/140
   */
  defineMessagesUsingFluent(fluent: string): IntlCodegen {
    this.errors.setContext({ locale: "template" });
    this.addParseResult("template", parseFluent(this.errors, "template", fluent));
    return this;
  }

  /**
   * This adds a localized message using `MessageFormat` syntax in the specified `locale`
   * for the previously defined Message with the matching `id`.
   */
  addLocalizedMessageUsingMessageFormat(locale: string, id: string, messageFormat: string): IntlCodegen {
    const { errors } = this;
    errors.setContext({ locale, messageId: id });
    this.addParseResult(validateLocale(locale), parseMsgFmt({ errors, locale, id, sourceText: messageFormat }));
    return this;
  }

  /**
   * This adds multiple localized messages at once using `fluent` syntax in the specified `locale`.
   */
  addLocalizedMessagesUsingFluent(locale: string, fluent: string): IntlCodegen {
    this.errors.setContext({ locale });
    this.addParseResult(validateLocale(locale), parseFluent(this.errors, locale, fluent));
    return this;
  }

  /**
   * This will run the actual parsing, type checking and code generation.
   * It will return an Array of `files` and `errors`.
   */
  async generate(): Promise<GenerateResult> {
    const { errors, bundle } = this;

    validateCollection(errors, bundle);
    validateParams(errors, bundle, this.typeDefs);

    // console.log(collection);

    return {
      files: [],
      errors: errors.errors,
    };
  }
}

export default IntlCodegen;
