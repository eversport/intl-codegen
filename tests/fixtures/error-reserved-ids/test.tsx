import { loadLanguage } from "./";

export async function test() {
  const intl = await loadLanguage("template");

  expect(intl.msgfmtValid()).toEqual("valid");
  expect(intl.fluentValid()).toEqual("valid");

  // should not be able to call this
  expect(() => intl.context()).toThrow();
}
