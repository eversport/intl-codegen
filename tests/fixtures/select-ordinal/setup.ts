import IntlCodegen from "../../../src";

export function setup(codegen: IntlCodegen) {
  const msg = `
{param}{param,selectordinal,
  one {st}
  two {nd}
  few {rd}
  other {th}
}
  `.trim();
  codegen.defineMessageUsingMessageFormat("msgfmt-select", msg, [{ name: "param", type: "number" }]);
}
