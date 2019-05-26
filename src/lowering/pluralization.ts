import { Locale } from "../parsing";

const CATEGORIES = new Set(["zero", "one", "two", "few", "many", "other"]);

export function isValidSelector(_locale: Locale, selector: number | string) {
  return typeof selector === "number" || CATEGORIES.has(selector);
}
