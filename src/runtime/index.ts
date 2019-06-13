export { NumberValue, DateTimeValue, MonetaryValue } from "./context";
export { defineLoader, LoaderFn, IntlObject } from "./loader";

/**
 * Intl-codegen will convert message Ids with dashes or underscores to use
 * camelCase notation instead. If there is any need to replicate that functionality,
 * use this function.
 */
export function convertIdentifier(str: string) {
  return str.replace(/[_-](\w|$)/g, (_, ch) => ch.toUpperCase());
}
