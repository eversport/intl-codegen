import * as MessageFormat from "intl-messageformat-parser";
import Message from "./Message";

export default class Language {
  private _messages = new Map<string, Message>();

  public constructor(public locale: string) {}

  public addMessage(identifier: string, message: string) {
    const node = MessageFormat.parse(message);

    const msg = new Message(identifier, node);
    this._messages.set(identifier, msg);
  }

  /** @internal */
  public messages() {
    return this._messages.entries();
  }
}
