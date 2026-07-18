import { execFileSync } from "node:child_process";
import process from "node:process";

const output = execFileSync("gofmt", ["-l", "."], {
  cwd: new URL("../../apps/api/", import.meta.url),
  encoding: "utf8",
});

if (output.trim()) {
  process.stderr.write(`Go formatting required:\n${output}`);
  process.exitCode = 1;
}
