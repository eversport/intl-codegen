export default {
  languages: {
    en: {
      test: "with a {parameter}",
      test2: "another simple string",
      "test-dashed": "a dashed id with {second} parameter",
    },
  },
  code: `
import React from "react";
import { Provider, Consumer, Localized, loadLanguage } from "./lang";

(async function test() {
  const lang = await loadLanguage("en");

  lang.test({ parameter: "parameter" });
  lang.testDashed({ second: "parameter" });
  lang["test-dashed"]({ second: "parameter" });

  return (
    <Provider value={lang}>
      <Localized id="test" params={{ parameter: "parameter" }} />
      <Localized id="test-dashed" params={{ second: "parameter" }} />
      <Consumer>
        {intl => intl.test({ parameter: "parameter" })}
      </Consumer>
    </Provider>
  );
})();
  `,
};
