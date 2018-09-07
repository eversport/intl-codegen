export default {
  languages: {
    en: {
      test: "with a {parameter}",
      "test-dashed": "a dashed id with {second} parameter",
    },
  },
  code: `
import React from "react";
import { Provider, Consumer, Localized, loadLanguage } from "./lang";

(async function test() {
  const lang = await loadLanguage("en");

  lang.test({ prmtr: "parameter" });
  lang.testDashed({ parameter: "parameter" });
  lang["test-dashed"]({ parameter: "parameter" });

  return (
    <Provider value={lang}>
      <Localized id="test" params={{ prmtr: "parameter" }} />
      <Localized id="test-dashed" params={{ parameter: "parameter" }} />
      <Consumer>
        {intl => intl.test({ prmtr: "parameter" })}
      </Consumer>
    </Provider>
  )
})();
  `,
};
