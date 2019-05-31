import * as Fluent from "fluent-syntax";
import * as MsgFmt from "intl-messageformat-parser";

export interface ErrorLocation {
  sourceText: string;
  node: Fluent.Node | { location: MsgFmt.Location };
}

export interface ErrorContext {
  /**
   * The locale of the message which caused this error, or `"template"`,
   * when the error occurred for template definitions.
   */
  localeId?: string;
  /**
   * The `id` of the message that caused the error.
   * When using `fluent`, it might not be possible to associate
   * `SyntaxError`s to a specific message.
   */
  messageId?: string;
}

export type ErrorId =
  | "parse-error"
  | "unsupported-syntax"
  | "undefined-message"
  | "unlocalized-message"
  | "unknown-type"
  | "wrong-type"
  | "undeclared-param"
  | "unknown-function"
  | "wrong-selector"
  | "missing-other";

export const ERROR_CLASSES: { [key in ErrorId]: SyntaxErrorConstructor } = {
  "parse-error": SyntaxError,
  "unsupported-syntax": SyntaxError,
  "undefined-message": ReferenceError,
  "unlocalized-message": ReferenceError,
  "unknown-type": TypeError,
  "wrong-type": TypeError,
  "undeclared-param": TypeError,
  "unknown-function": TypeError,
  "wrong-selector": TypeError,
  "missing-other": SyntaxError,
};

export interface CodegenError {
  name: "SyntaxError" | "TypeError" | "ReferenceError";
  /** A unique error ID */
  id: ErrorId;
  message: string;
  context: ErrorContext;
  /**
   * Returns a formatted Error Message, including a code-frame.
   */
  getFormattedMessage(): string;
}
