import React from "react";
import { loadLanguage } from "./";

export async function test() {
  const intl = await loadLanguage("de");

  // will be stringified, without formatting
  expect(intl.msgfmt({ param: 123456.789 })).toEqual("123456.789");
  expect(intl.fluent({ param: 123456.789 })).toEqual("123456.789");

  // … which is kind of weird for elements, so you better declare params!
  expect(intl.msgfmt({ param: <em>elem</em> })).toEqual("[object Object]");
  expect(intl.fluent({ param: <em>elem</em> })).toEqual("[object Object]");
}
