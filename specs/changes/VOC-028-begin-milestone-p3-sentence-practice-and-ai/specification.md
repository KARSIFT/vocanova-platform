# VOC-028 — Begin Milestone P3: Sentence Practice and AI Feedback: Specification

## Objective and requirement source

Deliver the DOC-12 §5 P3 gate: original-sentence practice with focused, accurate,
encouraging AI feedback across the full DOC-09 §3 flow — validate the sentence →
check target-vocabulary presence → apply safety controls → call the configured AI
model → validate the structured result → store it → update the daily sentence
mission → display concise feedback. This package creates the `learner_sentences`
and `ai_feedback_attempts` tables (DOC-05 §11), the narrow `FeedbackProvider`
and `ModerationProvider` interfaces and a mock provider, the deterministic input
validation (DOC-09 §6), the full orchestration service (DOC-09 §17, running
against the mock provider only in CI), the prompt architecture (DOC-09 §14), a
production adapter drafted against the narrow interface (no concrete
provider/model or credentials selected — `D02`), safety/moderation (DOC-09 §15),
the `/api/v1` endpoint and a reusable feedback component wired into the Home /
Word-Detail / Review-Completion entry points (DOC-09 §5), and evaluation +
observability (DOC-09 §23). Authority: DOC-12 §5 (P3 paragraph), DOC-09 in full
(authoritative AI-feature design), DOC-05 §§11,15, DOC-07 (API/DTO/idempotency
conventions established by VOC-025/026/027), and the supplied request. The A1
auth/requester context (VOC-025), P1 content/learning foundation and `user_words`
(VOC-026), and P2 `reviews` module + `review_attempts` history (VOC-027) carry
forward unchanged.

## Scope and non-goals

In scope:
1. `learner_sentences` persistence — one Ent schema file
   (`apps/api/ent/schema/learnersentence.go`) + reviewed versioned Atlas migration
   per DOC-05 §11 (`meaning_id` nullable, `user_word_id` nullable,
   `sentence_text`, `normalized_sentence_text`, `source`
   (`word_detail`/`review`/`daily_mission`/`free_practice`), `status`
   (`submitted`/`feedback_ready`/`feedback_failed`/`archived`), `submitted_at`,
   `deleted_at`; check `char_length(sentence_text) <= 1000` at the DB layer),
   following the DOC-05 §18 migration order (`daily_activity_summaries →
   learner_sentences → ai_feedback_attempts`; the skipped P4 tables are not
   created — `learner_sentences` is added after `review_attempts`).
2. `ai_feedback_attempts` persistence — one Ent schema file
   (`apps/api/ent/schema/aifeedbackattempt.go`) + migration per DOC-05 §11:
   `learner_sentence_id`, `status` (`pending`/`succeeded`/`failed`/`cancelled`),
   `provider`, `model`, `prompt_version`, `request_hash`, `feedback_json jsonb`,
   `feedback_text`, `error_code`, `error_message`, `started_at`, `completed_at`
   (`completed_at` required when `status='succeeded'`; `error_code` required when
   `status='failed'`). Immutable history (DOC-05 §16). No `ON DELETE CASCADE`.
3. The narrow `FeedbackProvider` interface and a separate
   `ModerationProvider` interface (DOC-09 §17 — **not** a vague generic
   `Generate(ctx, input any)` interface; provider SDK types stay inside the
   adapter layer), plus a mock provider that returns deterministic, schema-valid
   feedback so the orchestration service and CI never depend on a paid provider
   (DOC-09 §23).
4. Deterministic input validation (DOC-09 §6): ≥3 words, ≤300 characters,
   primarily English, one meaningful sentence, includes the target word / an
   accepted inflection (`work`→`works/worked/working`) / a configured phrase
   variant, belongs to an eligible attempt owned by the authenticated learner.
   Backend normalizes (trim, collapse whitespace, Unicode-normalize) while
   preserving the learner's original display text. Validation codes `too_short`,
   `too_long`, `missing_target`, `invalid_input`, `unsupported_language`,
   `attempt_not_eligible`; validation failures never call the model and never
   complete a mission. Target-word/inflection/phrase matching accepts
   capitalization and configured variants but does not silently accept unrelated
   synonyms.
