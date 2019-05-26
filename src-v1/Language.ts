import Message from "./Message";

const RESERVED = new Set(["locale"]);

// TODO: add TSDocs for these interfaces

export interface Messages {
  [identifier: string]: string;
}

export interface ILanguage {
  addMessage(identifier: string, message: string): void;
  addMessages(messages: Messages): void;
}

export class Language implements ILanguage {
  public messages = new Map<string, Message>();

  public constructor(public locale: string) {}

  public addMessages(messages: Messages) {
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
