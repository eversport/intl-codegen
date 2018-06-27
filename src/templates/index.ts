export const main = `
import React from "react";

const { Provider, Consumer } = React.createContext(undefined);
export { Provider, Consumer };

function dashify(str) {
  return str.replace(/([A-Z])/g, "-$1").toLowerCase();
}

const cachedLanguage = new Map();
export async function loadLanguage(locale) {
  let language = cachedLanguage.get(locale);
  if (language) return language;

  let fns;
  // __LOADERS__

  language = {};
  for (const [id, fn] of Object.entries(fns.default)) {
    language[id] = createTextWrapper(fn);
    language[\`__react__\${dashify(id)}\`] = createReactWrapper(fn);
  }

  cachedLanguage.set(locale, language);
  return language;
}

function createTextWrapper(fn) {
  return params => fn(params).map(String).join("");
}

function createReactWrapper(fn) {
  return params => React.createElement(React.Fragment, undefined, ...fn(params));
}

export function Localized({ id, params }) {
  return React.createElement(Consumer, undefined, intl => intl[\`__react__\${id}\`](params));
}
`.trim();

export const types = `
import React from "react";

export = Intl;
export as namespace Intl;

declare namespace Intl {
  interface Intl {
__PROPS__
  }
  function loadLanguage(locale: __LOCALES__): Promise<Intl>;

  const Provider: React.Provider<Intl>;
  const Consumer: React.Consumer<Intl>;

  const Localized: React.SFC<__COMPONENTS__>;
}
`.trim();
