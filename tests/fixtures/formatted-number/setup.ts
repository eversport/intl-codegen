import IntlCodegen from "../../../src";

export function setup(codegen: IntlCodegen) {
  codegen.defineMessageUsingMessageFormat("msgfmt-percent", "a percentage: {num, number, percent}", [
    {
      name: "num",
      type: "number",
    },
  ]);
}
