import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { loadLanguage, Provider, Localized } from "./react";

export async function test() {
  let intl, rendered;

  const params = { react: <strong>react</strong> };

  intl = await loadLanguage("en");
  rendered = renderToStaticMarkup(
    <Provider value={intl}>
      <Localized id="with-element" params={params} /> <Localized id="a-dashed-id" />
    </Provider>,
  );
  expect(rendered).toEqual("a <strong>react</strong> element dashed!");

  intl = await loadLanguage("de");
  rendered = renderToStaticMarkup(
    <Provider value={intl}>
      <Localized id="with-element" params={params} /> <Localized id="a-dashed-id" />
    </Provider>,
  );
  expect(rendered).toEqual("ein <strong>react</strong> element gebindestricht :-D");
}
