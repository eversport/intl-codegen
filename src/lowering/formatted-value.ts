import { Bundle } from "../bundle";
import { date, id, monetary, num, Param, ParamType, ref } from "../types";

export function getParamType(bundle: Bundle, name: string, param?: Param, requestedType?: ParamType) {
  if (!param) {
    bundle.raiseTypeError("undeclared-param", `Parameter ${name} has not been declared.`);
    return undefined;
  }

  const { type } = param;
  const compatible = !requestedType || type === requestedType || (type === "monetary" && requestedType === "number");
  if (!compatible) {
    bundle.raiseTypeError(
      "wrong-type",
      `Parameter \`${name}\` has type \`${type}\` but was used as \`${requestedType}\`.`,
    );
  }

  return {
    type,
    compatible,
  };
}

export function formatValue(
  bundle: Bundle,
  name: string,
  param?: Param,
  requestedType?: ParamType,
  formatOptions?: Intl.DateTimeFormatOptions | Intl.NumberFormatOptions,
) {
  const paramType = getParamType(bundle, name, param, requestedType);

  if (!paramType) {
    return ref(name);
  }

  const { type, compatible } = paramType;

  const matchingFormat = compatible ? formatOptions : undefined;
  if (type === "number") {
    return num(id(name), matchingFormat);
  } else if (type === "datetime") {
    return date(name, matchingFormat);
  } else if (type === "monetary") {
    return monetary(name, matchingFormat);
  }
  return ref(name);
}
