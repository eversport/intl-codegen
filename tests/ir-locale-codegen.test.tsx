import React from "react";
import { defineLoader } from "../runtime";
import { LocaleGenerator } from "../src/codegen/locale";
import { Locale } from "../src/locale";
import { Message } from "../src/message";
import { date, id, lit, LocaleId, MessageId, monetary, num, Params, ref, text } from "../src/types";

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

  const loader = defineLoader(["test"], {
    async template() {
      const fn = Function(code.replace("export default", "return"))();
      return {
        default: fn,
      };
    },
  });

  const intl = await loader(["garbage", "de-AT", "en"]);
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
});
