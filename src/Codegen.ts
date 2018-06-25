import { AllNodes, TextElement, Argument, Pattern } from "intl-messageformat-parser";
import Language from "./Language";
import { Expressions } from "./Message";
import * as Templates from "./templates";

interface MergedMessage {
  expressions: Expressions;
  id: string;
}

export class TsCodegen {
  constructor(private languages: Map<string, Language>) {}

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

    for (const [id, msg] of this.getMessageTypes()) {
      const typelist = this.generateTypeList(msg.expressions);
      const params = typelist ? `params: { ${typelist} }` : "";

      props.push(`  ${msg.id}(${params}): string;`);
      components.push(`{ id: ${JSON.stringify(id)}, ${params} }`);
    }

    template = template.replace(`// __PROPS__`, props.join("\n"));
    template = template.replace(`// __COMPONENTS__`, components.join(" | "));

    return template;
  }
}

export class MainCodegen {
  constructor(private languages: Map<string, Language>) {}

  public generate(defaultLocale: string) {
    let template = Templates.main;
    const loaders: Array<string> = [];
    for (const locale of this.languages.keys()) {
      loaders.push(`if (locale === "${locale}") {\n  fns = await import("${locale}.js");\n}`);
    }
    loaders.push(`{\n  return loadLanguage(${JSON.stringify(defaultLocale)});\n}`)
    template = template.replace(`// __LOADERS__`, loaders.join(" else "));
    return template;
  }
}

export class LanguageCodegen {
  constructor(private language: Language) {}

  public generate() {
    let code = "";

    // first generate function bodies
    for (const [, message] of this.language.messages()) {
      let params = this.generateParams(message.expressions);
      code +=
        `function ${message.id}(${params}) {\n` +
        `  const parts = [];\n` +
        this.generate_messageFormatPattern(message.node) +
        `  return parts;\n}\n`;
    }

    // then generate the export
    code += "\nexport default {\n";
    for (const [key, message] of this.language.messages()) {
      code += `  ${JSON.stringify(key)}: ${message.id},\n`;
    }
    code += "};";

    return code;
  }

  private gen = (node: AllNodes) => {
    // @ts-ignore: can’t correctly typecheck this
    const fn = this[`generate_${node.type}`];

    if (fn) {
      return fn.call(this, node, this.language);
    }
    console.log("Unknown node type in Codegen:", node);
    return "";
  };

  private generateParams(params: Expressions) {
    if (!params.size) {
      return "";
    }
    return `{ ${[...params.keys()].join(", ")} }`;
  }

  private generate_messageFormatPattern(pat: Pattern) {
    const elements = pat.elements.map(this.gen);
    return elements.join("\n");
  }

  // @ts-ignore this is called
  private generate_messageTextElement(el: TextElement) {
    return `  parts.push(${JSON.stringify(el.value)});`;
  }

  // @ts-ignore this is called
  private generate_argumentElement(arg: Argument) {
    if (!arg.format) {
      return `parts.push(${arg.id})`;
    }
    const { format } = arg;
    if (format.type === "selectFormat") {
      const branches = format.options.map(option => {
        const condition = `${arg.id} == ${option.selector}`;
        return `if (${condition}) {\n${this.generate_messageFormatPattern(option.value)}\n  }`;
      });
      return `  ` + branches.join(" else ") + `\n`;
    }
    console.log("Unknown format type in Codegen:", format);
  }
}
