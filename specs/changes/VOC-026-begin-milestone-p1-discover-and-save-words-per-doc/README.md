# VOC-026 — Begin Milestone P1: Discover and Save Words

**Draft package — not adopted, not approved, and not implementation authority.**
Human adoption, resolution of the stated open decisions, and separate implementation
authorization are required before work begins. No authorization, approval, activation,
deployment, or closure field is set by this draft.

## Identity and lifecycle

- Package ID: `VOC-026`; canonical path: `specs/changes/VOC-026-begin-milestone-p1-discover-and-save-words-per-doc/`.
- Lifecycle: `draft`; every authorization field in `change.yaml` remains at its unadopted
  default (`approval_status: not-approved`, `implementation_authorized: false`,
  `automatic_merge_allowed: false`, `production_impact: unknown`,
  `repository_adoption_status: not-adopted`).
- Proposed risk: **R3** (proposal only — not a determination). This is the first real
  learning-content API surface and the first real owner-data writes; it touches
  database schemas/migrations (`/apps/api/migrations`, `/apps/api/ent/schema` — R3 path
  floor), requester-scoped learner-owned data, idempotent writes, and CSRF-gated state
  mutations. The path-based classifier (`scripts/governance/classify-change-risk.sh`)
  floors these paths at R3; the implementation-time classifier, builder, verifier, and
  applicable human authority govern the actual class. Several founder-level
  product/scope decisions in `specification.md` (D01, D03, D04, D05) are **open** and
  become R4 once decided; this draft does not decide them.
- Decision owner: founder; target branch: `develop`; request source: free text (the
  DOC-12 §5 P1 paragraph plus the supplied request).
- A-003 is active: routine R3 requires strengthened controls and exact-SHA independent
  verification but not standing steward/founder approval solely because it is R3. An R4
  product/scope, privacy, or material user-trust decision remains founder-controlled.
  EHR is not presumed.

## Objective and requirement source

Begin DOC-12 §5 P1: an authenticated learner can discover a word, open its detail, save
it, see it saved consistently across the app (home/discover/progress), and remove it.
Ground the schema in DOC-05 §§7–8 (canonical_words, word_meanings, word_examples,
usage_notes, journey_situations, journey_words) and §9 (user_words); the API contract in
DOC-07; the backend module/rule structure in DOC-06 §§3,7,8,9,10,18; and the
Go/Huma/chi, PostgreSQL+Ent+Atlas, explicit-DTO/OpenAPI, requester-scoped deny-by-default
authorization conventions already established by VOC-025 (A1). VOC-025-D05 deliberately
deferred replacing the VOC-010–VOC-024 learning-content mocks (situation lists, word
lists, word detail data); this package is their replacement on a real vocabulary-content
foundation under now-real auth.

## Scope, non-goals, risk, and protected areas

Scope is a fixed ordered multi-PR sequence: (T00) canonical vocabulary/situation
persistence + migrations + deterministic seed; (T01) discovery and word-detail read API
with requester-scoped saved-state overlay; (T02) user-words persistence + save/unsave API
with idempotency, CSRF, and deny-by-default authorization; (T03) wire the existing
Discover, Situation drill-down, and Word-Detail screens from their mock data to the real
API; (T04) reconcile saved-state consistency on the Home and Progress screens with the
retained P4 mock fields; (T05) mock-decommission inventory, staging evidence, rollback
rehearsal, and P1 gate readiness.

Excluded: spaced-repetition/review scheduling (P2), sentence practice/AI feedback (P3),
missions/streaks/confidence-points/leaderboards (P4), onboarding/settings, account
deletion, production deployment, real secrets, and any invented P2–P4 behavior. The
word-addition reward and `next_review_at` interactions with P2/P4 are explicitly flagged
open decisions (D04), not implemented by guessing. Protected: database migrations,
Ent schemas, learner-owned data, requester-scoped authorization, idempotency, CSRF, and
seed-data integrity. Rollback must preserve user-word integrity and never corrupt
canonical content.

## Verification, approvals, release, and closure

Every P1 PR requires Claude Code review bound to the exact final SHA; learner-data,
authorization, idempotency, CSRF, migration, and contract-drift findings block release.
Run installed commands (`pnpm validate`, `pnpm test`, `pnpm build`, the
`scripts/governance/*` checks as applicable, plus the Go format/vet/test/build and web
lint/typecheck/build suites discovered at the adopted base) and the deterministic
content/migration/contract/auth tests this package adds. Staging validation and rollback
rehearsal are required before the DOC-12 P1 gate can be evaluated; live staging evidence
is blocked until the F3 staging environment exists (`VOC-026-DEP-03`). This draft grants
no approval, merge, activation, credentials, deployment, or closure authority, and the
package is not adopted.