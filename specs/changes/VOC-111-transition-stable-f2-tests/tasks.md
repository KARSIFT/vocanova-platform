# VOC-111 — Tasks

## VOC-111-T00 — Make the focused F2 verifier profile-transition stable

- Requirement source: `VOC-111-D00` through `VOC-111-D08`
- Acceptance criteria: `VOC-111-AC-00` through `VOC-111-AC-06`
- Tests: `VOC-111-TEST-00` through `VOC-111-TEST-06`
- Evidence: `VOC-111-EV-00` through `VOC-111-EV-06`
- Implementation pull-request mapping: one coherent implementation PR
- Risk: R3
- Status: pending review and adoption

Change only `scripts/foundation/voc081-f2-evidence-policy.test.mjs`. Select the active
profile from the complete exact record, inject duplicate raw members without a fixed
profile value, and use explicit plan-owned pre/future surface sources for complete
profile and both-direction hybrid fixtures. Retain every VOC-110 and VOC-109 assertion
unchanged in effect, complete deterministic/rollback evidence, obtain specialist and
independent exact-SHA reviews, and observe the first real VOC-105 candidate. Do not
edit the runtime validator or perform any external action.

One task is the minimum-sufficient unit because the three stale assumptions and their
transition proof share one executable test boundary and one rollback point. Splitting
them would leave the protected suite knowingly profile-dependent and duplicate branch,
coordination, elapsed-time, repeated-check, exact-review, and bookkeeping overhead
without a releasable or rollback-safe partial outcome.
