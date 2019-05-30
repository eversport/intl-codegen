import * as fluent from "fluent-syntax";
import { Bundle } from "../bundle";
import { Message } from "../message";
import { date, Element, id, monetary, num, Pattern, ref, text } from "../types";

export function convertFluent(bundle: Bundle, msg: Message) {
  const { sourceText } = msg;

  const ast = msg.ast as fluent.Message;

  const ir = convertPattern(ast.value);

  // after the whole AST has been converted, and we don’t need the complete
  // source text anymore, make sure to cut it down to only this single message

  msg.sourceText = msg.sourceText.slice(ast.span.start, ast.span.end);

  return ir;

  function convertPattern(node: fluent.Pattern): Pattern {
    return {
      type: "Pattern",
      elements: node.elements.map(convertElement),
    };
  }

  function convertElement(node: fluent.Element): Element {
    if (node.type === "TextElement") {
      return text(node.value);
    } else if (node.type === "Placeable" && node.expression.type === "VariableReference") {
      const { name } = node.expression.id;
      const { type } = msg.params.get(name as any)!;

      if (type === "number") {
        return num(id(name));
      } else if (type === "datetime") {
        return date(name);
      } else if (type === "monetary") {
        return monetary(name);
      }
      return ref(name);
    }

    bundle.raiseSyntaxError("unsupported-syntax", `Fluent \`${node.type}\` is not yet supported.`);
    return text(sourceText.slice(node.span.start, node.span.end));
  }
}
