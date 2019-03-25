import IntlMessageFormat from "intl-messageformat";
import path from "path";
import IntlCodegen from "../src";
import { forEachFixture } from "./helpers";

interface FixtureCase {
  locale?: string;
  params?: { [key: string]: any };
  formats?: any;
  debug?: boolean;
  skip?: boolean;
  expected?: string;
}

interface Fixture extends FixtureCase {
  message: string;
  name?: string;
  cases?: Array<FixtureCase>;
}

export const fixturesDir = path.join(__dirname, "messageformat");

describe("Compare to MessageFormat", () => {
  beforeAll(() => {
    // hm, looks like intl-messageformat has no way to specify the output timezone.
    process.env.TZ = "Europe/Vienna";
  });
  forEachFixture(fixturesDir, runFixture);
});

export function runFixture(fixture: Fixture) {
  const { message, debug: _debug, skip: _skip, formats: _formats } = fixture;
  const cases = fixture.cases || [fixture];
  for (const [i, example] of cases.entries()) {
    const { locale = "en", params = {}, debug = _debug, skip = _skip, formats = _formats } = example;
    let { expected } = example;
    const name = `${fixture.name} #${i + 1}`;
    const fn = !skip ? it : it.skip;

    fn(name, () => {
      if (!expected) {
        const msg = new IntlMessageFormat(message, locale, formats);
        expected = msg.format(params);
      }

      const codegen = new IntlCodegen({ formats });
      const lang = codegen.getLanguage(locale);
      lang.addMessage("test", message);
      let files = codegen.generateFiles();
      let code = files[`${locale}.js`];
      code = code.replace("export default", "return");

      if (debug) {
        console.log(code);
        console.log(expected);
      }

      const generatedMsg = Function(code)().test;

      const actual = generatedMsg(params).join("");

      expect(actual).toEqual(expected);
    });
  }
}
