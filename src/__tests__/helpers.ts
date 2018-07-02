import fse from "fs-extra";
import path from "path";
import ts from "typescript";
import IntlCodegen from "../";

export function forEachFixture<T>(dir: string, fn: (fixture: T) => void) {
  const files = fse.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (filePath.endsWith(".ts")) {
      const name = path.basename(file, ".ts");
      const fixture = require(filePath).default;
      fixture.name = name;
      fn(fixture);
    }
  }
}

const fixturesDir = path.join(__dirname, "codegen");
const outputDir = path.join(__dirname, "..", "..", ".testoutput");

interface Fixture {
  defaultLanguage?: string;
  languages: { [key: string]: { [key: string]: string } };
  code?: string;
  debug?: string;
}

export function testTypings(name: string, fn?: (dir: string) => Promise<void>) {
  ensureCompiledFixture(name, async dir => {
    const diagnostics = await getDiagnostics(path.join(dir, "index.tsx"));
    expect(diagnostics).toMatchSnapshot();
    if (fn) {
      await fn(dir);
    }
  });
}

// https://github.com/Microsoft/TypeScript/wiki/Using-the-Compiler-API#a-minimal-compiler
const tsConfig = path.join(__dirname, "..", "..", "tsconfig.json");
const compilerOptions = fse
  .readFile(tsConfig, "utf-8")
  .then(config => new Function(`return ${config}`)().compilerOptions)
  .then(config => ts.convertCompilerOptionsFromJson(config, path.dirname(tsConfig)).options);

async function getDiagnostics(fileName: string) {
  const options = await compilerOptions;
  const program = ts.createProgram([fileName], options);

  const allDiagnostics = ts.getPreEmitDiagnostics(program).map(diagnostic => {
    if (diagnostic.file) {
      const { line, character } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start!);
      const fileName = diagnostic.file.fileName.replace(`${outputDir}/`, "");
      const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n");
      return `${fileName} (${line + 1},${character + 1}): ${message}`;
    } else {
      return `${ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n")}`;
    }
  });
  return allDiagnostics;
}

export function ensureCompiledFixture(name: string, fn: (dir: string) => Promise<void>) {
  const output = path.join(outputDir, name);
  const fileName = path.join(fixturesDir, `${name}.ts`);
  const fixture: Fixture = require(fileName).default;
  it(name, async () => {
    const { defaultLanguage, languages, debug } = fixture;
    let { code = `export * from "./lang";` } = fixture;
    try {
      const codegen = new IntlCodegen(defaultLanguage);

      for (const [locale, messages] of Object.entries(languages)) {
        const lang = codegen.getLanguage(locale);
        lang.addMessages(messages);
      }

      const files = await codegen.writeFiles(path.join(output, "lang"));
      if (debug) {
        for (const [name, content] of Object.entries(files)) {
          console.log(`=== lang/${name} ===\n${content}`);
        }
      }

      if (code) {
        code = code.trim();
        await fse.outputFile(path.join(output, "index.tsx"), code);
        if (debug) {
          console.log(`=== index.tsx ===\n${code}`);
        }
      }

      await fn(output);
    } finally {
      await fse.remove(output);
    }
  });
}
