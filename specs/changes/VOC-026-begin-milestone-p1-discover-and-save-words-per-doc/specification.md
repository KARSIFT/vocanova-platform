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

`VOC-026-D01` — **RESOLVED at adoption (founder decision, 2026-07-25).** The seed reuses
the existing VOC-022 situation/word content verbatim as the initial real canonical set:
the same seven situations (Airport, Restaurant, Hotel Check-in, Job Interview, Daily
Conversation, Work Meeting, University Class) and the words/meanings already shown by each
situation's mock word list, converted into real `canonical_words`/`word_meanings` rows
(one meaning per existing mock entry to start; `word_examples`/`usage_notes` may be added
per word where the mock already implies one, otherwise left for a later content pass — do
not invent new example sentences beyond what a mock entry already implies). A1–C1
difficulty mix is whatever the existing mock content already reflects; do not rebalance it
for T00. This keeps the real seed visually/behaviorally identical to what VOC-022's mock
already showed, minimizing new invented content while making it real. T00's seed is scoped
exactly to this; expanding the canonical catalog beyond it is out of scope for P1.

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

`VOC-026-D03` — **RESOLVED at adoption (founder decision, 2026-07-25).** Show-all-with-overlay:
the discovery/situation query returns every meaning in the situation regardless of saved
state, with a per-meaning `saved: bool` overlay computed from the requester's `user_words`.
This matches the existing VOC-022 mock UI's "Saved" badge behavior and is the only reading
consistent with the P1 gate's "see it saved consistently across the app" — an exclusion
query would make a save action remove a word from the very screen the learner just saved it
from, which is not what "saved consistently" means. `TEST`/`AC` are written to this reading;
the exclusion alternative is rejected, not merely deferred.

`VOC-026-D04` — **RESOLVED at adoption (founder decision, 2026-07-25).** Adopted exactly as
the draft proposed: P1 save sets `status='new'`, `source` per the request origin
(`journey`/`search`/`manual`), `review_step=0`, `added_at`, and leaves `next_review_at`,
`consecutive_*_count`, `total_review_count`, and all other counters at their schema
defaults — `next_review_at` stays null, not `now`, so P1 never manufactures a P2-coupled
"due" signal. Save writes **no** Confidence Point ledger entry and **no** mission/daily-
activity row; DOC-06 §10/§11's point-award and scheduling behavior belongs to P2/P4 and is
explicitly deferred, not implemented here. Keeps P1 strictly additive to the `user_words`
row without inventing any P2/P4 table or semantics.

`VOC-026-D05` — **RESOLVED at adoption (founder decision, 2026-07-25).** Option (a): on
Home and Progress, replace only the mock fields that represent *saved-word content* (e.g.
a "recently saved" or saved-words list/count) with the real P1 saved-words API, wired the
same way T03 wires Discover/Situation/Word-Detail. Every P4-only or P2-only mock field that
has no P1 equivalent — mission target, reviewed-today, streak, due-words count, Confidence
Points, and the weekly completion history — stays exactly as it is today, explicitly
labelled/commented as mock-pending-P4 (or -P2) in the code, not deleted and not silently
left ambiguous. This satisfies the P1 gate's "saved consistently across the app" without
inventing any P4 gamification or P2 scheduling data.

`VOC-026-D06` — **RESOLVED at adoption (founder decision, 2026-07-25).** Composite record
of D01/D03/D04/D05 above: VOC-022's existing situation/word set is the real P1 seed (D01);
discovery shows all meanings with a saved overlay (D03); save writes only the P1-owned
`user_words` fields with no P2/P4 side effects (D04); Home/Progress get real saved-word
content wired in, with every other P4/P2 mock field explicitly retained and labelled
mock-pending (D05). T00–T05 may proceed under these resolutions.

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