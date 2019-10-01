# Runtime API

The generated code currently is split up into straight js code, or into react
specific code.

## Functional Example

```ts
import { loadLanguage } from "./output-directory";

// load a language based on language detection
const intl = await loadLanguage(navigator.languages);

// the `intl` object has all the defined messages as functions
intl.messageId({ param1: { value: 1234.56, currency: "EUR" } });

// it also has a context, with locale information as well as some formatting
// related helpers
console.log(intl.context.locale.loaded);
const mf = intl.context.createMonetaryFormatter();
console.log(mf({ value: 1234.56, currency: "EUR" }));
```

## Data-Oriented Example

```ts
import { loadLanguage, TranslationKey } from "./output-directory";

// The `TranslationKey` type can be used in custom user code, and metadata about
// the desired translation can be passed around freely.
let key: TranslationKey = "message-id";
key = { id: "message-id-with-params", params: { a: "a string" } };

// Then at a later point in the application lifecycle, the translation is
// actually applied…
const intl = await loadLanguage(navigator.languages);
console.log(intl(key));
```

## React Example

```tsx
import { loadLanguage, Provider, Localized, useIntl } from "./output-directory/react";

<Provider value={await loadLanguage(navigator.languages)}>
  <Localized id="message-id" params={{ param1: { value: 1234.56, currency: "EUR" } }} />
</Provider>;

// or inside a component using hooks:
function MyComponent() {
  // please note that the context could potentially be `undefined`, if one forgets
  // the `Provider` wrapper.
  const intl = useIntl();

  // just like in the non-react example above
  return intl.messageId({ param1: { value: 1234.56, currency: "EUR" } });
}
```
