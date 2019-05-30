import { loadLanguage } from "./";

export async function test() {
  const intl = await loadLanguage("de");
  expect(intl.simpleParam({ a: "param!" })).toEqual("a simple param: param!");
}
