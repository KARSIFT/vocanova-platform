import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { inspectF2Scripts } from "./voc081-f2-evidence-policy.mjs";

export const F3_RECORD_PATH = "docs/operations/voc-105-f3-evidence.json";
export const F3_NARRATIVE_PATH = "docs/operations/voc-105-f3-evidence.md";
export const DESIGNATED_F3_SURFACES = Object.freeze([
  "docs/README.md",
  "docs/operations/README.md",
  "docs/operations/cloudflare-delivery.md",
  "docs/operations/voc-081-f2-evidence.json",
  "docs/operations/voc-081-f2-evidence.md",
  F3_RECORD_PATH,
  F3_NARRATIVE_PATH,
  "docs/product/12-mvp-implementation-plan.md",
  "docs/product/README.md",
]);

const DELIVERY_PATH = "docs/operations/cloudflare-delivery.md";
const PUBLIC_RESOURCES = Object.freeze({
  account: "0a9eda28b96d77c24dcde74f3e074d47",
  zone: "63286d93b5f32925ac7366b4e97908be",
  d1: "22ae386f-e3f5-4d98-a3ad-18b39d3b8556",
});
const CLOUDFLARE_PREFIX = ["CLOUD", "FLARE"].join("");
const ALLOWED_CREDENTIAL_NAMES = new Set([
  [CLOUDFLARE_PREFIX, "ACCOUNT", "ID"].join("_"),
  [CLOUDFLARE_PREFIX, "API", "TOKEN"].join("_"),
]);
const HIGH_RISK_PROJECTIONS = Object.freeze({
  "docs/README.md": [
    "2ffb9c11fcc852d97b1350ae992f91d242913bdc1b6c676f38056e9c919ce2c5",
    "878ac4afa86d20799efbc81b0d429e390f595f33ebd7343a3f53c4e4eaf8d90a",
    "8832d2d05828832df014329b72584c9b27669f12a5846aec411373793ad5c743",
    "652c5ab7fb14b08983e28a6a4e5a8ad0d7164efa761e1c24081912a87d87ae3c",
  ],
  "docs/operations/README.md": [
    "0c206484617186064e772b665056e10531d84006d3a0d2c4b8cf131df48e95d3",
    "76e7265b61b8c095366ad43d54f4e9f6bc28d71cc9f773693760408e277a0193",
    "96392476f3118b9691d6a2535cf9b002d25b9af2db23a130ca58de08d973c955",
    "9297cbdadfaaf30b43aeb7daf7e90cd8a8555b7faac9576da2e740f3e8900078",
  ],
  "docs/operations/cloudflare-delivery.md": [
    "fa9d0caf1c3186157ec7476b34f1bee575cb569243a76f33248522bbeacc43e0",
    "2a801f8ab23aba771ed8ad1dff41846db7f766be5e1ebf6ecd83ef881213a0ec",
    "9228e479e6c42c4e7151fda2feb279b134e04d41b65f002b5fdaa6f83e29134f",
    "64688b2e1fa9a049270b1b1783239f03356d9cba4e00fe21aa286d5fa385bb44",
  ],
  "docs/operations/voc-081-f2-evidence.json": [
    "710b34dc8c253a89f5745fd8a549100fb5615f99ae2af50fbeaf2825b5f407ea",
    "b4adb3f162894178e2a75aaeb835a5c35e7348cecdc8eaf1195858960d2834f4",
    "a560577733ece56f33c61cf610398e39d54d14cd70604c46eb4def98a8a966c5",
    "eba6af33d947290b913f91a393e363c4619da9a45658efa002a5b821a969b5b1",
  ],
  "docs/operations/voc-081-f2-evidence.md": [
    "cef0dd1e99fa57f591532ba7b84c1222ca02dff1284c844bfb2b9b6ebf6267fe",
    "68325539946c4836b34ecdd505637d30d34feb2606f587d067958671cc791efb",
    "5f9001281aa5bd4af228c1e8661f429bb7892c58a853880e5dca7faf7d2b8161",
    "41e73a0be967564c232d1f3848ff8d8db3404e8387286193bed360460f1bcfe8",
  ],
  "docs/operations/voc-105-f3-evidence.json": [
    "7ba7ecee1b591787d3761f52f079a0bb0f197b3a840506b2252441471ff6c774",
    "b4adb3f162894178e2a75aaeb835a5c35e7348cecdc8eaf1195858960d2834f4",
    "a9ee0b5641a49e54c33036ce3f6b8fcc244aa9e74443a1f8d5917118370dcd38",
    "3841de5ce90e64a4b4a1424f73025260bc83b22df7f37741c1b1053c89ae8b5a",
  ],
  "docs/operations/voc-105-f3-evidence.md": [
    "1bb3c307a77107227a96011065391641dbb75c198e1411978a9e3eb401cf4528",
    "e56803e1b8a5b217df468f6afb8f24ff80200599b4d4408838df84a004eebe99",
    "e22b0023b329d93cc578cdb2c0e74a30f1ac42aa62f26fafab2093f62228f68c",
    "f4a490a89249dd4f6d3ab3f3d8cae8cb7cae822b0ed2543a10c7642513827c1e",
  ],
  "docs/product/12-mvp-implementation-plan.md": [
    "710320cecad0eb90d1448d9559ef7986eb3804634f7fb55fd72e15277131c0d2",
    "26ddec86c049d2bf7ea7171fe0b4acd347423c10bfe51f6e154b9a6da67a161d",
    "80573cdc41ed4e310878d997f14ca6778468f39323d1ee0f725e4a2c0b3ebb8e",
    "8a41c6b9501977c8ab0ca0a88a473407a6112033b5e93cd0a08918688a01fc91",
  ],
  "docs/product/README.md": [
    "85da55c0f0f0b454dfb4eb7b7e195df810541e1a72d4f92d0f3ca1621b5fa21c",
    "b4adb3f162894178e2a75aaeb835a5c35e7348cecdc8eaf1195858960d2834f4",
    "fbb6b26654e2159dab0288eeb7caa309d622c1320674bec83002864f84fdacd9",
    "630f971607f1ddfd36c47f35c73c81e37a744e194750e527affb9e15a3275204",
  ],
});
const OPERATIONAL_DOMAIN_PATTERN =
  /\b(?:staging|delivery|delivered|deploy|deployed|deployment|deployments|dispatch|promote|workflows?|CI|DNS|traffic|resources?|D1|API[\s-]+Worker|build|live|launch|learner[\s-]+data|credentials?|versions?|settings?|environments?|migrations?|promotions?|releases?|rollback|smoke|revocation)(?=\b|_)/i;
