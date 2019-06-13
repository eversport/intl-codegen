import IntlCodegen from "../../../src";

export function setup(codegen: IntlCodegen) {
  codegen.defineMessageUsingMessageFormat("msgfmt", "an undeclared {param}.");
}