5. The full orchestration service (DOC-09 §17 request lifecycle): authenticate →
   authorize attempt ownership → load authoritative target/learner data →
   normalize → validate → rate-limit → idempotency/dedup check → safety checks →
   build provider-neutral task → call provider → validate/normalize output →
   persist + update mission transactionally → emit privacy-safe telemetry →
   return backend-confirmed result. **Running against only the mock provider in
   this foundation task** (no real provider call yet). The DOC-05 §15 AI feedback
   workflow is mandatory: insert `learner_sentences` → insert
   `ai_feedback_attempts` (pending) → commit → call the provider **outside** the
   transaction → update attempt status → update sentence status → (mission
   step). Dedup key: learner + attempt + target word + normalized sentence +
   prompt version (DOC-09 §19) — repeated equivalent requests never trigger
   duplicate provider calls, duplicate feedback, or double mission completion.
6. The mission-completion step as a **stub/interface point flagged for P4**
   (`D01`/`DEP-03`): the daily-mission / streak / Confidence-Point tables do not
   exist (confirmed at draft time), so the orchestrator exposes a
   `MissionUpdater` interface seam and treats mission-completion as
   backend-decided after successful persistence (DOC-09 §8) — but the real
   `daily_mission_snapshots` write is **not** implemented; no P4 tables are
   invented and the public `missionCompleted` result is surfaced honestly (false
   / not-yet-wired) rather than fabricated. P4 owns the real wiring.
7. Prompt architecture (DOC-09 §14): three backend-built layers — system prompt
   (role, A2/B1 audience, target-word focus, injection protection, structured
   output requirement), developer prompt (classification rules, correction
   priority, field rules/length limits, level-aware behavior, regional-variation
   handling, safety instructions, output schema), user task payload (structured
   data: learner level, target word, part of speech, target meaning, accepted
   forms, learner sentence — serialized as data, never concatenated into
   instruction text). Prompt + output-schema versioning (`sentence-feedback-v1`
   / `feedback-schema-v1`); a material prompt change creates a new version;
   prompts live in version-controlled code. Structured-output validation with
   **one** constrained repair attempt; backend rejects inconsistent
   combinations (e.g. `status=correct` with `target_word_used_correctly=false`),
   invalid enums, empty required fields, excessive lengths, leaked instructions.
8. A production adapter drafted against the narrow T00 `FeedbackProvider`
   interface — **without selecting/hard-configuring a concrete commercial
   provider/model or wiring real credentials** (`D02`). The actual provider/model
   choice, secrets provisioning, and privacy verification (training-data use,
   retention, processing regions, subprocessors, deletion; prefer
   non-training/minimized-retention configs — DOC-09 §21) are an **open founder
   decision**; T02 cannot be accepted until candidates are evaluated and the
   choice + privacy settings are recorded (DOC-09 §18, §21, §24; DOC-12 §5 P3
   gate).
9. Safety and moderation (DOC-09 §15): deterministic validation → lightweight
   local abuse checks → provider moderation when required → safety outcome
   mapping (`allowed`/`allowed_sensitive`/`blocked`/`self_harm_intervention`/
   `moderation_unavailable`, never shown directly) → feedback-model call for
   allowed content → output validation → privacy-safe telemetry. Self-harm
   content interrupts with a crisis-resource message; provider refusals return a
   safe temporary failure, preserve input, allow retry; raw refusal text is
   never shown. Injection resistance: learner input is untrusted text to grade,
   never followed as instructions (DOC-09 §14).
10. The `/api/v1` endpoint for sentence feedback (request/response per DOC-09 §5
    submission/success/failure states; `credentials: "include"`; frontend never
    sends provider prompts/model settings/authoritative vocabulary metadata),
    explicit DTOs (never Ent models), stable operation IDs, committed OpenAPI
    + matched `@vocanova/api-client`. `X-CSRF-Token` and user+operation-scoped
    `Idempotency-Key` on the write.
