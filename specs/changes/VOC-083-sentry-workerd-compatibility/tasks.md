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
- Status: local-validation-complete; pending-independent-exact-SHA-review-and-hosted-proof

Own final qualification of T00/T01: add a complete fresh-artifact manifest/invariant and
fixture-backed log classification
to both local workerd smoke owners. Include failing unsupported-Wasm, missing/zero/
partial-inventory, and passing imported-precompiled-module fixtures; reorder `ci:web`
to build before compatibility/dry-run/smoke and make local-stack build/scan fresh output
before its own smoke. Run final canonical build/workerd/reporting-equivalence acceptance.
If it fails, stop, update T00's decision and T01 revision, then repeat with fresh exact-
SHA review; never silently select/ship a replacement. Preserve the service-binding and
disabled-DSN no-network contract.

## VOC-083-T03 — Documentation, exact-SHA review, and rollback evidence

- Requirements: all
- Acceptance: `VOC-083-AC-04`, `VOC-083-AC-05`
- Tests: `VOC-083-TEST-05`, `VOC-083-TEST-06`
- Evidence: `VOC-083-EV-05`, `VOC-083-EV-06`
- Status: blocked-by-T02

Reconcile affected active docs, run the proportionate final checks, independently
review the exact final revision with Cloudflare/Workers/Sentry specialization, and
rehearse repository-only rollback, and request a fresh exact-SHA review after the
preserved prior FAIL. Do not claim hosted proof, independent PASS before it exists, or
any live Sentry/Cloudflare outcome.
