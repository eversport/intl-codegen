import { loadLanguage } from "./";

export async function test() {
  const intl = await loadLanguage("de");

  const params = { num: 123456.789, dt: new Date("2019-01-01T16:47:52.095Z") };

  // will be formatted according to the type
  expect(intl.msgfmt(params)).toEqual("num: 123.456,789, date: 1.1.2019, time: 1.1.2019");
}
