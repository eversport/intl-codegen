import { Params } from "../types";
import { isId } from "./helpers";
import { Message } from "../message";

const paramTypes = {
  string: "string",
  number: "NumberValue",
  datetime: "DateTimeValue",
  monetary: "MonetaryValue",
  element: "React.ReactNode",
  // TODO: elements other than react, custom types…
};

export function generateParamsType(params: Params) {
  if (!params.size) {
    return "";
  }

  let code = "{ ";

  let first = "";
  for (const { name, type } of params.values()) {
    code += first;
    first = ", ";
    code += `${isId(name) ? name : `[${JSON.stringify(name)}]`}: `;
    // TODO: custom types
    code += (paramTypes as any)[type];
  }

  code += " }";
  return code;
}

export function hasElementParameter(message: Message) {
  for (const param of message.params.values()) {
    if (param.type === "element") {
      return true;
    }
  }
  return false;
}
