import React from "react";
import { LocaleGenerator } from "../src/codegen/locale";
import { Locale } from "../src/locale";
import { Message } from "../src/message";
import { defineLoader } from "../src/runtime";
import { date, id, lit, LocaleId, MessageId, monetary, num, Params, ref, select, text, variant } from "../src/types";

async function makeFn(_params: Record<string, string>, ...elements: Array<any>) {
  const loc = "template" as LocaleId;
  const msgId = "test-id" as MessageId;
  const params: Params = new Map(Object.entries(_params).map(([name, type]: [any, any]) => [name, { name, type }]));
  const message = new Message(loc, msgId, params)
    .withParseResult("source-text", undefined as any)
    .withIR({ type: "Pattern", elements });
  const locale = new Locale(loc);
  locale.messages.set(msgId, message);

  const generator = new LocaleGenerator(locale);
  const code = generator.generate();

  // console.log(code);

  const loader = defineLoader(["test"], {
    async template() {
      const fn = Function(code.replace("export default", "return"))();
      return {
        default: fn,
      };
    },
  });

  const intl = await loader([_params.locale || "garbage", "de-AT", "en"]);
  return (intl as any).test;
}

describe("locale codegen", () => {
  it("should generate a very simple message", async () => {
    const fn = await makeFn({}, text("foobar"));
    expect(fn()).toMatchInlineSnapshot(`"foobar"`);
  });

  it("should generate a very simple param reference", async () => {
    const fn = await makeFn({}, ref("foo-bar"));
    expect(fn({ "foo-bar": "foobar" })).toMatchInlineSnapshot(`"foobar"`);
  });

  it("should generate a formatted number literal", async () => {
    const fn = await makeFn({}, num(lit(123456.789)));
    expect(fn()).toMatchInlineSnapshot(`"123 456,789"`);
  });

  it("should generate a formatted number param", async () => {
    const fn = await makeFn({}, num(id("foo-bar")));
    expect(fn({ "foo-bar": 123456.789 })).toMatchInlineSnapshot(`"123 456,789"`);
  });

  it("should combine flat text and formatters", async () => {
    const fn = await makeFn(
      {},
      text("number: "),
      num(id("number")),
      text("\ndatetime: "),
      date("datetime", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "numeric",
        minute: "numeric",
        timeZone: "UTC",
        timeZoneName: "short",
      }),
      text("\nmonetary: "),
      monetary("monetary"),
    );
    expect(
      fn({
        number: 123456.789,
        datetime: new Date("2019-05-28T16:44:51.992Z"),
        monetary: {
          value: 123456.789,
          currency: "EUR",
        },
      }),
    ).toMatchInlineSnapshot(`
      "number: 123 456,789
      datetime: 28. Mai 2019, 16:44 UTC
      monetary: € 123.456,79"
    `);
  });

  it("should generate correct code that outputs elements", async () => {
    const fn = await makeFn({ elem: "element" }, text("an element: "), ref("elem"));
    expect(fn({ elem: <strong>the element \o/</strong> })).toMatchInlineSnapshot(`
      Array [
        "an element: ",
        <strong>
          the element \\o/
        </strong>,
      ]
    `);
  });

  it("should generate correct code for single variant selects", async () => {
    let fn = await makeFn({ arg: "string" }, select(id("arg"), [variant(0, ref("arg"))]));

    expect(fn({ arg: "an arg" })).toEqual("an arg");

    fn = await makeFn({ arg: "element" }, select(id("arg"), [variant(0, ref("arg"))]));

    expect(fn({ arg: <em>an element</em> })).toMatchInlineSnapshot(`
      Array [
        <em>
          an element
        </em>,
      ]
    `);
  });

  it("should generate correct code for simple selects", async () => {
    let fn = await makeFn(
      { arg: "string" },
      select(id("arg"), [
        variant(0, text("nothing to see here")),
        variant("a", text("its a")),
        variant("b", text("its b")),
      ]),
    );

    expect(fn({ arg: "a" })).toEqual("its a");
    expect(fn({ arg: "b" })).toEqual("its b");
    expect(fn({ arg: "something else" })).toEqual("nothing to see here");

    fn = await makeFn(
      { arg: "string", elem: "element" },
      select(id("arg"), [
        variant(0, text("the element:"), ref("elem")),
        variant("a", text("its a")),
        variant("b", text("its b")),
      ]),
    );

    expect(fn({ arg: "something else", elem: <em>the element</em> })).toMatchInlineSnapshot(`
      Array [
        "the element:",
        <em>
          the element
        </em>,
      ]
    `);
  });

  it("should support plural selectors", async () => {
    let fn = await makeFn(
      { arg: "number" },
      select(id("arg"), [variant("other", text("something else")), variant(1, text("one"))], "plural"),
    );

    expect(fn({ arg: 1 })).toEqual("one");
    expect(fn({ arg: 0 })).toEqual("something else");

    fn = await makeFn(
      { arg: "number" },
      select(id("arg"), [variant("other", text("something else")), variant("one", text("one"))], "plural"),
    );

    expect(fn({ arg: 1 })).toEqual("one");
    expect(fn({ arg: 0 })).toEqual("something else");
  });

  it("should support ordinal selectors", async () => {
    let fn = await makeFn(
      { arg: "number", locale: "en" },
      ref("arg"),
      select(
        id("arg"),
        [
          variant("other", text("th")),
          variant("one", text("st")),
          variant("two", text("nd")),
          variant("few", text("rd")),
        ],
        "ordinal",
      ),
    );

    expect(fn({ arg: 11 })).toEqual("11th");
    expect(fn({ arg: 22 })).toEqual("22nd");
    expect(fn({ arg: 23 })).toEqual("23rd");
    expect(fn({ arg: 31 })).toEqual("31st");
  });
});
