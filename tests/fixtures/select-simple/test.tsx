import { loadLanguage } from "./";

export async function test() {
  const intl = await loadLanguage("de");

  expect(intl.msgfmtSelect({ param: "a" })).toEqual("its a");
  expect(intl.msgfmtSelect({ param: "b" })).toEqual("its b");
  expect(intl.msgfmtSelect({ param: "foo" })).toEqual("its something else");

  expect(intl.fluentSelect({ param: "a" })).toEqual("its a");
  expect(intl.fluentSelect({ param: "b" })).toEqual("its b");
  expect(intl.fluentSelect({ param: "foo" })).toEqual("its something else");
}