11. A reusable feedback component wired into the Home, Word-Detail, and
    Review-Completion entry points per DOC-09 §5 (a component, not a primary
    route). Display: overall result, original sentence, corrected sentence when
    needed, short explanation, one improvement tip when useful, AI-limitation
    copy, report action, backend-confirmed mission state. Failure preserves
    input with a safe retryable message and no provider details.
12. Evaluation + observability (DOC-09 §23): deterministic tests, mock-provider
    integration tests, an initial dataset of ≥200 synthetic cases across
    correctness/grammar/regional/ambiguity/injection/sensitive/unsafe/A2-B1
    categories, a stable golden regression set (~50 cases, `golden-set-v1`),
    and observability metrics grouped by prompt version/schema version/provider/
    model/release — never including learner text in metric labels. CI never
    depends on a paid provider. MVP acceptance thresholds (DOC-09 §23) are the
    release-blocking targets; protected live-model evaluation runs outside CI
    under explicit cost limits only after `D02`.
13. Reconcile mock fields touched by P3 (the Sentence-History insight screen and
    any AI/feedback mocks are explicitly post-MVP, DOC-09 §26; P3 does not build
    them), collect the mock-decommission inventory, staging evidence, rollback
    rehearsal, provider-evidence/privacy placeholders, and P3 gate readiness.

Out of scope (do not invent): everything DOC-09 §4 excludes (open-ended chat,
general tutor, essay correction, pronunciation, roleplay, streaming,
user-selectable models, automatic multi-provider routing, fine-tuning,
semantic result-sharing, production prompt self-optimization, etc.); the
Sentence-History screen and sentence-history insights (post-MVP, DOC-09 §26);
missions, streaks, Confidence Points, daily-mission snapshots,
daily-activity summaries, grace days, and any P4 behavior — in particular the
mission-completion write is a P4-flagged stub, do **not** create
`daily_mission_snapshots` / `confidence_point_ledger` / `streak_states` /
`daily_activity_summaries` / `grace_day_ledger` (none exist); account
deletion/anonymization of AI content (DOC-09 §22 — future account-deletion
work); production deployment; real secrets or a concrete commercial
provider/model selection (`D02`); revisiting A1/P1/P2 mechanics; and any
invention not required to pass the P3 gate.

## Risk and protected areas

Proposed **R3** — not a determination. Protected paths: `/apps/api/migrations`
and `/apps/api/ent/schema` (data-integrity, immutable feedback history,
learner-content, forward/backward compatibility, recovery — R3 path floor),
`/apps/api/business/aifeedback` (the first external-paid-provider orchestration:
learner-generated untrusted content, safety/moderation, injection resistance,
privacy minimization, pending-row workflow, idempotency/dedup, cost controls),
and the committed OpenAPI/client contract (drift). This milestone is the
highest-stakes yet (external paid provider, safety, privacy, real
learner-generated content). Under A-003, routine R3 needs strengthened controls
and exact-SHA independent verification, not standing steward/founder approval
solely for being R3; R4 founder authority is unchanged. Several founder-level
decisions below (`D02` production provider/model + privacy, `D03` AI-disable /
cost ceilings, `D04` retention/legal, `D05` entry-point UX placement) are
**open** and become R4 once decided; `D02` is a hard gate on T02 acceptance
(DOC-09 §24; DOC-12 §5). This draft does not resolve them, does not select a
concrete provider/model, and does not wire real credentials.

## Decisions, contradictions, security, and privacy

