import { Bundle, templateId } from "../bundle";
import { CodeGenerator } from "./generator";

export class MainTypesGenerator extends CodeGenerator {
  constructor(public bundle: Bundle) {
    super();
  }

  generate() {
    const template = this.bundle.getLocale(templateId);

    this.line(`import { LoaderFn } from "intl-codegen/runtime";`);
    this.blank();
    this.line(`export declare const loadLanguage: LoaderFn<{`);

    const messageIds = [...template.messages.keys()];
    messageIds.sort((a, b) => a.localeCompare(b));

    this.indent += 1;
    for (const msg of messageIds) {
      this.line(`${this.isId(msg) ? msg : `[${JSON.stringify(msg)}]`}(): string,`);
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
