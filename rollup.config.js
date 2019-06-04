// @ts-ignore
import json from "rollup-plugin-json";
// @ts-ignore
import resolve from "rollup-plugin-node-resolve";
import dts from "rollup-plugin-dts";

const external = [
  "@babel/code-frame",
  "fluent-langneg",
  "fluent-syntax",
  "fs-extra",
  "intl-messageformat-parser",
  "path",
  "react",
];

const globals = {
  "fluent-langneg": "FluentLangNeg",
  "fluent-syntax": "FluentSyntax",
  "fs-extra": "undefined",
  "intl-messageformat-parser": "IntlMessageFormatParser",
  path: "undefined",
  react: "React",
};

/** @type {(input: string, output: string, name: string) => Array<import("rollup").RollupWatchOptions>} */
function makeConfig(input, output, name) {
  return [
    {
      input: `./.build/src/${input}`,
      output: [
        { exports: "named", name, file: `${output}.umd.js`, format: "umd", globals },
        { exports: "named", file: `${output}.js`, format: "cjs" },
        { file: `${output}.mjs`, format: "es" },
      ],

      external,

      plugins: [resolve(), json({ preferConst: true, indent: "  " })],
    },
    {
      input: `./.build/src/${input}`.replace(".js", ".d.ts"),
      output: [{ file: `${output}.d.ts`, format: "es" }],
      plugins: [dts()],
    },
  ];
}

const config = [
  ...makeConfig("index.js", "codegen", "IntlCodegen"),
  ...makeConfig("runtime/index.js", "runtime", "IntlCodegenRuntime"),
  ...makeConfig("runtime-react/index.js", "runtime-react", "IntlCodegenRuntimeReact"),
];

export default config;
