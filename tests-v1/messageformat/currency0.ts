export default {
  message: `{total, number, currency0}`,
  compress: true,
  cases: [
    // beware! these are not normal spaces!
    {
      params: { total: { value: 1234, currency: "EUR" } },
      locale: "de",
      expected: "1.234 €",
    },
    {
      params: { total: { value: 1234, currency: "EUR" } },
      locale: "en",
      expected: "€1,234",
    },
    {
      params: { total: { value: 1234, currency: "HUF" } },
      locale: "de",
      expected: "1.234 HUF",
    },
    {
      params: { total: { value: 12345, currency: "JPY" } },
      locale: "de",
      expected: "12.345 ¥",
    },
    {
      params: { total: { value: 12345, currency: "JPY" } },
      locale: "en",
      expected: "¥12,345",
    },
    {
      params: { total: { value: 1234, currency: "USD" } },
      locale: "de",
      expected: "1.234 $",
    },
    {
      params: { total: { value: 1234, currency: "USD" } },
      locale: "en",
      expected: "$1,234",
    },
  ],
};
