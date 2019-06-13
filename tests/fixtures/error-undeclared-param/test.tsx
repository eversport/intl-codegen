import React from "react";
import { loadLanguage } from "./";

export async function test() {
  const intl = await loadLanguage("en");

  // it will use the param anyway
  expect(intl.msgfmt({ param: "parameter" })).toEqual("an undeclared parameter.");
  expect(intl.fluent({ param: "parameter" })).toEqual("an undeclared parameter.");

  // but stringify it, without formatting
  expect(intl.msgfmt({ param: 123456.789 })).toEqual("an undeclared 123456.789.");
  expect(intl.fluent({ param: 123456.789 })).toEqual("an undeclared 123456.789.");

  // … which is kind of weird for elements, so you better declare params!
  expect(intl.msgfmt({ param: <em>elem</em> })).toEqual("an undeclared [object Object].");
  expect(intl.fluent({ param: <em>elem</em> })).toEqual("an undeclared [object Object].");
}
