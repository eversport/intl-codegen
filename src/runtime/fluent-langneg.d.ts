// Copied from: https://github.com/projectfluent/fluent.js/pull/231
// Why this hasn’t been merged since half a year is beyond me…

declare module "fluent-langneg" {
  interface NegotiateLanguageOptions {
    strategy?: "filtering" | "matching" | "lookup";
    defaultLocale?: string;
  }

  export function negotiateLanguages(
    requestedLocales: ReadonlyArray<string>,
    availableLocales: ReadonlyArray<string>,
    options?: NegotiateLanguageOptions,
  ): Array<string>;

  export function acceptedLanguages(acceptedLanguages: string): Array<string>;
}
