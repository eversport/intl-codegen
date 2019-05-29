import { Message } from "../message";
import { Pattern, Identifier } from "../types";
import { stable } from "./helpers";
import { DateTimeFormat, MonetaryFormat, NumberFormat } from "../types";
import { Locale } from "../locale";

const ID_RE = /^[A-Za-z_$][$\w]*$/;

export class LocaleGenerator {
  private indent = 0;
  private code = "";
  private line(line: string) {
    this.code += "\n" + "  ".repeat(this.indent) + line;
  }
  private blank() {
    this.code += "\n";
  }
  private append(s: string) {
    this.code += s;
  }

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

  constructor(public locale: Locale) {}

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

    for (const id of messageIds) {
      this.generateMessage(messages.get(id)!);
      this.append(",");
    }

    if (formatters.length) {
      this.line("];");
      this.indent -= 1;
      this.line("};");
    } else {
      this.line("];");
    }

    return this.code;
  }

  private messageHasElement: boolean = false;
  generateMessage(message: Message) {
    // record if the message has any element params
    this.messageHasElement = false;
    for (const param of message.params.values()) {
      if (param.type === "element") {
        this.messageHasElement = true;
        break;
      }
    }

    this.indent += 1;
    for (const line of message.sourceText.split("\n")) {
      this.line(`// \`${message.id}\`:`);
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
    const isId = ID_RE.test(id.name);
    return isId ? `params.${id.name}` : `params[${JSON.stringify(id.name)}]`;
  }
}