const CREDENTIAL_TERM_PATTERN =
  /\b(?:CLOUDFLARE_(?:ACCOUNT_ID|API_TOKEN)|[A-Z][A-Z0-9_]*(?:SECRET|TOKEN|PASSWORD|PRIVATE_KEY|API_KEY|ACCOUNT_ID)|credentials?|tokens?|secrets?|passwords?|private[ -]?keys?|api[ -]?keys?|access[ -]?tokens?|Authorization|Bearer)\b/i;
const LATER_HOLD_TERM_PATTERN =
  /\b(?:A1|P1\+?|P[2-5]|R[12]|L1|product[\s-]+acceptance|production|launch|learner[\s-]+data|VOC-080-HOLD-(?:01|02))\b/i;
const F3_STATUS_TERM_PATTERN = /\b(?:F3|staging[\s-]+status)\b/i;
const PERMITTED_OPERATIONAL_LINES = new Set([
  "The command “Deploy now” is prohibited.",
  "The sanitized past delivery description records that retry was not required.",
  "No deployment occurred.",
  "Deployment is prohibited.",
  "The sanitized delivery deployed the API Worker successfully in the past.",
]);
const PERMITTED_LATER_LINES = new Set([
  "A1 remains unresolved.",
  "Production remains held.",
]);
const PERMITTED_STANDALONE_LINES = new Set([
  ...PERMITTED_OPERATIONAL_LINES,
  ...PERMITTED_LATER_LINES,
]);
const GATE_EVIDENCE = new Map([
  [
    "isolated-staging-resources",
    "https://github.com/KARSIFT/vocanova-platform/issues/158#issuecomment-5438014817",
  ],
  [
    "privacy-safe-observability",
    "https://github.com/KARSIFT/vocanova-platform/issues/158#issuecomment-5438014817",
  ],
  [
    "compatible-d1-migrations",
    "https://github.com/KARSIFT/vocanova-platform/actions/runs/33386240492",
  ],
  [
    "exact-version-delivery",
    "https://github.com/KARSIFT/vocanova-platform/actions/runs/33386240492",
  ],
  [
    "bounded-staging-smoke",
    "https://github.com/KARSIFT/vocanova-platform/actions/runs/33386240492",
  ],
  [
    "rollback-baseline-and-rehearsal",
    "https://github.com/KARSIFT/vocanova-platform/issues/158#issuecomment-5438014817",
  ],
  [
    "standard-environment-protection",
    "https://github.com/KARSIFT/vocanova-platform/issues/158#issuecomment-5471376705",
  ],
  [
    "external-phase-closure",
    "https://github.com/KARSIFT/vocanova-platform/issues/158#issuecomment-5438136312",
  ],
  [
    "successful-current-delivery",
    "https://github.com/KARSIFT/vocanova-platform/issues/158#issuecomment-5477915272",
  ],
]);
const GATE_ITEMS = [...GATE_EVIDENCE.keys()];

const PROCEDURE_REGIONS = Object.freeze([
  {
    id: "credential-policy",
    start: "<!-- VOC-101-STAGING-CREDENTIAL-POLICY-BEGIN -->",
    end: "<!-- VOC-101-STAGING-CREDENTIAL-POLICY-END -->",
    includeEnd: true,
    sha256: "7892e3a2a5aa979de0f5f79401f1a36fc84a8616dca5dd9d6b94fc6b4c470655",
  },
  {
    id: "manual-staging",
    start: "## Standard manual staging delivery after settings action",
    end: "## Ordered implementation and truth boundary",
    includeEnd: false,
    sha256: "896fe5d079a3207b72b6ab87c0cfbc6d8f67c84ce5dffcd311d864e494f1c94a",
  },
  {
    id: "cancellation-rollback",
    start: "## Cancellation, failure, and rollback",
    end: "## Deterministic evidence",
    includeEnd: false,
    sha256: "e7a74c1cfc2dbb9960814664df2cc2283a82a97cd51e71156dd2b0e429c7c717",
  },
]);

