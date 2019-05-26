export default {
  languages: {
    en: {
      test: "test",
    },
  },
  code: `
import { loadLanguage, locales } from "./lang";

export async function main() {
  let locale = locales[0];
  locale = loadLanguage.locales[0];
  const lang = await loadLanguage(locale);

  return lang.locale === "foo";
}
  `,
};
