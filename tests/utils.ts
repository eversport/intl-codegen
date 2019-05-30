import fsExtra from "fs-extra";
import path from "path";
import IntlCodegen from "../src";
// import ts from "typescript";

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

// export function runFixture(name: string)

// export function testTypings(name: string, fn?: (dir: string) => Promise<void>) {
//   withCompiledFixture(name, async dir => {
//     const diagnostics = await getDiagnostics(path.join(dir, "index.tsx"));
//     expect(diagnostics).toMatchSnapshot();
//     if (fn) {
//       await fn(dir);
//     }
//   });
// }

// // https://github.com/Microsoft/TypeScript/wiki/Using-the-Compiler-API#a-minimal-compiler
// const tsConfig = path.join(__dirname, "..", "tsconfig.json");
// const compilerOptions = fsExtra
//   .readFile(tsConfig, "utf-8")
//   .then(config => new Function(`return ${config}`)().compilerOptions)
//   .then(config => ts.convertCompilerOptionsFromJson(config, path.dirname(tsConfig)).options);

// async function getDiagnostics(fileName: string) {
//   const options = await compilerOptions;
//   const dirName = path.dirname(fileName);
//   const program = ts.createProgram([fileName], options);

//   const allDiagnostics = ts.getPreEmitDiagnostics(program).map(diagnostic => {
//     if (diagnostic.file) {
//       const { line, character } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start!);
//       const fileName = diagnostic.file.fileName.replace(`${dirName}/`, "");
//       const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n");
//       return `${fileName} (${line + 1},${character + 1}): ${message}`;
//     } else {
//       return `${ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n")}`;
//     }
//   });
//   return allDiagnostics;
// }
