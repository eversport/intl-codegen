import { loadLanguage } from "./";

export async function test() {
  const intl = await loadLanguage("en");

  expect(intl.msgfmtSelect({ param: 11 })).toEqual("11th");
  expect(intl.msgfmtSelect({ param: 22 })).toEqual("22nd");
  expect(intl.msgfmtSelect({ param: 23 })).toEqual("23rd");
  expect(intl.msgfmtSelect({ param: 31 })).toEqual("31st");

  expect(intl.fluentSelect({ param: 11 })).toEqual("11th");
  expect(intl.fluentSelect({ param: 22 })).toEqual("22nd");
  expect(intl.fluentSelect({ param: 23 })).toEqual("23rd");
  expect(intl.fluentSelect({ param: 31 })).toEqual("31st");
}
