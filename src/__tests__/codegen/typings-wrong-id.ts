export default {
  languages: {
    en: {
      test: "with a {parameter}",
    }
  },
  code: `
import React from "react";
import { Provider, Consumer, Localized, loadLanguage } from "./lang";

(async function test() {
  const lang = await loadLanguage("en");

  lang.nonExistant({ parameter: "parameter" });

  return (
    <Provider value={lang}>
      <Localized id="non-existant" params={{ parameter: "parameter" }} />
      <Consumer>
        {intl => intl.nonExistant({ parameter: "parameter" })}
      </Consumer>
    </Provider>
  )
})();
  `
}
