import { loadLanguage } from "./";

export async function test() {
  const intl = await loadLanguage("en");

  expect(intl.msgfmtSelect({ param: 0 })).toEqual("no items");
  expect(intl.msgfmtSelect({ param: 1 })).toEqual("one item");
  expect(intl.msgfmtSelect({ param: 10 })).toEqual("10 items");

  expect(intl.fluentSelect({ param: 0 })).toEqual("no items");
  expect(intl.fluentSelect({ param: 1 })).toEqual("one item");
  expect(intl.fluentSelect({ param: 10 })).toEqual("10 items");
}
