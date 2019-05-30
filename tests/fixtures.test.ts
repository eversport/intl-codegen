import IntlCodegen from "../src";
import { withCompiledBundle } from "./utils";
import fsExtra from "fs-extra";
import path from "path";
import ts from "typescript";

const FIXTURES_DIR = path.join(__dirname, "fixtures");

jest.setTimeout(10 * 1000);

describe("Fixtures", () => {
  const fixtures = fsExtra.readdirSync(FIXTURES_DIR);
  for (const name of fixtures) {
    const dir = path.join(FIXTURES_DIR, name);

    it(`should handle "${name}"`, async () => {
      const codegen = new IntlCodegen();
      let hasSetup = false;

      const files = await fsExtra.readdir(dir);
      let hasDiagnostics = false;
      for (const file of files) {
        if (file === "setup.ts") {
          hasSetup = true;
        } else if (file === "diagnostics.txt") {
          hasDiagnostics = true;
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
        const testFile = path.join(runDir, "test.tsx");
        await fsExtra.copyFile(path.join(dir, "test.tsx"), testFile);

        const diagnostics = (await getDiagnostics(testFile)).join("\n").trim();

        const diagnosticsFiles = path.join(dir, "diagnostics.txt");
        if (!hasDiagnostics) {
          await fsExtra.outputFile(diagnosticsFiles, diagnostics);
        } else {
          const expectedDiagnostics = (await fsExtra.readFile(diagnosticsFiles, "utf-8")).trim();
          expect(diagnostics).toEqual(expectedDiagnostics);
        }

        const { test } = require(testFile);
        await test();
      });
    });
  }
});

// https://github.com/Microsoft/TypeScript/wiki/Using-the-Compiler-API#a-minimal-compiler
const tsConfig = path.join(__dirname, "..", "tsconfig.json");
const compilerOptions = fsExtra
  .readFile(tsConfig, "utf-8")
  .then(config => new Function(`return ${config}`)().compilerOptions)
  .then(config => ts.convertCompilerOptionsFromJson(config, path.dirname(tsConfig)).options);

const LANGNEG = path.join(__dirname, "..", "runtime", "fluent-langneg.d.ts");

async function getDiagnostics(fileName: string) {
  const options: ts.CompilerOptions = {
    ...(await compilerOptions),
    // skipLibCheck: false,
    // skipDefaultLibCheck: true,
  };
  const dirName = path.dirname(fileName);

  const program = ts.createProgram([fileName, LANGNEG], options);

  const allDiagnostics = ts.getPreEmitDiagnostics(program).map(diagnostic => {
    if (diagnostic.file) {
      const { line, character } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start!);
      const fileName = diagnostic.file.fileName.replace(`${dirName}/`, "");
      const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n");
      return `${fileName} (${line + 1},${character + 1}): ${message}`;
    } else {
      return `${ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n")}`;
    }
  });
  return allDiagnostics;
}
