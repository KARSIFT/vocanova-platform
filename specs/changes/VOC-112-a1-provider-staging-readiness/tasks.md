# VOC-112 — Tasks

## VOC-112-T00 — Complete the repository-side A1 provider boundary

- Requirements: `VOC-112-D00` through `VOC-112-D09`
- Acceptance criteria: `VOC-112-AC-00` through `VOC-112-AC-06`
- Tests: `VOC-112-TEST-00` through `VOC-112-TEST-08`
- Evidence: `VOC-112-EV-00` through `VOC-112-EV-08`
- Risk: R3
- Implementation PR mapping: one coherent PR into `develop`
- Status: pending plan review, adoption, prerequisite, and implementation

Add and wire the bounded Google OAuth and transactional-email adapters; establish the
typed fail-closed dependency/configuration boundary; preserve schema, contract,
session, authorization, web, and held-environment behavior; enforce literal provider
requests, exact response ceilings/reader cleanup, redirect/header/URL/avatar safety,
mixed-capability independence, exact fifteen paths, delivery-policy reconciliation,
and deterministic runbook validation; add security/browser evidence and the pending
staging procedure; validate/revert-rehearse; obtain distinct specialist and independent
R3 reviews; and merge through a separate actor.

One task is minimum sufficient because every deliverable controls the same auth entry
and provider-secret trust boundary. Task IDs are traceability groupings, not reasons to
split branches or PRs. Live provider/settings/deployment work is prohibited, not an
unrecorded subtask.
