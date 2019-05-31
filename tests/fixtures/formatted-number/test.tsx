import { loadLanguage } from "./";

export async function test() {
  const intl = await loadLanguage("de-DE");
  expect(intl.fluentPercent({ num: 0.945 })).toEqual("a percentage: 95 %");
  expect(intl.msgfmtPercent({ num: 0.945 })).toEqual("a percentage: 95 %");
}
