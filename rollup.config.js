// @ts-ignore
import json from "rollup-plugin-json";
// @ts-ignore
import resolve from "rollup-plugin-node-resolve";
import { ts, dts } from "rollup-plugin-dts";

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
      input,
      output: [
        { exports: "named", name, file: `${output}.umd.js`, format: "umd", globals },
        { exports: "named", file: `${output}.js`, format: "cjs" },
        { file: `${output}.mjs`, format: "es" },
      ],

      external,
      treeshake: { moduleSideEffects: false },

      plugins: [resolve({ extensions: [".ts"] }), json({ preferConst: true, indent: "  " }), ts()],
    },
    {
      input,
      output: [{ file: `${output}.d.ts`, format: "es" }],

      external,
      treeshake: { moduleSideEffects: false },

      plugins: [dts()],
    },
  ];
}

const config = [
  ...makeConfig("./src/index.ts", "codegen", "IntlCodegen"),
  ...makeConfig("./src/runtime/index.ts", "runtime", "IntlCodegenRuntime"),
  ...makeConfig("./src/runtime-react/index.ts", "runtime-react", "IntlCodegenRuntimeReact"),
];

export default config;
