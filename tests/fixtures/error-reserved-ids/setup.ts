import IntlCodegen from "../../../src";

export function setup(codegen: IntlCodegen) {
  codegen.defineMessageUsingMessageFormat("msgfmt-valid", "valid");
  codegen.defineMessageUsingMessageFormat("context", "invalid message id");

  codegen.addLocalizedMessageUsingMessageFormat("template", "msgfmt-valid", "invalid locale");
  codegen.addLocalizedMessagesUsingFluent("template", "fluent-valid = invalid invalid locale");
}
