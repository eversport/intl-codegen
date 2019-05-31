import { loadLanguage } from "./";

export async function test() {
  const intl = await loadLanguage("de-DE");
  const d = new Date("2019-01-01T16:47:52.095Z");
  const expected = `
date, default: 1.1.2019
date, short: 1.1.19
date, medium: 1. Jan. 2019
date, long: 1. Januar 2019
date, full: Dienstag, 1. Januar 2019
time, short: 17:47
time, medium: 17:47:52
time, long: 17:47:52 MEZ
time, full: 17:47:52 Mitteleuropäische Normalzeit
  `.trim();
  expect(intl.fluentDatetime({ d })).toEqual(expected);
  expect(intl.msgfmtDatetime({ d })).toEqual(expected);
}
