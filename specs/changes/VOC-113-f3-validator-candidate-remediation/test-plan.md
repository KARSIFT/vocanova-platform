# VOC-113 — Test Plan

## VOC-113-TEST-00 — Governance, reproduction, and stopped identity

- Covers: `VOC-113-AC-00`
- Procedure: validate all nine artifacts, R4 floor, explicit
  `automatic_merge_allowed: true`, one-task/one-PR mapping, two-path future edit,
  review/adoption gates, and external exclusions. At exact stopped PR #209 SHA
  `841d263...`, execute the fixed VOC-111 manifest and require `903e7f80...`. Reproduce
  each issue #211 accepted mutation in a disposable copy and record the missing
  diagnostic. Record `7205f485...` as historical only.
- Expected: both defect classes reproduce; no prior digest is relabeled; draft plan
  grants no implementation or external authority.
- Evidence: `VOC-113-EV-00`

## VOC-113-TEST-01 — Canonical corpus and positive baseline

- Covers: `VOC-113-AC-01`
- Procedure: prove all nine exact designated paths exist/read independently. Run the
  corrected validator against the complete exact PR candidate and against byte-for-
  byte disposable copies. For each allowed secret name, held/unresolved boundary,
  current F3 statement, historical immutable reference, expected delivery status, and
  rollback proof, retain one explicit positive and prove path-specific scanning does
  not reject it.
- Expected: the canonical corpus passes; removing a surface produces its path-specific
  missing diagnostic; no accepted positive grants external authority.
- Evidence: `VOC-113-EV-01`

## VOC-113-TEST-02 — Every-surface disclosure and vocabulary matrix

- Covers: `VOC-113-AC-02`
- Procedure: on each of the nine designated files independently inject, one at a time:
  a labelled API-token value, generic secret value, password/private-key/API-key/
  access-token/account-ID value, RFC-4122 Worker UUID, and credential identifiers
  `THIRD_PARTY_SECRET`, `SENTRY_AUTH_TOKEN`, `OPENAI_API_KEY`, `CF_ACCOUNT_ID`, and an
  unknown `*_PASSWORD`. Separately prove the value-free names
  `CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_API_TOKEN` remain allowed, then attach a
  literal value to each and require rejection. Snapshot every other surface.
- Expected: every prohibited injection fails with the mutated path and disclosure or
  vocabulary diagnostic; only the two exact value-free interface names pass; fixture
  code reads no environment or credential.
- Evidence: `VOC-113-EV-02`

## VOC-113-TEST-03 — Every-surface live and later-boundary matrix

- Covers: `VOC-113-AC-03`
- Procedure: on each designated file, independently inject direct imperatives for
  dispatch, deploy, migrate, promote, upload/publish, credential rotation/installation,
  settings/resource/traffic/DNS mutation, production activation, and launch, including
  `Deploy now.` and staging/production targets. On each file inject one claim at a time
  for every subject family in D04, with absent/`is`/`has been` copulas and the union
  complete/completed/passed/accepted/effective/ready/active/enabled/released/resolved/
  verified/approved/authorized. Include production complete-effective, public-launch
  accepted, and learner-data-authorized exact reproductions plus mixed case/hyphen/
  whitespace variants. Independently remove/claim release of each inherited hold.
- Expected: every mutation fails for its path and intended action/boundary/hold reason;
  unresolved/held/skipped/no-action controls pass; no command executes.
- Evidence: `VOC-113-EV-03`

## VOC-113-TEST-04 — History/current isolation on every surface

- Covers: `VOC-113-AC-04`
- Procedure: for each VOC-094 through VOC-104 and each designated file, inject one
  prospective `pending` or `held` snapshot presented as current/now/still/remains/active.
  Independently remove the historical/immutable qualifier or later-evidence
  supersession boundary from canonical mixed-history surfaces. Add reordered sentences
  that retain both explicit boundaries as positives.
- Expected: history-as-current and current-as-old-pending fail with path/package-
  specific diagnostics; immutable historical context plus exact supersession passes;
  no historical package file changes.
- Evidence: `VOC-113-EV-04`

## VOC-113-TEST-05 — Exact structured gate, delivery, and rollback matrix

- Covers: `VOC-113-AC-05`
- Procedure: first require the exact canonical JSON object/key/array inventory. For
  every governed object/array/key independently omit, rename, duplicate raw, add
  unknown, change type, reorder an ordered array, or change a value. For every gate
  item test absent, duplicate, unknown ID/status, failed/skipped status, missing/wrong
  evidence, and extra item. For required/delivery-gate/staging-job and every delivery
  step/status test absent, failed, skipped, unknown, wrong type, renamed, duplicate,
  and extra key/status. Separately test missing/wrong rollback-baseline evidence and
  missing/wrong/unknown rollback-after-failure outcome; separately mutate production
  from `skipped-held`.
