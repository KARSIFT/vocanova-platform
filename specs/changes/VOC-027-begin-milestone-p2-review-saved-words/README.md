# VOC-027 — Begin Milestone P2: Review Saved Words

**Draft package — not adopted, not approved, and not implementation authority.**
Human adoption, resolution of the stated open decisions, and separate implementation
authorization are required before work begins. No authorization, approval, activation,
deployment, or closure field is set by this draft.

## Identity and lifecycle

- Package ID: `VOC-027`; canonical path:
  `specs/changes/VOC-027-begin-milestone-p2-review-saved-words/`.
- Lifecycle: `draft`; every authorization field in `change.yaml` remains at its
  unadopted default (`approval_status: not-approved`,
  `implementation_authorized: false`, `automatic_merge_allowed: false`,
  `production_impact: unknown`, `repository_adoption_status: not-adopted`).
- Proposed risk: **R3** (proposal only — not a determination). This is the first
  real learning-state-mutating workflow: it adds a new owned table
  (`review_attempts`) and its migration (`/apps/api/migrations`,
  `/apps/api/ent/schema` — R3 path floor), mutates the existing learner-owned
  `user_words` scheduling fields inside a transaction, exposes the first
  requester-scoped write that changes scheduling state under idempotency + CSRF,
  and commits OpenAPI/client contract drift. The path-based classifier
  (`scripts/governance/classify-change-risk.sh`) floors these paths at R3; the
  implementation-time classifier, builder, verifier, and applicable human
  authority govern the actual class. Several founder-level product/scope
  decisions in `specification.md` (`D02`, `D03`, `D04`, `D05`) are **open** and
  become R4 once decided; this draft does not decide them.
- Decision owner: founder; target branch: `develop`; request source: free text
  (the DOC-12 §5 P2 paragraph plus the supplied request).
- A-003 is active: routine R3 requires strengthened controls and exact-SHA
  independent verification but not standing steward/founder approval solely
  because it is R3. An R4 product/scope, privacy, or material user-trust decision
  remains founder-controlled. EHR is not presumed.

## Objective and requirement source

Begin DOC-12 §5 P2: the specified spaced-repetition system end to end — scheduling
domain, due-queue, review session, response submission, and completion. Ground the
schedule in DOC-05 §9 (`user_words` scheduling fields, already present from
VOC-026/P1 and deliberately left at schema defaults/null by `VOC-026-D04`, which
this package now activates), DOC-05 §9 `review_attempts` (not yet created —
immutable history, one row per submitted answer, idempotent via
`client_attempt_id`), and DOC-05 §15 (the review-submission transaction). Ground
the rating movement rules in DOC-06 §10 (Again floors to step 0; two consecutive
incorrect/Again reset to step 0; Hard holds the step; Good/Easy advance with a
cap of 7; the backend owns the interval-to-step mapping). Ground the API contract
in DOC-07 (Review system: `GET /api/v1/reviews/due`, `POST
/api/v1/reviews/submissions`; idempotency required for submissions; CSRF; UUIDv7;
RFC3339 UTC). The A1 auth/session/requester-context and OpenAPI/commit pattern
established by VOC-025 and the P1 content/learning foundation established by
VOC-026 carry forward unchanged.

## Scope, non-goals, risk, and protected areas

Scope is a fixed ordered multi-PR sequence: (T00) `review_attempts` persistence +
migration + the scheduling domain logic (Again/Hard/Good/Easy → step transitions,
counters, `next_review_at`); (T01) the requester-scoped due-queue read API
(`GET /api/v1/reviews/due`); (T02) the review submission write API
(`POST /api/v1/reviews/submissions`) implementing exactly the DOC-05 §15
review-submission transaction **minus** the daily-mission / point-ledger / streak
steps (those tables do not exist yet — P4's job, explicitly excluded here); and
(T03) wiring a review experience into the app (new route(s) as needed) that lets a
learner review due words and see completion state. T04 reconciles the Home
due-review mock with the now-real due-queue and collects mock-decommission
inventory, staging evidence, rollback rehearsal, and P2 gate readiness.

Excluded: AI feedback / sentence practice (P3); missions, streaks, Confidence
Points, daily-mission snapshots, daily-activity summaries, grace days, and any P4
gamification — do **not** add `next_review_at = now` on word-add, do **not** award
points, do **not** touch `daily_mission_snapshots` / `confidence_point_ledger` /
`streak_states` (none exist yet); typing / `sentence_usage` prompt types (MVP =
`multiple_choice` and `self_check` per DOC-05 §9, matching DOC-05's own
MVP-first note); revisiting P1 word-addition behavior (P1's
`next_review_at = null` already satisfies the DOC-05 due-word rule, so the P2
scheduling entry-point needs no P1 change — see `D01`); onboarding/profile/
settings; account deletion; production deployment; real secrets; and any invented
P3/P4 behavior.

Protected: database migrations, Ent schemas, learner-owned scheduling state
(`user_words`), immutable `review_attempts` history, requester-scoped
authorization, idempotency (user+operation-scoped, `client_attempt_id` uniqueness),
CSRF, and the committed OpenAPI/client contract. Rollback must preserve
`user_words` integrity and immutable history; a reverted migration must never
destroy learner scheduling state or attempt history.

## Verification, approvals, release, and closure

Every P2 PR requires Claude Code review bound to the exact final SHA;
learner-scheduling-data, authorization, idempotency (double-submit causing a
duplicate schedule update), CSRF, migration, immutable-history, and contract-drift
findings block release. Run installed commands (`pnpm validate`, `pnpm test`,
`pnpm build`, the `scripts/governance/*` checks as applicable, plus the Go
format/vet/test/build and web lint/typecheck/build suites discovered at the
adopted base) and the deterministic review-domain/migration/contract/auth/
idempotency tests this package adds. Staging validation and rollback rehearsal
are required before the DOC-12 P2 gate can be evaluated; live staging evidence is
blocked until the F3 staging environment exists (`VOC-027-DEP-02`). This draft
grants no approval, merge, activation, credentials, deployment, or closure
authority, and the package is not adopted.