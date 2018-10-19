export default {
  languages: {
    en: {
      test1: "test1",
      test2: "test2",
      "a-dashed-id": "dashed!",
      "with-params": "{param}",
    },
  },
  code: `
import { Ids } from "./lang";

type MyType = { [key in Ids]: string };

declare const t: MyType;
t.test1 === "some string";
t.invalid === "should error";
t["a-dashed-id"] === "should work";
t.aDashedId === "should also work";
  `,
};
