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
    planPullRequest: "https://github.com/KARSIFT/vocanova-platform/pull/86",
    planCandidate: "6fb00a0b64e6f2d4adceb24a9caeffd9af98c779",
    tasks: 13,
    acceptanceCount: 12,
    testCount: 13,
  },
  {
    id: "VOC-081",
    directory: "VOC-081-f2-local-cloudflare-development",
    finalTask: "VOC-081-T04",
    finalHead: "a8694932671ad9c44fd2a97c128b14e6089e5faf",
    finalMerge: "36d526bdec83e28b17aa30a6814d42b92f058ec1",
    planPullRequest: "https://github.com/KARSIFT/vocanova-platform/pull/102",
    planCandidate: "111323e5275b3ed2a2e86440ef087a44f0d00bde",
    tasks: 5,
    acceptanceCount: 8,
    testCount: 7,
  },
  {
    id: "VOC-082",
    directory: "VOC-082-distinct-agent-role-separation",
    finalTask: "VOC-082-T01",
    finalHead: "9b52963eba5b1dee30e0a63936de2c9ff0b82337",
    finalMerge: "eb13979a7ad59e5dd1eef0680116b84eeadb059a",
    planPullRequest: "https://github.com/KARSIFT/vocanova-platform/pull/110",
    planCandidate: "c1109466c1498aab48744d5b94457522a36535e4",
    tasks: 2,
    acceptanceCount: 9,
    testCount: 6,
  },
  {
    id: "VOC-083",
    directory: "VOC-083-sentry-workerd-compatibility",
    finalTask: "VOC-083-T03",
    finalHead: "bd7d98fc9bc2af9683b42d2fb1807794d27cda1a",
    finalMerge: "d4078924ae6d0be52628973e84be51734d93a5a9",
    planPullRequest: "https://github.com/KARSIFT/vocanova-platform/pull/111",
    planCandidate: "8ec6b530b37972a3a9e8102905a4f1b429386941",
    tasks: 4,
    acceptanceCount: 6,
    testCount: 7,
  },
];

