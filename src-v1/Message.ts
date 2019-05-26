import MessageFormat, { MessageFormatPattern, ArgumentElement } from "intl-messageformat-parser";
import { logFormatError, ErrorInfo } from "./errors";

type ExpressionType = "string" | "any";
export type Expressions = Map<string, ExpressionType>;

export interface FormattedArgument {
  id: string;
  type: "date" | "time" | "number";
  style: string;
  errorInfo: ErrorInfo;
}

export type BasicBlockElement = string | FormattedArgument;

interface BasicBlock {
  type: "block";
  expressions: Array<BasicBlockElement>;
}

interface Branch {
  condition?: string;
  body: BlockBody;
}

interface Conditional {
  type: "conditional";
  branches: Array<Branch>;
}

export type BlockBody = Array<BasicBlock | Conditional>;

const INVALID_AST = MessageFormat.parse("invalid message syntax");

interface MessageOptions {
  locale: string;
  id: string;
  code: string;
}

export default class Message {
  public expressions: Expressions = new Map();
  public body: BlockBody;

  constructor(public options: MessageOptions) {
    this.body = [];

    try {
      const node = MessageFormat.parse(options.code);
      this.walkPattern(node);
    } catch (error) {
      logFormatError(`The message has invalid syntax`, {
        ...options,
        message: error.message,
        loc: error.location,
      });
      this.walkPattern(INVALID_AST);
    }
  }

  private pushPart(part: BasicBlockElement) {
    let block = this.body[this.body.length - 1];
    if (!block || block.type !== "block") {
      block = {
        type: "block",
        expressions: [],
      };
      this.body.push(block);
    }
    block.expressions.push(part);
  }

  private walkPattern(p: MessageFormatPattern) {
    const { elements } = p;
    for (const el of elements) {
      if (el.type === "messageTextElement") {
        this.pushPart(JSON.stringify(el.value));
      } else {
        this.walkArgument(el);
      }
    }
  }

  private walkArgument(a: ArgumentElement) {
    this.expressions.set(a.id, "any");

    if (!a.format) {
      this.pushPart(a.id);
      return;
    }
    const { format } = a;

    if (format.type === "numberFormat" || format.type === "timeFormat" || format.type === "dateFormat") {
      const type = format.type === "numberFormat" ? "number" : format.type === "dateFormat" ? "date" : "time";
      this.pushPart({
        id: a.id,
        type,
        style: format.style,
        errorInfo: { ...this.options, loc: format.location },
      });
      return;
    }

    /* istanbul ignore else */
    if (format.type === "selectFormat" || format.type === "pluralFormat") {
      if (format.type === "pluralFormat" && (format.ordinal || format.offset)) {
        logFormatError("Plural `ordinal` and `offset` are not yet supported.", {
          ...this.options,
          // well, the AST does not provide the location for *everything*, so this is the best we can do
          loc: { start: format.location.start, end: format.options[0].location.start },
        });
      }

      const { body } = this;
      const branches: Array<Branch> = [];
      body.push({
        type: "conditional",
        branches,
      });
      let other: Branch | undefined;
      for (const option of format.options) {
        let condition: string | undefined;
        if (option.selector !== "other") {
          if (format.type === "selectFormat") {
            condition = `String(${a.id}) == ${JSON.stringify(option.selector)}`;
          } else {
            const isNumber = option.selector.startsWith("=");
            if (isNumber) {
              const num = Number(option.selector.substr(1));
              condition = `${a.id} == ${num}`;
            } else {
              const valStart = option.value.location.start;
              logFormatError("Plural forms other than `=X` or `other` are not yet supported.", {
                ...this.options,
                // again, this is the best we can do
                loc: { start: option.location.start, end: { line: valStart.line, column: valStart.column - 1 } },
              });
            }
          }
        }
        const body: BlockBody = [];
        let branch = {
          condition,
          body,
        };
        this.body = body;
        this.walkPattern(option.value);
        if (!condition) {
          other = branch;
        } else {
          branches.push(branch);
        }
      }
      if (other && other.body.length) {
        branches.push(other);
      }
      this.body = body;
      return;
    }

    /* istanbul ignore next */
    console.log("Unknown format type in Codegen:", format);
  }
}
