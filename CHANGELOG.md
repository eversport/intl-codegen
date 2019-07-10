### 2.0.0 2019-07-10

- See the [introductory blog post](https://swatinem.de/blog/intl-codegen-2/) for
  an overview of features and the docs for an overview of the API.

### 1.7.1 2019-05-06

- Update deprecated `React.SFC` usage

### 1.7.0 2019-03-27

- Add special `currency`, `currency0`, `currencycode` and `currencycode0` formats
  for the `number` type.
  These are implemented in a special way and expect a
  `{ currency: string, value: number }` object as argument. No typechecking however :-(

### 1.6.1 2018-11-12

- Massively improved error messages when encountering invalid / unsupported syntax
- Add a `WithIntl` type to accompany the `withIntl` HOC

### 1.5.1 2018-10-19

- Improve codegen a bit, and allow camelCase Ids on `<Localized />` Component.

### 1.5.0 2018-09-07

- Also expose dashed Ids on the `Intl` object: `intl["my-dashed-id"]()`

### 1.4.0 2018-08-22

- Export all the message Ids as `Ids` typescript type
- Provide a `withIntl` HOC

### 1.3.1 2018-07-25

- Gracefully handle wrong usage of generated React Components.
- Warn at compile time about missing translations. It will now fall back to the
  messages defined in the `defaultLocale` if any other locale does not have those
  messages defined.

### 1.2.0 2018-07-09

- Simple plurals, with `=X` and `other` selectors are now supported.

### 1.1.0 2018-07-03

- `IntlCodegen` constructor now takes an optional `Options` object, which can take
  custom formats.
- Generated code now includes a `locales` export, which is a list of all defined locales.
  This is also exposed as `loadLanguage.locales`.
- In a similar way, the loaded locales now have a `locale: string` prop.
- `IntlCodegen` will warn if you define a message that conflicts with any reserved key,
  such as the `locale` prop mentioned above.
- You can now use the `number`, `date` and `time` formats.
