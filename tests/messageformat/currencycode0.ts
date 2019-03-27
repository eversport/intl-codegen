export default {
  message: `{total, number, currencycode0}`,
  compress: true,
  cases: [
    // beware! these are not normal spaces!
    {
      params: { total: { value: 1234, currency: "EUR" } },
      locale: "de",
      expected: "1.234 EUR",
    },
    {
      params: { total: { value: 1234, currency: "EUR" } },
      locale: "en",
      expected: "EUR 1,234",
    },
    {
      params: { total: { value: 1234, currency: "HUF" } },
      locale: "de",
      expected: "1.234 HUF",
    },
    {
      params: { total: { value: 12345, currency: "JPY" } },
      locale: "de",
      expected: "12.345 JPY",
    },
    {
      params: { total: { value: 12345, currency: "JPY" } },
      locale: "en",
      expected: "JPY 12,345",
    },
    {
      params: { total: { value: 1234, currency: "USD" } },
      locale: "de",
      expected: "1.234 USD",
    },
    {
      params: { total: { value: 1234, currency: "USD" } },
      locale: "en",
      expected: "USD 1,234",
    },
  ],
};
