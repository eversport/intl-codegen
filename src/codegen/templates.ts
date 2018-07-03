export const main = `
import React from "react";

function dashify(str) {
  return str.replace(/([A-Z])/g, "-$1").toLowerCase();
}

export const locales = [__LOCALES__];

const cachedLanguage = new Map();
export async function loadLanguage(locale) {
  let language = cachedLanguage.get(locale);
  if (language) return language;

  let fns;
  __LOADERS__

  language = { locale };
  for (const [id, fn] of Object.entries(fns.default)) {
    language[id] = createTextWrapper(fn);
    language[\`__react__\${dashify(id)}\`] = createReactWrapper(fn);
  }

  cachedLanguage.set(locale, language);
  return language;
}
loadLanguage.locales = locales;

function createTextWrapper(fn) {
  return params => fn(params).map(String).join("");
}

function createReactWrapper(fn) {
  return params => React.createElement(React.Fragment, undefined, ...fn(params));
}

const { Provider, Consumer } = React.createContext(undefined);
export { Provider, Consumer };

export function Localized({ id, params }) {
  return React.createElement(Consumer, undefined, intl => intl[\`__react__\${id}\`](params));
}
`.trim();

export const types = `
import React from "react";

export = Intl;
export as namespace Intl;

declare namespace Intl {
  type Locales = __LOCALES__;

  interface Intl {
__PROPS__
  }

  interface LoadLanguage {
    (locale: Locales): Promise<Intl>;
    locales: Array<Locales>;
  }

  const locales: Array<Locales>;
  const loadLanguage: LoadLanguage;

  const Provider: React.Provider<Intl>;
  const Consumer: React.Consumer<Intl>;

  const Localized: React.SFC<__COMPONENTS__>;
}
`.trim();
