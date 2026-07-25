# VOC-027 — Implementation Plan

## Preconditions and protected areas

Do not begin until this draft is adopted, `D02`/`D03`/`D04`/`D05` are resolved into
`D06`, the adopted `develop` base and its repository commands are recorded, the P1
(VOC-026) content/save foundation is confirmed as the requester context every P2
read/write depends on (`VOC-027-DEP-01`), and the F3 staging path is understood
for evidence (`VOC-027-DEP-02`). Database schemas/migrations, Ent schemas,
immutable `review_attempts` history, the `user_words` scheduling fields the
submission mutates, requester-scoped authorization, idempotency,
`client_attempt_id` uniqueness, CSRF, and the committed OpenAPI/client contract
are R3 protected. Preserve existing compatible work; no secrets, provider
configuration, payer-protected content, or real learner data enters source
control. No auth/session or P1 content/save mechanics are re-litigated; they stay
owned by A1/P1.

## File reconciliation and implementation sequence

First inventory the actual scaffold carried from VOC-025/VOC-026 (the A1 glue:
`Requester`, `RequireAuth`, `CSRFMiddleware`, `AuthorizeOwner`,
`Idempotency-Key` handling, OpenAPI generation/commit, the matched
`@vocanova/api-client`, and the migration/seed test convention) and confirm the
`user_words` scheduling fields + `(user_id, next_review_at)` index already exist
(`apps/api/ent/schema/userword.go`) — P2's schema work is additive
(`review_attempts`) only. Then execute `T00 → T01 → T02 → T03 → T04` in order; a
task depending on an open decision waits for `D06` rather than guessing. Keep the
scheduling domain logic independent of Huma/chi and of Ent writes (pure function
called by the transaction layer in T02); keep `reviews` business logic independent
of `content`/`learning` table writes — cross-module reads (e.g. resolving a
meaning for a due prompt) are read-only service queries, not direct cross-module
table access (DOC-06 §3). Commit generated OpenAPI and the matched client with
their source changes. Do not wire a frontend review route to a real submission
API until the approved contract exists (T03 follows T02). The submission
transaction must run the DOC-05 §15 steps in order inside one transaction so
history and current state always move together.

## Validation and independent verification

Run every installed relevant command discovered at implementation time: root
`pnpm validate`/`pnpm test`/`pnpm build`, the
`scripts/governance/validate-governance.sh` and
`scripts/governance/classify-change-risk.sh` checks as applicable to the changed
paths, Go `gofmt`/`go vet`/`go test`/`go build`, web lint/typecheck/build/format,
the review-domain/migration/contract/auth/idempotency tests this package adds,
and the deterministic mock-inventory check (extended in T04). Claude Code
independently reviews each exact final SHA for: scope and the classifier floor,
migration safety and immutable-history preservation, requester scope and the
404-private-resource rule, idempotency scope isolation and exactly-once schedule
update, CSRF enforcement, scheduling-rule correctness (floor/cap/two-consecutive
reset), no P4 tables/behavior and no P1 revisit (`D01`), contract/OpenAPI/client
drift, the `D02` DOC-05/DOC-07 prompt-type reconciliation, secrets/logging
redaction, accessibility of the review route, staging/rollback evidence, and
implementer separation. Missing staging, tooling, or open-decision evidence
remains a blocker or limitation, never a pass; a missing check is not reported as
passing.

## Deployment and rollback

This draft authorizes no deployment. Future staging rollout (when F3 exists) is
ordered: adopted-baseline build/checks → apply the `review_attempts` migration
under the approved procedure → deploy → health/smoke → verify
due-queue → submit → schedule-update-exactly-once → completion under
non-production identities → cross-user/CSRF/idempotency validation → monitoring
→ then a `review_attempts`/`user_words` rollback rehearsal. Trigger rollback on
cross-learner access, idempotency failure (duplicate schedule update),
scheduling-rule violation, migration integrity fault, leaked secret/token, or
failed health checks. Roll back/recover under the approved procedure: preserve
immutable `review_attempts` history (never drop committed attempt rows on
rollback), preserve `user_words` schedule state written before the rollback
window, validate with non-production identities, and record the last-known-good
revision; production activation remains separately governed.