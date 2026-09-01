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
    "85d2b5e63661155624516ca3c045e47c62f91a8f744b5549c2a13b9f5483b439",
    "8d7058ba5b1a408aeecc12607e9441b22c6eba61afa1f7eda855c4b36876dead",
    "b9557b08dfd08392c7cbc0166d0498a36a684c5e9401569ce65fcdede01f2d31",
  ],
  "docs/operations/README.md": [
    "e578efdb426efa4344e14a387ca3f92bd34af6cba7462e8dfa35cc043c6b8da8",
    "1b276bc9120de48da02384d8465a8c8702918ade10d7109a77c4ff8e0e44bc54",
    "fb3ee6d14bd47d4e2a487a3ecc2d43c66071c3bf284bf8bed61a106ab5590601",
  ],
  "docs/operations/cloudflare-delivery.md": [
    "b815609add1d3c6c32a7a680b4cab6955cbcb3f61b1b5b8b3f278455088df877",
    "5fdb0be398f07f6723cf01941fd9cd7f9e06370605573455054c9e43b05b1a9a",
    "e5fbe3b2e7cebdea3f68fc9a5268a10427320ff62442a8a085e752c4071f675a",
  ],
  "docs/operations/voc-081-f2-evidence.json": [
    "c2389e9b42ed6570a1d62ee4acbd26256d578df2043a18938675ef5093ebe3e3",
    "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    "976a5521ef1af3f69687c65aa078faf9fdadf01840414c470d7fc4c7a7fd8661",
  ],
  "docs/operations/voc-081-f2-evidence.md": [
    "cfea28a1eb854f2f39ec861095cd8c98626900c50501755f6879becfdce08bcd",
    "8167bba92c9089985b66bb81b35c327a2d7d85af28b5a01144e06690c3541b10",
    "49540c4232e827c3564a94c3a2cebca7ff5ee54fb4fe731c2dd6edd365e2243a",
  ],
  "docs/operations/voc-105-f3-evidence.json": [
    "c44c1fa7fc13cef87f151d03fa50b26258b1dcd494d1b974641bab5ad181bddd",
    "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    "50a64c277c66ed6678956363594ab9c233db2e4161208237d901bb22181fdb5e",
  ],
  "docs/operations/voc-105-f3-evidence.md": [
    "08cf93f8071a838bb36519d37ce30aeb442cc1bd8445ac4c9f5760407ce25c17",
    "ef084dd9b49cbc8f8510afc9b48ffe61ea6eab04b7b10a3266f708d9cb1fee17",
    "0e19b8abfab527f9a049e35485aaea7b066ad0399dc16d2007357e7a137c057f",
  ],
  "docs/product/12-mvp-implementation-plan.md": [
    "71a5d13f439ae10e0eb1a41f9371bab1bfa4d135bc34921d23dc53d5b4fd1286",
    "805e7d6f9a6bf07743d45d4e3c39b83762155bc52ed314636e67400bdb11e6d3",
    "2fe84043e8f84f0496c0eed76ea12757fae17057647e4c36661d5955a7d3d411",
  ],
  "docs/product/README.md": [
    "81fbe22ff8be3f50e4ea10efcda6aac8911917fa47002dfb83a888bd3e4304d0",
    "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    "dc5932f72dc597602d749a6aae376849300f93be7bbc7b952f289b223fb40650",
  ],
});
const ACTION_STEM_PATTERN =
  /\b(?:deploy\w*|dispatch\w*|migrat\w*|promot\w*|retr(?:y|ied|ies|ying)|upload\w*|publish\w*|rotat\w*|revok\w*|remov\w*|delet\w*|cancel\w*|configur\w*|chang\w*|creat\w*|enabl\w*|disabl\w*|restor\w*|install\w*|settings?|rout\w*|releas\w*|launch\w*|access\w*|export\w*|import\w*|transform\w*)\b/i;
const CREDENTIAL_TERM_PATTERN =
  /\b(?:CLOUDFLARE_(?:ACCOUNT_ID|API_TOKEN)|[A-Z][A-Z0-9_]*(?:SECRET|TOKEN|PASSWORD|PRIVATE_KEY|API_KEY|ACCOUNT_ID)|credentials?|tokens?|secrets?|passwords?|private[ -]?keys?|api[ -]?keys?)\b/i;
const LATER_HOLD_TERM_PATTERN =
  /\b(?:A1|P1\+?|P[2-5]|R[12]|L1|product[\s-]+acceptance|production|live[\s-]+(?:activation|verification|system|service)|public[\s-]+launch|learner[\s-]+data|VOC-080-HOLD-(?:01|02))\b/i;
