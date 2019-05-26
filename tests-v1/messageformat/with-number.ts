const params = {
  num: 1234567.890123,
  prc: 0.494,
};

// well, that is kinda funny:
// intl-messageformat actually has a predefined `currency` format,
// but that actually errors because one also needs to provide a currency code!

export default {
  message: `With a number: {num, number}
    And a percentage: {prc, number, percent}
    And a custom currency: {num, number, currency:EUR}
    `.trim(),
  formats: {
    number: {
      "currency:EUR": {
        style: "currency",
        currency: "EUR",
      },
    },
  },
  cases: [
    {
      locale: "en",
      params,
    },
    {
      locale: "de",
      params,
    },
  ],
};
