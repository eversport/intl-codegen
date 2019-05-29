import { LocaleId } from "./types";
import { Locale } from "./locale";

/**
 * A `Bundle` is a collection of multiple locales and their messages.
 */
export class Bundle {
  public locales = new Map<LocaleId, Locale>([["template" as LocaleId, new Locale("template" as LocaleId)]]);

  // public addFluentMessages(locale: LocaleId, sourceText: string) {
  //   return this;
  // }

  // public addMessageFormat(locale: LocaleId, id: MessageId, sourceText: string) {
  //   return this;
  // }
}
