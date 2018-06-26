import fs from "fs";
import path from "path";

export function forEachFixture<T>(dir: string, fn: (fixture: T) => void) {
  const files = fs.readdirSync(dir);
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
