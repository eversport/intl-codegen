import Message from "./Message";
import { Language as ILanguage } from "./types";

const RESERVED = new Set(["locale"]);

export default class Language implements ILanguage {
  public messages = new Map<string, Message>();

  public constructor(public locale: string) {}

  public addMessages(messages: { [identifier: string]: string }) {
    for (const [id, msg] of Object.entries(messages)) {
      this.addMessage(id, msg);
    }
  }

  public addMessage(id: string, message: string) {
    if (RESERVED.has(id)) {
      console.warn(`The key "${id}" is used internally by intl-codegen.`);
      console.warn(`Consider using a different key instead.`);
    }

    const msg = new Message({ locale: this.locale, id, code: message });
    this.messages.set(id, msg);
  }
}