const POSITIVE_VERBS =
  "complete(?:[\\s-]+effective)?|completed|passed|accepted|effective|ready|active|enabled|released|resolved|verified|approved|authorized";
const LATER_SUBJECTS = Object.freeze([
  {
    id: "later product milestone",
    pattern:
      "(?:A1(?:[\\s-]+authenticated)?|authenticated[\\s-]+A1|P1\\+?|P[2-5]|R[12]|L1)(?:[\\s-]+(?:product[\\s-]+)?acceptance)?",
  },
  {
    id: "production",
    pattern: "production(?:[\\s-]+(?:readiness|traffic|deployment))?",
  },
  {
    id: "live activation",
    pattern: "live[\\s-]+(?:activation|verification|system|service)",
  },
  { id: "public launch", pattern: "public[\\s-]+launch" },
  {
    id: "learner data",
    pattern:
      "learner[\\s-]+data(?:[\\s-]+(?:access|use|import|export|transform|transformation|delete|deletion))?",
  },
  { id: "aggregate product acceptance", pattern: "product[\\s-]+acceptance" },
]);

function readSurface(root, relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function normalized(source) {
  return source
    .replace(/\r\n?/g, "\n")
    .replace(/[ \t\n\f\v]+/g, " ")
    .trim();
}

function occurrences(source, needle) {
  let count = 0;
  let offset = 0;
  while ((offset = source.indexOf(needle, offset)) !== -1) {
    count += 1;
    offset += needle.length;
  }
  return count;
}

function requireEqual(errors, actual, expected, label) {
  if (actual !== expected)
    errors.push(
      `${F3_RECORD_PATH}: ${label}: expected ${JSON.stringify(expected)}`,
    );
}

function exactKeys(errors, value, expected, label) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    errors.push(`${F3_RECORD_PATH}: ${label}: expected object`);
    return false;
  }
  const actual = Object.keys(value).sort();
  const wanted = [...expected].sort();
  if (JSON.stringify(actual) !== JSON.stringify(wanted))
    errors.push(
      `${F3_RECORD_PATH}: ${label}: exact keys expected ${wanted.join(",")}; got ${actual.join(",")}`,
    );
  return true;
}

function duplicateRawJsonKeys(source) {
  const duplicates = [];
  let index = 0;
  const skip = () => {
    while (/\s/.test(source[index] ?? "")) index += 1;
  };
  const stringToken = () => {
    const start = index++;
    let escaped = false;
    while (index < source.length) {
      const character = source[index++];
      if (escaped) escaped = false;
      else if (character === "\\") escaped = true;
      else if (character === '"') break;
    }
    return JSON.parse(source.slice(start, index));
  };
  const value = (objectPath) => {
    skip();
    if (source[index] === "{") return object(objectPath);
    if (source[index] === "[") return array(objectPath);
    if (source[index] === '"') return void stringToken();
    while (index < source.length && !/[\],}]/.test(source[index])) index += 1;
  };
  const object = (objectPath) => {
    index += 1;
    const keys = new Set();
    skip();
    while (index < source.length && source[index] !== "}") {
      const key = stringToken();
      skip();
      if (source[index] !== ":") throw new Error("invalid object separator");
      index += 1;
      if (keys.has(key))
        duplicates.push(`${objectPath}: duplicate raw key ${key}`);
      keys.add(key);
      value(`${objectPath}.${key}`);
      skip();
      if (source[index] === ",") {
        index += 1;
        skip();
      } else break;
    }
    if (source[index] !== "}") throw new Error("invalid object terminator");
    index += 1;
  };
  const array = (arrayPath) => {
    index += 1;
    let item = 0;
    skip();
    while (index < source.length && source[index] !== "]") {
      value(`${arrayPath}[${item++}]`);
      skip();
      if (source[index] === ",") {
        index += 1;
        skip();
      } else break;
    }
    if (source[index] !== "]") throw new Error("invalid array terminator");
    index += 1;
  };
  try {
    value("$");
  } catch {
    return [];
  }
  return duplicates;
}

