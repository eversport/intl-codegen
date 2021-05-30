import IntlCodegen from "../src";
import { withCompiledBundle } from "./utils";

describe("Explicit API", () => {
  it("should allow defining messages using fluent syntax", async () => {
    const codegen = new IntlCodegen();

    codegen.defineMessagesUsingFluent("a = a\nb = b");

    await withCompiledBundle("explicit-fluent", codegen, async mod => {
      const { loadLanguage } = require(mod);
      const intl = await loadLanguage("de");
      expect(intl.a()).toMatchInlineSnapshot(`"a"`);
    });
  });

  it("should allow defining messages using messageformat syntax", async () => {
    const codegen = new IntlCodegen();

    codegen.defineMessageUsingMessageFormat("a", "a");

    await withCompiledBundle("explicit-msgfmt", codegen, async mod => {
      const { loadLanguage } = require(mod);
      const intl = await loadLanguage("de");
      expect(intl.a()).toMatchInlineSnapshot(`"a"`);
    });
  });

  it("should allow defining messages using both", async () => {
    const codegen = new IntlCodegen();

    codegen.defineMessagesUsingFluent("a = a");
    codegen.defineMessageUsingMessageFormat("b", "b");

    await withCompiledBundle("explicit-both", codegen, async mod => {
      const { loadLanguage } = require(mod);
      const intl = await loadLanguage("de");
      expect(intl.a()).toMatchInlineSnapshot(`"a"`);
      expect(intl.b()).toMatchInlineSnapshot(`"b"`);
    });
  });
});
