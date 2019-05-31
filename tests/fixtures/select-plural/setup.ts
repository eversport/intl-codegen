import IntlCodegen from "../../../src";

export function setup(codegen: IntlCodegen) {
  const msg = `
{param,plural,
  =0 {no items}
  one {one item}
  other {{param} items}
}
  `.trim();
  codegen.defineMessageUsingMessageFormat("msgfmt-select", msg, [{ name: "param", type: "number" }]);
}
