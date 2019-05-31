import { loadLanguage } from "./";

export async function test() {
  const eng = await loadLanguage("en");
  const tpl = await loadLanguage("invalid");

  // no problem here
  expect(tpl.fluentCorrect()).toEqual("a correct message");
  expect(eng.fluentCorrect()).toEqual("correctly translated message");
  expect(tpl.msgfmtCorrect()).toEqual("a correct message");
  expect(eng.msgfmtCorrect()).toEqual("correctly translated message");

  // missing localization copies content from template
  expect(tpl.fluentMissingLocalization()).toEqual("a message with missing localization");
  expect(eng.fluentMissingLocalization()).toEqual("a message with missing localization");
  expect(tpl.msgfmtMissingLocalization()).toEqual("a message with missing localization");
  expect(eng.msgfmtMissingLocalization()).toEqual("a message with missing localization");

  // missing definition uses message id for template
  expect(tpl.fluentMissingDefinition()).toEqual("fluent-missing-definition");
  expect(eng.fluentMissingDefinition()).toEqual("a message that is missing a definition");
  expect(tpl.msgfmtMissingDefinition()).toEqual("msgfmt-missing-definition");
  expect(eng.msgfmtMissingDefinition()).toEqual("a message that is missing a definition");
}
