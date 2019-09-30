import { loadLanguage, TranslationKey } from "./";

export async function test() {
  const intl = await loadLanguage("de");

  // calling the api directly
  expect(intl({ id: "simple-param", params: { a: "parameter!" } })).toEqual("a simple param: parameter!");
  expect(intl("no-param")).toEqual("without a param");

  // these will be type-errors:
  expect(() => intl("simple-param")).toThrow();
  // this does work correctly, so maybe allow this pattern in general?
  expect(intl({ id: "no-param" })).toEqual("without a param");

  // dynamic usage:
  let key: TranslationKey;

  key = "no-param";
  key = { id: "no-param" }; // is a type-error but still works
  expect(intl(key)).toEqual("without a param");

  key = { id: "simple-param", params: { a: "parameter!" } };
  expect(intl(key)).toEqual("a simple param: parameter!");

  key = "invalid";
  expect(() => intl(key)).toThrow();
}
