import path from "path";
import fs from "fs";
import { runFixture, Fixture } from "./run-fixture";

const fixturesDir = path.join(__dirname, "fixtures");

describe("Compare to MessageFormat", () => {
  const dirs = fs.readdirSync(fixturesDir);
  for (const file of dirs) {
    const filePath = path.join(fixturesDir, file);
    if (filePath.endsWith(".ts")) {
      const name = path.basename(file, ".ts");
      const fixture: Fixture = require(filePath).default;
      fixture.name = name;
      runFixture(fixture);
    }
  }
});
