import { Message } from "./message";
import { LocaleId, MessageId } from "./types";

export class Locale {
  public readonly messages: Map<MessageId, Message> = new Map();

  constructor(public readonly locale: LocaleId) {}
}
