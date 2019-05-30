import * as mf from "intl-messageformat-parser";
import { Bundle } from "../bundle";
import { Message } from "../message";
import { date, Element, id, monetary, num, Pattern, ref, text } from "../types";

export function convertMsgFmt(bundle: Bundle, msg: Message) {
  const { sourceText } = msg;

  return convertPattern(msg.ast as mf.MessageFormatPattern);

  function convertPattern(node: mf.MessageFormatPattern): Pattern {
    return {
      type: "Pattern",
      elements: node.elements.map(convertElement),
    };
  }

  function convertElement(node: mf.Element): Element {
    if (node.type === "messageTextElement") {
      return text(node.value);
    }

    if (!node.format) {
      const name = node.id;
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

    bundle.raiseSyntaxError("unsupported-syntax", `MessageFormat \`${node.format}\` is not yet supported.`);
    return text(sourceText.slice(node.location.start.offset, node.location.end.offset));
  }
}
