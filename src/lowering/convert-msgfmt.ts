import * as mf from "intl-messageformat-parser";
import { Bundle } from "../bundle";
import { Message } from "../message";
import { Element, ParamId, ParamType, Pattern, text } from "../types";
import { formatValue } from "./formatted-value";
import { formats } from "./msgfmt-formats";

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

    const { format } = node;
    const name = node.id;
    const param = msg.params.get(name as ParamId);

    if (!format) {
      return formatValue(bundle, name, param);
    } else if (format.type === "numberFormat") {
      return formatValue(bundle, name, param, "number" as ParamType, formats.number[format.style]);
    } else if (format.type === "dateFormat" || format.type === "timeFormat") {
      return formatValue(
        bundle,
        name,
        param,
        "datetime" as ParamType,
        (format.type === "dateFormat" ? formats.date : formats.time)[format.style],
      );
    }

    bundle.raiseSyntaxError("unsupported-syntax", `MessageFormat \`${node.format}\` is not yet supported.`);
    return text(sourceText.slice(node.location.start.offset, node.location.end.offset));
  }
}
