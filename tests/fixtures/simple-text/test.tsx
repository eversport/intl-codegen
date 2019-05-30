import { loadLanguage } from "./";

export async function test() {
  const intl = await loadLanguage("de");
  expect(intl.simpleText()).toEqual("just some text");
}
