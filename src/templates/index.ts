export const main = `
import React from "react";

const { Provider, Consumer } = React.createContext(undefined);
export { Provider, Consumer };

function camelify(str) {
  return str.replace(/-(\\w|$)/g, (_, ch) => ch.toUpperCase());
}

const cachedLanguage = new Map();
export async function loadLanguage(locale) {
  let language = cachedLanguage.get(locale);
  if (language) return language;

  let fns;
  // __LOADERS__

  language = {};
  for (const [id, fn] of Object.entries(fns.default)) {
    language[camelify(id)] = createTextWrapper(fn);
    language[\`__react__\${id}\`] = createReactWrapper(fn);
  }

  cachedLanguage.set(locale, language);
  return language;
}

function createTextWrapper(fn) {
  return params => fn(params).join("");
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

  const Localized: React.SFC<__COMPONENTS__>;

  type Provider = React.Provider<Intl>;
  type Consumer = React.Provider<Intl>;

  function loadLanguage(locale: string): Promise<Intl>;
}
`.trim();
