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
    const dashed = dashify(id);

    language[id] = createTextWrapper(fn);
    language[\`__react__\${id}\`] = createReactWrapper(fn);

    if (dashed !== id) {
      language[dashed] = language[id];
      language[\`__react__\${dashed}\`] = createReactWrapper(fn);
    }
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

const Context = React.createContext(undefined);
const { Provider, Consumer } = Context;
export { Context, Provider, Consumer };

export function withIntl(Component) {
  return React.forwardRef((props, ref) =>
    React.createElement(Consumer, undefined, intl => {
      return React.createElement(Component, { ...props, ref, intl })
    })
  );
}

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

export type Locales = __LOCALES__;

export interface Intl {
__PROPS__
}

interface LoadLanguage {
  (locale: Locales): Promise<Intl>;
  locales: Array<Locales>;
}

export type Ids = __IDS__;

export const locales: Array<Locales>;
export const loadLanguage: LoadLanguage;

export const Context: React.Context<Intl>;
export const Provider: React.Provider<Intl>;
export const Consumer: React.Consumer<Intl>;

export interface WithIntl {
  intl: Intl
}
export function withIntl<P extends WithIntl>(Component: React.ComponentType<P>):
  React.FC<Pick<P, Exclude<keyof P, "intl">>>;

export const Localized: React.FC<__COMPONENTS__>;
`.trim();
