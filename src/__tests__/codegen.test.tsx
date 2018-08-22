import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ensureCompiledFixture, testTypings } from "./helpers";

// running typescript takes quite some time
jest.setTimeout(10 * 1000);

describe("Codegen", () => {
  ensureCompiledFixture("simple", async dir => {
    const { loadLanguage } = require(dir);
    let lang;

    lang = await loadLanguage("en");
    expect(lang.test()).toEqual("en");

    lang = await loadLanguage("de");
    expect(lang.test()).toEqual("de");

    lang = await loadLanguage("fallback");
    expect(lang.locale).toEqual("en");
    expect(lang.test()).toEqual("en");
  });

  ensureCompiledFixture("dashed-ids", async dir => {
    const { loadLanguage } = require(dir);
    let lang;

    lang = await loadLanguage("en");
    expect(lang.aDashedId()).toEqual("dashed!");
  });

  beforeEach(() => {
    jest.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  ensureCompiledFixture("react", async dir => {
    const { loadLanguage, Consumer, Provider, Localized, withIntl } = require(dir);
    let lang, rendered;

    const params = { react: <strong>react</strong> };

    lang = await loadLanguage("en");
    rendered = renderToStaticMarkup(
      <Provider value={lang}>
        <Localized id="test" params={params} />
      </Provider>,
    );
    expect(rendered).toEqual("a <strong>react</strong> element");

    lang = await loadLanguage("de");
    rendered = renderToStaticMarkup(
      <Provider value={lang}>
        <Localized id="test" params={params} />
      </Provider>,
    );
    expect(rendered).toEqual("ein <strong>react</strong> element");

    lang = await loadLanguage("de");
    rendered = renderToStaticMarkup(
      <Provider value={lang}>
        <Consumer>
          {(intl: any) => {
            const text = intl.test({ react: "text" });
            return `${typeof text}: ${text}`;
          }}
        </Consumer>
      </Provider>,
    );
    expect(rendered).toEqual("string: ein text element");

    const MyComponent = withIntl(({ prop, intl }: { prop: string; intl: any }) => {
      const text = intl.test({ react: prop });
      return `${typeof text}: ${text}`;
    });

    lang = await loadLanguage("de");
    rendered = renderToStaticMarkup(
      <Provider value={lang}>
        <MyComponent prop="text" />
      </Provider>,
    );
    expect(rendered).toEqual("string: ein text element");

    rendered = renderToStaticMarkup(
      <>
        <Localized id="test" params={params} />
        <Localized id="test2" params={params} />
      </>,
    );
    expect(rendered).toEqual("");
    expect(console.warn).toHaveBeenCalledTimes(1);
    expect(console.warn).toHaveBeenCalledWith(
      "Localization not initialized correctly.\nMake sure to include `<Provider value={await loadLanguage(__LOCALE__)}>` in your component tree.",
    );

    jest.resetAllMocks();

    lang = await loadLanguage("de");
    rendered = renderToStaticMarkup(
      <Provider value={lang}>
        <>
          <Localized id="invalid" params={params} /> <Localized id="invalid" params={params} />{" "}
          <Localized id="invalid2" params={params} />
        </>
      </Provider>,
    );
    expect(rendered).toEqual("invalid invalid invalid2");
    expect(console.warn).toHaveBeenCalledTimes(2);
    expect(console.warn).toHaveBeenNthCalledWith(1, `The translation key "invalid" is not defined.`);
    expect(console.warn).toHaveBeenNthCalledWith(2, `The translation key "invalid2" is not defined.`);
  });

  testTypings("typings-correct");
  testTypings("typings-locales");
  testTypings("typings-no-strings");

  testTypings("typings-ids");
  testTypings("typings-withIntl");

  testTypings("typings-wrong-locale");
  testTypings("typings-wrong-id");
  testTypings("typings-wrong-param");
});
