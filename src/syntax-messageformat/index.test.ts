import parser from ".";

function parse(source: string) {
  console.log(parser.parse(source));
}

describe("syntax-messageformat", () => {
  it("should parse simple text", () => {
    parse("just some text");
  });
  it("should parse simple mf argument", () => {
    parse("just a mf {argument} surrounded by text");
  });
  it("should parse simple html tag", () => {
    parse("just a <em>simple</em> html tag");
  });
});
