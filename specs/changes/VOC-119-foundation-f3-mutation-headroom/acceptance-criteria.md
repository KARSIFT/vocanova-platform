# VOC-119 — Acceptance Criteria

## Gate A — Governance, allocation, and scope

### VOC-119-AC-00 — Exact intake and next free ID

- `change.yaml` records issue #228, PR #215 head
  `476ac55bb5ade513916fa3aacadd8c1a2742430b`, run `33527039103`, job
  `99920414097`, exact base `e1379508621ee228ae06c88ebcad3b1b018ef4cc`, and the
  draft plan branch.
- The package records that VOC-116 is current foundation timeout authority, VOC-118 is
  already consumed on `develop`, and `VOC-119` is the next free package ID as of
  2026-09-01.
- The package is `adopted`, binds `approved_candidate_sha` to
  `16d5b5cee3c6ece074edc1bde64c5ac1207ff4da`, authorizes one task and one future
  implementation PR, and grants no external-action authority.

### VOC-119-AC-01 — Exact one-file implementation boundary

- `implementation_paths` contains exactly
  `scripts/foundation/voc105-f3-evidence-policy.test.mjs`.
- `scripts/foundation/voc105-f3-evidence-policy.mjs`, `package.json`,
  `docs/development.md`, `.github/workflows/ci.yml`, `pnpm-lock.yaml`, and all other
  `scripts/foundation/*.test.mjs` files are explicit preservation surfaces.
- The package states that after the plan merges, implementation branches from the
  then-current exact `origin/develop`, records that implementation parent SHA/tree
  before editing, and stops and returns to planning if a second file, timeout
  change, workflow edit, or package-script change appears necessary.

## Gate B — Measured diagnosis and semantic boundary

### VOC-119-AC-02 — Read-only diagnosis is exact and falsifiable

- The package records the hosted named-test durations from issue #228 exactly.
- The package records the local planning measurements exactly: representative mutation
  path `56.882 ms`, `inspectF3Evidence()` `55.215 ms`, fixture/support work
  `1.668 ms`, and direct `inspectF3Surface()` `6.071 ms`.
- The package records that the 6,462-assertion `later authority claim...` estimates
  are about `356.8 s` for repeated `inspectF3Evidence()`, about `367.6 s` for the
  representative full mutation path, and `39.2 s` for the surface-local path, and
  that each is an inference from measured averages plus loop cardinality rather than
  a measured after result.
- The package explicitly states that fixture churn/process startup as the dominant
  cause was disproved by local profiling.

### VOC-119-AC-03 — Coverage-preserving optimization contract

- The planned implementation uses immutable canonical-source setup and direct
  surface-local validation only where one designated surface is the entire semantic
  subject of the mutation.
- Full `inspectF3Evidence()` remains required wherever record JSON validity,
  designated-surface existence, package-script wiring, or cross-file invariants are
  part of the assertion.
- The package prohibits mutation removal, coverage reduction, regex weakening,
  snapshot substitution, sharding, retry, and timeout increase.

## Gate C — CI and authority preservation

### VOC-119-AC-04 — Foundation contract remains exact

- The package preserves VOC-116's exact 20-minute hosted foundation cap and the exact
  `pnpm run ci:foundation` / `node --test scripts/foundation/*.test.mjs` discovery
  contract.
- The package prohibits any workflow, aggregate, package-script, or timeout change as
  part of VOC-119.

### VOC-119-AC-05 — Validation evidence is complete

- The test plan requires exact before/after durations for the five issue-named tests,
  the complete VOC-105 file, the complete foundation suite, and final hosted job
  headroom.
- The test plan requires focused VOC-105 tests, the full `ci:foundation` command,
  governance/risk/format/diff validation, exact path audits, and hosted required
  checks.
- The package states that any skipped test, count regression, timeout increase, or
  renewed near-cap hosted result blocks merge and issue closure.

### VOC-119-AC-06 — Rollback and monitoring are explicit

- The release plan specifies a complete one-file reviewed revert to the implementation
  parent if semantic behavior, counts, or hosted headroom regress.
- Post-merge monitoring tracks the five named tests, complete VOC-105 file, complete
  foundation suite, and hosted headroom on the exact merge SHA.

### VOC-119-AC-07 — Independent review and holds remain in force

- The package requires exact-SHA independent cross-model R3 review for both plan and
  implementation by distinct non-author actors, with no verdict transfer after an
  edit.
- The package states that no founder/steward approval is inferred from risk class and
  that no external-effect authority is granted.
