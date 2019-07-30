import { loadLanguage } from "./";

export async function test() {
  let de = await loadLanguage(["*"]);
  de = await loadLanguage(["$/random garbage"]);

  // we use the fallback if the requested language is invalid
  expect(de.num({ num: 123456.789 })).toEqual("formatiert 123.456,789");
}
