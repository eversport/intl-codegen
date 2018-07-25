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

  ensureCompiledFixture("react", async dir => {
    const { loadLanguage, Consumer, Provider, Localized } = require(dir);
    let lang, rendered;

    lang = await loadLanguage("en");
    rendered = renderToStaticMarkup(
      <Provider value={lang}>
        <Localized id="test" params={{ react: <strong>react</strong> }} />
      </Provider>,
    );
    expect(rendered).toEqual("a <strong>react</strong> element");

    lang = await loadLanguage("de");
    rendered = renderToStaticMarkup(
      <Provider value={lang}>
        <Localized id="test" params={{ react: <strong>react</strong> }} />
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
  });

  testTypings("typings-correct");
  testTypings("typings-locales");
  testTypings("typings-no-strings");

  testTypings("typings-wrong-locale");
  testTypings("typings-wrong-id");
  testTypings("typings-wrong-param");
});
