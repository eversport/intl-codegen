import { Bundle, templateId } from "../bundle";
import { CodeGenerator } from "./generator";
import { camelify } from "./helpers";
import { generateParamsType, hasElementParameter } from "./params-types";
import { Locale } from "../locale";

function hasAnyElementParameter(locale: Locale) {
  for (const msg of locale.messages.values()) {
    if (hasElementParameter(msg)) {
      return true;
    }
  }
  return false;
}

export class MainTypesGenerator extends CodeGenerator {
  constructor(public bundle: Bundle) {
    super();
  }

  generate() {
    const template = this.bundle.getLocale(templateId);

    if (hasAnyElementParameter(template)) {
      this.line(`import React from "react";`);
    }
    this.line(
      `import { LoaderFn, IntlObject, NumberValue, DateTimeValue, MonetaryValue } from "intl-codegen/runtime";`,
    );
    this.blank();

    this.line(`interface Messages {`);
    const messageIds = [...template.messages.keys()];
    messageIds.sort((a, b) => a.localeCompare(b));

    this.indent += 1;
    for (const id of messageIds) {
      const msg = template.messages.get(id)!;
      const params = generateParamsType(msg.params);
      const returnType = hasElementParameter(msg) ? "Array<React.ReactNode>" : "string";
      this.line(`${camelify(msg.messageId)}(${params ? `params: ${params}` : ""}): ${returnType},`);
    }
    this.indent -= 1;
    this.line(`}`);

    this.blank();

    this.line(`export type Locales =`);
    this.indent += 1;
    for (const locale of this.bundle.locales.keys()) {
      this.line(`| ${JSON.stringify(locale)}`);
    }
    this.indent -= 1;
    this.append(`;`);

    this.blank();

    this.line(`export type Intl = IntlObject<Messages, Locales>;`);
    this.line(`export declare const loadLanguage: LoaderFn<Messages, Locales>;`);

    return this.finish();
  }
}
