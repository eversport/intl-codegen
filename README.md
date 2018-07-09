# intl-codegen – generate code and type definitions from translations

[![Build Status](https://img.shields.io/travis/eversport/intl-codegen.svg)](https://travis-ci.org/eversport/intl-codegen)
[![Coverage Status](https://img.shields.io/codecov/c/github/eversport/intl-codegen.svg)](https://codecov.io/gh/eversport/intl-codegen)

If you want to translate your react app, you usually end up using [react-intl][react-intl]. But doing so has a few problems.

- `react-intl` is [42k minified][react-intl-bundle], which is quite a lot.
- it also parses all your translation strings at start time, which might hurt performance.
- while `react-intl` itself has `@types`, there is no way actually validate the correct usage of your translations.

[react-intl]: https://github.com/yahoo/react-intl
[react-intl-bundle]: https://bundlephobia.com/result?p=react-intl

**intl-codegen** was born to solve the above problems:

- it compiles your translation strings into javascript functions at compile time
- it has a minimal 30 SLOC runtime, so the codesize is negligible.
- but the best thing of all: it also generates typescript definitions depending on your translation strings, so it can validate correct usage and parameters.

## Example

### At Compile time

```ts
import IntlCodegen from "intl-codegen";

const codegen = new IntlCodegen();
codegen.getLanguage("en").addMessage("id", "An english translation with {parameter}");
codegen.getLanguage("de").addMessage("id", "Eine deutsche Übersetzung mit {parameter}");
await codegen.writeFiles("./localization");
```

### At Runtime

```ts
import React from "react";
// NOTE: the relative path here
import { Provider, Consumer, Localized, loadLanguage } from "./localization";

async function App() {
  const intl = loadLanguage("de");
  return (
    <Provider value={intl}>
      <>
        {/* Use the React API that renders React Nodes: */}
        <Localized id="id" params={{ parameter: <span>react elem</span> }} />
        {/* Or use intl object directly via React Context: */}
        <Consumer>{intl => intl.id({ parameter: "string" })}</Consumer>
      </>
    </Provider>
  );
}
```

## MessageFormat Syntax

There is a great explanation of the _MessageFormat_ syntax on the
[formatjs.io](https://formatjs.io/guides/message-syntax/) website!
So far, `intl-codegen` only supports a very limited set of features, but other
features will be added as we go forward.

## Codegen API

The codegen API looks like this (in typescript syntax):

```ts
interface GeneratedCode {
  [fileName: string]: string;
}

interface Language {
  addMessage(identifier: string, message: string): void;
  addMessages(messages: { [identifier: string]: string }): void;
}

interface Options {
  defaultLocale?: string;
  formats?: any;
}

class IntlCodegen {
  constructor(options?: Options);
  constructor(defaultLocale?: string);
  getLanguage(locale: string): Language;
  generateFiles(): GeneratedCode;
  writeFiles(outputDirectory: string): Promise<GeneratedCode>;
}
```

## Runtime API

Your generated code exports the following API (in typescript syntax):

```ts
/**
 * The Intl object has one function property per translation string you defined.
 * In this example, the translation string `string with {param1}.` with identifier
 * `test` will generate the following signature:
 */
interface Intl {
  test(params: { param1: any }): string;
  locale: string;
}

/**
 * This will dynamically load one of your locales and returns an `Intl` instance
 * described below.
 */
interface LoadLanguage {
  (locale: string): Promise<Intl>;
  locales: Array<string>;
}

const locales: Array<string>;
const loadLanguage: LoadLanguage;

/**
 * This is the main Component you will use in your React app, like so:
 * `<Localized id="test" params={{ param1: <span>some other react elem</span> }} />`
 * If you are using typescript, it will validate that all your props are correct.
 */
const Localized: React.SFC<{
  id: "test";
  params: { param1: any };
}>;

/**
 * *intl-codegen* generated code uses the React Context API.
 */
type Provider = React.Provider<Intl>;
type Consumer = React.Provider<Intl>;
```

## ChangeLog

### 1.2.0 UNRELEASED

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

## Roadmap

- [ ] support all of MessageFormat:
  - [x] date formatting
  - [x] number formatting, including currencies
  - [x] basic pluralization
  - [ ] full pluralization, with all cases, offsets and ordinals
- [ ] validate types for number / date
- [x] generate shorter code for branchless messages
- [ ] support dynamic currency usage
- [ ] make react usage optional, so projects not using react can have further codesize savings
- [ ] benchmark and compare startup and runtime performance to `react-intl` / `intl-messageformat`
- [ ] support fluent translation syntax
