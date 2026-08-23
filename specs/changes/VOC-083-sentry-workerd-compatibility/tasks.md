# VOC-083 — Tasks

## VOC-083-T00 — Evidence matrix and candidate decision

- Requirements: `VOC-083-R00`
- Acceptance: `VOC-083-AC-00`
- Tests: `VOC-083-TEST-00`
- Evidence: `VOC-083-EV-00`
- Status: complete-provisional-workers-native-selection-recorded-in-VOC-083-EV-00

After adoption, inventory direct/transitive Sentry imports and
generated bundle locations, retrieve current primary-source compatibility evidence,
and compare configuration fix, package update, and Workers-native adapter. Document an
exact selected version/configuration and rejected alternatives only after reporting-
compatibility evidence. If needed, test candidates only in fresh isolated worktrees with
local simulation/synthetic non-secret values; record sanitized results and fully discard
or revert each probe. T00 commits only its matrix/provisional decision, not probe code,
and does not change the canonical task branch's runtime/config, dependency manifest/
lockfile, tests, CI, or active docs. T01 remains blocked until this record is complete;
T00 does not claim final canonical acceptance.

## VOC-083-T01 — Preserve reporting with the selected Workers-safe repair

- Requirements: `VOC-083-R01`, `VOC-083-R02`
- Acceptance: `VOC-083-AC-01`, `VOC-083-AC-02`
- Tests: `VOC-083-TEST-01`, `VOC-083-TEST-02`
- Evidence: `VOC-083-EV-01`, `VOC-083-EV-02`
- Status: complete-merged-through-PR-115

Apply the T00 provisional choice canonically, regenerate/review any lockfile change,
and preserve server/Worker/browser capture/privacy controls. Prepare deterministic
non-network reporting seams but leave final generated-bundle/workerd/reporting-
equivalence acceptance to T02. Do not turn off Sentry or source-map controls.

## VOC-083-T02 — Generated-bundle and workerd-log fail-closed evidence

- Requirements: `VOC-083-R01`, `VOC-083-R02`, `VOC-083-R03`, `VOC-083-R04`
- Acceptance: `VOC-083-AC-01`, `VOC-083-AC-02`, `VOC-083-AC-03`, `VOC-083-AC-04`
- Tests: `VOC-083-TEST-01`, `VOC-083-TEST-02`, `VOC-083-TEST-03`, `VOC-083-TEST-04`
- Evidence: `VOC-083-EV-01`, `VOC-083-EV-02`, `VOC-083-EV-03`, `VOC-083-EV-04`
- Status: complete; prior-exact-SHA-FAIL-preserved; exact-SHA e3a71a13eedfc8fef05b580280047e41f320de48
  passed formal review and merged through PR #116 as 23da9da69bb27529994e70d4bf6e9a0a78ea26b6;
  hosted and post-merge evidence recorded in t03-evidence.md

Own final qualification of T00/T01: add a complete fresh-artifact manifest/invariant and
fixture-backed log classification
to both local workerd smoke owners. Include failing unsupported-Wasm, missing/zero/
partial-inventory, and passing imported-precompiled-module fixtures; reorder `ci:web`
to build before compatibility/dry-run/smoke and make local-stack build/scan fresh output
before its own smoke. Run final canonical build/workerd/reporting-equivalence acceptance.
If it fails, stop, update T00's decision and T01 revision, then repeat with fresh exact-
SHA review; never silently select/ship a replacement. Preserve the service-binding and
disabled-DSN no-network contract.

The independent review of
`ab1b24d527f2d71649efb61cc1a8475535de282b` recorded **FAIL** with five blockers.
Remediation keeps that verdict intact while adding deterministic final-bundle
canonicalization, complete every-module/reference/Wasm checks, global-object Wasm
alias detection, close-aware incremental diagnostics in both owners, fresh distinct
retry ports, and standalone Sentry environment stripping. Local evidence does not
replace the required fresh exact-revision review or hosted proof; the remediated T02
revision subsequently supplied both, and its repository-only ten-commit rollback to
the exact T01 revision `9f11195ed186e214fade57884e66ca96f2498ebc` passed.

## VOC-083-T03 — Documentation, exact-SHA review, and rollback evidence

- Requirements: all
- Acceptance: `VOC-083-AC-04`, `VOC-083-AC-05`
- Tests: `VOC-083-TEST-05`, `VOC-083-TEST-06`
- Evidence: `VOC-083-EV-05`, `VOC-083-EV-06`
- Status: candidate-reconciliation-recorded; pending T03's own exact-final-SHA
  specialist review, hosted proof, and ordinary repository rollback

Reconcile affected active docs, run the proportionate final checks, independently
review the exact final revision with Cloudflare/Workers/Sentry specialization, and
rehearse repository-only rollback. The candidate inventory records that no additional
runtime/configuration/dependency/active-document edit was necessary because T02
reconciled every declared affected surface. T03 must request and record its own
exact-SHA review after the preserved prior FAIL, plus hosted proof and an ordinary
rollback, before closure. Do not claim a T03 PR number, final SHA, review, hosted
result, or any live Sentry/Cloudflare outcome in advance.
