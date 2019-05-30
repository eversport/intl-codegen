import { loadLanguage } from "./";

export async function test() {
  const intl = await loadLanguage("de");
  expect(intl["simple-text"]()).toEqual("just some text");
}
