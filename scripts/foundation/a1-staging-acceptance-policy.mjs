import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";

import { parseStrictJson } from "./cloudflare-delivery-policy.mjs";

export const RUNBOOK_PATH = "docs/operations/a1-staging-acceptance.md";
export const OPERATIONS_INDEX_PATH = "docs/operations/README.md";
export const PENDING_STATUS = "pending-separate-authority";
export const REQUIRED_CHECK_IDS = [
  "exact-sha-attempt-binding",
  "magic-link-request-receipt-single-consume",
  "magic-link-replay-denial",
  "magic-link-redacted-logs",
  "google-start-callback",
  "google-mismatched-state-denial",
  "google-replayed-state-denial",
  "session-navigation",
  "onboarding-routing",
  "logout-old-cookie-denial",
  "unauthenticated-denial",
  "two-user-cross-access-denial",
  "csrf-denial",
  "disabled-user-denial",
  "abuse-limit",
  "email-provider-kill-switch",
  "google-provider-kill-switch",
  "exact-worker-rollback",
  "forward-only-d1-integrity",
];
export const REQUIRED_LATER_AUTHORITY_KEYS = [
  "provider_accounts_and_selection",
  "contracts_and_spend",
  "google_oauth_client_and_redirect_allowlist",
  "email_sender_domain_and_inbox",
  "credential_creation_installation_rotation",
  "disposable_test_identities_and_retention",
  "staging_dispatch_and_deployment",
  "evidence_minimization",
  "rollback_owner_and_procedure",
  "completion_or_expiry",
];

const BEGIN = "<!-- A1-STAGING-ACCEPTANCE-RECORD-BEGIN -->";
const END = "<!-- A1-STAGING-ACCEPTANCE-RECORD-END -->";
const TOP_LEVEL_KEYS = [
  "schema_version",
  "record_status",
  "a1_milestone_status",
  "external_effects_by_voc112",
  "exact_binding",
  "provider_status",
  "checks",
  "later_authority",
  "production_holds",
];
const CHECK_MARKERS = {
  "exact-sha-attempt-binding": ["exact repository SHA", "positive attempt"],
  "magic-link-request-receipt-single-consume": [
    "disposable non-production inbox",
    "consume it exactly once",
  ],
  "magic-link-replay-denial": ["Replay", "denial"],
  "magic-link-redacted-logs": ["sanitized logs", "redacted evidence"],
  "google-start-callback": [
    "disposable non-production Google identity",
    "allowlisted redirect",
  ],
  "google-mismatched-state-denial": ["mismatched OAuth state", "denial"],
  "google-replayed-state-denial": ["Replay", "OAuth state"],
  "session-navigation": ["protected navigation", "fixed lifetime"],
  "onboarding-routing": ["onboarding routing", "protected destination"],
  "logout-old-cookie-denial": ["old session cookie", "denied"],
  "unauthenticated-denial": ["without authentication", "denial"],
  "two-user-cross-access-denial": ["two disposable", "requester boundary"],
  "csrf-denial": ["absent and mismatched CSRF", "without mutation"],
  "disabled-user-denial": ["Disable a disposable", "denied"],
  "abuse-limit": ["abuse limit", "account enumeration"],
  "email-provider-kill-switch": [
    "only the email provider switch",
    "no network call",
  ],
  "google-provider-kill-switch": [
    "only the Google provider switch",
    "no network call",
  ],
  "exact-worker-rollback": ["exact prior Worker version", "rollback evidence"],
  "forward-only-d1-integrity": [
    "no schema change is expected",
    "forward correction",
  ],
};

export function inspectA1StagingAcceptance({ runbook, operationsIndex }) {
  const errors = [];
  const record = extractRecord(runbook, errors);
  inspectIndex(operationsIndex, errors);
  inspectText(runbook, errors);
  if (record) inspectRecord(record, errors);
  return errors;
}

export function validateA1StagingAcceptance(repositoryRoot) {
  const errors = [];
  let runbook;
  let operationsIndex;
  try {
    runbook = readFileSync(resolve(repositoryRoot, RUNBOOK_PATH), "utf8");
  } catch {
    errors.push(`${RUNBOOK_PATH}: missing or unreadable`);
  }
  try {
    operationsIndex = readFileSync(
      resolve(repositoryRoot, OPERATIONS_INDEX_PATH),
      "utf8",
    );
  } catch {
    errors.push(`${OPERATIONS_INDEX_PATH}: missing or unreadable`);
  }
  if (runbook === undefined || operationsIndex === undefined) return errors;
  return inspectA1StagingAcceptance({ runbook, operationsIndex });
}

