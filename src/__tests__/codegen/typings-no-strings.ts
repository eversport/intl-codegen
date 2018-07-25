export default {
  languages: {},
  code: `
import React from "react";
import { Provider, Localized, loadLanguage } from "./lang";

(async function test() {
  const lang = await loadLanguage("en");

  return (
    <Provider value={lang}>
      <Localized />
    </Provider>
  )
})();
  `,
};
