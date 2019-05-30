import IntlCodegen from "../src";
import { withCompiledBundle } from "./utils";
import fsExtra from "fs-extra";
import path from "path";

const FIXTURES_DIR = path.join(__dirname, "fixtures");

describe("Fixtures", () => {
  const fixtures = fsExtra.readdirSync(FIXTURES_DIR);
  for (const name of fixtures) {
    const dir = path.join(FIXTURES_DIR, name);

    it(`should handle "${name}"`, async () => {
      const codegen = new IntlCodegen();
      let hasSetup = false;

      const files = await fsExtra.readdir(dir);
      for (const file of files) {
        if (file.endsWith("setup.ts")) {
          hasSetup = true;
        } else if (file.endsWith(".ftl")) {
          const content = await fsExtra.readFile(path.join(dir, file), "utf-8");
          if (file === "template.ftl") {
            codegen.defineMessagesUsingFluent(content);
          } else {
            const locale = path.basename(file, ".ftl");
            codegen.addLocalizedMessagesUsingFluent(locale, content);
          }
        } else if (file.endsWith(".json")) {
          const json = await fsExtra.readJson(path.join(dir, file));
          const locale = path.basename(file, ".json");
          for (const [id, msg] of Object.entries(json)) {
            codegen.addLocalizedMessageUsingMessageFormat(locale, id, msg as any);
          }
        }
      }

      if (hasSetup) {
        const { setup } = require(path.join(dir, "setup.ts"));
        setup(codegen);
      }

      await withCompiledBundle(name, codegen, async runDir => {
        const testFile = path.join(runDir, "test.ts");
        await fsExtra.copyFile(path.join(dir, "test.ts"), testFile);

        const { test } = require(testFile);
        await test();
      });
    });
  }
});
