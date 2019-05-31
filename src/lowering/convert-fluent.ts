import * as fluent from "fluent-syntax";
import { Bundle } from "../bundle";
import { Message } from "../message";
import { Element, ParamId, ParamType, Pattern, text } from "../types";
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
      const fn = node.expression.id.name;
      const fnType = (fn === "NUMBER" ? "number" : fn === "DATETIME" ? "datetime" : "unknown") as ParamType;
      if (fnType === "unknown") {
        bundle.raiseReferenceError("unknown-function", `Fluent function ${fn} is not supported.`);
      }
      const arg0 = node.expression.arguments.positional[0];
      const formatOptions = argsToJson(node.expression.arguments);

      if (arg0.type === "VariableReference") {
        const { name } = arg0.id;
        const param = msg.params.get(name as ParamId);

        return formatValue(bundle, name, param, fnType, formatOptions);
      }
    }

    bundle.raiseSyntaxError("unsupported-syntax", `Fluent \`${node.type}\` is not yet supported.`);
    return text(sourceText.slice(node.span.start, node.span.end));
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
