import * as mf from "intl-messageformat-parser";
import { Bundle } from "../bundle";
import { Message } from "../message";
import { Element, id, ParamId, ParamType, Pattern, select, text, Variant, variant } from "../types";
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
    } else if (format.type === "selectFormat" || format.type === "pluralFormat") {
      let other: Variant | undefined;

      let type: "ordinal" | "plural" | undefined;
      if (format.type === "pluralFormat") {
        type = format.ordinal ? "ordinal" : "plural";
      }

      if (type && (!param || param.type !== "number")) {
        bundle.raiseTypeError("wrong-type", `Messageformat plural selector is only valid for type "number".`);
        type = undefined;
      }

      const variants: Array<Variant> = [];
      for (const option of format.options) {
        const selector = option.selector.startsWith("=") ? Number(option.selector.slice(1)) : option.selector;

        // TODO: validate selector depending on pluralization

        const vari = variant(selector, ...option.value.elements.map(convertElement));
        if (selector === "other") {
          other = vari;
        } else {
          variants.push(vari);
        }
      }

      if (!other) {
        bundle.raiseSyntaxError("missing-other", "MessageFormat requires a `other` case to be defined.");
        variants.unshift(variants.pop()!);
      } else {
        variants.unshift(other);
      }
      return select(id(name), variants, type);
    }

    bundle.raiseSyntaxError("unsupported-syntax", `MessageFormat \`${node.format}\` is not yet supported.`);
    return text(sourceText.slice(node.location.start.offset, node.location.end.offset));
  }
}
