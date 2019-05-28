import { LocaleId } from "../types";

const CATEGORIES = new Set(["zero", "one", "two", "few", "many", "other"]);

export function isValidSelector(_locale: LocaleId, selector: number | string) {
  return typeof selector === "number" || CATEGORIES.has(selector);
}