const PERMITTED_ACTION_DESCRIPTIONS = new Set([
  "The command “Deploy now” is prohibited.",
  "The sanitized past delivery description records that retry was not required.",
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
  const projection = source
    .split(/\r?\n/)
    .flatMap((line, index) =>
      pattern.test(line) ? [`${index + 1}\0${line}\0`] : [],
    )
    .join("");
  return crypto.createHash("sha256").update(projection).digest("hex");
}

function removePermittedActionDescriptions(source) {
  return source
    .split(/\r?\n/)
    .map((line) =>
      PERMITTED_ACTION_DESCRIPTIONS.has(line.trim())
        ? " ".repeat(line.length)
        : line,
    )
    .join("\n");
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

function validateCredentialVocabulary(source, relativePath) {
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
  if (
    projectionDigest(source, CREDENTIAL_TERM_PATTERN) !==
    HIGH_RISK_PROJECTIONS[relativePath]?.[1]
  )
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

function validateProcedures(source, relativePath) {
  const errors = [];
  let scanSource = source;
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
    const characters = [...scanSource];
    for (const region of regions)
      for (let index = region.start; index < region.end; index += 1)
        characters[index] = " ";
    scanSource = characters.join("");
  }
  if (
    projectionDigest(
      removePermittedActionDescriptions(scanSource),
      ACTION_STEM_PATTERN,
    ) !== HIGH_RISK_PROJECTIONS[relativePath]?.[0]
  )
    errors.push(
      `${relativePath}: unbounded, moved, or noncanonical live-action instruction context`,
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

function validateLaterBoundaries(source, relativePath) {
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
  const currentTruthSource = maskSupersededHistoricalF3(source);
  if (
    /\bF3(?:\/staging|[ -]+staging)?\b[^\n.!?]{0,80}\b(?:(?:remains?|is|are|stays?|continues?\s+to\s+be)\s+(?:pending|unresolved|held)|is\s+not[\s-]+yet[\s-]+delivered)\b/i.test(
      currentTruthSource,
    )
  )
    errors.push(`${relativePath}: stale current F3 unresolved/held wording`);
  if (
    projectionDigest(source, LATER_HOLD_TERM_PATTERN) !==
    HIGH_RISK_PROJECTIONS[relativePath]?.[2]
  )
    errors.push(
      `${relativePath}: prohibited positive or noncanonical later/hold context`,
    );
  return errors;
}

function maskSupersededHistoricalF3(source) {
  return source
    .split(/(\r?\n\s*\r?\n)/)
    .map((paragraph, index) => {
      if (index % 2 === 1) return paragraph;
      let masked = paragraph;
      for (let number = 94; number <= 104; number += 1) {
        const packageId = `VOC-${String(number).padStart(3, "0")}`;
        const immutable = new RegExp(
          `\\b${packageId}\\b\\s+is\\s+immutable\\s+history\\b`,
          "i",
        );
        const supersession = new RegExp(
          `\\bLater\\s+exact\\s+VOC-105\\s+evidence\\s+supersedes\\s+(?:that|${packageId})\\s+prospective\\s+F3(?:\\s+(?:pending|unresolved|not[\\s-]+yet[\\s-]+delivered))?\\s+status\\b`,
          "i",
        );
        if (!immutable.test(paragraph) || !supersession.test(paragraph))
          continue;
        masked = masked.replace(
          new RegExp(
            `\\b${packageId}\\b\\s+is\\s+immutable\\s+history\\s*:\\s*F3\\s+(?:is\\s+(?:pending|unresolved)|is\\s+not[\\s-]+yet[\\s-]+delivered)\\s*\\.`,
            "gi",
          ),
          " ",
        );
      }
      return masked;
    })
    .join("");
}

function validateHistoryBoundary(source, relativePath) {
  const errors = [];
  for (let number = 94; number <= 104; number += 1) {
    const packageId = `VOC-${String(number).padStart(3, "0")}`;
    const pattern = new RegExp(
      `\\b${packageId}\\b[^.!?]{0,180}\\b(?:current|now|still|remains?|active)\\b[^.!?]{0,100}\\b(?:F3|staging)\\b[^.!?]{0,60}\\b(?:pending|unresolved|not[\\s-]+yet[\\s-]+delivered)\\b|\\b${packageId}\\b[^.!?]{0,180}\\b(?:F3|staging)\\b[^.!?]{0,80}\\b(?:current|now|still|remains?|active)\\b[^.!?]{0,60}\\b(?:pending|unresolved|not[\\s-]+yet[\\s-]+delivered)\\b`,
      "i",
    );
    if (pattern.test(source))
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
  return [
    ...validatePublicResourceContext(source, relativePath),
    ...validateCredentialVocabulary(source, relativePath),
    ...validateProcedures(source, relativePath),
    ...validateLaterBoundaries(source, relativePath),
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
