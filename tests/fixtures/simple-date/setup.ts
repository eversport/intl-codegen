import IntlCodegen from "../../../src";

export function setup(codegen: IntlCodegen) {
  codegen.defineMessageUsingMessageFormat("msgfmt-date", "a date: {d}", [
    {
      name: "d",
      type: "datetime",
    },
  ]);
}
