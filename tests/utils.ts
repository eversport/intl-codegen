import fsExtra from "fs-extra";
import "intl-pluralrules";
import path from "path";
import IntlCodegen from "../src";
import { GenerateResult } from "../src/bundle";

const TEST_OUTPUT = path.join(__dirname, "..", ".testoutput");

export async function withCompiledBundle(
  name: string,
  codegen: IntlCodegen,
  fn: (dir: string, result: GenerateResult) => any,
) {
  const outputDir = path.join(TEST_OUTPUT, name);
  try {
    await fsExtra.remove(outputDir);
    const result = await codegen.write(outputDir);

    await fn(outputDir, result);
  } finally {
    await fsExtra.remove(outputDir);
  }
}
