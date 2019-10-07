import { loadLanguage } from "./";
import { loadLanguage as loadLanguageReact } from "./react";

export async function test() {
  // It should be able to initialize it
  let intl = await loadLanguage("de");
  intl = await loadLanguageReact("de");

  expect(intl).toBeInstanceOf(Function);
}
