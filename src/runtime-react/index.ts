import { convertIdentifier } from "intl-codegen/runtime";
import React from "react";

const warned: { [key: string]: boolean } = {};
function warnOnce(msg: string) {
  if (warned[msg]) {
    return;
  }
  console.warn(msg);
  warned[msg] = true;
}

export interface ReactAPI<IntlType, LocalizedType> {
  Context: React.Context<IntlType | undefined>;
  Provider: React.Provider<IntlType | undefined>;
  Consumer: React.Consumer<IntlType | undefined>;
  Localized: React.FC<LocalizedType>;
  useIntl: () => IntlType | undefined;
}

export function createReactAPI<IntlType, LocalizedType extends { id: string; params?: any }>(): ReactAPI<
  IntlType,
  LocalizedType
> {
  const Context = React.createContext<IntlType | undefined>(undefined);
  const { Provider, Consumer } = Context;

  // @ts-ignore: https://github.com/DefinitelyTyped/DefinitelyTyped/issues/20544
  return { Context, Provider, Consumer, Localized, useIntl };

  function useIntl() {
    return React.useContext(Context);
  }

  function Localized({ id = "", params = {} }: LocalizedType): React.ReactNode {
    const intl = useIntl();
    if (!intl) {
      warnOnce(
        "Localization not initialized correctly.\nMake sure to include `<Provider value={intl}>` in your component tree.",
      );
      return id;
    }
    const fn: any = intl[convertIdentifier(id) as keyof IntlType];
    if (fn) {
      const result = fn(params);
      if (typeof result === "string") {
        return result;
      }
      return React.createElement(React.Fragment, undefined, ...result);
    }
    warnOnce(`The translation key "${id}" is not defined.`);
    return id;
  }
}
