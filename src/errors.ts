import { LocaleId, MessageId, ParamId } from "./types";

// interface ErrorLocation {
//   /** A note associated with this location. */
//   note: string;
//   /**
//    * The locale of the message which caused this error, or `"template"`,
//    * when the error occured for template definitions.
//    */
//   locale: string;
//   /**
//    * The `id` of the message that caused the error.
//    * When using `fluent`, it might not be possible to associate
//    * `SyntaxError`s to a specific message.
//    */
//   id?: string;
//   /** The complete source string */
//   source: string;
//   /** The source code offsets for the part that caused problems. */
//   range: [number, number];
//   /** A formatted code-frame, when `@babel/code-frame` is available. */
//   codeframe?: string;
// }

// export interface CodegenError {
//   name: "SyntaxError" | "TypeError" | "ReferenceError";
//   message: string;
//   locations: Array<ErrorLocation>;
// }

export type CodegenError =
  // | {
  //     id: string;
  //   }
  | {
      id: "message-not-defined";
      messageId: string;
    }
  | {
      id: "message-not-localized";
      locale: string;
      messageId: string;
    }
  | {
      id: "unsupported-syntax";
      locale: string;
      messageId: string;
      node: unknown;
    }
  | {
      id: "unknown-parameter-type";
      locale: string;
      messageId: string;
      param: string;
      type: string;
    }
  | {
      id: "undeclared-parameter";
      locale: string;
      messageId: string;
      param: string;
    }
  | {
      id: "wrong-parameter-type";
      locale: string;
      messageId: string;
      param: string;
    };

interface ErrorContext {
  locale: LocaleId;
  messageId: MessageId;
}

export class ErrorCollector {
  public errors: Array<CodegenError> = [];
  private context: ErrorContext = {} as ErrorContext;

  public setContext(context: Partial<ErrorContext>) {
    Object.assign(this.context, context);
  }

  public messageNotDefined(messageId: MessageId) {
    this.errors.push({
      id: "message-not-defined",
      messageId,
    });
  }
  public messageNotLocalized(messageId: MessageId) {
    this.errors.push({
      id: "message-not-localized",
      locale: this.context.locale,
      messageId,
    });
  }
  public unsupportedSyntax(node: unknown) {
    const { locale, messageId } = this.context;
    this.errors.push({
      id: "unsupported-syntax",
      locale,
      messageId,
      node,
    });
  }
  public unknownParamType(param: ParamId, type: string) {
    const { locale, messageId } = this.context;
    this.errors.push({
      id: "unknown-parameter-type",
      locale,
      messageId,
      param,
      type,
    });
  }
  public undeclaredParam(param: ParamId) {
    const { locale, messageId } = this.context;
    this.errors.push({
      id: "undeclared-parameter",
      locale,
      messageId,
      param,
    });
  }
  public wrongParamType(param: ParamId) {
    const { locale, messageId } = this.context;
    this.errors.push({
      id: "wrong-parameter-type",
      locale,
      messageId,
      param,
    });
  }
}
