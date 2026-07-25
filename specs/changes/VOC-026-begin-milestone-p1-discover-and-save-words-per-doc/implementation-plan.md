# VOC-026 — Implementation Plan

## Preconditions and protected areas

Do not begin until this draft is adopted, `D01`/`D03`/`D04`/`D05` are resolved into `D06`, the
adopted `develop` base and its repository commands are recorded, A1 (VOC-025) requester
context is confirmed as the auth foundation (`VOC-026-DEP-01`), and the F3 staging path is
understood for evidence (`VOC-026-DEP-03`). Database schemas/migrations, Ent schemas,
learner-owned data (`user_words`), requester-scoped authorization, idempotency, CSRF, and the
committed OpenAPI/client contract are R3 protected. Preserve existing compatible work; no
secrets, provider configuration, copyrighted unlicensed content, or real learner data enters
source control. No auth/session mechanics are re-litigated; they stay owned by A1.

## File reconciliation and implementation sequence

First inventory the actual scaffold (the A1 Glue: `Requester`, `RequireAuth`,
`CSRFMiddleware`, `AuthorizeOwner`, `Idempotency-Key` handling, OpenAPI generation/commit,
the matched `@vocanova/api-client`, and the migration test convention) and every P1-touched
mock (`MOCK_DISCOVER_SITUATIONS`, `MOCK_SITUATION_WORD_LISTS`, the word-detail mock import,
and the Home/Progress mock fields per `D05`). Classify each target as preserve, compatible
extension, replacement-under-adopted-contract (decommission the mock), or
retained-as-mock-pending-P4. Execute `T00 → T01 → T02 → T03 → T04 → T05` in order; a task
depending on an open decision waits for `D06` rather than guessing. Keep `content` and
`learning` business logic independent of Huma/chi and of each other's table writes — cross-module
saved-state overlay is a read-only service query, not direct cross-module table access (DOC-06 §3).
Commit generated OpenAPI and the matched client with their source changes. Do not wire a
frontend mock to a real API until its approved contract exists (T03/T04 follow T01/T02).

## Validation and independent verification

Run every installed relevant command discovered at implementation time: root `pnpm validate`/
`pnpm test`/`pnpm build`, the `scripts/governance/validate-governance.sh` and
`scripts/governance/classify-change-risk.sh` checks as applicable to the changed paths, Go
`gofmt`/`go vet`/`go test`/`go build`, web lint/typecheck/build/format, the content/migration/
contract/auth/idempotency tests this package adds, and the deterministic mock-inventory check.
Claude Code independently reviews each exact final SHA for: scope and the classifier floor,
migration safety and seed rerun-safety, requester scope and the 404-private-resource rule,
idempotency scope isolation, CSRF enforcement, save side-effects within the adopted `D04`
boundary (no P2/P4 tables/behavior), contract/OpenAPI/client drift, secrets/logging redaction,
accessibility of the wired screens, staging/rollback evidence, and implementer separation.
Missing staging, seed-scope, provider, or tooling evidence remains a blocker or limitation,
never a pass; a missing check is not reported as passing.

## Deployment and rollback

This draft authorizes no deployment. Future staging rollout (when F3 exists) is ordered:
adopted-baseline build/checks → apply content+user-words migration under the approved procedure
→ run the deterministic seed → deploy → health/smoke → verify discover/save/consistency/unsave
under non-production identities → cross-user/CSRF/idempotency validation → monitoring → then a
content/user-words rollback rehearsal. Trigger rollback on cross-learner access, idempotency
failure, migration integrity fault, seed-data corruption, leaked secret/token, or failed health
checks. Roll back/recover under the approved procedure, preserve canonical content integrity and
soft-deleted `user_words` rows, validate with non-production identities, and record the
last-known-good revision; production activation remains separately governed.