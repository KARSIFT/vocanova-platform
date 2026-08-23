# VOC-084 — Test Plan

## VOC-084-TEST-00 — Exact inventory schema and evidence audit

- Covers: `VOC-084-AC-00`
- Preconditions: adopted package and read-only access to existing public GitHub evidence
- Procedure: validate YAML/JSON structure, unique package/task IDs, exact 40-character
  SHAs, PR/merge mappings, verdicts, hosted applicability, rollback, and required FAILs;
  manually cross-check every URL before the exact-SHA review.
- Expected: every VOC-080 through VOC-083 task has complete non-placeholder evidence;
  contradictory or missing evidence blocks.
- Evidence: `VOC-084-EV-00`

## VOC-084-TEST-01 — VOC-080/VOC-081 active-claim reconciliation

- Covers: `VOC-084-AC-01`
- Preconditions: `VOC-084-T00` inventory
- Procedure: parse designated active fields in `change.yaml`, `tasks.md`,
  `acceptance-criteria.md`, README, and evidence records; compare task/criterion status
  and limitations to the inventory and inherited holds.
- Expected: completed repository work is complete, historical text remains historical,
  and live/F3/A1/production claims remain absent or held.
- Evidence: `VOC-084-EV-01`

## VOC-084-TEST-02 — VOC-082/VOC-083 active-claim reconciliation

- Covers: `VOC-084-AC-02`
- Preconditions: `VOC-084-T00` inventory
- Procedure: perform the same targeted comparison for VOC-082 and VOC-083, including
  required historical FAIL and later PASS identities.
- Expected: closure claims align and no failure is lost or converted to approval.
- Evidence: `VOC-084-EV-02`

## VOC-084-TEST-03 — Positive static closure contract

- Covers: `VOC-084-AC-03`
- Preconditions: reconciled task branches
- Procedure: run the new validator directly and through `pnpm run ci:foundation`.
- Expected: both pass without network, credentials, GitHub CLI, or mutable external
  state.
- Evidence: `VOC-084-EV-03`

## VOC-084-TEST-04 — Independent fail-closed fixtures

- Covers: `VOC-084-AC-03`
- Preconditions: isolated temporary fixture copies
- Procedure: independently mutate stale active status, evidence omission, FAIL verdict,
  inherited hold, identifier mapping, placeholder SHA/URL, and aggregate hook.
- Expected: every mutation fails for its own concrete reason; no fixture relies on a
  prior mutation or long-running/background process.
- Evidence: `VOC-084-EV-03`

## VOC-084-TEST-05 — Governance, scope, and no-live inventory

- Covers: `VOC-084-AC-04`, `VOC-084-AC-05`
- Preconditions: exact final candidate
- Procedure: run governance validation, risk classification, governance unit tests,
  foundation validation, formatting, audit as applicable, `git diff --check`, and a
  semantic scan for settings/runtime/live-action drift.
- Expected: R3 or higher declared risk passes; exactly four workflows remain; no live,
  settings, runtime, secret, deployment, or `main` mutation exists.
- Evidence: `VOC-084-EV-04`, `VOC-084-EV-05`

## VOC-084-TEST-06 — Exact review, hosted proof, and reverse rollback

- Covers: `VOC-084-AC-05`
- Preconditions: final task revisions with completed builder evidence
- Procedure: revert tasks in reverse order in a disposable worktree, validate each
  boundary and exact predecessor tree, remove the worktree, obtain a different-role
  exact-SHA semantic review without duplicating long suites, then run applicable hosted
  Actions and post-merge checks.
- Expected: rollback and tree equality pass; reviewer returns PASS with zero unresolved
  blockers; hosted required checks pass; no deployment job runs.
- Evidence: `VOC-084-EV-05`
