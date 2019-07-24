import { loadLanguage, Locales } from "./";

export async function test() {
  const de = await loadLanguage("de");
  // even explicitly requesting `template` should use the fallback
  const fb = await loadLanguage("template");

  // this should produce a type error, because `template` is not in `Locales`
  const assert: Locales = "template";
  new Error(assert);

  // assert that no `template` file has been created
  expect(() => require("./locales/template")).toThrowError("Cannot find module './locales/template'");

  // no problem here
  expect(fb.fluentPresent()).toEqual("this is en");
  expect(de.fluentPresent()).toEqual("this is de");
  expect(fb.msgfmtPresent()).toEqual("this is en");
  expect(de.msgfmtPresent()).toEqual("this is de");

  // missing localization copies content from fallback
  expect(fb.fluentMissing()).toEqual("this is en");
  expect(de.fluentMissing()).toEqual("this is en");
  expect(fb.msgfmtMissing()).toEqual("this is en");
  expect(de.msgfmtMissing()).toEqual("this is en");
}
