import IntlCodegen from "../../../src";

export function setup(codegen: IntlCodegen) {
  codegen.defineMessageUsingMessageFormat("msgfmt-correct", "a correct message");
  codegen.defineMessageUsingMessageFormat("msgfmt-missing-localization", "a message with missing localization");
}
