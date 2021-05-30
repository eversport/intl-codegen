import * as mf from "@formatjs/icu-messageformat-parser";
import { Bundle } from "../bundle";
import { Message } from "../message";
import { Element, id, ParamId, ParamType, Pattern, select, text, Variant, variant } from "../types";
import { formatValue } from "./formatted-value";
import { formats } from "./msgfmt-formats";

export function convertMsgFmt(bundle: Bundle, msg: Message) {
  const { sourceText } = msg;

  return convertPattern(msg.ast as Array<mf.MessageFormatElement>);

  function errCtx(node: any) {
    return { ctx: msg, loc: { sourceText, node } };
  }

  function convertPattern(node: Array<mf.MessageFormatElement>): Pattern {
    return {
      type: "Pattern",
      elements: node.map(convertElement),
    };
  }

  function convertElement(node: mf.MessageFormatElement): Element {
    if (mf.isLiteralElement(node)) {
      return text(node.value);
    }

    // const { format } = node;
    // const name = node.id;
    // const param = msg.params.get(name as ParamId);

    if (mf.isArgumentElement(node)) {
      const param = msg.params.get(node.value as ParamId);
      return formatValue(bundle, errCtx(node), node.value, param);
    } else if (mf.isNumberElement(node)) {
      const style = mf.isNumberSkeleton(node.style)
        ? node.style.parsedOptions
        : typeof node.style === "string"
        ? formats.number[node.style]
        : undefined;
      if (node.style && !style) {
        bundle.raiseError("unknown-format", `The format \`${node.style}\` is not valid.`, msg, {
          sourceText,
          node,
        });
      }

      const param = msg.params.get(node.value as ParamId);
      return formatValue(bundle, errCtx(node), node.value, param, "number" as ParamType, style);
    } else if (mf.isDateElement(node) || mf.isTimeElement(node)) {
      const style = mf.isDateTimeSkeleton(node.style)
        ? node.style.parsedOptions
        : typeof node.style === "string"
        ? (mf.isDateElement(node) ? formats.date : formats.time)[node.style]
        : undefined;
      if (node.style && !style) {
        bundle.raiseError("unknown-format", `The format \`${node.style}\` is not valid.`, msg, {
          sourceText,
          node,
        });
      }

      const param = msg.params.get(node.value as ParamId);
      return formatValue(bundle, errCtx(node), node.value, param, "datetime" as ParamType, style);
    } else if (mf.isSelectElement(node) || mf.isPluralElement(node)) {
      let other: Variant | undefined;

      let type: "ordinal" | "plural" | undefined;
      if (mf.isPluralElement(node)) {
        type = node.pluralType === "ordinal" ? "ordinal" : "plural";
      }
      const param = msg.params.get(node.value as ParamId);

      if (type && (!param || param.type !== "number")) {
        let info = param ? `, but parameter \`${param.name}\` has type \`${param.type}\`` : "";
        bundle.raiseError(
          "wrong-type",
          `Messageformat \`${type}\` selector is only valid for type "number"${info}.`,
          msg,
          {
            sourceText,
            node,
          },
        );
        type = undefined;
      }

      const variants: Array<Variant> = [];
      for (const option of Object.keys(node.options)) {
        const selector = option.startsWith("=") ? Number(option.slice(1)) : option;

        // TODO: validate selector depending on pluralization

        const vari = variant(selector, ...node.options[option].value.map(convertElement));
        if (selector === "other") {
          other = vari;
        } else {
          variants.push(vari);
        }
      }

      if (!other) {
        bundle.raiseError("missing-other", "MessageFormat requires an `other` case to be defined.", msg, {
          sourceText,
          node,
        });
        variants.unshift(variants.pop()!);
      } else {
        variants.unshift(other);
      }
      return select(id(node.value), variants, type);
    }

    bundle.raiseError("unsupported-syntax", `MessageFormat \`${node.type}\` is not yet supported.`, msg, {
      sourceText,
      node,
    });
    return text(sourceText.slice(node.location!.start.offset, node.location!.end.offset));
  }
}
