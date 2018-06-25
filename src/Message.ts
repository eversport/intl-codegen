import { Pattern } from "intl-messageformat-parser";

type ExpressionType = "string" | "any";
export type Expressions = Map<string, ExpressionType>;

function camelify(str: string) {
  return str.replace(/-(\w|$)/g, (_, ch) => ch.toUpperCase());
}

export default class Message {
  public expressions: Expressions = new Map();
  public id: string = camelify(this.identifier);

  constructor(public identifier: string, public node: Pattern) {
    this.walkPattern(this.node);
  }

  private walkPattern(p: Pattern) {
    const { elements } = p;
    for (const el of elements) {
      if (el.type === "argumentElement") {
        this.expressions.set(el.id, "any");
      }
    }
  }
}
