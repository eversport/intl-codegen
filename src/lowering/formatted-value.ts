import { Bundle } from "../bundle";
import { date, id, monetary, num, Param, ParamType, ref } from "../types";

export function formatValue(
  bundle: Bundle,
  name: string,
  param?: Param,
  requestedType?: ParamType,
  formatOptions?: Intl.DateTimeFormatOptions | Intl.NumberFormatOptions,
) {
  if (!param) {
    bundle.raiseTypeError("undeclared-param", `Parameter ${name} has not been declared.`);
    return ref(name);
  }

  const { type } = param;
  const compatibleType =
    !requestedType || type === requestedType || (type === "monetary" && requestedType === "number");
  if (!compatibleType) {
    bundle.raiseTypeError(
      "wrong-type",
      `Parameter \`${name}\` has type \`${type}\` but was used as \`${requestedType}\`.`,
    );
  }

  const matchingFormat = compatibleType ? formatOptions : undefined;
  if (type === "number") {
    return num(id(name), matchingFormat);
  } else if (type === "datetime") {
    return date(name, matchingFormat);
  } else if (type === "monetary") {
    return monetary(name, matchingFormat);
  }
  return ref(name);
}
