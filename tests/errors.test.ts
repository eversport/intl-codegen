import IntlCodegen from "../src";
import de from "deindent";

describe("should error", () => {
  it("when using an invalid locale", () => {
    const cg = new IntlCodegen();
    expect(() => cg.addLocalizedMessageUsingMessageFormat("template", "foo", "foo")).toThrowErrorMatchingInlineSnapshot(
      `"Locale \\"template\\" is reserved for internal use"`,
    );
    expect(() => cg.addLocalizedMessagesUsingFluent("template", "foo = foo")).toThrowErrorMatchingInlineSnapshot(
      `"Locale \\"template\\" is reserved for internal use"`,
    );
  });

  describe("on non-existent localized messages", () => {
    it("using MessageFormat", async () => {
      const cg = new IntlCodegen();
      cg.defineMessageUsingMessageFormat("a", "a")
        .defineMessageUsingMessageFormat("b", "b")
        .addLocalizedMessageUsingMessageFormat("en", "a", "a-en");

      const result = await cg.generate();

      expect(result.errors).toMatchInlineSnapshot(`
                      Array [
                        Object {
                          "id": "message-not-localized",
                          "locale": "en",
                          "messageId": "b",
                        },
                      ]
                  `);
    });

    it("using fluent", async () => {
      const cg = new IntlCodegen();
      cg.defineMessagesUsingFluent(
        de`a = a
           b = b`,
      ).addLocalizedMessagesUsingFluent("en", `a = a-en`);

      const result = await cg.generate();

      expect(result.errors).toMatchInlineSnapshot(`
                        Array [
                          Object {
                            "id": "message-not-localized",
                            "locale": "en",
                            "messageId": "b",
                          },
                        ]
                  `);
    });

    it("using both", async () => {
      const cg = new IntlCodegen();
      cg.defineMessagesUsingFluent(
        de`a = a
           b = b`,
      )
        .defineMessageUsingMessageFormat("c", "c")
        .addLocalizedMessageUsingMessageFormat("en", "c", "c-en")
        .addLocalizedMessagesUsingFluent("en", de`a = a-en`);

      const result = await cg.generate();

      expect(result.errors).toMatchInlineSnapshot(`
                        Array [
                          Object {
                            "id": "message-not-localized",
                            "locale": "en",
                            "messageId": "b",
                          },
                        ]
                  `);
    });
  });

  it("when using undeclared param", async () => {
    const cg = new IntlCodegen();
    cg.defineMessagesUsingFluent(
      de`# $foo (string)
         a = { $foo }
    `,
    )
      .addLocalizedMessageUsingMessageFormat("en", "a", "{foo}, {bar}")
      .addLocalizedMessagesUsingFluent("de", de`a = { $foo }, { $bar }`);

    const result = await cg.generate();

    expect(result.errors).toMatchInlineSnapshot(`
      Array [
        Object {
          "id": "undeclared-parameter",
          "locale": "en",
          "messageId": "a",
          "param": "bar",
        },
        Object {
          "id": "undeclared-parameter",
          "locale": "de",
          "messageId": "a",
          "param": "bar",
        },
      ]
    `);
  });
});
