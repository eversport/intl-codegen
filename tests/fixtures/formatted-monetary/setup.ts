import IntlCodegen from "../../../src";

export function setup(codegen: IntlCodegen) {
  const msg = `
currency: {num, number, currency}
currency0: {num, number, currency0}
currencycode: {num, number, currencycode}
currencycode0: {num, number, currencycode0}
  `.trim();
  codegen.defineMessageUsingMessageFormat("msgfmt-monetary", msg, [{ name: "num", type: "monetary" }]);
}