- Expected: one canonical record passes; every mutation fails with its exact object,
  item, field, step, or rollback diagnostic rather than a later unrelated error.
- Evidence: `VOC-113-EV-05`

## VOC-113-TEST-06 — Protected regression and exact replacement observation

- Covers: `VOC-113-AC-06`
- Procedure: retain all 26 existing focused cases unchanged in effect and inventory
  their names/assertion groups. Run both VOC-081/VOC-105 validators and focused suites,
  full `ci:foundation`, and `pnpm validate`. After the stable correction commit,
  capture exact head, fixed path list, each blob OID, and canonical digest immediately
  before and after these commands. Also run all VOC-110 profile/hybrid/false-claim and
  VOC-109 extension regressions.
- Expected: all checks pass; both manifest observations are byte-identical and name the
  replacement SHA/digest; any drift or regression stops PR #209 and starts a fresh
  governed candidate cycle.
- Evidence: `VOC-113-EV-06`

## VOC-113-TEST-07 — Exact revision, hosted review, and full rollback

- Covers: `VOC-113-AC-07`
- Procedure: run governance validation, risk classification, `git diff --check`,
  format/path audits, hosted required checks, and a disposable reverse of the complete
  PR #209 diff to base `5330844...`. Require exact base tree/no residue. Bind updated PR
  evidence plus fresh specialist and independent cross-model R4 verdicts to the final
  exact head; repeat after any edit.
- Expected: exactly the adopted two correction paths differ from stopped head; the
  complete PR still has exactly VOC-105's 12 paths; rollback restores exact base;
  reviewers report zero blockers; only a separate non-author may merge.
- Evidence: `VOC-113-EV-07`

## Commands

- `node scripts/foundation/voc081-f2-evidence-policy.mjs`
- `node scripts/foundation/voc105-f3-evidence-policy.mjs`
- `node --test scripts/foundation/voc081-f2-evidence-policy.test.mjs`
- `node --test scripts/foundation/voc105-f3-evidence-policy.test.mjs`
- `pnpm run ci:foundation`
- `pnpm validate`
- `bash scripts/governance/validate-governance.sh`
- `bash scripts/governance/classify-change-risk.sh`
- `git diff --check`
- exact stopped-head/corrected-head/full-base path audits
- disposable full PR #209 reverse/tree comparison

## Canonical replacement manifest

From the corrected PR #209 worktree, after proving `git rev-parse HEAD` is the stable
replacement head, run exactly:

```bash
for f in docs/README.md docs/operations/README.md docs/operations/cloudflare-delivery.md docs/operations/voc-081-f2-evidence.json docs/operations/voc-081-f2-evidence.md docs/operations/voc-105-f3-evidence.json docs/operations/voc-105-f3-evidence.md docs/product/12-mvp-implementation-plan.md docs/product/README.md package.json scripts/foundation/voc105-f3-evidence-policy.mjs scripts/foundation/voc105-f3-evidence-policy.test.mjs; do
  test -f "$f" || exit 1
  printf '%s\0' "$f"
  git hash-object "$f" | tr -d '\n'
  printf '\0'
done | sha256sum
```

Record all 12 `git hash-object` outputs as well as the first SHA-256 field. The command,
inventory, order, and framing are unchanged from VOC-111; only an adopted correction
may produce the replacement identity. Run it immediately before and after TEST-06.

No test runs Wrangler, contacts a network, reads a credential/environment value,
dispatches, deploys, migrates, changes settings/resources/traffic/DNS, accesses data,
spends, or launches.

## Evidence definitions

- `VOC-113-EV-00`: exact issue/reviewer reproduction, stopped identities, plan checks,
  reviews/adoption/bookkeeping, and non-author plan merge.
- `VOC-113-EV-01`: nine-path read/positive/missing-surface evidence.
- `VOC-113-EV-02`: every-surface disclosure/vocabulary matrix and no-secret proof.
- `VOC-113-EV-03`: every-surface live/later/hold matrix and no-execution proof.
- `VOC-113-EV-04`: VOC-094-104 history/current matrix.
- `VOC-113-EV-05`: exact schema/gate/delivery/rollback mutation matrix.
- `VOC-113-EV-06`: retained regression inventory, full deterministic results, and
  identical pre/post replacement manifest observation.
- `VOC-113-EV-07`: exact diff/hosted/reviews/PR binder/full-base rollback/merge evidence.
