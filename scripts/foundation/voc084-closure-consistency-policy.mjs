import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import process from "node:process";

export const INVENTORY_PATH =
  "specs/changes/VOC-084-reconcile-package-closure-state/closure-inventory.yaml";
export const FOUNDATION_COMMAND =
  "node scripts/foundation/voc084-closure-consistency-policy.mjs";

const PACKAGES = [
  {
    id: "VOC-080",
    directory: ["VOC-080-cloudflare-native-ru", "flo"].join(""),
    finalTask: "VOC-080-T12",
    finalHead: "3d6699c5eb378b9a00679d61a5c28b6b7e27c32c",
    finalMerge: "a05ab5c60534f36d1b89d9b9d32296469e9942bf",
    tasks: 13,
  },
  {
    id: "VOC-081",
    directory: "VOC-081-f2-local-cloudflare-development",
    finalTask: "VOC-081-T04",
    finalHead: "a8694932671ad9c44fd2a97c128b14e6089e5faf",
    finalMerge: "36d526bdec83e28b17aa30a6814d42b92f058ec1",
    tasks: 5,
  },
  {
    id: "VOC-082",
    directory: "VOC-082-distinct-agent-role-separation",
    finalTask: "VOC-082-T01",
    finalHead: "9b52963eba5b1dee30e0a63936de2c9ff0b82337",
    finalMerge: "eb13979a7ad59e5dd1eef0680116b84eeadb059a",
    tasks: 2,
  },
  {
    id: "VOC-083",
    directory: "VOC-083-sentry-workerd-compatibility",
    finalTask: "VOC-083-T03",
    finalHead: "bd7d98fc9bc2af9683b42d2fb1807794d27cda1a",
    finalMerge: "d4078924ae6d0be52628973e84be51734d93a5a9",
    tasks: 4,
  },
];

