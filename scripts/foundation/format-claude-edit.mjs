import { realpath } from "node:fs/promises";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { pathToFileURL } from "node:url";

const FORMATTED_EXTENSION = /\.(?:css|js|json|jsx|md|mdc|mjs|ts|tsx|yaml|yml)$/;

export function fileFromClaudePayload(payload, root) {
  let parsed;
  try {
    parsed = JSON.parse(payload);
  } catch {
    return null;
  }
  const candidate = parsed?.tool_input?.file_path;
  if (typeof candidate !== "string" || !FORMATTED_EXTENSION.test(candidate)) {
    return null;
  }
  const absolute = path.resolve(root, candidate);
  const relative = path.relative(root, absolute);
  if (
    relative === "" ||
    relative === ".." ||
    relative.startsWith(`..${path.sep}`) ||
    path.isAbsolute(relative)
  ) {
    return null;
  }
  return absolute;
}

async function readStdin() {
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  return Buffer.concat(chunks).toString("utf8");
}

async function main() {
  const root = await realpath(process.cwd());
  const requestedFile = fileFromClaudePayload(await readStdin(), root);
  if (!requestedFile) return;
  let file;
  try {
    file = await realpath(requestedFile);
  } catch {
    return;
  }
  const relative = path.relative(root, file);
  if (
    relative === ".." ||
    relative.startsWith(`..${path.sep}`) ||
    path.isAbsolute(relative)
  )
    return;
  const result = spawnSync(
    "pnpm",
    ["exec", "prettier", "--write", "--ignore-unknown", "--", file],
    { cwd: root, stdio: "inherit" },
  );
  if (result.error) throw result.error;
  process.exitCode = result.status ?? 1;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) await main();
