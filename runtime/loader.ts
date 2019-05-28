import { negotiateLanguages } from "fluent-langneg";
import { parseRequestedLanguages } from "./requested-language";
import { Context } from "./context";

interface MessageFile {
  default: (ctx: Context) => Array<any>;
}

interface LocaleInfo<T extends string = string> {
  requested: string | Array<string>;
  loaded: T;
  formatter: string;
}

type IntlObject<T extends {}> = T & { locale: LocaleInfo };

type LoaderFn<T> = (locale: string | Array<string>) => Promise<IntlObject<T>>;

interface LoaderMap {
  [locale: string]: () => Promise<MessageFile>;
}

export function defineLoader<T extends {}>(messageIds: Array<keyof T>, loaders: LoaderMap): LoaderFn<T> {
  const availableLocales = Object.keys(loaders);

  return async languages => {
    const requestedLocales = parseRequestedLanguages(languages);
    const [resolvedLocale] = negotiateLanguages(requestedLocales, availableLocales, {
      defaultLocale: "template",
      strategy: "lookup",
    });

    const formatterLocale = new Intl.NumberFormat(requestedLocales).resolvedOptions().locale;
    const context = new Context(formatterLocale);
    const messageFile = await loaders[resolvedLocale]();
    const messages = messageFile.default(context);

    const locale: LocaleInfo = {
      requested: requestedLocales,
      loaded: resolvedLocale,
      formatter: formatterLocale,
    };

    const intl: any = { locale };

    for (const [idx, id] of messageIds.entries()) {
      intl[id] = messages[idx];
    }

    return intl;
  };
}
