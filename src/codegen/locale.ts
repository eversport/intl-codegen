import { Locale } from "../locale";
import { Message } from "../message";
import { DateTimeFormat, Identifier, MonetaryFormat, NumberFormat, Pattern } from "../types";
import { CodeGenerator } from "./generator";
import { stable, hasElementParameter, isId } from "./helpers";

export class LocaleGenerator extends CodeGenerator {
  private formatters: Array<string> = [];
  generateFormatterFunction(format: NumberFormat | DateTimeFormat | MonetaryFormat): string {
    const creatorFn = format.type === "NumberFormat" ? "n" : format.type === "DateTimeFormat" ? "d" : "m";

    const stringified = `context.${creatorFn}(${stable(format.options)})`;

    let idx = this.formatters.indexOf(stringified);
    if (idx === -1) {
      idx = this.formatters.length;
      this.formatters.push(stringified);
    }

    return `formatter_${idx}`;
  }

  findFormatterFunctions(pattern: Pattern) {
    for (const elem of pattern.elements) {
      if (elem.type === "NumberFormat" || elem.type === "DateTimeFormat" || elem.type === "MonetaryFormat") {
        this.generateFormatterFunction(elem);
      }
    }
  }

  constructor(public locale: Locale) {
    super();
  }

  generate(): string {
    const { messages } = this.locale;

    const messageIds = [...messages.keys()];
    messageIds.sort((a, b) => a.localeCompare(b));

    // first, find all the formatters
    for (const msg of messages.values()) {
      this.findFormatterFunctions(msg.ir);
    }
    const { formatters } = this;

    if (formatters.length) {
      this.line("export default context => {");
      this.indent += 1;
      for (const [idx, formatter] of this.formatters.entries()) {
        this.line(`const formatter_${idx} = ${formatter};`);
      }
      this.blank();
      this.line("return [");
    } else {
      this.line("export default context => [");
    }

    for (const [idx, id] of messageIds.entries()) {
      this.generateMessage(messages.get(id)!);
      this.append(",");
      if (idx < messageIds.length - 1) {
        this.blank();
      }
    }

    if (formatters.length) {
      this.line("];");
      this.indent -= 1;
      this.line("};");
    } else {
      this.line("];");
    }

    return this.finish();
  }

  private messageHasElement: boolean = false;
  generateMessage(message: Message) {
    // record if the message has any element params
    this.messageHasElement = hasElementParameter(message);

    this.indent += 1;
    this.line(`// \`${message.id}\`:`);
    for (const line of message.sourceText.split("\n")) {
      this.line(`// ${line}`);
    }

    this.line(this.messageHasElement ? `params => [` : `params => ""`);
    this.generatePattern(message.ir);
    if (this.messageHasElement) {
      this.line("]");
    }
    this.indent -= 1;
  }

  generatePattern(pattern: Pattern) {
    this.indent += 1;
    for (const elem of pattern.elements) {
      if (!this.messageHasElement) {
        this.append(" +");
      }
      if (elem.type === "Text") {
        this.line(JSON.stringify(elem.value));
      } else if (elem.type === "VariableReference") {
        this.line(this.generateId(elem.id));
      } else if (elem.type === "NumberFormat" || elem.type === "DateTimeFormat" || elem.type === "MonetaryFormat") {
        const formatter = this.generateFormatterFunction(elem);
        const arg =
          elem.argument.type === "Identifier" ? this.generateId(elem.argument) : JSON.stringify(elem.argument.value);
        this.line(`${formatter}(${arg})`);
      }
      if (this.messageHasElement) {
        this.append(",");
      }
    }
    this.indent -= 1;
  }

  generateId(id: Identifier): string {
    return isId(id.name) ? `params.${id.name}` : `params[${JSON.stringify(id.name)}]`;
  }
}
