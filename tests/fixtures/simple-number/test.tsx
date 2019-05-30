import { loadLanguage } from "./";

export async function test() {
  const intl = await loadLanguage("de-DE");
  expect(intl.fluentNumber({ num: 123456.789 })).toEqual("a number: 123.456,789");
  expect(intl.msgfmtNumber({ num: 123456.789 })).toEqual("a number: 123.456,789");
}
