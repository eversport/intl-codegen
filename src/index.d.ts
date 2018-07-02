interface GeneratedCode {
  [fileName: string]: string;
}

interface Language {
  addMessage(identifier: string, message: string): void;
  addMessages(messages: { [identifier: string]: string }): void;
}

interface Options {
  defaultLocale?: string;
}

declare class IntlCodegen {
  constructor(options?: Options);
  constructor(defaultLocale?: string);
  getLanguage(locale: string): Language;
  generateFiles(): GeneratedCode;
  writeFiles(outputDirectory: string): Promise<GeneratedCode>;
}

export default IntlCodegen;
