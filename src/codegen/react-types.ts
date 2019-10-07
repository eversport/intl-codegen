import { Bundle, templateId } from "../bundle";
import { CodeGenerator } from "./generator";
import { generateParamsType } from "./params-types";

const API_EXPORTS = ["Context", "Provider", "Consumer", "Localized", "useIntl"];

export class ReactTypesGenerator extends CodeGenerator {
  constructor(public bundle: Bundle) {
    super();
  }

  generate() {
    const template = this.bundle.getLocale(templateId);
    const messageIds = [...template.messages.keys()];
    messageIds.sort((a, b) => a.localeCompare(b));

    // imports
    this.line(`import { ReactAPI } from "intl-codegen/runtime-react";`);
    this.line(`import { loadLanguage, Intl, Locales } from "./index";`);
    this.blank();

    // localized type
    this.line(`type LocalizedType = never`);
    this.indent += 1;
    for (const id of messageIds) {
      const msg = template.messages.get(id)!;
      this.line(`| {`);
      this.indent += 1;
      this.line(`id: ${JSON.stringify(msg.messageId)},`);
      const params = generateParamsType(msg.params);
      if (params) {
        this.line(`params: ${params},`);
      }
      this.indent -= 1;
      this.line(`}`);
    }
    this.indent -= 1;
    this.append(`;`);
    this.blank();

    // react api
    this.line(`type API = ReactAPI<Intl, LocalizedType>`);
    for (const prop of API_EXPORTS) {
      this.line(`declare const ${prop}: API["${prop}"];`);
    }
    this.blank();

    // exports
    this.line(`export { loadLanguage, Intl, Locales };`);
    this.line(`export { ${API_EXPORTS.join(", ")} };`);

    return this.finish();
  }
}
