import IntlCodegen from "../../../src";

export function setup(codegen: IntlCodegen) {
  codegen.defineMessageUsingMessageFormat("msgfmt-date-as-number", "{param, number}", [
    { name: "param", type: "datetime" },
  ]);
  codegen.defineMessageUsingMessageFormat("msgfmt-number-as-date", "{param, date}", [
    { name: "param", type: "number" },
  ]);

  const ordinal = `
{param}{param,selectordinal,
  one {st}
  two {nd}
  few {rd}
  other {th}
}
  `.trim();
  codegen.defineMessageUsingMessageFormat("msgfmt-string-as-ordinal", ordinal, [{ name: "param" }]);

  const plural = `
{param} {param,plural,
  one {parameter}
  other {parameters}
}
  `.trim();
  codegen.defineMessageUsingMessageFormat("msgfmt-string-as-plural", plural, [{ name: "param" }]);
}
