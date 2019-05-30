import IntlCodegen from "../../../src";

export function setup(codegen: IntlCodegen) {
  codegen.defineMessageUsingMessageFormat("msgfmt-number", "a number: {num}", [
    {
      name: "num",
      type: "number",
    },
  ]);
}
