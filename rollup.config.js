// @ts-ignore
import json from "rollup-plugin-json";
// @ts-ignore
import resolve from "rollup-plugin-node-resolve";
// @ts-ignore
import typescript from "rollup-plugin-typescript";
import dts from "rollup-plugin-dts";
import pkg from "./package.json";

const external = ["fs-extra", "path", "@babel/code-frame"];

/**
 * @type {Array<import("rollup").RollupWatchOptions>}
 */
const config = [
  {
    input: "./src/index.ts",
    output: [
      {
        name: "IntlCodegen",
        file: pkg.browser,
        format: "umd",
        globals: {
          "fs-extra": "undefined",
          path: "undefined",
        },
      },
      { file: pkg.main, format: "cjs" },
      { file: pkg.module, format: "es" },
    ],

    external,
    // @ts-ignore: this option is not in the @types
    treeshake: {
      pureExternalModules: true,
    },

    plugins: [
      resolve({
        jsnext: true,
        extensions: [".ts"],
      }),
      json({
        preferConst: true,
        indent: "  ",
      }),
      typescript(),
    ],
  },
  {
    input: "./src/index.ts",
    output: [{ file: pkg.types, format: "es" }],

    external,

    plugins: [dts()],
  },
];

export default config;