function validateRecord(source, record) {
  const errors = duplicateRawJsonKeys(source).map(
    (error) => `${F3_RECORD_PATH}: ${error}`,
  );
  exactKeys(
    errors,
    record,
    [
      "schema_version",
      "status",
      "package",
      "milestone_gate",
      "delivery_event",
      "settings_contract",
      "later_boundaries",
      "historical_boundary",
      "external_effects_by_voc105",
    ],
    "record",
  );
  requireEqual(
    errors,
    record.schema_version,
    "vocanova-voc105-f3-v1",
    "schema_version",
  );
  requireEqual(
    errors,
    record.status,
    "f3-staging-foundation-complete-effective",
    "status",
  );
  requireEqual(
    errors,
    record.package,
    "specs/changes/VOC-105-f3-current-documentation-reconciliation",
    "package",
  );

  const gate = record.milestone_gate;
  exactKeys(
    errors,
    gate,
    ["decision", "missing_evidence", "f2_dependency", "items"],
    "milestone_gate",
  );
  requireEqual(
    errors,
    gate?.decision,
    record.status,
    "milestone_gate.decision",
  );
  if (
    !Array.isArray(gate?.missing_evidence) ||
    gate.missing_evidence.length !== 0
  )
    errors.push(
      `${F3_RECORD_PATH}: milestone_gate.missing_evidence: expected empty array`,
    );
  exactKeys(
    errors,
    gate?.f2_dependency,
    ["status", "pull_request", "merge_sha"],
    "milestone_gate.f2_dependency",
  );
  requireEqual(
    errors,
    gate?.f2_dependency?.status,
    "complete-effective",
    "F2 status",
  );
  requireEqual(
    errors,
    gate?.f2_dependency?.pull_request,
    "https://github.com/KARSIFT/vocanova-platform/pull/108",
    "F2 PR",
  );
  requireEqual(
    errors,
    gate?.f2_dependency?.merge_sha,
    "36d526bdec83e28b17aa30a6814d42b92f058ec1",
    "F2 merge SHA",
  );

  if (!Array.isArray(gate?.items))
    errors.push(`${F3_RECORD_PATH}: milestone_gate.items: expected array`);
  else {
    if (gate.items.length !== GATE_ITEMS.length)
      errors.push(
        `${F3_RECORD_PATH}: milestone_gate.items: expected ${GATE_ITEMS.length} ordered items`,
      );
    gate.items.forEach((item, itemIndex) => {
      exactKeys(
        errors,
        item,
        ["id", "status", "evidence"],
        `milestone_gate.items[${itemIndex}]`,
      );
      const expectedId = GATE_ITEMS[itemIndex];
      requireEqual(errors, item?.id, expectedId, `gate item ${itemIndex} id`);
      if (!GATE_EVIDENCE.has(item?.id))
        errors.push(
          `${F3_RECORD_PATH}: gate item ${itemIndex}: unknown id ${JSON.stringify(item?.id)}`,
        );
      else {
        requireEqual(
          errors,
          item.status,
          "validated",
          `gate item ${item.id} status`,
        );
        requireEqual(
          errors,
          item.evidence,
          GATE_EVIDENCE.get(item.id),
          `gate item ${item.id} evidence`,
        );
      }
    });
    for (const id of GATE_ITEMS) {
      const count = gate.items.filter((item) => item?.id === id).length;
      if (count !== 1)
        errors.push(
          `${F3_RECORD_PATH}: gate item ${id}: expected exactly once; got ${count}`,
        );
    }
  }

  const event = record.delivery_event;
  exactKeys(
    errors,
    event,
    [
      "workflow",
      "run_id",
      "attempt",
      "event_sha",
      "url",
      "required",
      "delivery_gate",
      "staging_job",
      "steps",
      "production_job",
    ],
    "delivery_event",
  );
  requireEqual(errors, event?.workflow, "CI", "delivery workflow");
  requireEqual(errors, event?.run_id, 33386240492, "delivery run");
  requireEqual(errors, event?.attempt, 1, "delivery attempt");
  requireEqual(
    errors,
    event?.event_sha,
    "03528a84988ebe664207c6a439e133070627c92a",
    "delivery SHA",
  );
  requireEqual(
    errors,
    event?.url,
    "https://github.com/KARSIFT/vocanova-platform/actions/runs/33386240492",
    "delivery URL",
  );
  for (const field of ["required", "delivery_gate", "staging_job"])
    requireEqual(errors, event?.[field], "success", `delivery_event.${field}`);
  exactKeys(
    errors,
    event?.steps,
    [
      "migration",
      "immutable_upload",
      "exact_promotion",
      "bounded_smoke",
      "rollback_after_promotion_failure",
      "sanitized_outcome",
    ],
    "delivery_event.steps",
  );
  for (const step of [
    "migration",
    "immutable_upload",
    "exact_promotion",
    "bounded_smoke",
    "sanitized_outcome",
  ])
    requireEqual(
      errors,
      event?.steps?.[step],
      "success",
      `delivery step ${step}`,
    );
  requireEqual(
    errors,
    event?.steps?.rollback_after_promotion_failure,
    "skipped-expected",
    "rollback outcome",
  );
  requireEqual(
    errors,
    event?.production_job,
    "skipped-held",
    "production outcome",
  );

  const settings = record.settings_contract;
  const settingsExpected = {
    delivery_controls_pull_request:
      "https://github.com/KARSIFT/vocanova-platform/pull/175",
    settings_truth_pull_request:
      "https://github.com/KARSIFT/vocanova-platform/pull/179",
    credential_policy_pull_request:
      "https://github.com/KARSIFT/vocanova-platform/pull/178",
    sanitized_readback:
      "https://github.com/KARSIFT/vocanova-platform/issues/158#issuecomment-5471376705",
  };
  exactKeys(
    errors,
    settings,
    Object.keys(settingsExpected),
    "settings_contract",
  );
  for (const [key, expected] of Object.entries(settingsExpected))
    requireEqual(errors, settings?.[key], expected, `settings contract ${key}`);

  const later = record.later_boundaries;
  const laterExpected = {
    a1_authenticated_product_acceptance: "unresolved",
    p1_plus_product_acceptance: "unresolved",
    production_readiness: "held",
    production_traffic: "held",
    public_launch: "unresolved-held",
    learner_data: "held",
    inherited_holds: ["VOC-080-HOLD-01", "VOC-080-HOLD-02"],
  };
  exactKeys(errors, later, Object.keys(laterExpected), "later_boundaries");
  for (const [key, expected] of Object.entries(laterExpected)) {
    if (Array.isArray(expected)) {
      if (JSON.stringify(later?.[key]) !== JSON.stringify(expected))
        errors.push(
          `${F3_RECORD_PATH}: ${key}: expected exact ordered array ${JSON.stringify(expected)}`,
        );
    } else requireEqual(errors, later?.[key], expected, key);
  }

  exactKeys(
    errors,
    record.historical_boundary,
    ["packages", "later_evidence_supersedes_prospective_pending_language"],
    "historical_boundary",
  );
  requireEqual(
    errors,
    record.historical_boundary?.packages,
    "VOC-094-through-VOC-104-immutable",
    "historical package boundary",
  );
  requireEqual(
    errors,
    record.historical_boundary
      ?.later_evidence_supersedes_prospective_pending_language,
    true,
    "historical supersession boundary",
  );
  requireEqual(
    errors,
    record.external_effects_by_voc105,
    "none-repository-only",
    "VOC-105 external effects",
  );
  return errors;
}

