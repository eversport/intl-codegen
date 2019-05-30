import * as mf from "intl-messageformat-parser";
import { Message } from "../message";
import { Element, Pattern, ref, text } from "../types";

export function convertMsgFmt(msg: Message) {
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
      return ref(node.id);
    }

    // TODO: report unsupported syntax
    return text(sourceText.slice(node.location.start.offset, node.location.end.offset));
  }
}
