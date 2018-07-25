import IntlCodegen from "../";

describe("Options", () => {
  it("should take string or object", () => {
    let codegen = new IntlCodegen("de");
    const initWithString = codegen.generateFiles()["index.js"];

    codegen = new IntlCodegen({ defaultLocale: "de" });
    const initWithObject = codegen.generateFiles()["index.js"];

    codegen = new IntlCodegen({ defaultLocale: "en" });
    const initWithObject2 = codegen.generateFiles()["index.js"];

    expect(initWithString).toEqual(initWithObject);
    expect(initWithObject).not.toEqual(initWithObject2);
  });
});
