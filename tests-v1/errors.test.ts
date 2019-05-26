import IntlCodegen from "../src-v1";
import { ensureCompiledFixture } from "./helpers";

describe("Errors", () => {
  let consoleOutput: Array<any> = [];
  beforeEach(() => {
    jest.spyOn(console, "warn").mockImplementation((...args) => {
      consoleOutput.push({ warn: args });
    });
    jest.spyOn(console, "log").mockImplementation((...args) => {
      consoleOutput.push({ log: args });
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
    consoleOutput = [];
  });

  it("should warn on invalid messageformat syntax", () => {
    const codegen = new IntlCodegen();

    codegen.getLanguage("en").addMessage("invalid-message", "invalid stuff {");

    expect(consoleOutput).toMatchInlineSnapshot(`
      Array [
        Object {
          "warn": Array [
            "[en: invalid-message]: The message has invalid syntax",
          ],
        },
        Object {
          "log": Array [
            "> 1 | invalid stuff {
          |                ^ Expected \\"0\\", [1-9], or [^ \\\\t\\\\n\\\\r,.+={}#] but end of input found.",
          ],
        },
      ]
    `);
  });

  it("should warn on reserved IDs", () => {
    // TODO: make this an array
    const codegen = new IntlCodegen();

    codegen.getLanguage("en").addMessage("locale", "foo");

    expect(consoleOutput).toMatchInlineSnapshot(`
      Array [
        Object {
          "warn": Array [
            "The key \\"locale\\" is used internally by intl-codegen.",
          ],
        },
        Object {
          "warn": Array [
            "Consider using a different key instead.",
          ],
        },
      ]
    `);
  });

  it("should warn on invalid format style", () => {
    const codegen = new IntlCodegen();

    codegen
      .getLanguage("en")
      .addMessage("test", "{num, number, invalid}, {date, date, invalid}, {time, time, invalid}");

    codegen.generateFiles();

    expect(consoleOutput).toMatchInlineSnapshot(`
      Array [
        Object {
          "warn": Array [
            "[en: test]: Format \\"number.invalid\\" not defined, falling back to default formatting.",
          ],
        },
        Object {
          "log": Array [
            "> 1 | {num, number, invalid}, {date, date, invalid}, {time, time, invalid}
          |       ^^^^^^^^^^^^^^^",
          ],
        },
        Object {
          "warn": Array [
            "[en: test]: Format \\"date.invalid\\" not defined, falling back to default formatting.",
          ],
        },
        Object {
          "log": Array [
            "> 1 | {num, number, invalid}, {date, date, invalid}, {time, time, invalid}
          |                                ^^^^^^^^^^^^^",
          ],
        },
        Object {
          "warn": Array [
            "[en: test]: Format \\"time.invalid\\" not defined, falling back to default formatting.",
          ],
        },
        Object {
          "log": Array [
            "> 1 | {num, number, invalid}, {date, date, invalid}, {time, time, invalid}
          |                                                       ^^^^^^^^^^^^^",
          ],
        },
      ]
    `);
  });

  it("should warn on unsupported plural syntax", () => {
    let codegen;

    codegen = new IntlCodegen();
    codegen.getLanguage("en").addMessage("test", "plural with {plural, plural, one {one}}");
    codegen.generateFiles();

    expect(consoleOutput).toMatchInlineSnapshot(`
      Array [
        Object {
          "warn": Array [
            "[en: test]: Plural forms other than \`=X\` or \`other\` are not yet supported.",
          ],
        },
        Object {
          "log": Array [
            "> 1 | plural with {plural, plural, one {one}}
          |                              ^^^^",
          ],
        },
      ]
    `);
    consoleOutput = [];

    codegen = new IntlCodegen();
    codegen.getLanguage("en").addMessage("test", "plural with {plural, plural, offset: 1 other {offset}}");
    codegen.generateFiles();

    expect(consoleOutput).toMatchInlineSnapshot(`
      Array [
        Object {
          "warn": Array [
            "[en: test]: Plural \`ordinal\` and \`offset\` are not yet supported.",
          ],
        },
        Object {
          "log": Array [
            "> 1 | plural with {plural, plural, offset: 1 other {offset}}
          |                      ^^^^^^^^^^^^^^^^^^",
          ],
        },
      ]
    `);
    consoleOutput = [];

    codegen = new IntlCodegen();
    codegen.getLanguage("en").addMessage("test", "plural with {plural, selectordinal, other {ordinal}}");
    codegen.generateFiles();

    expect(consoleOutput).toMatchInlineSnapshot(`
      Array [
        Object {
          "warn": Array [
            "[en: test]: Plural \`ordinal\` and \`offset\` are not yet supported.",
          ],
        },
        Object {
          "log": Array [
            "> 1 | plural with {plural, selectordinal, other {ordinal}}
          |                      ^^^^^^^^^^^^^^^",
          ],
        },
      ]
    `);
    consoleOutput = [];
  });

  ensureCompiledFixture("locale-overwrite", async dir => {
    const { loadLanguage } = require(dir);
    const lang = await loadLanguage(loadLanguage.locales[0]);
    expect(lang.locale()).toEqual("locale overwritten");
  });

  it("should warn when falling back because of missing messages", () => {
    const codegen = new IntlCodegen();
    codegen.getLanguage("en").addMessage("foo", "bar");
    codegen.getLanguage("de");

    let files = codegen.generateFiles();
    let code = files[`de.js`];
    code = code.replace("export default", "return");

    const generatedMsg = Function(code)().foo;

    expect(generatedMsg().join("")).toEqual("bar");
    expect(consoleOutput).toMatchInlineSnapshot(`
      Array [
        Object {
          "warn": Array [
            "Translation key \\"foo\\" was not defined for locale \\"de\\". Falling back to default locale.",
          ],
        },
      ]
    `);
  });
});
