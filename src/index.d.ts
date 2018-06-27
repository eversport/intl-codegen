interface GeneratedCode {
  [fileName: string]: string;
}

interface Language {
  addMessage(identifier: string, message: string): void;
}

declare class IntlCodegen {
  constructor(defaultLocale?: string);
  getLanguage(locale: string): Language;
  generateFiles(): GeneratedCode;
  writeFiles(outputDirectory: string): Promise<GeneratedCode>;
}

export default IntlCodegen;
