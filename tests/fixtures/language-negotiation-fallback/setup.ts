import IntlCodegen from "../../../src";

export function setup() {
  const codegen = new IntlCodegen({
    fallbackLocale: "de",
  });

  return codegen;
}
