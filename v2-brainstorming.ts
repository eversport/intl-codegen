interface Param {
  /** Name of the parameter */
  name: string
  /**
   * The type of parameter.
   * This can be either the builtin `"string"`, `"number"`, `"datetime"`, `"monetary"`, `"element"`,
   * or any of the custom types defined using `defineType`.
   * It will default to `"string"`, which is strongly type-checked.
   */
  type?: string
}

interface ErrorLocation {
  /** A note associated with this location. */
  note: string
  /**
   * The locale of the message which caused this error, or `"template"`,
   * when the error occured for template definitions.
   */
  locale: string
  /**
   * The `id` of the message that caused the error.
   * When using `fluent`, it might not be possible to associate
   * `SyntaxError`s to a specific message.
   */
  id?: string
  /** The complete source string */
  source: string
  /** The source code offsets for the part that caused problems. */
  range: [number, number]
  /** A formatted code-frame, when `@babel/code-frame` is available. */
  codeframe?: string
}

interface CodegenError {
  name: 'SyntaxError' | 'TypeError' | 'ReferenceError'
  message: string
  locations: Array<ErrorLocation>
}

interface File {
  name: string
  content: string 
}

interface GenerateResult {
  files: Array<File>
  errors: Array<CodegenError>
}

export declare class IntlCodegen {
  /**
   * Define a custom enum type with `name` and `variants` for use inside selectors.
   */
  defineType(name: string, variants: Array<string>): IntlCodegen

  /**
   * Define a single message with `id` and `params`, with the fallback template in
   * `MessageFormat` syntax.
   */
  defineMessageUsingMessageFormat(id: string, params: Array<Param>, messageFormat: string): IntlCodegen

  /**
   * Defines multiple messages at once using `fluent` syntax.
   * Message `id`s and `params` are extracted directly from the `fluent` syntax
   * using a tsdoc-like comments.
   * See https://github.com/projectfluent/fluent/issues/140
   */
  defineMessagesUsingFluent(fluent: string): IntlCodegen

  /**
   * This adds a localized message using `MessageFormat` syntax in the specified `locale`
   * for the previously defined Message with the matching `id`.
   */
  addLocalizedMessageUsingMessageFormat(locale: string, id: string, messageFormat: string): IntlCodegen

  /**
   * This adds multiple localized messages at once using `fluent` syntax in the specified `locale`. 
   */
  addLocalizedMessagesUsingFluent(locale: string, fluent: string): IntlCodegen

  /**
   * This will run the actual parsing, type checking and code generation.
   * It will return an Array of `files` and `errors`. 
   */
  generate(): Promise<GenerateResult>
}
