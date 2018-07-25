import fse from "fs-extra";
import path from "path";
// @ts-ignore: doesn’t deal with json files
import { version } from "../package.json";
import LanguageCodegen from "./codegen/language";
import MainCodegen from "./codegen/main";
import TsCodegen from "./codegen/typings";
import mergeFormats from "./formats";
import { GeneratedCode, Options, default as IIntlCodegen } from "./types";
import Language from "./Language";

const BANNER =
  `
// DO NOT MODIFY
// FILE GENERATED BY \`intl-codegen@${version}\`
// https://github.com/eversport/intl-codegen
// DO NOT MODIFY
  `.trim() + "\n\n";

class IntlCodegen implements IIntlCodegen {
  private languages = new Map<string, Language>();
  private options: Required<Options>;

  // TODO: remove fallback to string with v2
  constructor(options: Options | string = {}) {
    if (typeof options === "string") {
      options = { defaultLocale: options };
    }
    this.options = {
      defaultLocale: options.defaultLocale || "en",
      formats: mergeFormats(options.formats),
    };

    this.getLanguage(this.options.defaultLocale);
  }

  public getLanguage(locale: string) {
    const { languages } = this;
    let language = languages.get(locale);
    if (!language) {
      language = new Language(locale);
      languages.set(locale, language);
    }
    return language;
  }

  public generateFiles(): GeneratedCode {
    const { languages, options } = this;
    const files: { [key: string]: string } = {};

    // make sure every message defined in the defaultLocale is also defined as
    // a fallback in every locale
    const defaultLanguage = languages.get(options.defaultLocale)!;
    for (const [key, message] of defaultLanguage.messages) {
      for (const [locale, language] of languages) {
        if (locale === options.defaultLocale) {
          continue;
        }
        if (!language.messages.has(key)) {
          console.warn(
            `Translation key "${key}" was not defined for locale "${locale}". Falling back to default locale.`,
          );
          language.addMessage(key, message.message);
        }
      }
    }

    for (const [locale, language] of languages) {
      const fileName = `${locale}.js`;
      const codegen = new LanguageCodegen(language, options);
      files[fileName] = BANNER + codegen.generate();
    }

    const mainCodegen = new MainCodegen(languages, options);
    files["index.js"] = BANNER + mainCodegen.generate();

    const tsCodegen = new TsCodegen(languages, options);
    files["index.d.ts"] = BANNER + tsCodegen.generate();

    return files;
  }

  public async writeFiles(outputDirectory: string) {
    const files = this.generateFiles();
    for (const [_fileName, contents] of Object.entries(files)) {
      const fileName = path.join(outputDirectory, _fileName);
      await fse.ensureFile(fileName);
      await fse.outputFile(fileName, contents);
    }
    return files;
  }
}

export default IntlCodegen;
