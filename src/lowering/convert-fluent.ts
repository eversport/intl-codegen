import * as fluent from "@fluent/syntax";
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
import { formatValue, getParamType } from "./formatted-value";

export function convertFluent(bundle: Bundle, msg: Message) {
  const { sourceText } = msg;

  const ast = msg.ast as fluent.Message;

  const ir = convertPattern(ast.value!);

  // after the whole AST has been converted, and we don’t need the complete
  // source text anymore, make sure to cut it down to only this single message

  msg.sourceText = msg.sourceText.slice(ast.span!.start, ast.span!.end);

  return ir;

  function errCtx(node: any) {
    return { ctx: msg, loc: { sourceText, node } };
  }

  function convertPattern(node: fluent.Pattern): Pattern {
    return {
      type: "Pattern",
      elements: node.elements.map(convertElement),
    };
  }

  function convertElement(node: fluent.PatternElement): Element {
    if (node.type === "TextElement") {
      return text(node.value);
    }
    const expr = node.expression;
    if (expr.type === "VariableReference") {
      const { name } = expr.id;
      const param = msg.params.get(name as ParamId);

      return formatValue(bundle, errCtx(expr.id), name, param);
    } else if (expr.type === "FunctionReference") {
      const { arg0, fnType, formatOptions } = getFnMeta(expr);
      if (arg0.type === "VariableReference") {
        const { name } = arg0.id;
        const param = msg.params.get(name as ParamId);

        return formatValue(bundle, errCtx(expr), name, param, fnType, formatOptions);
      }
    } else if (expr.type === "SelectExpression") {
      let type: "ordinal" | "plural" | undefined;
      let selector: Identifier | Literal;
      let fltSelector = expr.selector;

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
      } else if (fltSelector.type === "FunctionReference") {
        const { arg0, fnType, formatOptions } = getFnMeta(fltSelector);
        if (fnType === "number" && formatOptions.type === "ordinal") {
          type = "ordinal";
        }
        if (arg0.type === "VariableReference") {
          const { name } = arg0.id;
          selector = id(name);

          if (
            !getParamType(
              bundle,
              { ctx: msg, loc: { sourceText, node: fltSelector } },
              name,
              msg.params.get(name as ParamId),
              fnType,
            )!.compatible
          ) {
            // downgrade this to a straight string selector
            type = undefined;
          }
        } else if (arg0.type === "FunctionReference") {
          // hm, what to do?
          bundle.raiseError("unsupported-syntax", `Fluent \`${fltSelector.type}\` is not yet supported.`, msg, {
            sourceText,
            node: fltSelector,
          });
          return text(sourceText.slice(node.span!.start, node.span!.end));
        } else {
          selector = lit(arg0.type === "NumberLiteral" ? Number(arg0.value) : String(arg0.value));
        }
      } else {
        bundle.raiseError("unsupported-syntax", `Fluent \`${fltSelector.type}\` is not yet supported.`, msg, {
          sourceText,
          node: expr,
        });
        return text(sourceText.slice(node.span!.start, node.span!.end));
      }

      const variants: Array<Variant> = [];
      for (const option of expr.variants) {
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

    bundle.raiseError("unsupported-syntax", `Fluent \`${expr.type}\` is not yet supported.`, msg, {
      sourceText,
      node: expr,
    });
    return text(sourceText.slice(node.span!.start, node.span!.end));
  }

  function getFnMeta(node: fluent.FunctionReference) {
    const fn = node.id.name;
    const fnType = (fn === "NUMBER" ? "number" : fn === "DATETIME" ? "datetime" : "unknown") as ParamType;
    if (fnType === "unknown") {
      bundle.raiseError("unknown-function", `Fluent function \`${fn}\` is not supported.`, msg, {
        sourceText,
        node: node.id,
      });
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
