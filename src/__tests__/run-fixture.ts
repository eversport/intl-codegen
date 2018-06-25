import IntlMessageFormat from "intl-messageformat";
import IntlCodegen from "../";

interface FixtureCase {
  locale?: string;
  params?: { [key: string]: any };
  formats?: any;
  debug?: boolean;
}

export interface Fixture extends FixtureCase {
  message: string;
  name?: string;
  cases?: Array<FixtureCase>;
}

export function runFixture(fixture: Fixture) {
  const { message, debug: _debug } = fixture;
  const cases = fixture.cases || [fixture];
  for (const [i, example] of cases.entries()) {
    const { locale = "en", params = {}, debug = _debug } = example;
    const name = `${fixture.name} #${i + 1}`;
    it(name, () => {
      const msg = new IntlMessageFormat(message, locale);
      const expected = msg.format(params);

      const codegen = new IntlCodegen();
      const lang = codegen.getLanguage(locale);
      lang.addMessage("test", message);
      let files = codegen.generateFiles();
      let code = files[`${locale}.js`];
      code = code.replace("export default", "return");

      if (debug) {
        console.log(code);
      }

      const generatedMsg = Function(code)().test;

      const actual = generatedMsg(params).join("");

      expect(actual).toEqual(expected);
    });
  }
}
