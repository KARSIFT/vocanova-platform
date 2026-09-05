import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { parseDocument } from "yaml";

const PINNED_ACTION = /^[^\s@]+@[0-9a-f]{40}(?:\s+#.*)?$/;
const REQUIRED_MERGE_QUEUE_WORKFLOWS = [
  "ci.yml",
  "quality.yml",
  "security.yml",
];
const STAGING_DEPLOYMENT_WORKFLOW = ".github/workflows/deploy-staging.yml";
const STAGING_SECRET_NAMES = new Set([
  "CLOUDFLARE_ACCOUNT_ID",
  "CLOUDFLARE_API_TOKEN",
]);

export function validateYamlSyntax(relativePath, content) {
  const document = parseDocument(content, { uniqueKeys: true });
  return document.errors.map(
    (error) => `${relativePath}: invalid YAML (${error.message})`,
  );
}

function hasWritePermission(node) {
  if (Array.isArray(node)) return node.some(hasWritePermission);
  if (!node || typeof node !== "object") return false;
  for (const [key, value] of Object.entries(node)) {
    if (key === "permissions") {
      if (value === "write-all") return true;
      if (
        value &&
        typeof value === "object" &&
        Object.values(value).some((permission) => permission === "write")
      ) {
        return true;
      }
    }
    if (hasWritePermission(value)) return true;
  }
  return false;
}

export function validateActionPins(relativePath, content) {
  const violations = [];
  for (const match of content.matchAll(
    /^\s*-?\s*uses:\s*([^\s]+(?:\s+#.*)?)$/gm,
  )) {
    const reference = match[1].trim();
    if (!reference.startsWith("./") && !PINNED_ACTION.test(reference)) {
      violations.push(
        `${relativePath}: action reference must use a full commit SHA: ${reference}`,
      );
    }
  }
  return violations;
}

export function validateStagingDeploymentWorkflow(relativePath, content) {
  const violations = [];
  const report = (message) => violations.push(`${relativePath}: ${message}`);

  if (!/^  push:\n    branches: \[main\]\s*$/m.test(content)) {
    report("staging deployment must push only main");
  }
  if (!/^  workflow_dispatch:\s*$/m.test(content)) {
    report("staging deployment must support manual recovery dispatch");
  }
  if (
    /^  (?:pull_request|pull_request_target|merge_group|schedule):/m.test(
      content,
    )
  ) {
    report("staging deployment must not run for untrusted or scheduled events");
  }
  if (!/^  group: staging-deployment\s*$/m.test(content)) {
    report(
      "staging deployment must use the staging-deployment concurrency group",
    );
  }
  if (!/^  cancel-in-progress: false\s*$/m.test(content)) {
    report("staging deployment must not cancel an in-progress deployment");
  }
  if (!/^      name: staging\s*$/m.test(content)) {
    report("deployment job must use the staging environment");
  }
  if (!/^    needs: validate\s*$/m.test(content)) {
    report("deployment job must depend on validation");
  }
  if (!/test [^\n]*GITHUB_REF[^\n]*refs\/heads\/main/.test(content)) {
    report("manual deployment must reject refs other than main");
  }
  if (!/pnpm (?:run )?validate/.test(content)) {
    report(
      "staging deployment must validate the exact revision before mutation",
    );
  }
  if (!/smoke-staging\.mjs[^\n]*GITHUB_SHA/.test(content)) {
    report("staging deployment must smoke-test the expected release");
  }
  if (/wrangler[^\n]*(?:--env[= ]+production|--env[= ]+'')/.test(content)) {
    report(
      "deployment commands must only deploy the staging Wrangler environment",
    );
  }

  for (const match of content.matchAll(/secrets(?:\.|\[['"])([A-Z0-9_]+)/g)) {
    if (!STAGING_SECRET_NAMES.has(match[1])) {
      report(`unsupported Actions secret: ${match[1]}`);
    }
  }

  return violations;
}

export function validateWorkflowFile(relativePath, content) {
  const document = parseDocument(content, { uniqueKeys: true });
  const violations = document.errors.map(
    (error) => `${relativePath}: invalid YAML (${error.message})`,
  );
  const report = (message) => violations.push(`${relativePath}: ${message}`);

  violations.push(...validateActionPins(relativePath, content));

  if (
    /^\s{0,2}(pull_request_target|issue_comment|workflow_run):/m.test(content)
  ) {
    report("privileged or indirect event trigger is not allowed");
  }
  if (/^\s{2,4}paths(?:-ignore)?:/m.test(content)) {
    report("trigger-level path filters can strand required checks");
  }
  if (document.errors.length === 0 && hasWritePermission(document.toJS())) {
    report("credential-free workflows must not request write permission");
  }
  if (
    relativePath !== STAGING_DEPLOYMENT_WORKFLOW &&
    /\bsecrets\s*(?:\.|\[)/.test(content)
  ) {
    report("credential-free workflows must not interpolate Actions secrets");
  }
  if (!/^permissions:\n\s+contents:\s+read\s*$/m.test(content)) {
    report("workflow must declare top-level contents: read permission");
  }

  if (/^\s{2}merge_group:/m.test(content)) {
    if (!content.includes("github.event_name != 'merge_group'")) {
      report("merge-group runs must not be cancelled in progress");
    }
  }

  const lines = content.split("\n");
  for (let index = 0; index < lines.length; index += 1) {
    if (!/uses:\s*actions\/checkout@/.test(lines[index])) continue;
    const block = lines.slice(index + 1, index + 8).join("\n");
    if (!/persist-credentials:\s*false/.test(block)) {
      report(
        `checkout near line ${index + 1} must disable persisted credentials`,
      );
    }
  }

  const jobStarts = lines
    .map((line, index) => (/^  ([\w-]+):\s*$/.exec(line) ? index : -1))
    .filter(
      (index) =>
        index >= 0 && index > lines.findIndex((line) => line === "jobs:"),
    );
  for (let position = 0; position < jobStarts.length; position += 1) {
    const start = jobStarts[position];
    const end = jobStarts[position + 1] ?? lines.length;
    const block = lines.slice(start, end);
    if (!block.some((line) => /^\s{4}runs-on:/.test(line))) continue;
    const timeouts = block.filter((line) =>
      /^\s{4}timeout-minutes:/.test(line),
    );
    if (timeouts.length !== 1) {
      report(
        `runner job ${lines[start].trim().replace(":", "")} must declare exactly one timeout-minutes`,
      );
    }
  }

  if (relativePath === STAGING_DEPLOYMENT_WORKFLOW) {
    violations.push(
      ...validateStagingDeploymentWorkflow(relativePath, content),
    );
  }

  return violations;
}

export async function validateWorkflows(root) {
  const directory = path.join(root, ".github/workflows");
  const names = (await readdir(directory)).filter((name) =>
    /\.ya?ml$/.test(name),
  );
  const violations = [];
  for (const name of names) {
    const content = await readFile(path.join(directory, name), "utf8");
    violations.push(
      ...validateWorkflowFile(`.github/workflows/${name}`, content),
    );
  }
  for (const name of REQUIRED_MERGE_QUEUE_WORKFLOWS) {
    if (!names.includes(name)) {
      violations.push(
        `.github/workflows/${name}: required workflow is missing`,
      );
      continue;
    }
    const content = await readFile(path.join(directory, name), "utf8");
    for (const event of ["push", "pull_request", "merge_group"]) {
      if (!new RegExp(`^  ${event}:`, "m").test(content)) {
        violations.push(`.github/workflows/${name}: missing ${event} trigger`);
      }
    }
  }
  const actionRoot = path.join(root, ".github/actions");
  for (const entry of await readdir(actionRoot, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    for (const fileName of ["action.yml", "action.yaml"]) {
      try {
        const relativePath = `.github/actions/${entry.name}/${fileName}`;
        const content = await readFile(path.join(root, relativePath), "utf8");
        violations.push(...validateYamlSyntax(relativePath, content));
        violations.push(...validateActionPins(relativePath, content));
      } catch (error) {
        if (error.code !== "ENOENT") throw error;
      }
    }
  }
  return violations;
}

async function main() {
  const violations = await validateWorkflows(path.resolve(process.cwd()));
  if (violations.length > 0) {
    console.error(violations.map((item) => `- ${item}`).join("\n"));
    process.exitCode = 1;
    return;
  }
  console.log("GitHub workflows are valid.");
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) await main();
