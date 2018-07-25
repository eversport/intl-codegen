export default {
  languages: {
    en: {
      test: "test",
    },
  },
  code: `
import { loadLanguage } from "./lang";

loadLanguage("incorrect-locale");
  `,
};
