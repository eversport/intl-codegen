import { Message } from "../message";
import { Bundle } from "../bundle";
import { LocaleId, Pattern, Identifier } from "../types";
import { stable } from "./helpers";
import { DateTimeFormat, MonetaryFormat, NumberFormat } from "../types";

export class BundleGenerator {
  private indent = 0;

  private code = "";
  private line(line: string) {
    this.code += "\n";
    this.code += "  ".repeat(this.indent);
    this.code += line;
  }
  private blank() {
    this.code += "\n";
  }
  private append(s: string) {
    this.code += s;
  }

  constructor(public bundle: Bundle) {}

  generateLocale(localeId: LocaleId): string {
    const locale = this.bundle.locales.get(localeId)!;

    const messageIds = [...locale.keys()];
    messageIds.sort((a, b) => a.localeCompare(b));

    this.indent += 1;

    this.line("return [");
    for (const id of messageIds) {
      this.generateMessage(locale.get(id)!);
      this.append(",");
    }
    this.line("];");

    const messagesCode = this.code;
    this.code = "export default context => {";

    this.generateFormatters();
    this.code += messagesCode;

    this.indent -= 1;

    this.line("};");

    return this.code;
  }

  generateFormatters() {
    for (const [idx, formatter] of this.formatters.entries()) {
      this.line(`const formatter_${idx} = ${formatter};`);
    }
    if (this.formatters.length) {
      this.blank();
    }
  }

  generateMessage(message: Message) {
    for (const line of message.sourceText.split("\n")) {
      this.line(`// \`${message.id}\`:`);
      this.line(`// ${line}`);
    }
    this.line(`params => ""`);
    this.generatePattern(message.ir);
  }

  generatePattern(pattern: Pattern) {
    this.indent += 1;
    for (const elem of pattern.elements) {
      this.append(" +");
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
    }
    this.indent -= 1;
  }

  generateId(id: Identifier): string {
    return `params[${JSON.stringify(id.name)}]`;
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
}
