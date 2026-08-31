# VOC-104 — Test Plan

## VOC-104-TEST-00 — Governance, scope, and delivery shape

- Covers: `VOC-104-AC-00`
- Procedure: run governance validation and risk classification; inspect package
  lifecycle, exact path inventory, one-task/one-PR mapping, authority exclusions,
  automatic-merge drafting, and the implementation diff.
- Expected: the draft remains unauthorized until exact-candidate reviews and
  adoption; plan path floor is R1, implementation path and effective risk are R3;
  exactly three implementation paths are allowed; no external action is authorized.
- Evidence: `VOC-104-EV-00`

## VOC-104-TEST-01 — File-backed workflow shape fails closed

- Covers: `VOC-104-AC-01`
- Procedure: run `inspectDeliveryWorkflow()` against the final workflow and focused
  mutations that restore either direct pipe, remove a capture, share a capture across
  Workers, swap resolver inputs, start resolution before the matching list command
  completes, remove failure-safe cleanup, print/persist JSON, or bypass exact output
  assignment.
- Expected: the final workflow has no errors; every mutation has at least one focused
  error. Each list command exits before the corresponding resolver starts, paths are
  distinct and quoted, and cleanup cannot mask the primary status.
- Evidence: `VOC-104-EV-01`

## VOC-104-TEST-02 — Complete JSON and exact resolver behavior

- Covers: `VOC-104-AC-02`
- Procedure: in an isolated temporary directory with network unavailable, have a
  child producer write a synthetic versions array in multiple chunks and exit. Only
  after successful completion, invoke the policy CLI with the completed file as stdin
  and the exact synthetic tag. Repeat with truncated JSON, an invalid UUID, no exact
  tag, and two exact-tag matches.
- Expected: only the complete unambiguous document prints the exact synthetic UUID
  and exits zero. Every negative input exits nonzero, prints no accepted UUID, and
  makes no network request. No Wrangler or protected ID is used.
- Evidence: `VOC-104-EV-02`

## VOC-104-TEST-03 — Ordering and partial-state handling

- Covers: `VOC-104-AC-03`
- Procedure: inspect the staging steps and mutate list/capture/resolve failures and
  ordering. Assert that current serving deployment readback precedes migration,
  migration precedes immutable uploads, both completed resolutions precede promotion,
  and promotion precedes smoke. Confirm rollback remains conditioned on promotion
  having begun and a fresh tag includes SHA prefix, run ID, and attempt.
- Expected: pre-promotion failures leave promotion/smoke skipped and cannot activate
  rollback or traffic. Earlier unpromoted versions cannot match a future run/attempt
  tag. Applied compatible migrations remain forward-only partial state.
- Evidence: `VOC-104-EV-03`

## VOC-104-TEST-04 — Regression, invariants, and exact revision

- Covers: `VOC-104-AC-04`
- Procedure: run the focused test file, delivery validation, complete foundation and
  workspace checks, governance validation, risk classification, and
  `git diff --check`. Inspect the exact implementation diff and obtain specialist and
  independent R3 review of that SHA.
- Expected: all applicable commands pass; every pre-existing negative delivery test,
  secret boundary, rollback guard, and production hold remains intact; only the three
  approved files differ; historical packages have zero diff; distinct non-author
  reviews have zero unresolved blocking findings.
- Evidence: `VOC-104-EV-04`

## VOC-104-TEST-05 — Post-merge staging outcome

- Covers: `VOC-104-AC-05`
- Procedure: only under separate existing dispatch authority after implementation
  merge, review the exact SHA/run/attempt, use the normal environment approval path,
  and inspect sanitized step outcomes. Do not copy secret values, JSON bodies,
  temporary paths, or version UUIDs into repository evidence.
- Expected: either exact promotion and bounded smoke succeed, or a repaired
  list/resolve failure occurs before promotion and proves traffic unchanged. If a
  failure occurs after promotion begins, both rollback attempts and their result are
  recorded under the existing policy; it does not satisfy the no-promotion branch.
- Evidence: `VOC-104-EV-05`

## Sanitized baseline evidence

At exact base SHA `53be9f7aa7aada15faedd0588686b26a4c652ecb`, the workflow
contains two direct list-to-resolver pipelines, one for API and one for web. The
existing workflow inspector returns no error for that shape, demonstrating the
deterministic coverage gap. This source-only observation uses no network, secret, or
protected version value.

Hosted run `33372680216`, attempt 1, supplies the behavioral evidence: ordered D1
migration and both immutable uploads completed; version resolution then failed with
`EAGAIN`/`EPIPE`; promotion, smoke, promotion rollback, and production were skipped.
The pipe-lifetime mechanism remains a hypothesis; the required file-backed handoff is
safe without depending on that hypothesis being conclusively proven.

## Commands

- `node --test scripts/foundation/cloudflare-delivery-policy.test.mjs`
- `node scripts/foundation/cloudflare-delivery-policy.mjs`
- `pnpm run ci:delivery`
- `pnpm run ci:foundation`
- `pnpm validate`
- `bash scripts/governance/validate-governance.sh`
- `bash scripts/governance/classify-change-risk.sh`
- `git diff --check`

## Evidence definitions

- `VOC-104-EV-00`: exact plan review/adoption record, package validation, path/risk
  evidence, hosted plan checks, and normal different-actor plan merge.
- `VOC-104-EV-01`: focused final workflow and negative shape-mutation results at the
  exact implementation SHA.
- `VOC-104-EV-02`: isolated complete/truncated/ambiguous synthetic JSON child-process
  results proving exact file-backed resolver behavior.
- `VOC-104-EV-03`: exact ordering, pre-promotion stop, fresh-tag isolation, and
  partial-state inspection evidence.
- `VOC-104-EV-04`: complete local/hosted checks, exact three-file diff, historical
  package zero-diff proof, exact-SHA specialist/independent R3 verdicts, and normal
  different-actor merge evidence.
- `VOC-104-EV-05`: later separately authorized staging run's sanitized promotion,
  smoke, no-promotion, or applicable rollback outcome without protected values.

No test may use a real secret, protected workflow-log value, production data, live
GitHub mutation, Cloudflare API, Wrangler network command, workflow dispatch, or
deployment.
