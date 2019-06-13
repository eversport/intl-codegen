import IntlCodegen from "../../../src";

export function setup(codegen: IntlCodegen) {
  codegen.defineMessageUsingMessageFormat("msgfmt", "selector: {param, select, foo {its foo} bar {its bar}}.", [
    { name: "param" },
  ]);
}
