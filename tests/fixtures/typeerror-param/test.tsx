import { loadLanguage } from "./";

export async function test() {
  const intl = await loadLanguage("de");

  expect(() => {
    // calling without params
    intl.simpleParam();
    intl.simpleParam({});

    // calling with wrong param name
    intl.simpleParam({ b: "" });

    // calling with wrong type
    intl.simpleParam({ a: 123 });
  }).toThrow();
}
