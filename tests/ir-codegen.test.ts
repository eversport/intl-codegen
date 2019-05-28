import { BundleGenerator } from "../src/codegen/js";
import { Bundle } from "../src/bundle";
import { LocaleId, MessageId } from "../src/types";
import { defineLoader } from "../runtime";
import { text, ref, id, num, date, monetary, lit } from "../src/ir";

async function makeFn(...elements: any) {
  const bundle = new Bundle();

  bundle.locales.get("template" as LocaleId)!.set(
    "test" as MessageId,
    {
      id: "test-id",
      sourceText: "test-source",
      ir: { type: "Pattern", elements },
    } as any,
  );

  const generator = new BundleGenerator(bundle);
  const code = generator.generateLocale("template" as LocaleId);

  const loader = defineLoader(["test"], {
    async template() {
      const fn = Function(code.replace("export default", "return"))();
      return {
        default: fn,
      };
    },
  });

  const intl = await loader(["garbage", "de-AT", "en"]);
  return intl.test;
}

describe("js codegen", () => {
  it("should generate a very simple message", async () => {
    const fn = await makeFn(text("foobar"));
    expect(fn()).toMatchInlineSnapshot(`"foobar"`);
  });

  it("should generate a very simple param reference", async () => {
    const fn = await makeFn(ref("foo-bar"));
    expect(fn({ "foo-bar": "foobar" })).toMatchInlineSnapshot(`"foobar"`);
  });

  it("should generate a formatted number literal", async () => {
    const fn = await makeFn(num(lit(123456.789)));
    expect(fn()).toMatchInlineSnapshot(`"123 456,789"`);
  });

  it("should generate a formatted number param", async () => {
    const fn = await makeFn(num(id("foo-bar")));
    expect(fn({ "foo-bar": 123456.789 })).toMatchInlineSnapshot(`"123 456,789"`);
  });

  it("should combine flat text and formatters", async () => {
    const fn = await makeFn(
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
});
