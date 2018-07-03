import { Options } from "../intl-codegen";
import Language from "../Language";
import * as Templates from "./templates";

export default class MainCodegen {
  constructor(private languages: Map<string, Language>, private options: Options) {}

  public generate() {
    const { defaultLocale } = this.options;
    let template = Templates.main;

    const locales = [...this.languages.keys()];
    locales.sort((a, b) => a.localeCompare(b));

    const loaders: Array<string> = [];
    for (const locale of locales) {
      loaders.push(`if (locale === "${locale}") {\n    fns = await import("./${locale}.js");\n  }`);
    }
    loaders.push(`{\n    return loadLanguage(${JSON.stringify(defaultLocale)});\n  }`);
    template = template.replace(`__LOADERS__`, loaders.join(" else "));

    template = template.replace(`__LOCALES__`, locales.map(l => JSON.stringify(l)).join(", "));
    return template;
  }
}
