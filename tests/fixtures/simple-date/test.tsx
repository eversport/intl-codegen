import { loadLanguage } from "./";

export async function test() {
  const intl = await loadLanguage("de-DE");
  const d = new Date("2019-05-30T16:47:52.095Z");
  expect(intl.fluentDate({ d })).toEqual("a date: 30.5.2019");
  expect(intl.msgfmtDate({ d })).toEqual("a date: 30.5.2019");
}
