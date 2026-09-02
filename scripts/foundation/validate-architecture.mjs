import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const SOURCE_EXTENSION = /\.(?:js|jsx|mjs|ts|tsx)$/;
const IMPORT_PATTERN =
  /(?:import|export)\s+(?:[\s\S]*?\s+from\s+)?["']([^"']+)["']|import\(\s*["']([^"']+)["']\s*\)|require\(\s*["']([^"']+)["']\s*\)/g;
const IGNORED_DIRECTORIES = new Set([
  ".next",
  ".open-next",
  ".wrangler",
  "coverage",
  "dist",
  "node_modules",
  "test-results",
]);

function workspaceOf(relativePath) {
  const parts = relativePath.split("/");
  return ["apps", "packages"].includes(parts[0]) && parts[1]
    ? `${parts[0]}/${parts[1]}`
    : null;
}

async function sourceFiles(root, relativeDirectory) {
  const result = [];
  async function walk(relativePath) {
    for (const entry of await readdir(path.join(root, relativePath), {
      withFileTypes: true,
    })) {
      if (entry.isSymbolicLink() || IGNORED_DIRECTORIES.has(entry.name))
        continue;
      const child = path.posix.join(relativePath, entry.name);
      if (entry.isDirectory()) await walk(child);
      else if (entry.isFile() && SOURCE_EXTENSION.test(entry.name))
        result.push(child);
    }
  }
  await walk(relativeDirectory);
  return result;
}

export async function validateArchitecture(root) {
  const violations = [];
  const files = [
    ...(await sourceFiles(root, "apps")),
    ...(await sourceFiles(root, "packages")),
  ];

  for (const relativePath of files) {
    const sourceWorkspace = workspaceOf(relativePath);
    const content = await readFile(path.join(root, relativePath), "utf8");
    for (const match of content.matchAll(IMPORT_PATTERN)) {
      const specifier = match[1] ?? match[2] ?? match[3];
      let targetWorkspace = null;

      if (specifier.startsWith(".")) {
        const target = path.posix.normalize(
          path.posix.join(path.posix.dirname(relativePath), specifier),
        );
        targetWorkspace = workspaceOf(target);
      } else if (
        specifier.startsWith("apps/") ||
        specifier.startsWith("packages/")
      ) {
        targetWorkspace = workspaceOf(specifier);
      } else if (
        specifier === "@vocanova/web" ||
        specifier.startsWith("@vocanova/web/")
      ) {
        targetWorkspace = "apps/web";
      } else if (
        specifier === "@vocanova/api-worker" ||
        specifier.startsWith("@vocanova/api-worker/")
      ) {
        targetWorkspace = "apps/api-worker";
      }

      if (!targetWorkspace || targetWorkspace === sourceWorkspace) continue;
      const crossesApplications =
        sourceWorkspace?.startsWith("apps/") &&
        targetWorkspace.startsWith("apps/");
      const packageImportsApplication =
        sourceWorkspace?.startsWith("packages/") &&
        targetWorkspace.startsWith("apps/");
      if (crossesApplications || packageImportsApplication) {
        violations.push(
          `${relativePath}: ${sourceWorkspace} must not import ${targetWorkspace} via ${specifier}`,
        );
      }
    }
  }
  return violations;
}

async function main() {
  const violations = await validateArchitecture(path.resolve(process.cwd()));
  if (violations.length > 0) {
    console.error(violations.map((item) => `- ${item}`).join("\n"));
    process.exitCode = 1;
    return;
  }
  console.log("Workspace architecture boundaries are valid.");
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) await main();
