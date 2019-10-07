import IntlCodegen from "../src";
import { withCompiledBundle } from "./utils";
import fsExtra from "fs-extra";
import path from "path";
import ts from "typescript";

const FIXTURES_DIR = path.join(__dirname, "fixtures");

jest.setTimeout(10 * 1000);

describe("Fixtures", () => {
  beforeEach(() => {
    jest.spyOn(console, "error").mockImplementation(() => {});
    jest.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const fixtures = fsExtra.readdirSync(FIXTURES_DIR);
  for (const name of fixtures) {
    const dir = path.join(FIXTURES_DIR, name);

    it(`should handle "${name}"`, async () => {
      let codegen = new IntlCodegen();

      try {
        const { setup } = require(path.join(dir, "setup.ts"));
        const result = setup(codegen);
        if (result) {
          codegen = result;
        }
      } catch {}

      const files = await fsExtra.readdir(dir);
      let hasDiagnostics = false;
      let tsConfig: Partial<ts.CompilerOptions> = {};

      for (const file of files) {
        if (file === "tsconfig.json") {
          tsConfig = await loadCompilerOptions(path.join(dir, file));
        } else if (file === "diagnostics-errors.txt") {
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

      await withCompiledBundle(name, codegen, async (runDir, result) => {
        const testFile = path.join(runDir, "test.tsx");
        await fsExtra.copyFile(path.join(dir, "test.tsx"), testFile);

        let diagnostics = (await getDiagnostics(testFile, tsConfig)).join("\n").trim();
        if (result.errors.length) {
          diagnostics += diagnostics ? "\n\n---\n\n" : "";
          diagnostics += result.errors.map(e => e.getFormattedMessage()).join("\n");
        }

        const diagnosticsFile = path.join(dir, "diagnostics-errors.txt");
        if (!hasDiagnostics) {
          await fsExtra.outputFile(diagnosticsFile, diagnostics);
        } else {
          const expectedDiagnostics = (await fsExtra.readFile(diagnosticsFile, "utf-8")).trim();
          expect(diagnostics.trim()).toEqual(expectedDiagnostics.trim());
        }

        const { test } = require(testFile);
        await test();
      });
    });
  }
});

// https://github.com/Microsoft/TypeScript/wiki/Using-the-Compiler-API#a-minimal-compiler
const tsConfig = path.join(__dirname, "..", "tsconfig.json");
const compilerOptions = loadCompilerOptions(tsConfig);

// hm, when calling this manually, typescript does not find the type definitions
// for this…
const LANGNEG = path.join(__dirname, "..", "src", "runtime", "fluent-langneg.d.ts");

let PROGRAM: ts.Program;

async function loadCompilerOptions(fileName: string): Promise<ts.CompilerOptions> {
  const content = await fsExtra.readFile(fileName);
  // tsconfig files are not quite valid json, because they can contain comments
  // and trailing commas…
  const config = new Function(`return ${content}`)().compilerOptions;
  return ts.convertCompilerOptionsFromJson(config, path.dirname(fileName)).options;
}

async function getDiagnostics(fileName: string, optionsOverrides?: Partial<ts.CompilerOptions>) {
  const options: ts.CompilerOptions = {
    ...(await compilerOptions),
    ...optionsOverrides,
    // NOTE: enabling this is **prohibitively** slow! Unless I find a solution to
    // use the language service in a more lazy fashion, this will not happen :-(
    // skipLibCheck: false,
    // skipDefaultLibCheck: true,
  };

  // well… typescript actually uses `/` only, instead of platform specific separators.
  // So make sure we convert other paths accordingly.
  // Also, lolwut but why can’t I just use `"\\"` as a string instead of a rlobal regex?¿?
  const dirPrefix = path.dirname(fileName).replace(/\\/g, "/") + "/";

  PROGRAM = ts.createProgram([LANGNEG, fileName], options, undefined, PROGRAM);

  const allDiagnostics = ts.getPreEmitDiagnostics(PROGRAM).map(diagnostic => {
    if (diagnostic.file) {
      const { line, character } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start!);
      const fileName = diagnostic.file.fileName.replace(dirPrefix, "");
      const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n");
      return `${fileName} (${line + 1},${character + 1}): ${message}`;
    } else {
      return `${ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n")}`;
    }
  });
  return allDiagnostics;
}
