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

const warned = {};
function warnOnce(msg) {
  if (warned[msg]) { return; }
  console.warn(msg);
  warned[msg] = true;
}

export function Localized({ id, params }) {
  return React.createElement(Consumer, undefined, intl => {
    if (!intl) {
      warnOnce("Localization not initialized correctly.\\nMake sure to include \`<Provider value={await loadLanguage(__LOCALE__)}>\` in your component tree.");
      return;
    }
    const fn = intl[\`__react__\${id}\`];
    if (fn) {
      return fn(params);
    }
    warnOnce(\`The translation key "\${id}" is not defined.\`);
    return id;
  });
}
`.trim();

export const types = `
import React from "react";

type Locales = __LOCALES__;

interface Intl {
__PROPS__
}

interface LoadLanguage {
  (locale: Locales): Promise<Intl>;
  locales: Array<Locales>;
}

export type Ids = __IDS__;

export const locales: Array<Locales>;
export const loadLanguage: LoadLanguage;

export const Provider: React.Provider<Intl>;
export const Consumer: React.Consumer<Intl>;

export const Localized: React.SFC<__COMPONENTS__>;
`.trim();
