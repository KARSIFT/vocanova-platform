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
  "apps/api/cmd",
  "apps/api/app",
  "apps/api/business",
  "apps/api/foundation",
  "apps/api/ent",
  "apps/api/migrations",
  "packages/api-client",
  "packages/design-tokens",
  "packages/eslint-config",
  "packages/typescript-config",
  "docs",
  "infra",
  "scripts",
];

const prohibitedDirectories = ["services/api", "backend", "apps/mobile"];

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

  const packageJsonContent = JSON.parse(
    readFileSync(path.join(repositoryRoot, "package.json"), "utf8"),
  );
  const workspaces = packageJsonContent.workspaces || [];
  if (!workspaces.includes("apps/web") || !workspaces.includes("packages/*")) {
    errors.push(
      "workspace patterns do not include web and shared packages",
    );
  }

  const expected = [
    "apps/web",
    "packages/api-client",
    "packages/design-tokens",
    "packages/eslint-config",
    "packages/typescript-config",
  ];

  for (const relative of expected) {
    if (!existsSync(path.join(repositoryRoot, relative, "package.json"))) {
      errors.push(`expected workspace project missing: ${relative}`);
    }
  }

  if (
    existsSync(path.join(repositoryRoot, "apps/api/package.json"))
  ) {
    errors.push("apps/api must not be a workspace project");
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
