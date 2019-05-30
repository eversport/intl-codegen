import { Bundle, templateId } from "../bundle";
import { CodeGenerator } from "./generator";
import { camelify } from "./helpers";
import { generateParamsType } from "./params-types";

export class MainTypesGenerator extends CodeGenerator {
  constructor(public bundle: Bundle) {
    super();
  }

  generate() {
    const template = this.bundle.getLocale(templateId);

    this.line(`import { LoaderFn, NumberValue, DateTimeValue, MonetaryValue } from "intl-codegen/runtime";`);
    this.blank();
    this.line(`export declare const loadLanguage: LoaderFn<{`);

    const messageIds = [...template.messages.keys()];
    messageIds.sort((a, b) => a.localeCompare(b));

    this.indent += 1;
    for (const id of messageIds) {
      const msg = template.messages.get(id)!;
      const params = generateParamsType(msg.params);
      // TODO: element returns
      this.line(`${camelify(msg.id)}(${params ? `params: ${params}` : ""}): string,`);
    }
    this.indent -= 1;

    this.line("},");

    this.indent += 1;
    for (const locale of this.bundle.locales.keys()) {
      this.line(`| ${JSON.stringify(locale)}`);
    }
    this.indent -= 1;

    this.line(">;");

    return this.finish();
  }
}
