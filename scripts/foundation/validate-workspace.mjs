import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);

const requiredDirectories = [
  "apps/web",
  "apps/api-worker",
  "packages/api-client",
  "packages/design-tokens",
  "packages/eslint-config",
  "packages/typescript-config",
  "docs",
  "scripts",
];

const prohibitedDirectories = [
  "services/api",
  "backend",
  "apps/mobile",
  "apps/api",
  "infra",
];

export function validateWorkspace() {
  const errors = [];

  for (const relative of requiredDirectories) {
    if (!existsSync(path.join(repositoryRoot, relative))) {
      errors.push(`missing required directory: ${relative}`);
    }
  }

  for (const relative of prohibitedDirectories) {
    if (existsSync(path.join(repositoryRoot, relative))) {
      errors.push(`prohibited directory exists: ${relative}`);
    }
  }

  const workspace = readFileSync(
    path.join(repositoryRoot, "pnpm-workspace.yaml"),
    "utf8",
  );
  if (
    !workspace.includes("- apps/web") ||
    !workspace.includes("- apps/api-worker") ||
    !workspace.includes("- packages/*")
  ) {
    errors.push(
      "pnpm workspace patterns do not include web, Worker API, and shared packages",
    );
  }

  const projects = JSON.parse(
    execFileSync("pnpm", ["--recursive", "list", "--depth", "-1", "--json"], {
      cwd: repositoryRoot,
      encoding: "utf8",
    }),
  );
  const actual = new Set(
    projects.map((project) => path.relative(repositoryRoot, project.path)),
  );
  const expected = new Set([
    "apps/web",
    "apps/api-worker",
    "packages/api-client",
    "packages/design-tokens",
    "packages/eslint-config",
    "packages/typescript-config",
  ]);

  for (const relative of expected) {
    if (!actual.has(relative)) {
      errors.push(`pnpm did not enumerate expected project: ${relative}`);
    }
  }

  return errors;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const errors = validateWorkspace();
  if (errors.length) {
    process.stderr.write(`${errors.join("\n")}\n`);
    process.exitCode = 1;
  } else {
    process.stdout.write("Workspace foundation validation passed.\n");
  }
}
