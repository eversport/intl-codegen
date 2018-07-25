export interface GeneratedCode {
  [fileName: string]: string;
}

export interface Language {
  addMessage(identifier: string, message: string): void;
  addMessages(messages: { [identifier: string]: string }): void;
}

export interface Options {
  defaultLocale?: string;
  formats?: any;
}

declare var IntlCodegen: {
  new (options?: Options): IntlCodegen;
  new (defaultLocale?: string): IntlCodegen;
};

interface IntlCodegen {
  getLanguage(locale: string): Language;
  generateFiles(): GeneratedCode;
  writeFiles(outputDirectory: string): Promise<GeneratedCode>;
}

export default IntlCodegen;
