// @ts-ignore
import json from "rollup-plugin-json";
// @ts-ignore
import resolve from "rollup-plugin-node-resolve";
import { ts, dts } from "rollup-plugin-dts";

const external = [
  "fluent-syntax",
  "fluent-langneg",
  "intl-messageformat-parser",
  "fs-extra",
  "path",
  "@babel/code-frame",
];

const globals = {
  "fs-extra": "undefined",
  path: "undefined",
  "fluent-langneg": "FluentLangNeg",
  "fluent-syntax": "FluentSyntax",
  "intl-messageformat-parser": "IntlMessageFormatParser",
};

/** @type {(input: string, output: string) => Array<import("rollup").RollupWatchOptions>} */
function makeConfig(input, output) {
  return [
    {
      input,
      output: [
        { exports: "named", name: "IntlCodegen", file: `${output}.umd.js`, format: "umd", globals },
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

const config = [...makeConfig("./src/index.ts", "codegen"), ...makeConfig("./src/runtime/index.ts", "runtime")];

export default config;