const EXPECTED_TASKS = {
  "VOC-080-T00": {
    pullRequest: "https://github.com/KARSIFT/vocanova-platform/pull/87",
    head: "5b857fe4b8aa5a427165545aebfbb1f562771886",
    merge: "c376d9f71d217c5a0736be4b54f2b784a8f54414",
  },
  "VOC-080-T01": {
    pullRequest: "https://github.com/KARSIFT/vocanova-platform/pull/88",
    head: "b582b95e264e0c5c55ece02ad9aee0172347ef84",
    merge: "e3b9f502fee91f15cb0dc0c163b52ebcc396f2fc",
  },
  "VOC-080-T02": {
    pullRequest: "https://github.com/KARSIFT/vocanova-platform/pull/89",
    head: "d70f2308a3c03907c3ad2d8eb8797939a5e9ae59",
    merge: "b7c20e87a688b4ed8164c38ea73258761699069f",
  },
  "VOC-080-T03": {
    pullRequest: "https://github.com/KARSIFT/vocanova-platform/pull/90",
    head: "a82714639eeae6458ad3c3d027778c369e90ff5b",
    merge: "ae9f2a899d8b40858c7706f5a2992a4cecfb1a55",
  },
  "VOC-080-T04": {
    pullRequest: "https://github.com/KARSIFT/vocanova-platform/pull/91",
    head: "6d68e20d4a1b5bb5a97fe5eb469dd6cd5ab5ee22",
    merge: "93733aeafa725621736767d67a47a6b6c06fa650",
  },
  "VOC-080-T05": {
    pullRequest: "https://github.com/KARSIFT/vocanova-platform/pull/92",
    head: "f18c4dfb8bd95e675d58b22472a2fdbb4ebd7e42",
    merge: "1881b00bac4b7656a68c8dff335cc0f67e951c4a",
  },
  "VOC-080-T06": {
    pullRequest: "https://github.com/KARSIFT/vocanova-platform/pull/93",
    head: "e44424a727aa9b548c561147188a220f6cfc7c67",
    merge: "deda0a6deabf1dfcb785fda4a3445084e640230f",
  },
  "VOC-080-T07": {
    pullRequest: "https://github.com/KARSIFT/vocanova-platform/pull/94",
    head: "de2b3d0f4bf0105cb74d5abaa9a5ab826ee75dd1",
    merge: "a160454c84f0972df0b4934cf6001c2ab2beeab9",
  },
  "VOC-080-T08": {
    pullRequest: "https://github.com/KARSIFT/vocanova-platform/pull/95",
    head: "2bce45c1d22ce53eedcdabb457d9849a254a8069",
    merge: "366534d0bd68c716a280f6413a0bbed7fd7f05cb",
  },
  "VOC-080-T09": {
    pullRequest: "https://github.com/KARSIFT/vocanova-platform/pull/96",
    head: "631899874d27839969895db0590a52524b9507ca",
    merge: "315e590d888badfaf24c09698a072d131f5d4640",
  },
  "VOC-080-T10": {
    pullRequest: "https://github.com/KARSIFT/vocanova-platform/pull/97",
    head: "203ac878d7a054de0826188924446e5d24a6dd43",
    merge: "6fa48164d974fe347d8c7c408b4374af5254f336",
  },
  "VOC-080-T11": {
    pullRequest: "https://github.com/KARSIFT/vocanova-platform/pull/99",
    head: "697bb1360c4df706ef05ff50d07e4b11b1b6b13b",
    merge: "fa467159cfc5089c1355691c43df208a312d6801",
  },
  "VOC-080-T12": {
    pullRequest: "https://github.com/KARSIFT/vocanova-platform/pull/100",
    head: "3d6699c5eb378b9a00679d61a5c28b6b7e27c32c",
    merge: "a05ab5c60534f36d1b89d9b9d32296469e9942bf",
  },
  "VOC-081-T00": {
    pullRequest: "https://github.com/KARSIFT/vocanova-platform/pull/103",
    head: "9b0e90fcd89469763c9874a5b0ef951e4d76149d",
    merge: "45480d66fef0247d1d411b9141aebf239eea9142",
  },
  "VOC-081-T01": {
    pullRequest: "https://github.com/KARSIFT/vocanova-platform/pull/104",
    head: "aae4473d1072517b40e42bbb0dc4e992c37c16b5",
    merge: "7d508361c7f9b63430f859e92a7512e960426d7a",
  },
  "VOC-081-T02": {
    pullRequest: "https://github.com/KARSIFT/vocanova-platform/pull/106",
    head: "38d8c27b64557e8e8bc58bb05ea3c2cd858e1136",
    merge: "e33fe3050e00cf4c64894a8392bda9cfd1f68337",
  },
  "VOC-081-T03": {
    pullRequest: "https://github.com/KARSIFT/vocanova-platform/pull/107",
    head: "ca7596cb72128e5fa47483a65678773a6968dd79",
    merge: "eb32cadf1f58941094d8359d1e82ea43af2306cd",
  },
  "VOC-081-T04": {
    pullRequest: "https://github.com/KARSIFT/vocanova-platform/pull/108",
    head: "a8694932671ad9c44fd2a97c128b14e6089e5faf",
    merge: "36d526bdec83e28b17aa30a6814d42b92f058ec1",
  },
  "VOC-082-T00": {
    pullRequest: "https://github.com/KARSIFT/vocanova-platform/pull/112",
    head: "b1fa02e0b79e11d75e02194988826106aae2939c",
    merge: "26c16b7b07d55c1910c7fd9711dfb17662a75d8e",
  },
  "VOC-082-T01": {
    pullRequest: "https://github.com/KARSIFT/vocanova-platform/pull/114",
    head: "9b52963eba5b1dee30e0a63936de2c9ff0b82337",
    merge: "eb13979a7ad59e5dd1eef0680116b84eeadb059a",
  },
  "VOC-083-T00": {
    pullRequest: "https://github.com/KARSIFT/vocanova-platform/pull/113",
    head: "71db51d1dd2571d01e9ee3b3c13ebc2c00e43514",
    merge: "e79f04402055d7ebbb1ccfbaf8e7a1dd1b85185c",
  },
  "VOC-083-T01": {
    pullRequest: "https://github.com/KARSIFT/vocanova-platform/pull/115",
    head: "9f11195ed186e214fade57884e66ca96f2498ebc",
    merge: "8b1f83a54ca72edebce0b7b5ed9f7d99e00a37d6",
  },
  "VOC-083-T02": {
    pullRequest: "https://github.com/KARSIFT/vocanova-platform/pull/116",
    head: "e3a71a13eedfc8fef05b580280047e41f320de48",
    merge: "23da9da69bb27529994e70d4bf6e9a0a78ea26b6",
  },
  "VOC-083-T03": {
    pullRequest: "https://github.com/KARSIFT/vocanova-platform/pull/117",
    head: "bd7d98fc9bc2af9683b42d2fb1807794d27cda1a",
    merge: "d4078924ae6d0be52628973e84be51734d93a5a9",
  },
};

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
  {
    owner: "package VOC-082 plan",
    marker: "review_history",
    revision: "5db667afb47987d9343f78975e3d5cacb03dd3dc",
    evidence:
      "https://github.com/KARSIFT/vocanova-platform/pull/110#issuecomment-5385195955",
    verdict: "fail",
  },
  {
    owner: "package VOC-082 plan",
    marker: "review_history",
    revision: "f73ea9e27937584c3058ad39884b91854cb15d52",
    evidence:
      "https://github.com/KARSIFT/vocanova-platform/pull/110#issuecomment-5385221023",
    verdict: "fail",
  },
  {
    owner: "package VOC-083 plan",
    marker: "review_history",
    revision: "682b33ec1a126e8924395f7d7f7eb26191f2a57a",
    evidence:
      "https://github.com/KARSIFT/vocanova-platform/pull/111#issuecomment-5385262973",
    verdict: "fail",
  },
  {
    owner: "package VOC-083 plan",
    marker: "review_history",
    revision: "07772a00f753e614d3fd7a51539cabe4f0da1393",
    evidence:
      "https://github.com/KARSIFT/vocanova-platform/pull/111#issuecomment-5385292757",
    verdict: "fail",
  },
  {
    owner: "VOC-080-T03",
    marker: "failure_history",
    result: "fail",
    evidence:
      "https://github.com/KARSIFT/vocanova-platform/actions/runs/32569643923",
  },
  {
    owner: "VOC-080-T08",
    marker: "review_history",
    revision: "b6ee09cc9536061c7f67abec52e877dc61d8e9b2",
    evidence:
      "https://github.com/KARSIFT/vocanova-platform/pull/95#issuecomment-5381138504",
    verdict: "fail",
  },
  {
    owner: "VOC-080-T09",
    marker: "review_history",
    revision: "3ad219a9b81a0aa9fb036329c71791e1415146bf",
    evidence:
      "https://github.com/KARSIFT/vocanova-platform/pull/96#issuecomment-5381703445",
    verdict: "fail",
  },
  {
    owner: "VOC-080-T09",
    marker: "review_history",
    revision: "ad47ca20e3425c9b29aeb0f6f496e46988ed9a4e",
    evidence:
      "https://github.com/KARSIFT/vocanova-platform/pull/96#issuecomment-5381866725",
    verdict: "fail",
  },
  {
    owner: "VOC-080-T09",
    marker: "review_history",
    revision: "568d2739745555d8f19fd6a71e61c6aeabb0a9e8",
    evidence:
      "https://github.com/KARSIFT/vocanova-platform/pull/96#issuecomment-5381917214",
    verdict: "fail",
  },
  {
    owner: "VOC-080-T09",
    marker: "review_history",
    revision: "1e75846674612637c1fde9af3d7643042946188e",
    evidence:
      "https://github.com/KARSIFT/vocanova-platform/pull/96#issuecomment-5381964117",
    verdict: "fail",
  },
  {
    owner: "VOC-080-T10",
    marker: "failure_history",
    result: "fail",
    evidence:
      "https://github.com/KARSIFT/vocanova-platform/actions/runs/32593748534",
  },
  {
    owner: "VOC-080-T11",
    marker: "failure_history",
    result: "fail",
    evidence:
      "https://github.com/KARSIFT/vocanova-platform/pull/99#issuecomment-5382605362",
  },
  {
    owner: "VOC-081-T02",
    marker: "failure_history",
    result: "fail",
    evidence:
      "https://github.com/KARSIFT/vocanova-platform/actions/runs/32610283718",
  },
  {
    owner: "VOC-081-T04",
    marker: "failure_history",
    result: "fail",
    evidence:
      "https://github.com/KARSIFT/vocanova-platform/pull/108#issuecomment-5383822937",
  },
  {
    owner: "VOC-082-T00",
    marker: "review_history",
    revision: "6c6d566125bdd78514aabad3894776d8494fa467",
    evidence:
      "https://github.com/KARSIFT/vocanova-platform/pull/112#issuecomment-5385743353",
    verdict: "fail",
  },
  {
    owner: "VOC-082-T00",
    marker: "review_history",
    revision: "b1fa02e0b79e11d75e02194988826106aae2939c",
    evidence:
      "https://github.com/KARSIFT/vocanova-platform/pull/112#issuecomment-5385753681",
    verdict: "fail",
  },
  {
    owner: "VOC-082-T01",
    marker: "review_history",
    revision: "9b52963eba5b1dee30e0a63936de2c9ff0b82337",
    evidence:
      "https://github.com/KARSIFT/vocanova-platform/pull/114#issuecomment-5385846754",
    verdict: "fail",
  },
  {
    owner: "VOC-082-T01",
    marker: "failure_history",
    revision: "aa63cd6811c42b1ac02327fe64b6fdd44bce1235",
    evidence:
      "https://github.com/KARSIFT/vocanova-platform/actions/runs/32637325844",
    result: "fail",
  },
  {
    owner: "VOC-082-T01",
    marker: "failure_history",
    evidence:
      "https://github.com/KARSIFT/vocanova-platform/actions/runs/32637631138",
    result: "fail",
  },
  {
    owner: "VOC-083-T01",
    marker: "review_history",
    revision: "eb6b57fc30751b6269917b60bd3b35850f517bcf",
    evidence:
      "https://github.com/KARSIFT/vocanova-platform/pull/115#issuecomment-5385971779",
    verdict: "fail",
  },
  {
    owner: "VOC-083-T02",
    marker: "review_history",
    revision: "ab1b24d527f2d71649efb61cc1a8475535de282b",
    evidence:
      "https://github.com/KARSIFT/vocanova-platform/pull/116#issuecomment-5386309046",
    verdict: "fail",
  },
  {
    owner: "VOC-083-T03",
    marker: "review_history",
    revision: "987d38caf461eece780ba0421594305d759fa7c4",
    evidence:
      "https://github.com/KARSIFT/vocanova-platform/pull/117#issuecomment-5386710425",
    verdict: "fail",
  },
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

