import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { loadLanguage, Localized, Provider, useIntl } from "./react";

// @ts-ignore: https://github.com/DefinitelyTyped/DefinitelyTyped/issues/20544
const MyComponent: React.FC = () => {
  const intl = useIntl();
  return intl.aDashedId();
};

export async function test() {
  let intl, rendered;
  intl = await loadLanguage("de");

  // using without initializing a `Provider`
  rendered = renderToStaticMarkup(
    <>
      <Localized id="a-dashed-id" /> <Localized id="a-dashed-id" />
    </>,
  );
  expect(rendered).toEqual("a-dashed-id a-dashed-id");
  expect(console.warn).toHaveBeenCalledTimes(1);
  expect(console.warn).toHaveBeenCalledWith(
    "Localization not initialized correctly.\nMake sure to include `<Provider value={intl}>` in your component tree.",
  );

  jest.resetAllMocks();

  // using hook without initializing a `Provider`
  expect(() => {
    rendered = renderToStaticMarkup(<MyComponent />);
  }).toThrowError(
    "Localization not initialized correctly.\nMake sure to include `<Provider value={intl}>` in your component tree.",
  );

  // using with unknown ids
  rendered = renderToStaticMarkup(
    <Provider value={intl}>
      <>
        <Localized id="invalid" /> <Localized id="invalid" /> <Localized id="invalid2" />
      </>
    </Provider>,
  );
  expect(rendered).toEqual("invalid invalid invalid2");
  expect(console.warn).toHaveBeenCalledTimes(2);
  expect(console.warn).toHaveBeenNthCalledWith(1, `The translation key "invalid" is not defined.`);
  expect(console.warn).toHaveBeenNthCalledWith(2, `The translation key "invalid2" is not defined.`);

  // should fail typechecks without an id
  rendered = renderToStaticMarkup(
    <Provider value={intl}>
      <>
        <Localized />
      </>
    </Provider>,
  );
  expect(rendered).toEqual("");
}