function extractProcedureRegion(source, definition) {
  const start = source.indexOf(definition.start);
  if (start === -1) return null;
  const endStart = source.indexOf(
    definition.end,
    start + definition.start.length,
  );
  if (endStart === -1) return null;
  const end = definition.includeEnd
    ? endStart + definition.end.length
    : endStart;
  return { start, end, source: source.slice(start, end) };
}

function projectionDigest(source, pattern) {
  const lineProjection = source
    .split(/\r?\n/)
    .flatMap((line, index) =>
      pattern.test(line) ? [`${index + 1}\0${line}\0`] : [],
    )
    .join("");
  const paragraphProjection = source
    .split(/\r?\n\s*\r?\n/)
    .flatMap((paragraph, index) => {
      const exactParagraph = paragraph.trim();
      return pattern.test(exactParagraph)
        ? [`${index + 1}\0${exactParagraph}\0`]
        : [];
    })
    .join("");
  return crypto
    .createHash("sha256")
    .update(`lines\0${lineProjection}paragraphs\0${paragraphProjection}`)
    .digest("hex");
}

function maskExactLines(source, permittedLines) {
  return source
    .split(/\r?\n/)
    .map((line) =>
      permittedLines.has(line.trim()) ? " ".repeat(line.length) : line,
    )
    .join("\n");
}

function isPermittedHistoricalF3Paragraph(paragraph) {
  const compact = normalized(paragraph);
  for (let number = 94; number <= 104; number += 1) {
    const packageId = `VOC-${String(number).padStart(3, "0")}`;
    const historicalStates = [
      `${packageId} is immutable history: F3 is pending.`,
      `${packageId} is immutable history: F3 pending.`,
      `${packageId} is immutable history: F3 remains pending.`,
      `${packageId} is immutable history: F3 is unresolved.`,
      `${packageId} is immutable history: F3 unresolved.`,
      `${packageId} is immutable history: F3 staging is unresolved.`,
      `${packageId} is immutable history: F3 is not yet delivered.`,
      `${packageId} is immutable history: F3 has not been delivered.`,
      `F3 is pending in ${packageId} immutable history.`,
      `F3 remains pending in ${packageId} immutable history.`,
      `F3 staging is unresolved in ${packageId} immutable history.`,
      `F3 is not yet delivered in ${packageId} immutable history.`,
      `${packageId} immutable history records F3 as pending.`,
      `${packageId} immutable history records F3 staging as unresolved.`,
    ];
    const supersessions = [
      "Later exact VOC-105 evidence supersedes that prospective F3 status.",
      `Later exact VOC-105 evidence supersedes ${packageId} prospective F3 pending status.`,
      `Later exact VOC-105 evidence supersedes ${packageId} prospective F3 unresolved status.`,
      `Later exact VOC-105 evidence supersedes ${packageId} prospective F3 not-delivered status.`,
      `Later exact VOC-105 evidence supersedes the prospective F3 status from ${packageId}.`,
    ];
    for (const state of historicalStates)
      for (const supersession of supersessions)
        if (
          compact === `${state} ${supersession}` ||
          compact === `${supersession} ${state}`
        )
          return true;
  }
  return false;
}

function isPermittedHistoricalHeldParagraph(paragraph) {
  const compact = normalized(paragraph);
  for (let number = 94; number <= 104; number += 1) {
    const packageId = `VOC-${String(number).padStart(3, "0")}`;
    if (
      compact ===
      `${packageId} is immutable history. Production remains held; learner data remains held; VOC-080-HOLD-01 remains held; VOC-080-HOLD-02 remains held.`
    )
      return true;
  }
  return false;
}

