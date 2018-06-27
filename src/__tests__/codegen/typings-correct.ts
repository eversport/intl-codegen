export default {
  languages: {
    en: {
      test: "with a {parameter}",
      test2: "another simple string",
    },
  },
  code: `
import React from "react";
import { Provider, Consumer, Localized, loadLanguage } from "./lang";

(async function test() {
  const lang = await loadLanguage("en");

  lang.test({ parameter: "parameter" });

  return (
    <Provider value={lang}>
      <Localized id="test" params={{ parameter: "parameter" }} />
      <Consumer>
        {intl => intl.test({ parameter: "parameter" })}
      </Consumer>
    </Provider>
  )
})();
  `,
};
