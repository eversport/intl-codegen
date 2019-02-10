// @ts-ignore
const pegjs = require("pegjs");
const fsExtra = require("fs-extra");
const path = require("path");

const dir = path.join(__dirname, "..", "src", "syntax-messageformat");
const src = path.join(dir, "parser.pegjs");
const dest = path.join(dir, "index.js");

const parser = pegjs.generate(fsExtra.readFileSync(src, "utf-8"), {
  output: "source",
});

fsExtra.outputFileSync(dest, `// @ts-nocheck\nexport default\n${parser}`);
