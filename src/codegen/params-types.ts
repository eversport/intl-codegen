import { Params } from "../types";
import { isId } from "./helpers";

const paramTypes = {
  string: "string",
  number: "IntlNumber",
  datetime: "IntlDateTime",
  monetary: "IntlMonetaryValue",
  // TODO: element, custom types…
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
