import { loadLanguage } from "./";

export async function test() {
  const intl = await loadLanguage("de");

  const d = new Date("2019-01-01T16:47:52.095Z");

  // it will format normal values as how they are declared
  expect(intl.msgfmtDateAsNumber({ param: d })).toEqual("1.1.2019");
  expect(intl.fluentDateAsNumber({ param: d })).toEqual("1.1.2019");

  expect(intl.msgfmtNumberAsDate({ param: 123456.789 })).toEqual("123.456,789");
  expect(intl.fluentNumberAsDate({ param: 123456.789 })).toEqual("123.456,789");

  // it will downgrade to a string-based selector
  expect(intl.msgfmtStringAsOrdinal({ param: "one" })).toEqual("onest");
  expect(intl.fluentStringAsOrdinal({ param: "one" })).toEqual("onest");
  expect(intl.msgfmtStringAsOrdinal({ param: "anything else" })).toEqual("anything elseth");
  expect(intl.fluentStringAsOrdinal({ param: "anything else" })).toEqual("anything elseth");

  expect(intl.msgfmtStringAsPlural({ param: "one" })).toEqual("one parameter");
  expect(intl.msgfmtStringAsPlural({ param: "anything else" })).toEqual("anything else parameters");
  expect(intl.fluentStringAsPlural({ param: "one" })).toEqual("one parameter");
  expect(intl.fluentStringAsPlural({ param: "anything else" })).toEqual("anything else parameters");
}
