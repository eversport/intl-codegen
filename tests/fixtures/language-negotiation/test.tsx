import { loadLanguage } from ".";

export async function test() {
  let tpl = await loadLanguage(["*"]);
  tpl = await loadLanguage(["$/random garbage"]);

  // if the requested language is invalid and no fallback is defined,
  // we use the platform default, which we set for the tests via `LANG=en`.
  expect(tpl.num({ num: 123456.789 })).toEqual("template 123,456.789");
}
