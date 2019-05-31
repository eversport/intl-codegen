import { Bundle } from "../bundle";
import { ErrorLocation, ErrorContext } from "../errors";
import { date, id, monetary, num, Param, ParamType, ref } from "../types";

interface ErrorInfo {
  ctx: ErrorContext;
  loc: ErrorLocation;
}

export function getParamType(bundle: Bundle, err: ErrorInfo, name: string, param?: Param, requestedType?: ParamType) {
  if (!param) {
    bundle.raiseError("undeclared-param", `Parameter ${name} has not been declared.`, err.ctx, err.loc);
    return undefined;
  }

  const { type } = param;
  const compatible = !requestedType || type === requestedType || (type === "monetary" && requestedType === "number");
  if (!compatible) {
    bundle.raiseError(
      "wrong-type",
      `Parameter \`${name}\` has type \`${type}\` but was used as \`${requestedType}\`.`,
      err.ctx,
      err.loc,
    );
  }

  return {
    type,
    compatible,
  };
}

export function formatValue(
  bundle: Bundle,
  err: ErrorInfo,
  name: string,
  param?: Param,
  requestedType?: ParamType,
  formatOptions?: Intl.DateTimeFormatOptions | Intl.NumberFormatOptions,
) {
  const paramType = getParamType(bundle, err, name, param, requestedType);

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
