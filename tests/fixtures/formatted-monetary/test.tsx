import { loadLanguage } from "./";

export async function test() {
  const intl = await loadLanguage("de-DE");

  const num = {
    value: 123456789,
    currency: "EUR",
  };
  const expected = `
currency: 123.456.789,00 €
currency0: 123.456.789 €
currencycode: 123.456.789,00 EUR
currencycode0: 123.456.789 EUR
  `.trim();

  expect(intl.fluentMonetary({ num })).toEqual(expected);
  expect(intl.msgfmtMonetary({ num })).toEqual(expected);
}
