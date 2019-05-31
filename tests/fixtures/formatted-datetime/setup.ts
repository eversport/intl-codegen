import IntlCodegen from "../../../src";

export function setup(codegen: IntlCodegen) {
  const msg = `
date, default: {d, date}
date, short: {d, date, short}
date, medium: {d, date, medium}
date, long: {d, date, long}
date, full: {d, date, full}
time, short: {d, time, short}
time, medium: {d, time, medium}
time, long: {d, time, long}
time, full: {d, time, full}
  `.trim();
  codegen.defineMessageUsingMessageFormat("msgfmt-datetime", msg, [{ name: "d", type: "datetime" }]);
}
