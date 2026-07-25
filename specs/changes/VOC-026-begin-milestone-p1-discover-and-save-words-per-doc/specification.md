# VOC-026 — Begin Milestone P1: Discover and Save Words: Specification

## Objective and requirement source

Deliver the DOC-12 §5 P1 gate: an authenticated learner can discover a word, open its
detail, save it, see it saved consistently across the app (home/discover/progress), and
remove it — on a real vocabulary-content foundation. VOC-025 (A1) deliberately deferred
replacing the learning-content mocks (VOC-025-D05); this package replaces them with real
canonical content, real discovery/word-detail read APIs, and real owner-data save/unsave,
wired under the now-real A1 auth. Authority: DOC-12 §5 (P1 paragraph), DOC-05 §§7–9,
DOC-06 §§3,7,8,9,10,18, DOC-07, and the supplied request.

## Scope and non-goals

In scope:
1. Canonical content persistence — Ent schemas + reviewed versioned Atlas migrations for
   `canonical_words`, `word_meanings`, `word_examples`, `usage_notes`,
   `journey_situations`, and `journey_words`; and the learner-owned `user_words` table —
   per DOC-05 §§7–9 constraints (unique `(language_code, normalized_text)`,
   `(word_id, meaning_order)`, `(meaning_id, example_order)`, `(meaning_id, note_order)`,
   journey_situations unique `slug`, journey_words unique
   `(journey_situation_id, meaning_id)`, user_words unique
   `(user_id, meaning_id) where deleted_at is null`, check constraints, status lifecycle).
2. Versioned, deterministic, rerunnable seed data (DOC-05 §§19,20) for the initial journey
   situations and canonical words/meanings/examples/usage-notes and the journey-word
   relationships, using fixed UUIDs and a single-transaction Go seed command.
3. Explicit request/response DTOs, Huma/chi routes, standard errors, committed OpenAPI
   and matched client artifacts — never expose Ent models (DOC-07).
4. Discovery and word-detail read APIs with requester-scoped saved-state overlay
   (queries `user_words` read-only for the authenticated requester).
5. Save (`POST /api/v1/user-words`) and unsave
   (`DELETE /api/v1/user-words/{meaningId}` — keying flagged D02) with idempotency, CSRF,
   deny-by-default auth, requester-scoped ownership, and the 404-private-resource rule.
6. Wire the existing `(app)` Home, Discover, Situation drill-down, Word-Detail, and
   Progress screens from their current mock constants to the real API behind the A1 auth
   shell, with saved state consistent across all of them.

Out of scope (do not invent): spaced-repetition/review scheduling, due-queue, review
submission, `next_review_at` scheduling semantics, or any P2 behavior (P2); sentence
practice, AI feedback, moderation, prompt/provider (P3); missions, streaks, Confidence
Points, daily-mission snapshots, daily-activity summaries, grace days, leaderboards, or
any P4 behavior; onboarding/profile/settings; account deletion; production deployment; real
secrets; and inventions not required to pass the P1 gate.

## Risk and protected areas

Proposed **R3** — not a determination. Protected paths: `/apps/api/migrations` and
`/apps/api/ent/schema` (data-integrity, forward/backward compatibility, recovery),
`/apps/api/business/content` and `/apps/api/business/learning` (owner-data writes,
idempotency, requester scope, CSRF), and the committed OpenAPI/client contract (drift).
The path classifier floors migrations and schemas at R3. Under A-003, routine R3 needs
strengthened controls and exact-SHA independent verification, not standing steward/founder
approval solely for being R3; R4 founder authority is unchanged. Several founder-level
product/scope questions below are **open** and become R4 once decided; resolving them
(authorizing a material product/scope choice, the seed-data scope, the discovery-vs-mock
contradiction, save side-effects on the P2/P4 boundary, and the mock-screen transition)
is founder-controlled and is required before the affected tasks proceed. This draft does
not resolve them.

## Decisions, contradictions, security, and privacy

`VOC-026-D00` — **OPEN, adopted technical baseline (carry-forward).** P1 builds on the
VOC-025 A1 auth, session, requester-context (`Requester`/`RequesterUserID`), `RequireAuth`,
`CSRFMiddleware`, `AuthorizeOwner`, and the OpenAPI generation/commit pattern. The same
deny-by-default, requester-scoped, never-expose-Ent, explicit-DTO, UTC/RFC3339, UUIDv7,
`X-CSRF-Token`-double-submit, `Idempotency-Key`-user-scoped rules apply. No auth/session
mechanics are re-litigated here.

`VOC-026-D01` — **OPEN, founder decision required.** MVP canonical vocabulary seed-data
scope: how many journey situations, how many canonical words/meanings per situation, which
A1–C1 difficulty mix, and whether the seed reuses the existing VOC-022 situation/word
content (Airport, Restaurant, Hotel Check-in, Job Interview, Daily Conversation, Work
Meeting, University Class) as the initial real seed or defines a different set. The request
explicitly flags "exact canonical vocabulary seed-data scope for MVP" as founder-level. The
implementer must not pick an unbounded scope to make the milestone "look complete"; the
resolved scope bounds T00's seed and is the P1 content sufficiency reference.

