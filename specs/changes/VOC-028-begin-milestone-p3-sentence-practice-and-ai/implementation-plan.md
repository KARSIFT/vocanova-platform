# VOC-028 — Implementation Plan

## Preconditions and protected areas

Do not begin until this draft is adopted, `D01`–`D05` are resolved into `D06`,
the adopted `develop` base and its repository commands are recorded, the P2
(VOC-027) `reviews` module + `review_attempts` history is confirmed as the
boundary P3 reads against (`VOC-028-DEP-01`), and the F3 staging path is
understood for evidence (`VOC-028-DEP-04`). `D02` (production provider/model +
privacy) is a hard gate on T02 acceptance (`VOC-028-DEP-02`); T00–T01 may
proceed under `D00`/`D01` once adopted, but T02 cannot be accepted until `D02`
is resolved and recorded. Database schemas/migrations, Ent schemas, immutable
`ai_feedback_attempts` history, learner-owned `learner_sentences` content, the
pending-row workflow (no transaction held across the external call),
requester-scoped authorization, idempotency/dedup, rate limiting, injection
resistance, safety/moderation outcomes (blocked/self-harm never complete a
mission), privacy minimization (no learner text in logs/metrics, no raw
provider payload retained by default), backend-only provider keys, cost
controls, and the committed OpenAPI/client contract are R3/R4 protected.
Preserve existing compatible work; no secrets, a concrete commercial provider
model, provider credentials, payer-protected content, or real learner data
enters source control. No A1/P1/P2 mechanics are re-litigated; they stay owned
by their milestones.

## File reconciliation and implementation sequence

First inventory the actual scaffold carried from VOC-025/026/027 (the A1 glue:
`Requester`/`RequesterUserID`, `RequireAuth`, `CSRFMiddleware`,
`AuthorizeOwner`, `Idempotency-Key` handling, OpenAPI generation/commit, the
matched `@vocanova/api-client`, the `reviews` module + `reviewattempt` schema +
`review_attempts` migration, and the migration/seed test convention) and
confirm `daily_mission_snapshots`/`streak_states`/`confidence_point_ledger`/
`daily_activity_summaries`/`grace_day_ledger` do **not** exist (so the
mission-completion step is the `D01` stub, not a real write). Then execute
`T00 → T01 → T02 → T03 → T04 → T05` in order (the DOC-09 §24 mandatory six-PR
order); a task depending on an open decision waits for `D06` rather than
guessing. Keep the `FeedbackProvider`/`ModerationProvider` interfaces narrow and
separate (not a generic `Generate(ctx, input any)`); keep provider SDK types
inside the adapter layer. Keep deterministic validation and the safety mapping
pure where possible so the transaction layer and tests can exercise them
deterministically. Keep the provider call **outside** any DB transaction
(DOC-05 §15). Commit generated OpenAPI and the matched client with their
source changes. Do not wire a frontend entry to a real feedback endpoint until
the approved contract exists (T04 follows T03/T02). Do not select or hard-
configure a concrete commercial provider/model in T02 — read it from
configuration and flag it as the open `D02` decision. Do not invent P4 tables
for mission completion (`D01` stub). CI never depends on a paid provider.

## Validation and independent verification

Run every installed relevant command discovered at implementation time: root
`pnpm validate`/`pnpm test`/`pnpm build`, the
`scripts/governance/validate-governance.sh` and
`scripts/governance/classify-change-risk.sh` checks as applicable to the changed
paths, Go `gofmt`/`go vet`/`go test`/`go build`, web lint/typecheck/build/
format, the validation/orchestration/provider-mock/safety/contract/privacy/
evaluation tests this package adds, and the extended mock-inventory check
(T05). Secret-scan git history/diff for provider keys. Claude Code independently
reviews each exact final SHA for: scope and the classifier floor, migration
safety and immutable-history/learner-content preservation, the pending-row
(pending-row + no-transaction-during-provider-call) correctness, requester
scope and the 404-private-resource rule, dedup/rate-limit/idempotency,
injection resistance, the `D01` mission-stub boundary (no P4 tables),
safety/moderation outcomes (blocked/self-harm never complete a mission),
privacy minimization (no learner text in logs/metrics), backend-only keys and
no real credentials, the `D02` provider/privacy gate on T02, contract/OpenAPI/
client drift, accessibility of the feedback UI, evaluation tooling (CI never
pays, golden set integrity), staging/rollback evidence, and implementer
separation. Missing staging, tooling, `D02`, or open-decision evidence remains a
blocker or limitation, never a pass; a missing check is not reported as passing.

## Deployment and rollback

This draft authorizes no deployment. Future staging rollout (when F3 exists and
`D02` is resolved) is ordered: adopted-baseline build/checks → apply the
`learner_sentences`/`ai_feedback_attempts` migration under the approved
procedure → deploy → health/smoke → verify validate → feedback (mock, then real
under protected dev/staging evaluation + cost ceiling) → persist → mission-stub
→ display under non-production identities → cross-user/CSRF/idempotency/
safety/AI-disable validation → provider privacy verification → monitoring →
then a `learner_sentences`/`ai_feedback_attempts` rollback rehearsal. Trigger
rollback on unsafe feedback reaching learners, suspected cross-user exposure,
prompt injection revealing protected information, a spike in learner reports,
schema/quality failures, cost overrun, inconsistent mission state, incorrect
provider privacy configuration, or a serious provider outage/breaking change
(DOC-09 §25). Roll back/recover under the approved procedure: preserve immutable
`ai_feedback_attempts` history (never drop committed feedback rows on
rollback), preserve committed `learner_sentences` content, keep stored feedback
readable when AI generation is disabled, validate with non-production
identities, and record the last-known-good revision; production activation
remains separately governed. Existing stored feedback must remain readable when
generation is disabled (DOC-09 §25).