import { AllNodes, Argument, Pattern, TextElement } from "intl-messageformat-parser";
import { Options } from "./intl-codegen";
import Language from "./Language";
import { Expressions } from "./Message";
import * as Templates from "./templates";

interface MergedMessage {
  expressions: Expressions;
  id: string;
}

export class TsCodegen {
  constructor(private languages: Map<string, Language>, _options: Options) {}

  private getMessageTypes() {
    const messages = new Map<string, MergedMessage>();

    for (const language of this.languages.values()) {
      for (const [id, msg] of language.messages()) {
        const existing = messages.get(id);
        if (!existing) {
          messages.set(id, { id: msg.id, expressions: new Map(msg.expressions) });
          continue;
        }
        for (const [name, type] of msg.expressions) {
          // TODO: merge or warn about incompatible types
          existing.expressions.set(name, type);
        }
      }
    }

    return messages;
  }

  private generateTypeList(expressions: Expressions) {
    const types: Array<string> = [];

    for (const [name, type] of expressions) {
      types.push(`${name}: ${type}`);
    }

    return types.join(", ");
  }

  public generate() {
    let template = Templates.types;
    const props: Array<string> = [];
    const components: Array<string> = [];

    const messages = [...this.getMessageTypes()];
    messages.sort((a, b) => a[0].localeCompare(b[0]));
    const ids = new Set<string>();

    for (const [id, msg] of messages) {
      const typelist = this.generateTypeList(msg.expressions);
      const params = typelist ? `params: { ${typelist} }` : "";
      ids.add(msg.id);

      props.push(`    ${msg.id}(${params}): string;`);
      components.push(`{\n    id: ${JSON.stringify(id)}${params ? `,\n    ${params}` : ""}\n  }`);
    }

    if (!ids.has("locale")) {
      props.push(`    locale: Locales;`);
    }

    const locales = [...this.languages.keys()].map(locale => JSON.stringify(locale));

    template = template.replace(`__PROPS__`, props.join("\n"));
    template = template.replace(`__COMPONENTS__`, components.join(" | "));
    template = template.replace(`__LOCALES__`, locales.join(" | "));

    return template;
  }
}

export class MainCodegen {
  constructor(private languages: Map<string, Language>, private options: Options) {}

  public generate() {
    const { defaultLocale } = this.options;
    let template = Templates.main;

    const locales = [...this.languages.keys()];
    locales.sort((a, b) => a.localeCompare(b));

    const loaders: Array<string> = [];
    for (const locale of locales) {
      loaders.push(`if (locale === "${locale}") {\n    fns = await import("./${locale}.js");\n  }`);
    }
    loaders.push(`{\n    return loadLanguage(${JSON.stringify(defaultLocale)});\n  }`);
    template = template.replace(`__LOADERS__`, loaders.join(" else "));

    template = template.replace(`__LOCALES__`, locales.map(l => JSON.stringify(l)).join(", "));
    return template;
  }
}

interface Formatter {
  id: string;
  code: string;
}

export class LanguageCodegen {
  private formatters = new Map<string, Formatter>();

  constructor(private language: Language, private options: Options) {}

  public generate() {
    let code = "export default {\n";

    // sort messages so we have a stable sort order
    const messages = [...this.language.messages()].map(m => m[1]);
    messages.sort((a, b) => a.id.localeCompare(b.id));

    for (const message of messages) {
      const params = this.generateParams(message.expressions);
      const toplevel = this.generate_toplevelPattern(message.node);
      code += `  ${message.id}(${params}) {\n${toplevel}  },\n`;
    }

    code += "};";

    code = [...this.formatters.values()].map(f => f.code).join("\n") + `\n` + code;

    return code;
  }

  private gen = (node: AllNodes) => {
    // @ts-ignore: can’t correctly typecheck this
    const fn = this[`generate_${node.type}`];

    /* istanbul ignore else  */
    if (fn) {
      return fn.call(this, node, this.language);
    }

    /* istanbul ignore next */
    console.log("Unknown node type in Codegen:", node);
    /* istanbul ignore next */
    return "";
  };

  private generateParams(params: Expressions) {
    if (!params.size) {
      return "";
    }
    return `{ ${[...params.keys()].join(", ")} }`;
  }

  private generate_toplevelPattern(pat: Pattern) {
    // TODO: shortcut for single elements
    return (
      `    const parts = [];\n` + this.generate_messageFormatPattern(pat) + `\n    return parts;\n`
    );
  }

  private generate_messageFormatPattern(pat: Pattern) {
    const elements = pat.elements.map(this.gen);
    return elements.join("\n");
  }

  // @ts-ignore this is called
  private generate_messageTextElement(el: TextElement) {
    return `    parts.push(${JSON.stringify(el.value)});`;
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
    const code = `const ${id} = new ${constructor}("${locale}"${
      formatArgs ? `, ${JSON.stringify(formatArgs)}` : ""
    });`;

    formatter = {
      id,
      code,
    };
    formatters.set(formatterKey, formatter);

    return formatter;
  }

  // @ts-ignore this is called
  private generate_argumentElement(arg: Argument) {
    if (!arg.format) {
      return `    parts.push(${arg.id});`;
    }
    const { format } = arg;

    /* istanbul ignore else  */
    if (format.type === "selectFormat") {
      const branches = format.options.map(option => {
        const condition = `${arg.id} == ${option.selector}`;
        return `if (${condition}) {\n${this.generate_messageFormatPattern(option.value)}\n    }`;
      });
      return `    ` + branches.join(" else ") + `\n`;
    } else if (format.type === "numberFormat") {
      // TODO: support custom things like:
      // * inline currency: {value, number, currency:EUR}
      // * dynamic currency: {value, number, currency:$currency}
      const formatter = this.getFormatter("number", format.style);
      return `    parts.push(${formatter.id}.format(${arg.id}));`;
    } else if (format.type === "timeFormat" || format.type === "dateFormat") {
      const formatterKey = format.type === "timeFormat" ? "time" : "date";
      const formatter = this.getFormatter(formatterKey, format.style);
      return `    parts.push(${formatter.id}.format(${arg.id}));`;
    }

    /* istanbul ignore next */
    console.log("Unknown format type in Codegen:", format);
  }
}
