import { loadLanguage } from "./";

export async function test() {
  const intl = await loadLanguage("de-DE");
  const value = {
    value: 123456.789,
    currency: "EUR",
  };
  expect(intl.fluentMonetary({ value })).toEqual("a monetary value: 123.456,79 €");
  expect(intl.msgfmtMonetary({ value })).toEqual("a monetary value: 123.456,79 €");

  try {
    // calling with wrong parameter
    intl.fluentMonetary({ value: 123 });
    intl.fluentMonetary({ value: { value: 123 } });
  } catch {}
}
