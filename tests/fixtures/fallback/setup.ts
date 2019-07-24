import IntlCodegen from "../../../src";

export function setup() {
  const codegen = new IntlCodegen({
    fallbackLocale: "en",
  });
  codegen.defineMessageUsingMessageFormat("msgfmt-present", "this is template");
  codegen.defineMessageUsingMessageFormat("msgfmt-missing", "this is template");

  return codegen;
}
