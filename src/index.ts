import { LanguageCodegen, MainCodegen, TsCodegen } from "./Codegen";
import Language from "./Language";
import path from "path";
import fse from "fs-extra";

interface GeneratedCode {
  [fileName: string]: string;
}

class IntlCodegen {
  private languages = new Map<string, Language>();
  constructor(private defaultLocale: string = "en") {
    this.getLanguage(defaultLocale);
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
    const { languages, defaultLocale } = this;
    const files: { [key: string]: string } = {};

    for (const [locale, language] of languages) {
      const fileName = `${locale}.js`;
      const codegen = new LanguageCodegen(language);
      files[fileName] = codegen.generate();
    }

    const mainCodegen = new MainCodegen(languages);
    files["index.js"] = mainCodegen.generate(defaultLocale);

    const tsCodegen = new TsCodegen(languages);
    files["index.d.ts"] = tsCodegen.generate();

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