function maskPermittedHistoricalContexts(source) {
  return source
    .split(/(\r?\n\s*\r?\n)/)
    .map((paragraph, index) => {
      if (
        index % 2 === 0 &&
        (isPermittedHistoricalF3Paragraph(paragraph) ||
          isPermittedHistoricalHeldParagraph(paragraph))
      )
        return paragraph.replace(/[^\r\n]/g, " ");
      return paragraph;
    })
    .join("");
}

export function protectedProjectionDigests(source, relativePath) {
  const historyMasked = maskPermittedHistoricalContexts(source);
  const exactContextMasked = maskExactLines(
    historyMasked,
    PERMITTED_STANDALONE_LINES,
  );
  let operationalSource = exactContextMasked;
  if (relativePath === DELIVERY_PATH) {
    const characters = operationalSource.split("");
    for (const definition of PROCEDURE_REGIONS) {
      const region = extractProcedureRegion(exactContextMasked, definition);
      if (!region) continue;
      for (let index = region.start; index < region.end; index += 1)
        characters[index] = " ";
    }
    operationalSource = characters.join("");
  }
  return [
    projectionDigest(operationalSource, OPERATIONAL_DOMAIN_PATTERN),
    projectionDigest(exactContextMasked, CREDENTIAL_TERM_PATTERN),
    projectionDigest(exactContextMasked, LATER_HOLD_TERM_PATTERN),
    projectionDigest(exactContextMasked, F3_STATUS_TERM_PATTERN),
  ];
}

function validatePublicResourceContext(source, relativePath) {
  const errors = [];
  const pattern =
    /\b[0-9a-f]{32}\b|\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi;
  const found = [...source.matchAll(pattern)].map((match) =>
    match[0].toLowerCase(),
  );
  const allowed = new Set(Object.values(PUBLIC_RESOURCES));
  if (relativePath !== DELIVERY_PATH) {
    for (const value of found)
      errors.push(
        `${relativePath}: protected or unknown resource identifier ${value}`,
      );
    return errors;
  }
  for (const value of found)
    if (!allowed.has(value))
      errors.push(
        `${relativePath}: protected or unknown resource identifier ${value}`,
      );
  const compact = normalized(source);
  const contexts = [
    `token is scoped to account \`${PUBLIC_RESOURCES.account}\` with exactly`,
    `tuple binds account \`${PUBLIC_RESOURCES.account}\`, zone \`${PUBLIC_RESOURCES.zone}\`, D1 \`${PUBLIC_RESOURCES.d1}\`, API Worker`,
    `is restricted to account \`${PUBLIC_RESOURCES.account}\` with exactly`,
  ];
  for (const context of contexts)
    if (occurrences(compact, context) !== 1)
      errors.push(
        `${relativePath}: canonical public resource context is missing or relocated: ${context}`,
      );
  for (const [value, count] of [
    [PUBLIC_RESOURCES.account, 3],
    [PUBLIC_RESOURCES.zone, 1],
    [PUBLIC_RESOURCES.d1, 1],
  ])
    if (found.filter((entry) => entry === value).length !== count)
      errors.push(
        `${relativePath}: canonical public resource ${value} must occur exactly ${count} time(s)`,
      );
  return errors;
}

function validateCredentialVocabulary(source, relativePath, projections) {
  const errors = [];
  const names =
    source.match(
      /\b[A-Z][A-Z0-9]*(?:_[A-Z0-9]+)*(?:_SECRET|_TOKEN|_PASSWORD|_PRIVATE_KEY|_API_KEY|_ACCOUNT_ID)\b/g,
    ) ?? [];
  for (const name of names)
    if (!ALLOWED_CREDENTIAL_NAMES.has(name))
      errors.push(`${relativePath}: unknown credential interface name ${name}`);
  const safeCredentialDescription =
    "(?:a\\s+)?(?:value-free|confidential|sensitive|redacted|prohibited|absent|unavailable|required|available|scoped|valid|revoked|inactive|active|held|allowed|canonical|non-sensitive|evaluated|referenced)\\b|false\\b|null\\b|none\\b";
  const assignedAllowed = new RegExp(
    `\\b(?:${[...ALLOWED_CREDENTIAL_NAMES].join("|")})\\b[\\\"'\\x60]*\\s*` +
      `(?:(?:has|had)\\b\\s+(?:a\\s+)?value(?:\\s+of)?|value\\s+(?:is|was|equals)\\b|(?:is|was|equals)\\b|[=:])\\s*` +
      `[\\\"'\\x60]?(?!${safeCredentialDescription})[^\\s,;]{3,}`,
    "gi",
  );
  if (assignedAllowed.test(source))
    errors.push(
      `${relativePath}: allowed credential interface name has a prohibited value`,
    );
  const labelledValue = new RegExp(
    `\\b(?:token|api[_ -]?token|access[_ -]?token|secret|password|private[_ -]?key|api[_ -]?key|credential)\\b[\\\"'\\x60]*\\s*` +
      `(?:(?:has|had)\\b\\s+(?:a\\s+)?value(?:\\s+of)?|value\\s+(?:is|was|equals)\\b|(?:is|was|equals)\\b|[=:])\\s*` +
      `[\\\"'\\x60]?(?!${safeCredentialDescription})[A-Za-z0-9_./+:=-]{6,}`,
    "i",
  );
  if (labelledValue.test(source))
    errors.push(
      `${relativePath}: token, secret, password, key, or credential value is prohibited`,
    );
  if (projections[1] !== HIGH_RISK_PROJECTIONS[relativePath]?.[1])
    errors.push(
      `${relativePath}: credential value is prohibited or credential context is not canonical`,
    );
  return errors;
}

