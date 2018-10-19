import { Options } from "../types";
import Language from "../Language";
import { Expressions } from "../Message";
import * as Templates from "./templates";

interface MergedMessage {
  expressions: Expressions;
  id: string;
}

export default class TsCodegen {
  constructor(private languages: Map<string, Language>, _options: Options) {}

  private getMessageTypes() {
    const messages = new Map<string, MergedMessage>();

    for (const language of this.languages.values()) {
      for (const [id, msg] of language.messages) {
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

    for (const [dashedId, msg] of messages) {
      const typelist = this.generateTypeList(msg.expressions);
      const params = typelist ? `params: { ${typelist} }` : "";
      const camelId = msg.id;
      ids.add(camelId);
      ids.add(dashedId);

      let idStr = JSON.stringify(dashedId);

      props.push(`  ${camelId}(${params}): string;`);
      if (camelId !== dashedId) {
        props.push(`  [${idStr}](${params}): string;`);
        idStr += ` | ` + JSON.stringify(camelId);
      }
      components.push(`{\n  id: ${idStr}${params ? `,\n  ${params}` : ""}\n}`);
    }

    if (!ids.has("locale")) {
      props.push(`  locale: Locales;`);
    }

    const locales = [...this.languages.keys()].map(locale => JSON.stringify(locale));

    template = template.replace(`__PROPS__`, props.join("\n"));
    template = template.replace(`__COMPONENTS__`, components.join(" | ") || "never");
    template = template.replace(`__LOCALES__`, locales.join(" | "));
    template = template.replace(`__IDS__`, [...ids].map(id => JSON.stringify(id)).join(" |\n  ") || "never");

    return template;
  }
}
