import IntlCodegen from "../";
import { ensureCompiledFixture } from "./helpers";

describe("Errors", () => {
  beforeEach(() => {
    jest.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should warn on reserved IDs", () => {
    // TODO: make this an array
    const codegen = new IntlCodegen();

    codegen.getLanguage("en").addMessage("locale", "foo");
    expect(console.warn).toHaveBeenNthCalledWith(1, `The key "locale" is used internally by intl-codegen.`);
    expect(console.warn).toHaveBeenNthCalledWith(2, `Consider using a different key instead.`);
  });

  it("should warn on invalid format style", () => {
    const codegen = new IntlCodegen();

    codegen
      .getLanguage("en")
      .addMessage("test", "{num, number, invalid}, {date, date, invalid}, {time, time, invalid}");

    codegen.generateFiles();

    expect(console.warn).toHaveBeenNthCalledWith(
      1,
      `Format "number.invalid" not defined, falling back to default formatting.`,
    );
    expect(console.warn).toHaveBeenNthCalledWith(
      2,
      `Format "date.invalid" not defined, falling back to default formatting.`,
    );
    expect(console.warn).toHaveBeenNthCalledWith(
      3,
      `Format "time.invalid" not defined, falling back to default formatting.`,
    );
  });

  it("should warn on unsupported plural syntax", () => {
    let codegen;

    codegen = new IntlCodegen();
    codegen.getLanguage("en").addMessage("test", "plural with {plural, plural, one {one}}");
    codegen.generateFiles();

    expect(console.warn).toHaveBeenLastCalledWith("Plural forms other than `=X` or `other` are not yet supported.");

    codegen = new IntlCodegen();
    codegen.getLanguage("en").addMessage("test", "plural with {plural, plural, offset: 1 other {offset}}");
    codegen.generateFiles();

    expect(console.warn).toHaveBeenLastCalledWith("Plural `ordinal` and `offset` are not yet supported.");

    codegen = new IntlCodegen();
    codegen.getLanguage("en").addMessage("test", "plural with {plural, selectordinal, other {ordinal}}");
    codegen.generateFiles();

    expect(console.warn).toHaveBeenLastCalledWith("Plural `ordinal` and `offset` are not yet supported.");
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

    expect(console.warn).toHaveBeenLastCalledWith(
      `Translation key "foo" was not defined for locale "de". Falling back to default locale.`,
    );
    expect(generatedMsg().join("")).toEqual("bar");
  });
});