function semanticClauses(source) {
  return source
    .split(
      /(?:\r?\n|[.!?;]|\s*,\s*(?=(?:but|however|yet)\b)|\b(?:but|however|yet)\b)/i,
    )
    .map((clause) => clause.trim())
    .filter(Boolean);
}

function validateProcedures(source, relativePath, projections) {
  const errors = [];
  let scanSource = maskPermittedHistoricalContexts(source);
  if (relativePath === DELIVERY_PATH) {
    const regions = [];
    for (const definition of PROCEDURE_REGIONS) {
      const region = extractProcedureRegion(source, definition);
      if (!region) {
        errors.push(
          `${relativePath}: bounded procedure ${definition.id} region is missing or relocated`,
        );
        continue;
      }
      const digest = crypto
        .createHash("sha256")
        .update(region.source)
        .digest("hex");
      if (digest !== definition.sha256)
        errors.push(
          `${relativePath}: bounded procedure ${definition.id} guards or content drifted`,
        );
      regions.push(region);
    }
    const characters = scanSource.split("");
    for (const region of regions)
      for (let index = region.start; index < region.end; index += 1)
        characters[index] = " ";
    scanSource = characters.join("");
  }
  if (projections[0] !== HIGH_RISK_PROJECTIONS[relativePath]?.[0])
    errors.push(
      `${relativePath}: protected operational domain occurrence exposes an unbounded, moved, or noncanonical live-action instruction context`,
    );
  const relocatedProcedure =
    /remove the environment API-token secret|cancel in-flight staging runs|retry\s+revocation|verify the affected token is inactive|run the exact ordered D1 migration ledger|upload immutable SHA-prefix\/run-ID\/attempt-tagged Worker versions|promote the exact UUIDs|run bounded staging smoke|both API and web restoration independently/i;
  const relocatedScanSource = scanSource.replace(
    /If token scope or disclosure\s+evidence is wrong, revoke the token and remove the environment API-token secret before\s+staging can resume\./,
    " ",
  );
  const relocatedMatch = relocatedProcedure.exec(relocatedScanSource);
  if (relocatedMatch)
    errors.push(
      `${relativePath}: bounded live-action clause is outside its guarded runbook region: ${relocatedMatch[0]}`,
    );
  return errors;
}

function validateLaterBoundaries(source, relativePath, projections) {
  const errors = [];
  const clauses = semanticClauses(source);
  for (const subject of LATER_SUBJECTS) {
    const pattern = new RegExp(
      `\\b${subject.pattern}\\b[^\\n.!?]{0,64}\\b(?:is\\s+|has\\s+been\\s+)?(?:${POSITIVE_VERBS})\\b`,
      "gi",
    );
    for (const clause of clauses) {
      const match = pattern.exec(clause);
      pattern.lastIndex = 0;
      if (!match) continue;
      const prefix = clause.slice(0, match.index);
      const matchedClaim = match[0];
      const suffix = clause.slice(match.index + match[0].length);
      if (
        /\b(?:future|prospective|objective|gate)\b/i.test(prefix) ||
        /\b(?:cannot|must\s+not|not|only\s+after|until|if|when)\b/i.test(
          matchedClaim,
        ) ||
        /^\s*(?:[,():-]\s*)?(?:only\s+after|until|if|when)\b/i.test(suffix)
      )
        continue;
      errors.push(`${relativePath}: prohibited positive ${subject.id} claim`);
      break;
    }
  }
  const holdRelease = new RegExp(
    `\\bVOC-080-HOLD-(01|02)\\b[^\\n.!?]{0,64}\\b(?:(?:is\\s+|has\\s+been\\s+)?(?:${POSITIVE_VERBS}|lifted|cleared|removed|satisfied|closed|expired|waived|discharged|ceased)|no\\s+longer\\s+(?:applies|in\\s+force))\\b`,
    "i",
  );
  if (holdRelease.test(source))
    errors.push(`${relativePath}: inherited hold release claim is prohibited`);
  const currentTruthSource = maskPermittedHistoricalContexts(source);
  if (
    /\bF3(?:\/staging|[ -]+staging)?\b[^\n.!?]{0,80}\b(?:(?:remains?|is|are|stays?|continues?\s+to\s+be)\s+(?:pending|unresolved|held)|is\s+not[\s-]+yet[\s-]+delivered)\b/i.test(
      currentTruthSource,
    )
  )
    errors.push(`${relativePath}: stale current F3 unresolved/held wording`);
  if (projections[2] !== HIGH_RISK_PROJECTIONS[relativePath]?.[2])
    errors.push(
      `${relativePath}: prohibited positive or noncanonical later/hold context`,
    );
  if (projections[3] !== HIGH_RISK_PROJECTIONS[relativePath]?.[3])
    errors.push(
      `${relativePath}: stale current F3 or noncanonical F3 history context`,
    );
  return errors;
}

