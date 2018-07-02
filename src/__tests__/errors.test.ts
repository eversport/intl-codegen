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
    expect(console.warn).toHaveBeenCalledWith(
      `The key "locale" is used internally by intl-codegen.\n` +
        `Consider using a different key instead.`,
    );
  });

  it("should warn on invalid format style", () => {
    const codegen = new IntlCodegen();

    codegen
      .getLanguage("en")
      .addMessage("test", "{num, number, invalid}, {date, date, invalid}, {time, time, invalid}");

    codegen.generateFiles();

    expect(console.warn).toHaveBeenNthCalledWith(1, `Format "number.invalid" not defined, falling back to default formatting.`);
    expect(console.warn).toHaveBeenNthCalledWith(2, `Format "date.invalid" not defined, falling back to default formatting.`);
    expect(console.warn).toHaveBeenNthCalledWith(3, `Format "time.invalid" not defined, falling back to default formatting.`);
  });

  ensureCompiledFixture("locale-overwrite", async dir => {
    const { loadLanguage } = require(dir);
    const lang = await loadLanguage(loadLanguage.locales[0]);
    expect(lang.locale()).toEqual("locale overwritten");
  });
});
