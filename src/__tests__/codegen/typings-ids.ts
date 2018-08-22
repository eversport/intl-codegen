export default {
  languages: {
    en: {
      test1: "test1",
      test2: "test2",
    },
  },
  code: `
import { Ids } from "./lang";

type MyType = { [key in Ids]: string };

declare var t: MyType;
t.test1 === "some string";
t.invalid === "should error";
  `,
};
