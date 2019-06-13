import IntlCodegen from "../../../src";

export function setup(codegen: IntlCodegen) {
  codegen.defineMessageUsingMessageFormat("msgfmt-junk", "{");
  codegen.defineMessageUsingMessageFormat("msgfmt-invalid-format", "{foo,bar,baz}");
}
