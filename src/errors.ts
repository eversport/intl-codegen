export interface ErrorLocation {
  /** A note associated with this location. */
  note: string;
  /**
   * The locale of the message which caused this error, or `"template"`,
   * when the error occurred for template definitions.
   */
  locale: string;
  /**
   * The `id` of the message that caused the error.
   * When using `fluent`, it might not be possible to associate
   * `SyntaxError`s to a specific message.
   */
  id?: string;
  /** The complete source string */
  source: string;
  /** The source code offsets for the part that caused problems. */
  range: [number, number];
  /** A formatted code-frame, when `@babel/code-frame` is available. */
  codeframe?: string;
}

export type ErrorId =
  | "parse-error"
  | "unsupported-syntax"
  | "undefined-message"
  | "unlocalized-message"
  | "unknown-type"
  | "wrong-type"
  | "undeclared-param"
  | "unknown-function";

export interface CodegenError {
  name: "SyntaxError" | "TypeError" | "ReferenceError";
  id: ErrorId;
  message: string;
  locations: Array<ErrorLocation>;
}
