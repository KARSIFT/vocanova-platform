# VOC-030 — Begin Milestone P4: Daily Habit and Progress

**Draft package — not adopted, not approved, and not implementation authority.**
Human adoption, resolution of the stated open decisions, and separate
implementation authorization are required before work begins. No authorization,
approval, activation, deployment, or closure field is set by this draft.

## Identity and lifecycle

- Package ID: `VOC-030`; canonical path:
  `specs/changes/VOC-030-begin-milestone-p4-daily-habit-and-progress-per/`.
- Lifecycle: `draft`; every authorization field in `change.yaml` remains at its
  unadopted default (`approval_status: not-approved`,
  `implementation_authorized: false`, `automatic_merge_allowed: false`,
  `production_impact: unknown`, `repository_adoption_status: not-adopted`).
- Proposed risk: **R3** (proposal only — not a determination). This milestone
  adds five new owned tables (`daily_mission_snapshots`,
  `daily_activity_summaries`, `confidence_point_ledger`, `streak_states`,
  `grace_day_ledger`) plus a `user_settings` dependency table and their
  migrations (`/apps/api/migrations`, `/apps/api/ent/schema` — R3 path floor).
  It also **modifies already-shipped, protected write transactions** in the P1
  `learning` module (word addition), the P2 `reviews` module (review
  submission), and the P3 `aifeedback` module (replacing the
  `StubMissionUpdater` seam at `apps/api/business/aifeedback/mission.go` with a
  real implementation) — every one of those paths was previously reviewed and
  accepted under its own milestone, so retroactive modification deserves the
  same scrutiny as new R3 work, not less. The path-based classifier
  (`scripts/governance/classify-change-risk.sh`) floors these paths at R3; the
  implementation-time classifier, builder, verifier, and applicable human
  authority govern the actual class. Several product/scope decisions below
  (`D01`–`D05`) are **open** and become R4 once decided; this draft does not
  decide them and does not modify P1/P2/P3 write paths itself.
- Decision owner: founder; target branch: `develop`; request source: free text
  (the DOC-12 §5 P4 paragraph plus the supplied request, grounding DOC-00 §3,
  DOC-05 §§4,6,10,12,18, DOC-06 §§10,11,13, DOC-07, and DOC-08 in full).
- A-003 is active: routine R3 requires strengthened controls and exact-SHA
  independent verification but not standing steward/founder approval solely
  because it is R3. An R4 product/scope or material user-trust decision remains
  founder-controlled. Every P4 PR requires Claude Code review; false-progress,
  authorization, migration, and cross-module transaction findings block
  release. EHR is not presumed.

## Objective and requirement source

Begin DOC-12 §5 P4: daily missions, streak rules, progress aggregates, the Home
dashboard, and cross-capability consistency turn the isolated P1–P3 actions
(save a word, review a word, submit a sentence) into one daily habit. Ground
the design in DOC-00 §3 (Confidence Points, streak, Daily Mission — high-level
gamification model), DOC-05 §§4,6,10,12,18 (timezone strategy, `user_settings`,
`daily_mission_snapshots`/`daily_activity_summaries`,
`confidence_point_ledger`/`streak_states`/`grace_day_ledger`, migration order),
DOC-06 §§10,11,13 (mission-snapshot creation, reward configuration, timezone
resolution), DOC-07 (daily mission and progress/gamification API surface), and
DOC-08 (Home and Progress screen UX decisions). The A1 auth/requester context
(VOC-025), P1 content/learning foundation (VOC-026), P2 `reviews` module +
`review_attempts` history (VOC-027), and P3 `aifeedback` module +
`learner_sentences`/`ai_feedback_attempts` history and its explicitly
P4-flagged `MissionUpdater` stub (VOC-028-D01/DEP-03) carry forward and are the
direct dependency this package activates.

## Scope, non-goals, risk, and protected areas

Scope is a fixed ordered multi-PR sequence: (T00) the `missions` and
`gamification` business modules, their five new tables plus the `user_settings`
dependency table, and the pure reward/streak/grace-day domain logic; (T01–T03)
wire real (non-stub) mission/activity/point/streak updates into the existing
P1 word-addition, P2 review-submission, and P3 AI-feedback-orchestration
transactions, respectively, replacing the P3 `StubMissionUpdater`; (T04) the
`GET /api/v1/daily-mission` and `GET /api/v1/progress` read APIs; (T05) Home
and Progress screen wiring to real data, retiring `MOCK_HOME_STATE`'s
`missionTargetWords`/`reviewedWordsToday`/`currentStreakDays` and
`MOCK_PROGRESS_STATE`'s `confidencePointsTotal`/`currentStreakDays`/
`longestStreakDays`/`completionHistory`; (T06) evaluation of the P4 gate's own
duplicate/failed/unauthorized-safety requirement, observability,
mock-inventory extension, staging evidence, and gate readiness.

Excluded: P5 cross-feature integration/reliability/accessibility polish; a
general Settings screen/API beyond the minimal `user_settings` row this
package needs (`D01`); leaderboards, badges, social challenges, rewards store
(DOC-12 §10); retroactive point/mission/streak credit for P1–P3 activity that
predates this package's activation (`D05`); onboarding-profile capture
(`user_onboarding_profiles` still does not exist — out of scope); revisiting
A1/P1/P2/P3 mechanics beyond the specific transaction points this package adds
to; production deployment; real secrets.

Protected: database migrations, Ent schemas, the already-shipped P1/P2/P3
transactional write paths this package extends, immutable
`confidence_point_ledger`/`grace_day_ledger` history, requester-scoped
authorization, idempotency (per-source-event dedup keys on the point ledger),
timezone-correct daily-local-date logic, and the committed OpenAPI/client
contract. Rollback must preserve learner-owned scheduling state, immutable
ledger history, and existing P1/P2/P3 behavior; a reverted migration must never
destroy learner progress history or leave a P1/P2/P3 write path partially
wired to a removed table.

## Verification, approvals, release, and closure

Every P4 PR requires Claude Code review bound to the exact final SHA; false
mission/streak/point state, cross-module transaction correctness, requester
scope, idempotency, migration, and contract-drift findings block release. Run
installed commands (`pnpm validate`, `pnpm test`, `pnpm build`, the
`scripts/governance/*` checks as applicable, plus the Go format/vet/test/build
and web lint/typecheck/build suites discovered at the adopted base) and the
deterministic domain/migration/transaction/contract/consistency tests this
package adds. Staging validation and rollback rehearsal are required before the
DOC-12 P4 gate can be evaluated; live staging evidence is blocked until the F3
staging environment exists (`VOC-030-DEP-02`). This draft grants no approval,
merge, activation, credentials, deployment, or closure authority, and the
package is not adopted.
