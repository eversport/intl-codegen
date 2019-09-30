import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Consumer, loadLanguage, Provider, useIntl } from "./react";

const MyComponent: React.FC = () => {
  const intl = useIntl();
  return (
    <>
      {intl({ id: "with-element", params: { react: <em>em</em> } })}
      {"\n"}
      {intl("a-dashed-id")}
      {"\n"}
      {intl.aDashedId()}
    </>
  );
};

export async function test() {
  let intl, rendered;

  // consumer api
  intl = await loadLanguage("de");
  rendered = renderToStaticMarkup(
    <Provider value={intl}>
      <Consumer>
        {intl => {
          // should raise a type-error because its nullable
          intl.withElement({ react: "text" });

          if (!intl) {
            throw new Error();
          }
          const elem = intl({ id: "with-element", params: { react: <em>em</em> } });
          const text = intl.withElement({ react: "text" }).join("");
          return (
            <>
              {elem}
              {`\n${typeof text}: ${text}`}
            </>
          );
        }}
      </Consumer>
    </Provider>,
  );
  expect(rendered).toEqual("a <em>em</em> element\nstring: a text element");

  // useIntl api
  intl = await loadLanguage("de");
  rendered = renderToStaticMarkup(
    <Provider value={intl}>
      <MyComponent />
    </Provider>,
  );
  expect(rendered).toEqual("a <em>em</em> element\ndashed!\ndashed!");
}
