import { Bundle } from "../bundle";
import { CodeGenerator } from "./generator";

export class ReactGenerator extends CodeGenerator {
  constructor(public bundle: Bundle) {
    super();
  }

  generate() {
    this.line(`import { createReactAPI } from "intl-codegen/runtime-react";`);
    this.line(`import { loadLanguage } from "./index.js";`);
    this.blank();
    this.line(`const { Context, Provider, Consumer, Localized, useIntl } = createReactAPI();`);
    this.blank();
    this.line(`export { loadLanguage, Context, Provider, Consumer, Localized, useIntl }`);

    return this.finish();
  }
}