function extractRecord(source, errors) {
  if (occurrences(source, BEGIN) !== 1 || occurrences(source, END) !== 1) {
    errors.push("runbook must contain exactly one delimited A1 record");
    return null;
  }
  const start = source.indexOf(BEGIN) + BEGIN.length;
  const finish = source.indexOf(END, start);
  if (finish < start) {
    errors.push("A1 record delimiters are out of order");
    return null;
  }
  const block = source.slice(start, finish).trim();
  const match = /^```json\s*([\s\S]*?)\s*```$/u.exec(block);
  if (!match) {
    errors.push("A1 record must be one JSON code block");
    return null;
  }
  try {
    return parseStrictJson(match[1]);
  } catch (error) {
    errors.push(`A1 record JSON is invalid: ${safeMessage(error)}`);
    return null;
  }
}

function inspectIndex(source, errors) {
  const encodedPath = "%61%31-%73taging-acceptance.md";
  const linked = source
    .split("\n")
    .filter((line) => line.includes(`(${encodedPath})`));
  if (linked.length !== 1)
    errors.push("operations index must contain exactly one A1 runbook link");
  else if (
    !/^RUNBOOK: \[Procedure template\]\(%61%31-%73taging-acceptance\.md\) — pending-separate-authority; owner: operator; related: DOC-12, VOC-112\.$/u.test(
      linked[0],
    )
  )
    errors.push("operations index A1 row is not exact");
  if (decodeURIComponent(encodedPath) !== "a1-staging-acceptance.md")
    errors.push(
      "operations index A1 link does not resolve to the runbook path",
    );
}