`VOC-026-D02` — **OPEN, implementer-facing naming/keying choice — founder or delegated
reviewer to settle at adoption.** DOC-05 §7 makes a *meaning* the core learning unit and
`user_words` one row per saved meaning, but the existing VOC-022 mock routes key the
word-detail URL by a `word` slug (`/discover/[situation]/[word]`) and show one definition
per entry. The package proposes: the situation drill-down and saved list expose *meaning*
entries each carrying a stable `meaningId`; the word-detail screen is keyed by the
canonical-word slug and renders all of that word's meanings, each individually saveable;
`DELETE /api/v1/user-words/{meaningId}` un-saves by meaning (unique per requester). The
exact path/identifier shapes (canonical-words URL vs word-meanings URL, slug vs id in the
read endpoints) are for the human reviewer to settle at adoption; this is a naming choice,
not a product-scope question, and is called out here rather than guessed.

`VOC-026-D03` — **OPEN, contradiction flagged — founder decision required.** DOC-05 §8
states the discovery query excludes meanings already in the learner's `user_words`, but
the VOC-022 situation drill-down mock deliberately lists saved and unsaved words together
and renders a "Saved" badge for saved ones. These conflict for P1. Either the discovery
query shows all situation meanings with a saved overlay (matching the existing mock UI and
the P1 gate's "see it saved consistently across the app"), or it excludes saved meanings
and the saved badge never appears in the situation list. The request explicitly flags how
saved state interacts with the existing static mock screens; resolving this contradiction
is founder-controlled. `TEST` and `AC` are written to whichever resolution is adopted; the
draft assumes the "show all with overlay" reading only for the proposed contract shape and
marks the exclusion alternative as requiring updated criteria.

`VOC-026-D04` — **OPEN, P2/P4 boundary — founder decision required.** DOC-06 §10 says word
addition creates `user_words` at `review_step=0` with `next_review_at = now` and "awards a
Confidence Point reward once"; DOC-06 §11 lists "Add word: +2". P1 must not invent P2
scheduling or P4 gamification, but `user_words` is one shared row whose fields all three
milestones touch. Resolve, for P1: (a) whether save sets `next_review_at` to `now` (making
the word immediately "due" — a P2-coupled signal) or leaves it null until P2 implements the
schedule; (b) whether save awards Confidence Points / appends a `confidence_point_ledger`
entry / updates a daily-activity counter, all of which require P4 tables that this package
does not create. The draft proposes: P1 save sets `status='new'`, `source` per the request
origin (`journey`/`search`/`manual`), `review_step=0`, `added_at`, and leaves
`next_review_at`, `consecutive_*_count`, `total_review_count`, and all counters at their
schema defaults; it writes **no** point ledger or mission/activity rows and adds **no**
tables it does not own. Resolving D04 differently is founder-controlled and adds tasks.

`VOC-026-D05` — **OPEN, founder decision required.** How saved state interacts with the
retained Home and Progress mock screens during the transition. The current Home mock shows
P4 data (mission target, reviewed today, streak, due words) and the Progress mock shows
Confidence Points, streaks, and a weekly completion history — all P4/P2 fields this package
must not invent. The P1 gate requires "see it saved consistently across the app
(home/discover/progress)." Resolve: (a) replace the P4 mock fields on Home/Progress with
real P1-relevant saved-word content for the milestone (and record the P4 fields as deferred
to P4, not invented now); (b) retain the P4 mocks untouched and add a real saved-words
section alongside them (mixed real/mock, explicitly labelled); or (c) another founder
choice. `VOC-025-D05` retained these mocks for A1; this package retires the ones in scope
and must record the disposition of the out-of-scope P4 mock fields. T04 cannot proceed past
this by guessing.

`VOC-026-D06` — **RESOLVED at adoption, not by this draft.** To be set when the founder
resolves D01, D03, D04, D05; no value is asserted here.

### Security and privacy

Canonical content is platform-owned, not personal. `user_words` is learner-owned behavior
state (saved meanings) — personal data: minimize, requester-scoped, never expose another
learner's rows, never log/analytics-identify saved-content choices. Save/unsave are
state-changing and require CSRF (`X-CSRF-Token`) and active auth; idempotency is required
for `POST /api/v1/user-words` (DOC-07) and scoped to the authenticated user. Inaccessible or
nonexistent owner resources return 404 (no enumeration). Passwords, tokens, OAuth, and
session mechanics stay owned by A1. No real secrets or provider data enter source; seed is
deterministic, reviewable, secret-free.

## Data, migrations, analytics, and accessibility

Migrations: follow DOC-05 §18 order (canonical_words → word_meanings → word_examples →
usage_notes → journey_situations → journey_words → user_words), forward/backward
compatibility review, disposable PostgreSQL rehearsal, explicit execution outside API
startup, and rerunnable deterministic seed in one transaction with fixed UUIDs
(DOC-05 §§19,20). Migration tests assert the required unique/partial-unique indexes, FKs,
check constraints (e.g. `user_words` unique `(user_id, meaning_id) where deleted_at is
null`, `canonical_words` unique `(language_code, normalized_text)`,
`journey_words.relevance_score` check 1–100, `user_words.review_step` check 0–7), seed
rerun-safety, and the DOC-05 §20 cases in scope (discovery excludes/overlays already-saved
meanings per the adopted D03 resolution; duplicate normalized word rejected). Analytics
is excluded. Accessibility: the wired screens keep the existing labelled controls, focus,
semantic markup, keyboard reachability, and non-color-only saved state this milestone is
responsible for (e.g. a saved label/badge, not color alone); absent automation is recorded
as a limitation, never a pass.