export default {
  languages: {
    en: {
      test: "with a {parameter}",
    },
  },
  code: `
import React from "react";
import { Provider, Consumer, Localized, loadLanguage } from "./lang";

(async function test() {
  const lang = await loadLanguage("en");

  lang.test({ prmtr: "parameter" });

  return (
    <Provider value={lang}>
      <Localized id="test" params={{ prmtr: "parameter" }} />
      <Consumer>
        {intl => intl.test({ prmtr: "parameter" })}
      </Consumer>
    </Provider>
  )
})();
  `,
};