const HOLDS = ["VOC-080-HOLD-00", "VOC-080-HOLD-01", "VOC-080-HOLD-02"];
const CLASSIFICATIONS = new Set(["active-claim", "historical", "prospective"]);
const SHA = /^[0-9a-f]{40}$/;
const GITHUB_PR_URL =
  /^https:\/\/github\.com\/KARSIFT\/vocanova-platform\/(?:pull|issues)\/\d+(?:#[-a-zA-Z0-9_]+)?$/;
const EVIDENCE_URL =
  /^https:\/\/github\.com\/KARSIFT\/vocanova-platform\/(?:pull|actions\/runs)\/\d+(?:#[-a-zA-Z0-9_]+)?$/;
const PLACEHOLDER =
  /(?:TODO|TBD|placeholder|example\.com|0{40}|x{40}|<[^>]+>)/i;
const HISTORICAL_FILES = new Set([
  "specs/changes/VOC-082-distinct-agent-role-separation/final-evidence.md",
  "specs/changes/VOC-083-sentry-workerd-compatibility/t00-evidence.md",
  "specs/changes/VOC-083-sentry-workerd-compatibility/t03-evidence.md",
]);
const PROSPECTIVE_FILES = new Set(
  PACKAGES.map(({ directory }) => `specs/changes/${directory}/release-plan.md`),
);

const REQUIRED_FAILURES = [
  "https://github.com/KARSIFT/vocanova-platform/pull/110#issuecomment-5385195955",
  "https://github.com/KARSIFT/vocanova-platform/pull/110#issuecomment-5385221023",
  "https://github.com/KARSIFT/vocanova-platform/pull/111#issuecomment-5385262973",
  "https://github.com/KARSIFT/vocanova-platform/pull/111#issuecomment-5385292757",
  "https://github.com/KARSIFT/vocanova-platform/actions/runs/32569643923",
  "https://github.com/KARSIFT/vocanova-platform/pull/95#issuecomment-5381138504",
  "https://github.com/KARSIFT/vocanova-platform/pull/96#issuecomment-5381703445",
  "https://github.com/KARSIFT/vocanova-platform/pull/96#issuecomment-5381866725",
  "https://github.com/KARSIFT/vocanova-platform/pull/96#issuecomment-5381917214",
  "https://github.com/KARSIFT/vocanova-platform/pull/96#issuecomment-5381964117",
  "https://github.com/KARSIFT/vocanova-platform/actions/runs/32593748534",
  "https://github.com/KARSIFT/vocanova-platform/pull/112#issuecomment-5385743353",
  "https://github.com/KARSIFT/vocanova-platform/pull/112#issuecomment-5385753681",
  "https://github.com/KARSIFT/vocanova-platform/pull/114#issuecomment-5385846754",
  "https://github.com/KARSIFT/vocanova-platform/actions/runs/32637325844",
  "https://github.com/KARSIFT/vocanova-platform/actions/runs/32637631138",
  "https://github.com/KARSIFT/vocanova-platform/pull/115#issuecomment-5385971779",
  "https://github.com/KARSIFT/vocanova-platform/pull/116#issuecomment-5386309046",
  "https://github.com/KARSIFT/vocanova-platform/pull/117#issuecomment-5386710425",
];

function read(repositoryRoot, relativePath) {
  const absolutePath = path.join(repositoryRoot, relativePath);
  if (!existsSync(absolutePath)) return null;
  return readFileSync(absolutePath, "utf8");
}

function error(errors, message) {
  errors.push(`VOC-084 closure consistency: ${message}`);
}

function blocksBetween(text, startMarker, endMarker) {
  const start = text.indexOf(startMarker);
  if (start < 0) return "";
  const end = endMarker ? text.indexOf(endMarker, start) : text.length;
  if (endMarker && end < 0) return "";
  return text.slice(start, end);
}

function inventoryTaskBlocks(inventory) {
  const section = blocksBetween(inventory, "tasks:\n", "file_classifications:");
  return [
    ...section.matchAll(
      /^  - id: (VOC-\d+-T\d+)[\s\S]*?(?=^  - id: |(?![\s\S]))/gm,
    ),
  ].map((match) => ({ id: match[1], text: match[0] }));
}

function inventoryClassificationBlocks(inventory) {
  const section = blocksBetween(inventory, "file_classifications:\n");
  return [...section.matchAll(/^  - \{([\s\S]*?)(?=^  - \{|(?![\s\S]))/gm)].map(
    (match) => {
      const pathMatch = match[1].match(/\bpath:\s*([^,\n}]+)/);
      const classificationMatch = match[1].match(
        /\bclassification:\s*([^,\n}]+)/,
      );
      return {
        path: pathMatch?.[1]?.trim(),
        classification: classificationMatch?.[1]?.trim(),
        text: match[0],
      };
    },
  );
}

function packageTaskIds(packageId, count) {
  return Array.from(
    { length: count },
    (_, index) => `${packageId}-T${String(index).padStart(2, "0")}`,
  );
}

function inspectInventory(inventory) {
  const errors = [];
  if (!inventory) return ["closure inventory is missing"];
  if (!/^schema_version:\s*1\s*$/m.test(inventory))
    error(errors, "inventory schema_version must be 1");
  if (!/^inventory_id:\s*VOC-084-EV-00\s*$/m.test(inventory))
    error(errors, "inventory identifier is invalid");
  if (!/^task_id:\s*VOC-084-T00\s*$/m.test(inventory))
    error(errors, "inventory task identifier is invalid");
  if (
    !/^effect_boundary:\n[\s\S]*?repository_completion_is_activation:\s*false/m.test(
      inventory,
    )
  ) {
    error(errors, "repository completion must not be treated as activation");
  }
  for (const hold of HOLDS) {
    const holdPattern = new RegExp(`^    ${hold}:\\s*held-[^\\n]+$`, "m");
    if (!holdPattern.test(inventory))
      error(errors, `${hold} inventory boundary is missing or released`);
  }

  const taskBlocks = inventoryTaskBlocks(inventory);
  const expectedTaskIds = PACKAGES.flatMap(({ id, tasks }) =>
    packageTaskIds(id, tasks),
  );
  const actualTaskIds = taskBlocks.map(({ id }) => id);
  if (
    actualTaskIds.length !== expectedTaskIds.length ||
    new Set(actualTaskIds).size !== actualTaskIds.length
  ) {
    error(
      errors,
      `inventory must contain each of ${expectedTaskIds.length} task rows exactly once`,
    );
  }
  for (const expectedId of expectedTaskIds) {
    if (!actualTaskIds.includes(expectedId))
      error(
        errors,
        `${expectedId} inventory row is missing or identifier drifted`,
      );
  }
  for (const { id, text } of taskBlocks) {
    const shaFields = ["implementation_head", "merge_commit"];
    for (const field of shaFields) {
      const value = text.match(
        new RegExp(`^    ${field}:\\s*([^\\s]+)`, "m"),
      )?.[1];
      if (!value || !SHA.test(value) || PLACEHOLDER.test(value))
        error(errors, `${id} ${field} is missing, non-exact, or a placeholder`);
    }
    const pullRequest = text.match(/^    pull_request:\s*(\S+)/m)?.[1];
    if (
      !pullRequest ||
      !GITHUB_PR_URL.test(pullRequest) ||
      PLACEHOLDER.test(pullRequest)
    )
      error(errors, `${id} pull request evidence is missing or invalid`);
    if (!/\bverdict:\s*pass(?:[-,\s]|$)/.test(text))
      error(errors, `${id} independent review must contain a PASS verdict`);
    const reviewBlock =
      blocksBetween(text, "review:", "review_history:") ||
      blocksBetween(text, "review:", "hosted:");
    const reviewEvidence = reviewBlock.match(
      /\bevidence:\s*(https:\/\/[^,\s}]+)/,
    )?.[1];
    if (
      !reviewEvidence ||
      !EVIDENCE_URL.test(reviewEvidence) ||
      PLACEHOLDER.test(reviewEvidence)
    )
      error(errors, `${id} independent review evidence is missing or invalid`);
    if (
      !/^    hosted:\n/m.test(text) ||
      !/^      status:\s*pass\s*$/m.test(text)
    )
      error(errors, `${id} hosted result must be pass`);
    if (
      !/(?:^      (?:ci|governance|security|quality|evidence):\s*https:\/\/\S+|^      evidence:\s*specs\/)/m.test(
        text,
      )
    )
      error(errors, `${id} hosted evidence is missing`);
    if (
      !/^    rollback:/m.test(text) ||
      !/(?:status:\s*pass|status: pass)/.test(text)
    )
      error(errors, `${id} rollback evidence is missing or not passing`);
  }

  for (const failureUrl of REQUIRED_FAILURES) {
    const offset = inventory.indexOf(failureUrl);
    if (offset < 0) {
      error(errors, `historical FAIL evidence is missing: ${failureUrl}`);
      continue;
    }
    const before = inventory.slice(Math.max(0, offset - 300), offset);
    const verdicts = [...before.matchAll(/(?:verdict|result):\s*([^,\n}]+)/g)];
    const nearest = verdicts.at(-1)?.[1]?.trim();
    if (nearest !== "fail")
      error(
        errors,
        `historical FAIL was rewritten or relabelled: ${failureUrl}`,
      );
  }
  return errors;
}