function inventoryPackageBlocks(inventory) {
  const section = blocksBetween(inventory, "packages:\n", "tasks:\n");
  return [
    ...section.matchAll(/^  - id: (VOC-\d+)[\s\S]*?(?=^  - id: |(?![\s\S]))/gm),
  ].map((match) => ({ id: match[1], text: match[0] }));
}

function historyEntries(block, marker) {
  const markerMatch = block.match(new RegExp(`^(\\s*)${marker}:`, "m"));
  if (!markerMatch) return [];
  const indent = markerMatch[1].length;
  const start = markerMatch.index + markerMatch[0].length;
  const sibling = block
    .slice(start)
    .search(new RegExp(`^ {${indent}}[A-Za-z_]+:`, "m"));
  const section = block.slice(
    start,
    sibling < 0 ? block.length : start + sibling,
  );
  return [
    ...section.matchAll(
      new RegExp(
        `^ {${indent + 2}}- ([\\s\\S]*?)(?=^ {${indent + 2}}- |(?![\\s\\S]))`,
        "gm",
      ),
    ),
  ].map((match) => match[1]);
}

function inspectHistoryTuple(ownerBlock, tuple, errors) {
  const entries = historyEntries(ownerBlock, tuple.marker);
  const entry = entries.find((candidate) => candidate.includes(tuple.evidence));
  if (!entry) {
    error(
      errors,
      `${tuple.owner} ${tuple.marker} is missing FAIL tuple ${tuple.evidence}`,
    );
    return;
  }
  if (
    tuple.revision &&
    !new RegExp(`\\brevision:\\s*${tuple.revision}\\b`).test(entry)
  )
    error(
      errors,
      `${tuple.owner} FAIL tuple revision drifted for ${tuple.evidence}`,
    );
  const result = tuple.verdict ?? tuple.result;
  const field = tuple.verdict ? "verdict" : "result";
  if (!new RegExp(`\\b${field}:\\s*${result}(?:[,\\s}]|$)`).test(entry))
    error(
      errors,
      `${tuple.owner} FAIL tuple is no longer labelled ${field}: ${result}`,
    );
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

  const packageBlocks = inventoryPackageBlocks(inventory);
  for (const packageInfo of PACKAGES) {
    const block = packageBlocks.find(({ id }) => id === packageInfo.id)?.text;
    if (!block) {
      error(errors, `${packageInfo.id} package summary is missing`);
      continue;
    }
    const expectedFields = [
      ["path", `path: specs/changes/${packageInfo.directory}`],
      ["plan pull request", `pull_request: ${packageInfo.planPullRequest}`],
      [
        "approved candidate",
        `approved_candidate: ${packageInfo.planCandidate}`,
      ],
      ["final merge", `final_merge: ${packageInfo.finalMerge}`],
      ["post-merge status", "status: pass"],
    ];
    for (const [label, expected] of expectedFields)
      if (!block.includes(expected))
        error(
          errors,
          `${packageInfo.id} package summary ${label} is missing or drifted`,
        );
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
    const pullRequest = text
      .match(/^    pull_request:\s*(\S+)/m)?.[1]
      ?.replace(/,$/, "");
    const expectedTask = EXPECTED_TASKS[id];
    if (!expectedTask) {
      error(errors, `${id} has no exact expected evidence mapping`);
    } else {
      for (const [label, value] of [
        ["pull request", pullRequest],
        [
          "implementation head",
          text.match(/^    implementation_head:\s*(\S+)/m)?.[1],
        ],
        ["merge commit", text.match(/^    merge_commit:\s*(\S+)/m)?.[1]],
      ]) {
        const expected =
          expectedTask[
            label === "pull request"
              ? "pullRequest"
              : label === "implementation head"
                ? "head"
                : "merge"
          ];
        if (value !== expected)
          error(
            errors,
            `${id} ${label} does not match its exact expected mapping`,
          );
      }
    }
    if (
      !pullRequest ||
      !/^https:\/\/github\.com\/KARSIFT\/vocanova-platform\/pull\/\d+$/.test(
        pullRequest,
      ) ||
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

  for (const tuple of REQUIRED_FAILURES) {
    let ownerBlock = "";
    if (tuple.owner.startsWith("package ")) {
      const packageId = tuple.owner.match(/VOC-\d+/)?.[0];
      ownerBlock = packageBlocks.find(({ id }) => id === packageId)?.text ?? "";
    } else {
      ownerBlock = taskBlocks.find(({ id }) => id === tuple.owner)?.text ?? "";
    }
    if (!ownerBlock)
      error(
        errors,
        `${tuple.owner} owner block is missing for historical FAIL`,
      );
    else inspectHistoryTuple(ownerBlock, tuple, errors);
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

function markdownSections(text) {
  return [
    ...text.matchAll(
      /^## (VOC-\d+-(?:T|AC|TEST)-?\d+)[^\n]*\n([\s\S]*?)(?=^## |(?![\s\S]))/gm,
    ),
  ].map((match) => ({ id: match[1], body: match[2] }));
}

function normalizedRefs(value, kind, packageId) {
  return [
    ...value.matchAll(new RegExp(`(?:${packageId}-)?${kind}(?:-)?\\d+`, "g")),
  ]
    .map(([ref]) =>
      ref.includes(packageId)
        ? ref.replace(`${packageId}-`, `${packageId}-`)
        : `${packageId}-${ref.replace(`${kind}-`, `${kind}-`)}`,
    )
    .sort();
}

function compareSets(errors, label, actual, expected) {
  if (
    actual.length !== expected.length ||
    actual.some((value, index) => value !== expected[index])
  )
    error(
      errors,
      `${label} identifier set or mapping drifted (expected ${expected.join(", ")}, found ${actual.join(", ")})`,
    );
}

function inspectActiveCarriers(repositoryRoot, inventory) {
  const errors = [];
  const classifications = inventoryClassificationBlocks(inventory);
  for (const packageInfo of PACKAGES) {
    const packageId = packageInfo.id;
    const expectedTasks = packageTaskIds(packageId, packageInfo.tasks);
    const expectedAcceptance = packageTaskIds(
      packageId,
      packageInfo.acceptanceCount,
    ).map((id) => id.replace("-T", "-AC-"));
    const expectedTests = packageTaskIds(packageId, packageInfo.testCount).map(
      (id) => id.replace("-T", "-TEST-"),
    );
    const directory = `specs/changes/${packageInfo.directory}`;
    const activePaths = classifications
      .filter(
        (record) =>
          record.classification === "active-claim" &&
          record.path?.startsWith(`${directory}/`),
      )
      .map((record) => record.path);
    for (const relativePath of activePaths) {
      const content = read(repositoryRoot, relativePath);
      if (!content) {
        error(
          errors,
          `${packageId} active carrier is missing: ${relativePath}`,
        );
        continue;
      }
      if (!content.includes(packageId))
        error(
          errors,
          `${packageId} active carrier lost its package identifier: ${relativePath}`,
        );
      const name = path.basename(relativePath);
      if (
        name === "README.md" &&
        !/(?:does not claim|no live effect|not external activation|no live action|authorizes no)/i.test(
          content,
        )
      )
        error(
          errors,
          `${packageId} README lacks its explicit repository-only/no-activation limitation`,
        );
      if (
        [
          "specification.md",
          "impact-analysis.md",
          "implementation-plan.md",
          "test-plan.md",
        ].includes(name) &&
        !/repository|local/i.test(content)
      )
        error(
          errors,
          `${packageId} ${name} lacks a designated repository/local limitation marker`,
        );
      if (name === "tasks.md") {
        const sections = markdownSections(content).filter(({ id }) =>
          id.startsWith(`${packageId}-T`),
        );
        compareSets(
          errors,
          `${packageId} task`,
          sections.map(({ id }) => id).sort(),
          expectedTasks,
        );
        for (const section of sections) {
          const acceptance = normalizedRefs(
            section.body.match(/^- Acceptance:\s*(.+)$/m)?.[1] ?? "",
            "AC",
            packageId,
          );
          const tests = normalizedRefs(
            section.body.match(/^- Tests:\s*(.+)$/m)?.[1] ?? "",
            "TEST",
            packageId,
          );
          if (
            !acceptance.length ||
            !acceptance.every((id) => expectedAcceptance.includes(id))
          )
            error(
              errors,
              `${section.id} acceptance mapping is missing or invalid`,
            );
          if (!tests.length || !tests.every((id) => expectedTests.includes(id)))
            error(errors, `${section.id} test mapping is missing or invalid`);
        }
      }
      if (name === "acceptance-criteria.md") {
        const sections = markdownSections(content).filter(({ id }) =>
          id.startsWith(`${packageId}-AC`),
        );
        compareSets(
          errors,
          `${packageId} acceptance`,
          sections.map(({ id }) => id).sort(),
          expectedAcceptance,
        );
        for (const section of sections) {
          const tasks = normalizedRefs(
            section.body.match(/^- Tasks:\s*(.+)$/m)?.[1] ?? "",
            "T",
            packageId,
          );
          const tests = normalizedRefs(
            section.body.match(/^- Tests:\s*(.+)$/m)?.[1] ?? "",
            "TEST",
            packageId,
          );
          if (!tasks.length || !tasks.every((id) => expectedTasks.includes(id)))
            error(errors, `${section.id} task mapping is missing or invalid`);
          if (!tests.length || !tests.every((id) => expectedTests.includes(id)))
            error(errors, `${section.id} test mapping is missing or invalid`);
          if (!/^- Result:\s*(?:complete|satisfied)/im.test(section.body))
            error(errors, `${section.id} result is not complete`);
        }
      }
      if (name === "test-plan.md") {
        const sections = markdownSections(content).filter(({ id }) =>
          id.startsWith(`${packageId}-TEST`),
        );
        compareSets(
          errors,
          `${packageId} test`,
          sections.map(({ id }) => id).sort(),
          expectedTests,
        );
        for (const section of sections) {
          const acceptance = normalizedRefs(
            section.body.match(/^- Covers:\s*(.+)$/m)?.[1] ?? "",
            "AC",
            packageId,
          );
          if (
            !acceptance.length ||
            !acceptance.every((id) => expectedAcceptance.includes(id))
          )
            error(
              errors,
              `${section.id} acceptance coverage mapping is missing or invalid`,
            );
        }
      }
    }
  }
  return errors;
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
  if (inventory)
    errors.push(...inspectActiveCarriers(repositoryRoot, inventory));
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
