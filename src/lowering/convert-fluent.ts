import * as fluent from "fluent-syntax";
import { Bundle } from "../bundle";
import { Message } from "../message";
import {
  Element,
  id,
  Identifier,
  lit,
  Literal,
  ParamId,
  ParamType,
  Pattern,
  select,
  text,
  Variant,
  variant,
} from "../types";
import { formatValue } from "./formatted-value";

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
    } else if (node.expression.type === "VariableReference") {
      const { name } = node.expression.id;
      const param = msg.params.get(name as ParamId);

      return formatValue(bundle, name, param);
    } else if (node.expression.type === "FunctionReference") {
      const { arg0, fnType, formatOptions } = getFnMeta(node.expression);
      if (arg0.type === "VariableReference") {
        const { name } = arg0.id;
        const param = msg.params.get(name as ParamId);

        return formatValue(bundle, name, param, fnType, formatOptions);
      }
    } else if (node.expression.type === "SelectExpression") {
      let type: "ordinal" | "plural" | undefined;
      let selector: Identifier | Literal;
      let fltSelector = node.expression.selector;

      if (fltSelector.type === "NumberLiteral") {
        type = "plural";
        selector = lit(Number(fltSelector.value));
      } else if (fltSelector.type === "StringLiteral") {
        selector = lit(fltSelector.value);
      } else if (fltSelector.type === "VariableReference") {
        selector = id(fltSelector.id.name);
        const param = msg.params.get(fltSelector.id.name as ParamId);
        if (param && param.type === "number") {
          type = "plural";
        }
      } else {
        const { arg0, fnType, formatOptions } = getFnMeta(fltSelector);
        if (fnType === "number" && formatOptions.type === "ordinal") {
          type = "ordinal";
        }
        if (arg0.type === "VariableReference") {
          const { name } = arg0.id;
          selector = id(name);

          // TODO: validate types!

          // const { type, compatible } = getParamType(bundle, name, msg.params.get(name as ParamId), fnType)!;
        } else if (arg0.type === "FunctionReference") {
          // hm, what to do?
          bundle.raiseSyntaxError("unsupported-syntax", `Fluent \`${node.type}\` is not yet supported.`);
          return text(sourceText.slice(node.span.start, node.span.end));
        } else {
          selector = lit(arg0.type === "NumberLiteral" ? Number(arg0.value) : arg0.value);
        }
      }

      const variants: Array<Variant> = [];
      for (const option of node.expression.variants) {
        const selector = option.key.type === "NumberLiteral" ? Number(option.key.value) : option.key.name;

        // TODO: validate selector depending on pluralization

        const vari = variant(selector, ...option.value.elements.map(convertElement));

        if (option.default) {
          variants.unshift(vari);
        } else {
          variants.push(vari);
        }
      }

      return select(selector, variants, type);
    }

    bundle.raiseSyntaxError("unsupported-syntax", `Fluent \`${node.type}\` is not yet supported.`);
    return text(sourceText.slice(node.span.start, node.span.end));
  }

  function getFnMeta(node: fluent.FunctionReference) {
    const fn = node.id.name;
    const fnType = (fn === "NUMBER" ? "number" : fn === "DATETIME" ? "datetime" : "unknown") as ParamType;
    if (fnType === "unknown") {
      bundle.raiseReferenceError("unknown-function", `Fluent function ${fn} is not supported.`);
    }
    const arg0 = node.arguments.positional[0];
    const formatOptions = argsToJson(node.arguments);

    return {
      fnType,
      arg0,
      formatOptions,
    };
  }
}

function argsToJson(node: fluent.CallArguments) {
  const json: { [key: string]: string | number } = {};

  for (const { name, value } of node.named) {
    const val = value.type === "NumberLiteral" ? Number(value.value) : value.value;
    json[name.name] = val;
  }

  return json;
}
