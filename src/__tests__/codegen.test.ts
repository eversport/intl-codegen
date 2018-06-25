import IntlCodegen from "../";
// import path from "path";

// const output = path.join(__dirname, "testoutput");

describe("Codegen", () => {
  it("should generate all the files", async () => {
    const codegen = new IntlCodegen();
    codegen.getLanguage("de").addMessage("test", "ein {foo}");
    codegen.getLanguage("en").addMessage("test", "some {foo}");

    console.log(codegen.generateFiles());
    // await codegen.writeFiles("en", output);
  });
});
