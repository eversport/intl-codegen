import json from "rollup-plugin-json";
import resolve from "rollup-plugin-node-resolve";
import sucrase from "rollup-plugin-sucrase";
import pkg from "./package.json";

export default {
  input: "./src/index.ts",
  output: [
    {
      name: "IntlCodegen",
      file: pkg.browser,
      format: "umd",
    },
    { file: pkg.main, format: "cjs" },
    { file: pkg.module, format: "es" },
  ],

  external: ["fs-extra"],

  plugins: [
    resolve({
      jsnext: true,
      extensions: [".ts"],
    }),
    json({
      preferConst: true,
      indent: "  ",
    }),
    sucrase({
      exclude: ["node_modules/**"],
      transforms: ["typescript"],
    }),
  ],
};
