import { Bundle, templateId } from "../bundle";
import { CodeGenerator } from "./generator";
import { camelify } from "./helpers";
import { generateParamsType, hasElementParameter } from "./params-types";
import { Locale } from "../locale";
import { Message } from "../message";

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
    const messageIds = [...template.messages.keys()];
    messageIds.sort((a, b) => a.localeCompare(b));

    const hasElements = hasAnyElementParameter(template);

    // imports
    if (hasElements) {
      this.line(`import React from "react";`);
    }
    this.line(
      `import { LoaderFn, IntlObject, NumberValue, DateTimeValue, MonetaryValue } from "intl-codegen/runtime";`,
    );
    this.blank();

    // POD interface
    const printMessageType = (msg: Message) => {
      const params = generateParamsType(msg.params);
      if (!params) {
        this.line(`| ${JSON.stringify(msg.messageId)}`);
        return;
      }
      this.line(`| {`);
      this.indent += 1;
      this.line(`id: ${JSON.stringify(msg.messageId)},`);
      this.line(`params: ${params},`);
      this.indent -= 1;
      this.line(`}`);
    };
    // split this up into keys with and without elements
    this.line(`type TranslationKey${hasElements ? "NoElement" : ""} = never`);
    this.indent += 1;
    for (const id of messageIds) {
      const msg = template.messages.get(id)!;
      if (hasElementParameter(msg)) {
        continue;
      }
      printMessageType(msg);
    }
    this.indent -= 1;
    this.append(`;`);
    if (hasElements) {
      this.line(`type TranslationKeyElement = never`);
      this.indent += 1;
      for (const id of messageIds) {
        const msg = template.messages.get(id)!;
        if (!hasElementParameter(msg)) {
          continue;
        }
        printMessageType(msg);
      }
      this.indent -= 1;
      this.append(`;`);
      this.line(`type TranslationKey = TranslationKeyNoElement | TranslationKeyElement`);
    }
    this.blank();

    // functional interface
    this.line(`interface Messages {`);
    this.indent += 1;
    this.line(`(key: TranslationKey${hasElements ? "NoElement" : ""}): string,`);
    if (hasElements) {
      this.line(`(key: TranslationKeyElement): Array<React.ReactNode>,`);
    }
    for (const id of messageIds) {
      const msg = template.messages.get(id)!;
      const params = generateParamsType(msg.params);
      const returnType = hasElementParameter(msg) ? "Array<React.ReactNode>" : "string";
      this.line(`${camelify(msg.messageId)}(${params ? `params: ${params}` : ""}): ${returnType},`);
    }
    this.indent -= 1;
    this.line(`}`);
    this.blank();

    // locales
    this.line(`export type Locales =`);
    this.indent += 1;
    for (const locale of this.bundle.locales.keys()) {
      if (this.bundle.skipTemplate(locale)) {
        continue;
      }
      this.line(`| ${JSON.stringify(locale)}`);
    }
    this.indent -= 1;
    this.append(`;`);
    this.blank();

    // exports
    this.line(`export { TranslationKey };`);
    this.line(`export type Intl = IntlObject<Messages, Locales>;`);
    this.line(`export declare const loadLanguage: LoaderFn<Messages, Locales>;`);

    return this.finish();
  }
}
