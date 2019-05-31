import IntlCodegen from "../../../src";

export function setup(codegen: IntlCodegen) {
  const msg = `
{param,select,
  a {its a}
  b {its b}
  other {its something else}
}
  `.trim();
  codegen.defineMessageUsingMessageFormat("msgfmt-select", msg, [{ name: "param" }]);
}
