import { Pattern, Argument } from "intl-messageformat-parser";

type ExpressionType = "string" | "any";
export type Expressions = Map<string, ExpressionType>;

interface FormattedArgument {
  id: string;
  type: "date" | "time" | "number";
  style: string;
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

export default class Message {
  public expressions: Expressions = new Map();
  public body: BlockBody;

  constructor(public id: string, node: Pattern) {
    this.body = [];
    this.walkPattern(node);
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

  private walkPattern(p: Pattern) {
    const { elements } = p;
    for (const el of elements) {
      if (el.type === "messageTextElement") {
        this.pushPart(JSON.stringify(el.value));
      } else {
        this.walkArgument(el);
      }
    }
  }

  private walkArgument(a: Argument) {
    this.expressions.set(a.id, "any");

    if (!a.format) {
      this.pushPart(a.id);
      return;
    }
    const { format } = a;

    if (
      format.type === "numberFormat" ||
      format.type === "timeFormat" ||
      format.type === "dateFormat"
    ) {
      const type =
        format.type === "numberFormat" ? "number" : format.type === "dateFormat" ? "date" : "time";
      this.pushPart({
        id: a.id,
        type,
        style: format.style,
      });
      return;
    }

    /* istanbul ignore else */
    if (format.type === "selectFormat") {
      const { body } = this;
      const branches: Array<Branch> = [];
      body.push({
        type: "conditional",
        branches,
      });
      let other: Branch | undefined;
      for (const option of format.options) {
        const condition =
          option.selector === "other"
            ? undefined
            : `String(${a.id}) == ${JSON.stringify(option.selector)}`;
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
      if (other) {
        branches.push(other);
      }
      this.body = body;
      return;
    }
    /* istanbul ignore next */
    console.log("Unknown format type in Codegen:", format);
  }
}