function validateHistoryBoundary(source, relativePath) {
  const errors = [];
  const currentTruthSource = maskPermittedHistoricalContexts(source);
  for (let number = 94; number <= 104; number += 1) {
    const packageId = `VOC-${String(number).padStart(3, "0")}`;
    const pattern = new RegExp(
      `\\b${packageId}\\b[^.!?]{0,180}\\b(?:current|now|still|remains?|active)\\b[^.!?]{0,100}\\b(?:F3|staging)\\b[^.!?]{0,60}\\b(?:pending|unresolved|not[\\s-]+yet[\\s-]+delivered)\\b|\\b${packageId}\\b[^.!?]{0,180}\\b(?:F3|staging)\\b[^.!?]{0,80}\\b(?:current|now|still|remains?|active)\\b[^.!?]{0,60}\\b(?:pending|unresolved|not[\\s-]+yet[\\s-]+delivered)\\b`,
      "i",
    );
    if (pattern.test(currentTruthSource))
      errors.push(
        `${relativePath}: ${packageId} superseded F3 history is presented as current`,
      );
  }
  if (relativePath === F3_NARRATIVE_PATH) {
    const compact = normalized(source);
    for (const marker of [
      "VOC-094 through VOC-104 remain immutable historical snapshots.",
      "This later exact record supersedes their prospective pending language only for current F3 status",
    ])
      if (!compact.includes(marker))
        errors.push(
          `${relativePath}: explicit immutable-history and later-VOC-105 supersession boundary is missing`,
        );
  }
  return errors;
}

export function inspectF3Surface(source, relativePath) {
  const projections = protectedProjectionDigests(source, relativePath);
  return [
    ...validatePublicResourceContext(source, relativePath),
    ...validateCredentialVocabulary(source, relativePath, projections),
    ...validateProcedures(source, relativePath, projections),
    ...validateLaterBoundaries(source, relativePath, projections),
    ...validateHistoryBoundary(source, relativePath),
  ];
}

export function inspectF3Evidence(root) {
  const errors = [];
  const sources = new Map();
  for (const relativePath of DESIGNATED_F3_SURFACES) {
    try {
      sources.set(relativePath, readSurface(root, relativePath));
    } catch {
      errors.push(
        `${relativePath}: designated current-truth surface is missing or unreadable`,
      );
    }
  }
  const recordSource = sources.get(F3_RECORD_PATH);
  if (recordSource !== undefined) {
    try {
      errors.push(...validateRecord(recordSource, JSON.parse(recordSource)));
    } catch (error) {
      errors.push(`${F3_RECORD_PATH}: invalid JSON (${error.message})`);
    }
  }
  for (const [relativePath, source] of sources)
    errors.push(...inspectF3Surface(source, relativePath));
  const narrative = sources.get(F3_NARRATIVE_PATH);
  if (narrative !== undefined)
    for (const marker of [
      "33386240492",
      "03528a84988ebe664207c6a439e133070627c92a",
      "skipped-expected",
      "skipped-held",
      "VOC-094 through VOC-104 remain immutable",
    ])
      if (!narrative.includes(marker))
        errors.push(`${F3_NARRATIVE_PATH}: missing ${marker}`);

  let packageJson;
  try {
    packageJson = JSON.parse(readSurface(root, "package.json"));
  } catch (error) {
    errors.push(`package.json: ${error.message}`);
    return errors;
  }
  if (
    packageJson.scripts?.["ci:f3-evidence"] !==
    "node scripts/foundation/voc105-f3-evidence-policy.mjs"
  )
    errors.push("package.json: ci:f3-evidence script is missing or drifted");
  errors.push(...inspectF2Scripts(JSON.stringify(packageJson)));
  const segments = (packageJson.scripts?.["ci:foundation"] ?? "")
    .split("&&")
    .map((segment) => segment.trim());
  if (
    segments.filter((segment) => segment === "pnpm run ci:f3-evidence")
      .length !== 1
  )
    errors.push(
      "package.json: ci:foundation must contain exact ci:f3-evidence segment once",
    );
  const settingsIndex = segments.indexOf("pnpm run ci:settings-truth");
  if (
    segments[settingsIndex + 1] !== "pnpm run ci:f3-evidence" ||
    segments[settingsIndex + 2] !== "node --test scripts/foundation/*.test.mjs"
  )
    errors.push(
      "package.json: ci:f3-evidence must occupy the governed extension slot",
    );
  return errors;
}

export function validateF3Evidence(root) {
  const errors = inspectF3Evidence(root);
  if (errors.length)
    throw new Error(
      `VOC-105 F3 evidence policy failed:\n- ${errors.join("\n- ")}`,
    );
}

const isMain =
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  try {
    validateF3Evidence(process.cwd());
    console.log("VOC-105 F3 evidence policy: PASS");
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