`VOC-028-D00` — **OPEN, adopted technical baseline (carry-forward proposal).**
P3 builds on the VOC-025 A1 auth/session/requester-context (`Requester`/
`RequesterUserID`), `RequireAuth`, `CSRFMiddleware`, `AuthorizeOwner`, the
user+operation-scoped `Idempotency-Key` handling, and the OpenAPI
generation/commit + matched `@vocanova/api-client` pattern; on the VOC-026 P1
`content`/`learning` modules and `canonical_words`/`word_meanings`/
`word_examples`/`usage_notes`/`user_words` tables; and on the VOC-027 P2
`reviews` business module + `review_attempts` immutable history. The same
deny-by-default, requester-scoped, never-expose-Ent, explicit-DTO, UTC/RFC3339,
UUIDv7, `X-CSRF-Token` double-submit, `Idempotency-Key` user-scoped rules apply.
No A1/P1/P2 mechanics are re-litigated here. Confirmed at draft time:
`daily_mission_snapshots`, `daily_activity_summaries`, `streak_states`,
`confidence_point_ledger`, and `grace_day_ledger` do **not** exist in
`apps/api/ent/schema/` or `apps/api/migrations/` (only `review_attempts`
through VOC-027 exists), and `learner_sentences`/`ai_feedback_attempts` do not
exist yet (P3 creates them). The `idempotency_keys` table (VOC-026 migration)
already exists and supports the `ai_feedback_request` scope (DOC-05 §13).

`VOC-028-D01` — **OPEN/proposed (directed by request).** Because the
daily-mission / streak / Confidence-Point tables genuinely do not exist (see
`D00`/`DEP-03`), the orchestrator's mission-completion step is implemented as a
**stub/interface point flagged for P4**: a `MissionUpdater` seam returns a
backend-decided result after successful persistence (DOC-09 §8), but writes no
`daily_mission_snapshots`/streak/point rows and surfaces `missionCompleted`
honestly (not-yet-wired / false) rather than fabricating completion. No P4 tables
are invented. The founder confirms this stub boundary at adoption; P4 owns the
real wiring. (Recorded so the implementer does not "complete the loop" by
guessing P4 tables.)

`VOC-028-D02` — **OPEN founder decision (R4 once decided; hard gate on T02).**
The production feedback provider/model selection, secrets provisioning, and
privacy verification. Per the request and DOC-09 §18/§21/§24 + DOC-12 §5, this
draft does **not** select/hard-configure a concrete commercial provider/model
or wire real credentials; the production adapter (T02) is drafted against the
narrow T00 `FeedbackProvider` interface only. Before T02 can be accepted, the
founder must evaluate provider candidates in the DOC-09 §18 order
(target-word feedback quality, correction accuracy, meaning preservation,
structured-output reliability, safety/privacy, latency/availability, cost
predictability, operational simplicity), verify privacy settings (training-data
use, retention, processing regions, subprocessors, deletion; prefer
non-training/minimized-retention configs — DOC-09 §21), and record the choice +
configuration (low randomness, short max output, structured output enabled, no
web access/tools/memory). One primary provider/model operated at a time in MVP;
no automatic multi-provider fallback (DOC-09 §17). Secrets remain backend-only
and never enter source (DOC-09 §21; AGENTS safety).

`VOC-028-D03` — **OPEN founder decision.** The emergency AI-disable switch,
global/per-user cost ceilings, monthly hard stop, and the invariant that
non-AI learning features remain available if AI generation is disabled (DOC-09
§19, §25). The disable mechanism + cost-limit values + telemetry/alterting are
a founder product/ops decision; the code seam is drafted in T05 observability
but the activation values are not guessed here.

`VOC-028-D04` — **OPEN founder decision (pre-production, legal review).**
Retention defaults (DOC-09 §21 — learner sentence + structured feedback retained
until account/learner deletion; request-level provider metadata 90 days;
aggregated metrics without learner text long-term; standard logs 30 days max;
raw provider request/response not stored by default; temporary malformed-output
capture 7 days max, off by default; learner reports 180 days post-resolution;
safety investigations up to 180 days). Defaults are configurable and require
legal review before production. The code stores configurable retention knobs
but the defaults/retention-job are not built or guessed in this milestone;
flagged as pre-production founder/legal work.