function walkFiles(directory, relative = "") {
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolute = path.join(directory, entry.name);
    const childRelative = path.join(relative, entry.name);
    return entry.isDirectory()
      ? walkFiles(absolute, childRelative)
      : [childRelative];
  });
}

function inspectFileClassifications(repositoryRoot, inventory) {
  const errors = [];
  const records = inventoryClassificationBlocks(inventory);
  const expectedFiles = PACKAGES.flatMap(({ directory }) =>
    walkFiles(path.join(repositoryRoot, "specs/changes", directory)).map(
      (file) => `specs/changes/${directory}/${file}`,
    ),
  ).sort();
  const paths = records.map((record) => record.path);
  for (const file of expectedFiles) {
    const occurrences = paths.filter((candidate) => candidate === file).length;
    if (occurrences === 0)
      error(errors, `file classification omission: ${file}`);
    if (occurrences > 1)
      error(errors, `file classification duplicate: ${file}`);
  }
  for (const record of records) {
    if (!record.path || !CLASSIFICATIONS.has(record.classification)) {
      error(
        errors,
        `file classification is invalid: ${record.path ?? "missing path"}`,
      );
      continue;
    }
    if (!expectedFiles.includes(record.path))
      error(
        errors,
        `file classification names an untracked target file: ${record.path}`,
      );
    const content = read(repositoryRoot, record.path);
    if (content === null) continue;
    const head = content.slice(0, 700).toLowerCase();
    if (
      record.classification === "historical" &&
      (!HISTORICAL_FILES.has(record.path) ||
        !/(historical|superseded|candidate)/.test(head))
    ) {
      error(
        errors,
        `file classification contradicts content (historical): ${record.path}`,
      );
    }
    if (
      record.classification === "prospective" &&
      (!PROSPECTIVE_FILES.has(record.path) ||
        !/(release|activation|future|held|prohibited)/.test(
          content.toLowerCase(),
        ))
    ) {
      error(
        errors,
        `file classification contradicts content (prospective): ${record.path}`,
      );
    }
  }
  return errors;
}

