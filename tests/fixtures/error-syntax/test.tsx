import { loadLanguage } from "./";

export async function test() {
  const intl = await loadLanguage("de");

  // MessageFormat will copy the message
  expect(intl.msgfmtJunk()).toEqual("msgfmt-junk");

  // fluent will not define the message at all
  expect(() => intl.fluentJunk()).toThrow();

  // attributes are just ignored
  expect(intl.fluentUnsupportedAttributes()).toEqual("with attributes");

  // message and term references are stringified
  expect(intl.fluentUnsupportedReferences()).toEqual("{message-reference} {-term-reference}");
}
