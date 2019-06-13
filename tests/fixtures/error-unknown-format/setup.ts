import IntlCodegen from "../../../src";

export function setup(codegen: IntlCodegen) {
  codegen.defineMessageUsingMessageFormat(
    "msgfmt",
    "num: {num,number,invalid}, date: {dt,date,invalid}, time: {dt,time,invalid}",
    [{ name: "num", type: "number" }, { name: "dt", type: "datetime" }],
  );
}
