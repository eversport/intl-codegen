import { loadLanguage } from "./";

export async function test() {
  const intl = await loadLanguage("en");

  // the "missing other" is a hard parser error now, so nothing will be parsed here.
  expect(intl.msgfmt({ param: "foo" })).toEqual("msgfmt");
  // expect(intl.msgfmt({ param: "foo" })).toEqual("selector: its foo.");
  // expect(intl.msgfmt({ param: "bar" })).toEqual("selector: its bar.");

  // // it will use the *last* selector in the list as the default
  // expect(intl.msgfmt({ param: "anything else" })).toEqual("selector: its bar.");
}
