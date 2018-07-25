import Message from "./Message";
import { Language as ILanguage } from "./types";

const RESERVED = new Set(["locale"]);

function camelify(str: string) {
  return str.replace(/-(\w|$)/g, (_, ch) => ch.toUpperCase());
}

export default class Language implements ILanguage {
  public messages = new Map<string, Message>();

  public constructor(public locale: string) {}

  public addMessages(messages: { [identifier: string]: string }) {
    for (const [id, msg] of Object.entries(messages)) {
      this.addMessage(id, msg);
    }
  }

  public addMessage(identifier: string, message: string) {
    if (RESERVED.has(identifier)) {
      console.warn(`The key "${identifier}" is used internally by intl-codegen.`);
      console.warn(`Consider using a different key instead.`);
    }

    const msg = new Message(camelify(identifier), message);
    this.messages.set(identifier, msg);
  }
}
