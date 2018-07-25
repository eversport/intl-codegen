import { Options } from "../types";
import Language from "../Language";
import { BasicBlockElement, BlockBody, Expressions } from "../Message";

interface Formatter {
  id: string;
  code: string;
}

export default class LanguageCodegen {
  private formatters = new Map<string, Formatter>();
  private indent = 0;

  constructor(private language: Language, private options: Options) {}

  public generate() {
    let code = "export default {\n";

    // sort messages so we have a stable sort order
    const messages = [...this.language.messages].map(m => m[1]);
    messages.sort((a, b) => a.id.localeCompare(b.id));

    for (const message of messages) {
      const params = this.generateParams(message.expressions);
      code += `  ${message.id}(${params}) {\n`;

      let { body } = message;
      const firstBlock = body[0];
      if (body.length === 1 && firstBlock.type === "block") {
        code += `${this.i()}return [${this.generateBlock(firstBlock.expressions)}];\n`;
      } else {
        if (firstBlock.type === "block") {
          code += `${this.i()}const parts = [${this.generateBlock(firstBlock.expressions)}];\n`;
          code += this.generateBody(body.slice(1));
        } else {
          code += `${this.i()}const parts = [];\n`;
          code += this.generateBody(body);
        }
        code += `${this.i()}return parts;\n`;
      }

      code += `  },\n`;
    }

    code += "};";

    code = [...this.formatters.values()].map(f => f.code).join("\n") + `\n` + code;

    return code;
  }

  private i() {
    return " ".repeat(4 + this.indent * 2);
  }

  private generateParams(params: Expressions) {
    if (!params.size) {
      return "";
    }
    return `{ ${[...params.keys()].join(", ")} }`;
  }

  private generateBody(body: BlockBody) {
    let code = "";
    for (const block of body) {
      if (block.type === "block") {
        code += `${this.i()}parts.push(${this.generateBlock(block.expressions)});\n`;
      } else {
        const branches = block.branches.map(branch => {
          const { condition, body } = branch;
          let code = `${condition ? `if (${condition}) ` : ""}{\n`;
          this.indent++;
          code += this.generateBody(body);
          this.indent--;
          return `${code}${this.i()}}`;
        });
        code += `${this.i()}${branches.join(" else ")}\n`;
      }
    }
    return code;
  }

  private generateBlock(block: Array<BasicBlockElement>) {
    this.indent++;
    let code = `\n${this.i()}`;
    code += block
      .map(b => {
        if (typeof b === "string") {
          return b;
        }
        const formatter = this.getFormatter(b.type, b.style);
        return `${formatter.id}.format(${b.id})`;
      })
      .join(`,\n${this.i()}`);
    this.indent--;
    code += `,\n${this.i()}`;
    return code;
  }

  private getFormatter(type: string, style?: string) {
    const {
      language: { locale },
      formatters,
      options: { formats },
    } = this;
    style = style || undefined;

    const formatterKey = `${type}.${style}`;
    let formatter = formatters.get(formatterKey);
    if (formatter) {
      return formatter;
    }

    let formatArgs;
    if (style) {
      formatArgs = formats[type][style];
      if (!formatArgs) {
        console.warn(`Format "${type}.${style}" not defined, falling back to default formatting.`);
      }
    }

    const id = `format_${type}_${formatters.size}`;
    const constructor = type === "number" ? "Intl.NumberFormat" : "Intl.DateTimeFormat";
    const code = `const ${id} = new ${constructor}("${locale}"${formatArgs ? `, ${JSON.stringify(formatArgs)}` : ""});`;

    formatter = {
      id,
      code,
    };
    formatters.set(formatterKey, formatter);

    return formatter;
  }
}
