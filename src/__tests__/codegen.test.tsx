import path from "path";
import IntlCodegen from "../";
import fse from "fs-extra";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ts from "typescript";

const fixturesDir = path.join(__dirname, "codegen");
const outputDir = path.join(__dirname, "..", "..", ".testoutput");

interface Fixture {
  defaultLanguage?: string;
  languages: { [key: string]: { [key: string]: string } };
  code?: string;
  debug?: string;
}

jest.setTimeout(20 * 1000);

describe("Codegen", () => {
  ensureCompiledFixture("simple", async dir => {
    const { loadLanguage } = require(dir);
    let lang;

    lang = await loadLanguage("en");
    expect(lang.test()).toEqual("en");

    lang = await loadLanguage("de");
    expect(lang.test()).toEqual("de");

    lang = await loadLanguage("fallback");
    expect(lang.test()).toEqual("en");
  });

  ensureCompiledFixture("react", async dir => {
    const { loadLanguage, Provider, Localized } = require(dir);
    let lang, rendered;

    lang = await loadLanguage("en");
    rendered = renderToStaticMarkup(
      <Provider value={lang}>
        <Localized id="test" params={{ react: <strong>react</strong> }} />
      </Provider>,
    );
    expect(rendered).toEqual("a <strong>react</strong> element");

    lang = await loadLanguage("de");
    rendered = renderToStaticMarkup(
      <Provider value={lang}>
        <Localized id="test" params={{ react: <strong>react</strong> }} />
      </Provider>,
    );
    expect(rendered).toEqual("ein <strong>react</strong> element");
  });

  ensureCompiledFixture("typings-correct", async dir => {
    const diagnostics = await getDiagnostics(path.join(dir, "index.tsx"));
    expect(diagnostics).toEqual([]);
  });

  ensureCompiledFixture("typings-wrong-id", async dir => {
    const diagnostics = await getDiagnostics(path.join(dir, "index.tsx"));
    expect(diagnostics).toMatchSnapshot();
  });

  ensureCompiledFixture("typings-wrong-param", async dir => {
    const diagnostics = await getDiagnostics(path.join(dir, "index.tsx"));
    expect(diagnostics).toMatchSnapshot();
  });
});

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

function ensureCompiledFixture(name: string, fn: (dir: string) => Promise<void>) {
  const fileName = path.join(fixturesDir, `${name}.ts`);
  const fixture: Fixture = require(fileName).default;
  it(name, async () => {
    const { defaultLanguage, languages, debug } = fixture;
    let { code = `export * from "./lang";` } = fixture;
    try {
      const codegen = new IntlCodegen(defaultLanguage);

      for (const [locale, messages] of Object.entries(languages)) {
        const lang = codegen.getLanguage(locale);
        for (const [key, message] of Object.entries(messages)) {
          lang.addMessage(key, message);
        }
      }

      const output = path.join(outputDir, name);
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
      await fse.remove(outputDir);
    }
  });
}
