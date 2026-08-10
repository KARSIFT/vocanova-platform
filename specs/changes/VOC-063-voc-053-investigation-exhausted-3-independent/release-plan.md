# VOC-063 — Release Plan

## Release and deployment authorization

This package requests no new deployment authority. Once adopted and implemented,
each task's pull request follows the existing governed path: independent review,
then automatic merge into `develop` (per `karsift-ai-infra`'s `merge-gate.yml`),
then — per AGENTS.md's "Release and deployment authority" section — automatic
promotion to `main` and automatic production deployment once this package's task
roster closes. This package does not alter any of that mechanism.

No production deployment effect is expected: changes are confined to a staging
E2E test file and package documentation.

## Preconditions, monitoring, and outcome

Preconditions:

- This package is adopted with explicit acceptance of `VOC-063-DEP-01`.
- `VOC-063-T01` merges to `develop` before `VOC-063-T02` can record staging
  verification evidence.

Monitoring: `deploy-staging.yml`'s post-deploy execution of
`tests/staging-e2e/core-loop.staging.spec.ts` is the direct evidence source.
Watch for:

- Step 7 pass/fail.
- `testInfo.annotations` entries reporting retry usage (operational signal that
  the transient-read hypothesis may still be occurring even when the gate passes).
- Any regression in steps 1–6 or 8–10 (out of scope for this change but would
  indicate an accidental broader edit).

Outcome owner: whoever implements `VOC-063-T02` records the passing staging run
in `VOC-063-EV-02`.

This package's completion unblocks VOC-052-T01's staging E2E evidence requirement
(the same dependency VOC-053 was opened to address) by making the gate more
resilient rather than fixing a located production defect.

## Rollback

Trigger: persistent staging gate failures attributable to `VOC-063-T01`, or
independent review finding unbounded retry behavior.

Mechanism: revert `VOC-063-T01`'s diff.

Validation: confirm a subsequent staging deploy runs the reverted spec; record
whether the original intermittent step-7 failure mode returns.

Accountable owner: implementer of `VOC-063-T01`.

Last-known-good reference: `apps/web/tests/staging-e2e/core-loop.staging.spec.ts`
revision immediately preceding `VOC-063-T01`'s merge.

## Independent verification, human approvals, and closure

Independent verification must confirm, against the exact implemented revision's
commit SHA:

- `VOC-063-DEP-01` was explicitly accepted at adoption (not silently assumed).
- VOC-053 supersession documentation is accurate and does not alter VOC-053's
  adopted authorization fields.
- Step 7 retry is bounded and preserves the invariant.
- Diagnostic code is fully removed.
- Real staging verification evidence meets `VOC-063-AC-03`/`AC-04`.
- No unrelated change was introduced.

Under active A-003 (`a003-active`), no standing technical-steward or founder
approval is silently assumed beyond what adoption records for the deliberate
scope change reversing VOC-053's non-goal. R4 consequences are not anticipated;
if the independent verifier finds semantic risk above R2, escalate rather than
self-approve.

Repository merge into `develop` and production release/deployment are not the
same event as closure — closure requires this package's acceptance criteria
recorded as passing with linked evidence.
