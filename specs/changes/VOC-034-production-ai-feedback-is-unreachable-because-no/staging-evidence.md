# VOC-034 — Staging and Live-Verification Evidence

## Purpose

This document records the evidence required by `VOC-034-AC-10` (via
`VOC-034-TEST-10`) — the live-staging verification issue #216 requires to actually
unblock `KARSIFT/vocanova-platform-sandbox#185` (VOC-032-T09). It is drafted before
adoption/implementation, mirroring `VOC-032`'s and `VOC-031`'s `staging-evidence.md`
convention, and is updated once `VOC-034-T03` actually executes.

## Current status

As of this draft (2026-07-30), no task in this package has been implemented, so no
live exercise has run under this package's own scope. The prerequisite credential
this exercise depends on is **already resolved**, unlike most prior milestones'
staging-evidence blockers: per issue #216's own reproduction
(2026-07-30T20:26:55Z), staging already has `AI_PROVIDER=opencode`, a working
private Docker-gateway OpenCode base URL, a non-empty application bearer,
`AI_PROVIDER_MODEL=opencode-go/hy3`, and `AI_FEATURES_ENABLED=true` — `VOC-032-DEP-03`
is resolved. The only remaining blocker for `VOC-034-T03` is `VOC-034-DEP-01`: this
package's own `T00`–`T02` merging and the staging host being redeployed with the
fixed image, via the existing, already-proven `deploy-staging` pipeline.

## Planned evidence (recorded here once `VOC-034-T03` executes)

| Evidence | Requirement | Status |
| --- | --- | --- |
| `EV-05` | API restarts healthy, logs `ai=on`, after redeploy | Blocked on `VOC-034-DEP-01` |
| `EV-05` | Real `POST /api/v1/sentence-feedback` for an ordinary safe sentence, via a disposable identity, does not return `SAFETY_MODERATION_UNAVAILABLE` | Blocked on `VOC-034-DEP-01` |
| `EV-05` | A `learner_sentences` row and an `ai_feedback_attempts` row are created for the attempt, then deleted along with the disposable identity, session, word fixture, saved word, and review used to reach the sentence-feedback step | Blocked on `VOC-034-DEP-01` |

## Exercise procedure

See `tasks.md`'s `VOC-034-T03` for the full ordered procedure. Summary: confirm
healthy restart with `ai=on` → create disposable identity → save word → complete
review → submit ordinary safe sentence → confirm real (non-fail-closed) result and
persisted rows → delete every disposable artifact created during the exercise →
record timestamps/row-count evidence below → update issue #216 and
`KARSIFT/vocanova-platform-sandbox#185` noting the blocker is resolved.

## Execution record (filled in when `VOC-034-T03` runs)

*(Not yet executed. This section is populated by whoever runs `VOC-034-T03` after
`VOC-034-T00`–`T02` merge and staging redeploys — timestamps, HTTP status/error-code
summary, before/after row counts, and confirmation of disposable-artifact cleanup,
with no secret values and no learner-text bodies beyond what's needed to prove the
outcome, per DOC-09 §22's synthetic-reproduction-over-real-content discipline.)*
