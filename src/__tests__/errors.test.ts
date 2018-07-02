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

  ensureCompiledFixture("locale-overwrite", async dir => {
    const { loadLanguage } = require(dir);
    const lang = await loadLanguage(loadLanguage.locales[0]);
    expect(lang.locale()).toEqual("locale overwritten");
  });
});
