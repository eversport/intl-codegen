import { Bundle, templateId } from "../bundle";
import { CodeGenerator } from "./generator";
import { camelify, isId } from "./helpers";

export class MainGenerator extends CodeGenerator {
  constructor(public bundle: Bundle) {
    super();
  }

  generate() {
    const template = this.bundle.getLocale(templateId);

    this.line(`import { defineLoader } from "intl-codegen/runtime";`);
    this.blank();
    this.line(`export const loadLanguage = defineLoader([`);

    const messageIds = [...template.messages.keys()];
    messageIds.sort((a, b) => a.localeCompare(b));

    this.indent += 1;
    for (const msg of messageIds) {
      this.line(`${JSON.stringify(camelify(msg))},`);
    }
    this.indent -= 1;

    this.line("], {");

    this.indent += 1;
    for (const locale of this.bundle.locales.keys()) {
      if (this.bundle.skipTemplate(locale)) {
        continue;
      }
      this.line(`${isId(locale) ? locale : JSON.stringify(locale)}: () => import("./locales/${locale}.js"),`);
    }
    this.indent -= 1;

    this.line(`}, ${JSON.stringify(this.bundle.options.fallbackLocale || "template")});`);

    return this.finish();
  }
}
