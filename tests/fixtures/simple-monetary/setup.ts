import IntlCodegen from "../../../src";

export function setup(codegen: IntlCodegen) {
  codegen.defineMessageUsingMessageFormat("msgfmt-monetary", "a monetary value: {value}", [
    {
      name: "value",
      type: "monetary",
    },
  ]);
}
