import { negotiateLanguages } from "fluent-langneg";
import { Context, LocaleInfo } from "./context";
import { parseRequestedLanguages } from "./requested-language";

interface MessageFile {
  default: (ctx: Context<any>) => Array<any>;
}

export type IntlObject<Messages, Locales> = Messages & { context: Context<Locales> };

export type LoaderFn<Messages, Locales> = (locale: string | Array<string>) => Promise<IntlObject<Messages, Locales>>;

interface LoaderMap {
  readonly [locale: string]: () => Promise<MessageFile>;
}

export function defineLoader<Messages extends {}, Locales extends string>(
  messageIds: ReadonlyArray<string>,
  loaders: LoaderMap,
  fallbackLocale: string = "template",
): LoaderFn<Messages, Locales> {
  const availableLocales = Object.keys(loaders);

  return async languages => {
    const requestedLocales = parseRequestedLanguages(languages);
    const [resolvedLocale] = negotiateLanguages(requestedLocales, availableLocales, {
      defaultLocale: fallbackLocale,
      strategy: "lookup",
    });

    const formatterLocale = new Intl.NumberFormat(requestedLocales).resolvedOptions().locale;

    const locale: LocaleInfo<Locales> = {
      requested: requestedLocales,
      loaded: resolvedLocale as Locales,
      formatter: formatterLocale,
    };
    const context = new Context(locale);
    const messageFile = await loaders[resolvedLocale]();
    const messages = messageFile.default(context);

    const intl: any = { context };

    for (const [idx, id] of messageIds.entries()) {
      intl[id] = messages[idx];
    }

    return intl;
  };
}
