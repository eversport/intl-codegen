import fsExtra from "fs-extra";
import path from "path";
import IntlCodegen from "../src";

const TEST_OUTPUT = path.join(__dirname, "..", ".testoutput");

export async function withCompiledBundle(name: string, codegen: IntlCodegen, fn: (dir: string) => any) {
  const outputDir = path.join(TEST_OUTPUT, name);
  try {
    await fsExtra.remove(outputDir);
    await codegen.write(outputDir);

    await fn(outputDir);
  } finally {
    await fsExtra.remove(outputDir);
  }
}
