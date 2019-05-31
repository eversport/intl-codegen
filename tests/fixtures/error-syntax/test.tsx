import { loadLanguage } from "./";

export async function test() {
  const intl = await loadLanguage("de");

  // MessageFormat will copy the message
  expect(intl.msgfmtJunk()).toEqual("msgfmt-junk");

  // fluent will not define the message at all
  try {
    intl.fluentJunk();
  } catch {}
}