`VOC-028-D05` — **OPEN founder decision.** The exact entry-point placement and
copy of the reusable feedback component across Home, Word-Detail, and
Review-Completion (DOC-09 §5) — which surfaces launch with the practice input and
which show entry affordances. The component is reusable (T04); the precise
placement/permutation is a founder UX decision; this draft proposes wiring it
primarily from Word-Detail (the natural target-word origin) with Home and
Review-Completion entry points, to be confirmed at adoption.

`VOC-028-D06` — **OPEN/proposed (composite, resolved at adoption).** Composite
record of `D01`–`D05` above for the implementer: mission-completion is a P4
stub (`D01`); no concrete provider/model or credentials are selected — `D02` is
a hard gate on T02 acceptance; AI-disable/cost ceilings are founder-controlled
(`D03`); retention defaults need legal review (`D04`); entry-point UX placement
is a founder decision (`D05`). T00–T01 may proceed under `D00`/`D01` once
adopted; T02 is blocked until `D02` is resolved; T04 placement waits for `D05`.

### Security and privacy

`learner_sentences` is real learner-generated content and `ai_feedback_attempts`
holds structured feedback plus provider metadata — personal data: minimize,
requester-scoped, never expose another learner's sentences/feedback, never log
or analytics-identify learner text, corrected sentences, full explanations,
provider prompts, or raw provider responses (DOC-09 §21). The submit write is
state-changing and requires CSRF (`X-CSRF-Token`) and active auth; idempotency
is required and scoped to the authenticated user (`request_hash`). Inaccessible
or nonexistent owner resources return 404 (no enumeration of another learner's
sentences or attempts). The backend owns all orchestration; the frontend never
sees the provider, holds credentials, constructs prompts, calls moderation
directly, interprets raw output, or determines mission completion (DOC-09 §17).
Provider requests may include only: CEFR level, target word/phrase, target
meaning, part of speech, accepted forms, learner sentence, output-schema
instructions — never name/email/session IDs/IP/account history/streak/
subscription/unrelated vocabulary history/other sentences/internal DB IDs
(DOC-09 §21). Learner input is untrusted: injection instructions embedded in a
sentence must be graded as text, never followed (DOC-09 §14). Provider keys are
backend-only and never enter source. One primary provider/model at a time; no
automatic multi-provider fallback (cost/privacy/debugging — DOC-09 §17). The
provider call is never held inside a DB transaction (DOC-05 §15 / DOC-09 §20).

## Data, migrations, analytics, and accessibility

Migrations: follow DOC-05 §18 order — the skipped P4 tables
(`daily_mission_snapshots`, `daily_activity_summaries`) are **not** created; add
`learner_sentences` then `ai_feedback_attempts` after `review_attempts`.
Reviewed versioned Atlas SQL; forward/backward compatibility review; disposable
PostgreSQL rehearsal; explicit migration execution outside API startup. No `ON
DELETE CASCADE` onto `ai_feedback_attempts` or `learner_sentences` (DOC-05 §16 —
immutable feedback history; learner sentences soft-deleted pending purge). The
`learner_sentences` DB-layer `char_length(sentence_text) <= 1000` check is the
safety net behind the stricter 300-character API limit (DOC-05 §11; DOC-09 §6).
Migration tests assert required FKs, the `ai_feedback_attempts` immutable
constraints, the `learner_sentences` status/source checks, the
`char_length(sentence_text) <= 1000` check, no cascade, idempotency/dedup
uniqueness on the request hash, and the DOC-05 §20 AI feedback lifecycle cases
in scope. Analytics is privacy-constrained: never include learner text in
metric labels; metrics group by prompt version/schema version/provider/model/
release only (DOC-09 §20). Raw provider request/response is not stored by
default; temporary diagnostic capture is off by default, auto-expires, restricts
access, excludes auth data, and logs who enabled it and why (DOC-09 §21).
Accessibility is material for T04: the feedback UI must have labelled controls,
visible focus, semantic correct/needs_improvement/incorrect status (non-color-
only), keyboard reachability for submit/report controls, mobile layout, and
sensible empty/pending/success/failure/safety-intervention states; absent
automation recorded honestly as a limitation, never a pass.