function inspectActiveClaims(repositoryRoot) {
  const errors = [];
  for (const packageInfo of PACKAGES) {
    const directory = path.join(
      repositoryRoot,
      "specs/changes",
      packageInfo.directory,
    );
    const change = read(
      repositoryRoot,
      `specs/changes/${packageInfo.directory}/change.yaml`,
    );
    const tasks = read(
      repositoryRoot,
      `specs/changes/${packageInfo.directory}/tasks.md`,
    );
    const acceptance = read(
      repositoryRoot,
      `specs/changes/${packageInfo.directory}/acceptance-criteria.md`,
    );
    if (!change || !tasks || !acceptance) {
      error(errors, `${packageInfo.id} active package records are incomplete`);
      continue;
    }
    if (!/^status:\s*adopted\s*$/m.test(change))
      error(errors, `${packageInfo.id} active status is stale or not adopted`);
    const implementation = blocksBetween(
      change,
      "implementation:\n",
      "release:\n",
    );
    if (!/\bcomplete\b/i.test(implementation))
      error(errors, `${packageInfo.id} implementation closure is not complete`);
    for (const field of ["final_task", "final_head", "final_merge_commit"]) {
      const expected =
        packageInfo[
          {
            final_task: "finalTask",
            final_head: "finalHead",
            final_merge_commit: "finalMerge",
          }[field]
        ];
      if (new RegExp(`^  ${field}:\\s*${expected}\\s*$`, "m").test(change))
        continue;
      if (
        field === "final_task" &&
        new RegExp(
          `(?:\\b${packageInfo.finalTask}\\b|\\b${packageInfo.finalTask.slice(-3)}\\b)`,
        ).test(implementation)
      )
        continue;
      if (
        (field === "final_head" || field === "final_merge_commit") &&
        new RegExp(`\\b${expected}\\b`).test(implementation)
      )
        continue;
      error(errors, `${packageInfo.id} ${field} is missing or drifted`);
    }
    for (const hold of HOLDS) {
      const listedAsInherited = new RegExp(`^  - ${hold}\\s*$`, "m").test(
        change,
      );
      const explicitlyHeld = new RegExp(`^    ${hold}:\\s*held\\s*$`, "m").test(
        change,
      );
      if (!listedAsInherited && !explicitlyHeld)
        error(errors, `${packageInfo.id} ${hold} is missing or released`);
    }
    if (
      /^\s*- Status:\s*(?:pending|blocked|candidate-only|integration-pending)\b/im.test(
        tasks,
      )
    )
      error(errors, `${packageInfo.id} active task status is stale`);
    const statuses = [...tasks.matchAll(/^\s*- Status:\s*(.+)$/gim)].map(
      (match) => match[1].toLowerCase(),
    );
    if (
      statuses.length !== packageInfo.tasks ||
      statuses.some((status) => !/(?:complete|integrated)/.test(status))
    )
      error(
        errors,
        `${packageInfo.id} active task records do not all report completion`,
      );
    const results = [...acceptance.matchAll(/^\s*- Result:\s*(.+)$/gim)].map(
      (match) => match[1].toLowerCase(),
    );
    if (
      results.length === 0 ||
      results.some((result) =>
        /\b(?:pending|blocked|candidate-only|integration-pending)\b/.test(
          result,
        ),
      )
    )
      error(errors, `${packageInfo.id} active acceptance result is stale`);
    if (results.some((result) => !/(?:complete|satisfied)/.test(result)))
      error(
        errors,
        `${packageInfo.id} active acceptance result is not complete`,
      );
    if (!directory)
      error(errors, `${packageInfo.id} package directory is invalid`);
  }
  return errors;
}

export function inspectFoundationScripts(packageJsonText) {
  const errors = [];
  let packageJson;
  try {
    packageJson = JSON.parse(packageJsonText);
  } catch {
    return ["package.json is not valid JSON"];
  }
  const foundation = packageJson?.scripts?.["ci:foundation"];
  if (!foundation?.includes("pnpm run ci:closure-consistency"))
    error(errors, "ci:foundation omits closure consistency validation");
  if (packageJson?.scripts?.["ci:closure-consistency"] !== FOUNDATION_COMMAND)
    error(errors, "ci:closure-consistency command is missing or drifted");
  return errors;
}

export function validateClosureConsistency(
  repositoryRoot = path.resolve(import.meta.dirname, "../.."),
) {
  const errors = [];
  const inventory = read(repositoryRoot, INVENTORY_PATH);
  errors.push(...inspectInventory(inventory));
  if (inventory)
    errors.push(...inspectFileClassifications(repositoryRoot, inventory));
  errors.push(...inspectActiveClaims(repositoryRoot));
  const packageJson = read(repositoryRoot, "package.json");
  errors.push(...inspectFoundationScripts(packageJson ?? ""));
  return errors;
}

if (process.argv[1] === new URL(import.meta.url).pathname) {
  const errors = validateClosureConsistency();
  if (errors.length > 0) {
    console.error(errors.join("\n"));
    process.exitCode = 1;
  } else {
    console.log("VOC-084 closure consistency validation passed.");
  }
}
