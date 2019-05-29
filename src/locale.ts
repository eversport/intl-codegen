import { LocaleId, MessageId } from "./types";
import { Message } from "./message";

export class Locale {
  public readonly messages: Map<MessageId, Message> = new Map();

  constructor(public readonly locale: LocaleId) {}
}