function inspectText(source, errors) {
  for (const required of [
    "No step may be executed under VOC-112 authority.",
    "A1 remains unresolved.",
    "VOC-080-HOLD-01",
    "VOC-080-HOLD-02",
    "forward correction",
    "redacted evidence",
    "provider switch",
    "later action record",
  ]) {
    if (!source.includes(required))
      errors.push(`runbook is missing: ${required}`);
  }
  if (
    /\bA1\s+(?:is|was|became)\s+(?:accepted|complete|completed|complete-effective)\b/iu.test(
      source,
    )
  )
    errors.push("runbook contains a prohibited A1 completion claim");
  if (
    /\b(?:was|were|has been|have been)\s+(?:enabled|executed|dispatched|deployed|sent|received)\b/iu.test(
      source,
    )
  )
    errors.push("runbook contains a prohibited live-result claim");
  if (
    /\b(?:Google|email|magic link|OAuth|provider)\s+(?:is|are)\s+enabled\b/iu.test(
      source,
    )
  )
    errors.push("runbook contains a prohibited provider-enablement claim");
  if (
    /\b(?:result|status|evidence)\s*[:=]\s*(?:pass|success|complete|completed|live)\b/iu.test(
      source,
    )
  )
    errors.push("runbook contains a prohibited completed result");
  if (/\b[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9.-]+\.[a-z]{2,}\b/iu.test(source))
    errors.push("runbook contains an email address");
  if (
    /\b[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\b/iu.test(
      source,
    )
  )
    errors.push("runbook contains a UUID or Worker version");
  if (/\b[0-9a-f]{40}\b/iu.test(source))
    errors.push("runbook contains an exact repository SHA");
  if (
    /\b(?:api[_ -]?key|bearer|jwt|oauth[_ -]?code|password|client[_ -]?secret|secret)\s*[:=]\s*["']?(?!pending|none)[a-z0-9_-]{4,}/iu.test(
      source,
    )
  )
    errors.push("runbook contains a credential-like value");
  if (
    /\b(?:run(?:_id| ID)|account(?:_id| ID))\s*[:=]\s*["']?[0-9]{4,}/iu.test(
      source,
    )
  )
    errors.push("runbook contains a run or account identifier");
  if (
    /\bpersonal (?:name|identity)\s*[:=]\s*["']?[a-z][a-z -]{2,}/iu.test(source)
  )
    errors.push("runbook contains personal identity data");
}

function inspectRecord(record, errors) {
  if (!isRecord(record)) {
    errors.push("A1 record must be an object");
    return;
  }
  exactKeys(record, TOP_LEVEL_KEYS, "A1 record", errors);
  expectEqual(
    record.schema_version,
    "vocanova-a1-staging-acceptance-v1",
    "schema_version",
    errors,
  );
  expectEqual(record.record_status, PENDING_STATUS, "record_status", errors);
  expectEqual(
    record.a1_milestone_status,
    PENDING_STATUS,
    "a1_milestone_status",
    errors,
  );
  expectEqual(
    record.external_effects_by_voc112,
    "none-repository-only",
    "external_effects_by_voc112",
    errors,
  );

  if (isRecord(record.exact_binding)) {
    exactKeys(
      record.exact_binding,
      [
        "exact_repository_sha",
        "workflow_run_id",
        "run_attempt",
        "action_authority_record",
        "result",
        "evidence",
      ],
      "exact_binding",
      errors,
    );
    for (const [key, expected] of Object.entries({
      exact_repository_sha: "PENDING_EXACT_40_HEX_SHA",
      workflow_run_id: "PENDING_AUTHORIZED_RUN_ID",
      run_attempt: "PENDING_POSITIVE_INTEGER_ATTEMPT",
      action_authority_record: "PENDING_LATER_ACTION_RECORD",
      result: PENDING_STATUS,
      evidence: PENDING_STATUS,
    }))
      expectEqual(
        record.exact_binding[key],
        expected,
        `exact_binding.${key}`,
        errors,
      );
  } else errors.push("exact_binding must be an object");

  if (isRecord(record.provider_status)) {
    exactKeys(
      record.provider_status,
      ["email_magic_link", "google_oauth"],
      "provider_status",
      errors,
    );
    for (const key of ["email_magic_link", "google_oauth"])
      expectEqual(
        record.provider_status[key],
        PENDING_STATUS,
        `provider_status.${key}`,
        errors,
      );
  } else errors.push("provider_status must be an object");

  inspectChecks(record.checks, errors);
  if (isRecord(record.later_authority)) {
    exactKeys(
      record.later_authority,
      REQUIRED_LATER_AUTHORITY_KEYS,
      "later_authority",
      errors,
    );
    for (const key of REQUIRED_LATER_AUTHORITY_KEYS)
      expectEqual(
        record.later_authority[key],
        PENDING_STATUS,
        `later_authority.${key}`,
        errors,
      );
  } else errors.push("later_authority must be an object");

  const expectedHolds = [
    { id: "VOC-080-HOLD-01", state: "held" },
    { id: "VOC-080-HOLD-02", state: "held" },
  ];
  if (JSON.stringify(record.production_holds) !== JSON.stringify(expectedHolds))
    errors.push("production_holds must retain the exact ordered held pair");
}

function inspectChecks(checks, errors) {
  if (!Array.isArray(checks)) {
    errors.push("checks must be an array");
    return;
  }
  const ids = checks.map((check) => (isRecord(check) ? check.id : undefined));
  if (JSON.stringify(ids) !== JSON.stringify(REQUIRED_CHECK_IDS))
    errors.push("checks must contain the exact ordered required IDs");
  for (const check of checks) {
    if (!isRecord(check)) {
      errors.push("each check must be an object");
      continue;
    }
    exactKeys(
      check,
      ["id", "procedure", "result", "evidence"],
      `check ${String(check.id)}`,
      errors,
    );
    expectEqual(
      check.result,
      PENDING_STATUS,
      `check ${String(check.id)} result`,
      errors,
    );
    expectEqual(
      check.evidence,
      PENDING_STATUS,
      `check ${String(check.id)} evidence`,
      errors,
    );
    if (
      typeof check.procedure !== "string" ||
      check.procedure.trim().length < 20
    )
      errors.push(`check ${String(check.id)} procedure is missing`);
    const markers = CHECK_MARKERS[check.id];
    if (!markers) continue;
    for (const marker of markers)
      if (!check.procedure.includes(marker))
        errors.push(`check ${check.id} procedure is missing marker: ${marker}`);
  }
}

function exactKeys(value, expected, label, errors) {
  const actual = Object.keys(value);
  if (JSON.stringify(actual) !== JSON.stringify(expected))
    errors.push(`${label} keys are not exact`);
}

function expectEqual(actual, expected, label, errors) {
  if (actual !== expected) errors.push(`${label} must equal ${expected}`);
}

function occurrences(source, token) {
  return source.split(token).length - 1;
}

function isRecord(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function safeMessage(error) {
  return error instanceof Error ? error.message : "unknown parse failure";
}

if (
  process.argv[1] &&
  fileURLToPath(import.meta.url) === resolve(process.argv[1])
) {
  const repositoryRoot = resolve(import.meta.dirname, "../..");
  const errors = validateA1StagingAcceptance(repositoryRoot);
  if (errors.length > 0) {
    for (const error of errors) console.error(`A1 staging policy: ${error}`);
    process.exitCode = 1;
  } else {
    console.log("A1 staging acceptance policy: PASS");
  }
}
