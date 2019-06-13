import { loadLanguage } from "./";

export async function test() {
  const intl = await loadLanguage("de");

  // should error on unknown message
  expect(typeof intl.invalid).toEqual("undefined");
}
