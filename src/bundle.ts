import { LocaleId, MessageId } from "./types";
import { Message } from "./message";

/**
 * A `Bundle` is a collection of multiple locales and their messages.
 */
export class Bundle {
  public locales = new Map<LocaleId, Map<MessageId, Message>>([["template" as LocaleId, new Map()]]);

  // public addFluentMessages(locale: LocaleId, sourceText: string) {
  //   return this;
  // }

  // public addMessageFormat(locale: LocaleId, id: MessageId, sourceText: string) {
  //   return this;
  // }
}
