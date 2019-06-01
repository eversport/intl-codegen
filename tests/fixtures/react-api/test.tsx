import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Consumer, loadLanguage, Provider, useIntl } from "./react";

// @ts-ignore: https://github.com/DefinitelyTyped/DefinitelyTyped/issues/20544
const MyComponent: React.FC = () => {
  const intl = useIntl();
  // should error because its nullable
  intl.aDashedId();

  if (!intl) {
    throw new Error();
  }
  return intl.aDashedId();
};

export async function test() {
  let intl, rendered;

  // consumer api
  intl = await loadLanguage("de");
  rendered = renderToStaticMarkup(
    <Provider value={intl}>
      <Consumer>
        {intl => {
          // should error because its nullable
          intl.withElement({ react: "text" });

          if (!intl) {
            throw new Error();
          }
          const text = intl.withElement({ react: "text" }).join("");
          return `${typeof text}: ${text}`;
        }}
      </Consumer>
    </Provider>,
  );
  expect(rendered).toEqual("string: a text element");

  // useIntl api
  intl = await loadLanguage("de");
  rendered = renderToStaticMarkup(
    <Provider value={intl}>
      <MyComponent />
    </Provider>,
  );
  expect(rendered).toEqual("dashed!");
}
