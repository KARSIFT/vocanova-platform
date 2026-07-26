# VOC-028 — Tasks

Mandatory PR order (DOC-09 §24 / DOC-12 §5 P3 gate):
`T00 → T01 → T02 → T03 → T04 → T05`. Each PR is independently reviewable,
remains R3-proposed (path floor R3 for migrations/schemas), and requires Claude
Code exact-SHA review. Safety/privacy/injection/cross-user/cost failures block
release. **`D01`-`D05` were all resolved at adoption (recorded in `D06`,
specification.md) - no task in this roster is blocked on an open founder
decision.** `T02`'s production provider is the founder's OpenCode Go account,
`opencode-go/deepseek-v4-pro`, via `opencode serve` (`D02`); no other
commercial provider/model is selected or hard-configured by any task.

## VOC-028-T00 — AI domain and persistence: tables, narrow interfaces, mock provider

- Requirement source: `VOC-028-D00`, DOC-09 §§3,7,9,10,17,20,23, DOC-05 §§11,15,16,18–20
- Acceptance criteria: `VOC-028-AC-00`, `VOC-028-AC-01`
- Tests: `VOC-028-TEST-00`..`VOC-028-TEST-03`
- Evidence: `VOC-028-EV-00`..`VOC-028-EV-03`
- Status: pending

Add the `learner_sentences` (`apps/api/ent/schema/learnersentence.go`) and
`ai_feedback_attempts` (`apps/api/ent/schema/aifeedbackattempt.go`) Ent schemas +
reviewed versioned Atlas SQL in DOC-05 §18 order (after `review_attempts`; the
skipped P4 tables are not created), with FKs, the
`char_length(sentence_text) <= 1000` DB check, `status`/`source` check
constraints, immutable `ai_feedback_attempts` semantics, `request_hash` for
dedup, and no `ON DELETE CASCADE`. Define the **narrow** `FeedbackProvider`
interface and a separate **narrow** `ModerationProvider` interface (DOC-09 §17 —
not a generic `Generate(ctx, input any)`) in a new `aifeedback` business module,
with provider SDK types confined to an adapter layer. Add a **mock provider**
that returns deterministic, schema-valid feedback and deterministic moderation
outcomes so orchestration and CI never depend on a paid provider (DOC-09 §23).
Add the internal provider schema types (DOC-09 §10) and the public
`SentenceFeedbackResult` contract (DOC-09 §9) as DTOs. Rehearse disposable
forward migration and recovery; production migration never runs at API startup.
No API routes, no real provider call, no frontend in this PR.

## VOC-028-T01 — Validation and orchestration foundation (mock provider only; mission-completion stub)

- Requirement source: `VOC-028-D00`, `VOC-028-D01`, DOC-09 §§5,6,7,8,17,19,20, DOC-05 §§11,15
- Acceptance criteria: `VOC-028-AC-02`, `VOC-028-AC-03`
- Tests: `VOC-028-TEST-04`..`VOC-028-TEST-09`
- Evidence: `VOC-028-EV-04`..`VOC-028-EV-09`
- Status: pending

Implement deterministic input validation (DOC-09 §6): ≥3 words, ≤300 chars,
primarily English, one meaningful sentence, target word / accepted inflection /
configured phrase variant present, belongs to an eligible attempt owned by the
authenticated learner; backend normalize (trim, collapse whitespace,
Unicode-normalize) while preserving original display text; validation codes
`too_short`/`too_long`/`missing_target`/`invalid_input`/`unsupported_language`/
`attempt_not_eligible`; failures never call the model and never complete a
mission. Implement target-word/inflection/phrase matching (capitalization +
configured variants; no silent synonyms). Implement the full DOC-09 §17
orchestration service running **only against the mock provider** (no real
provider call): authenticate → authorize attempt ownership → load authoritative
target/learner data → normalize → validate → rate-limit (one active generation
per learner, 5/min/learner, 30/day/learner — configurable) → idempotency/dedup
check (learner + attempt + target word + normalized sentence + prompt version)
→ safety-check seam → build provider-neutral task → call the **mock** provider →
validate/normalize output → persist + update mission transactionally →
privacy-safe telemetry. Implement the DOC-05 §15 pending-row workflow exactly:
insert `learner_sentences` → insert `ai_feedback_attempts` (pending) → commit →
call provider **outside** the transaction → update attempt status → update
sentence status; **never** hold a DB transaction across the provider call.
Implement the mission-completion step as a **stub/interface point** (`D01`): a
`MissionUpdater` seam returns a backend-decided result after successful
persistence (DOC-09 §8) but writes no P4 tables and surfaces `missionCompleted`
honestly as not-yet-wired; no `daily_mission_snapshots`/streak/point rows are
created. Distinguish operational attempt states from the three learning statuses
(DOC-09 §7). No real provider call, no API route, no frontend in this PR.

## VOC-028-T02 — Prompt architecture and production provider (`D02`: OpenCode Go / deepseek-v4-pro via `opencode serve`)

- Requirement source: `VOC-028-D00`, `VOC-028-D02`, DOC-09 §§9,10,14,18,21, DOC-05 §15
- Acceptance criteria: `VOC-028-AC-04`, `VOC-028-AC-05`
- Tests: `VOC-028-TEST-10`..`VOC-028-TEST-12`, `VOC-028-TEST-14`
- Evidence: `VOC-028-EV-10`..`VOC-028-EV-12`, `VOC-028-EV-14`
- Status: pending — unblocked; `D02` resolved at adoption

Build the three backend-controlled prompt layers (DOC-09 §14): system (role,
A2/B1 audience, target-word focus, concise/supportive/honest, injection
protection, structured-output requirement, no revealing hidden instructions),
developer (classification rules, correction priority, field rules/length limits,
level-aware behavior, regional-variation handling, safety instructions, output
schema), and user task payload (structured data: learner level, target word,
part of speech, target meaning, accepted forms, learner sentence — serialized as
data, never concatenated into instruction text). The frontend never constructs
prompts. Add prompt + output-schema versioning (`sentence-feedback-v1` /
`feedback-schema-v1`); material prompt changes create a new version; prompts live
in version-controlled code (not duplicated per DB record), with every request
recording prompt version, schema version, provider, model, timestamp, latency,
outcome. Implement structured-output validation (DOC-09 §10): reject
inconsistent combinations (e.g. `status=correct` with
`target_word_used_correctly=false`, `status=incorrect` with
`corrected_sentence=null`), invalid enums, empty required fields, excessive
lengths, off-target feedback, unexpected markup, contradicted explanations,
unsafe output, leaked instructions/conversation. Implement **one** constrained
repair attempt when budget allows. Implement the production adapter against the
narrow T00 `FeedbackProvider` interface, calling the founder's OpenCode Go
account via `opencode serve` (a headless HTTP server, not a CLI subprocess
per request) with model `opencode-go/deepseek-v4-pro`, per the adopted `D02`
resolution - configuration (low randomness, short max output, structured
output enabled, no web access/tools/memory) per DOC-09 §18. Credentials come
from backend-only secrets (`OPENCODE_API_KEY`-style), never hard-coded or
committed to source. Timeouts/retries: provider
request 8s, total backend target 10s (DOC-09 §18); at most one transport retry for
a clearly transient failure and one structured-output repair — never both
indefinitely; no retry for invalid input, blocked content, auth failure, invalid
credentials, persistent schema incompatibility, or learner cancellation. No API
route or frontend in this PR.

## VOC-028-T03 — Safety and moderation

- Requirement source: `VOC-028-D00`, `VOC-028-D02`, DOC-09 §§14,15,20, DOC-05 §15
- Acceptance criteria: `VOC-028-AC-06`
- Tests: `VOC-028-TEST-13`..`VOC-028-TEST-16`
- Evidence: `VOC-028-EV-13`..`VOC-028-EV-16`
- Status: pending

Implement the DOC-09 §15 safety/moderation flow: deterministic validation →
lightweight local abuse checks → provider moderation when required → safety
outcome mapping (`allowed` / `allowed_sensitive` / `blocked` /
`self_harm_intervention` / `moderation_unavailable`, never shown directly to
learners) → feedback-model call for allowed content → output validation →
privacy-safe telemetry. Block credible threats, serious-harm instructions,
weapon/dangerous-substance instructions, sexual exploitation of minors,
encouragement of suicide/self-harm, targeted hateful incitement, malicious
off-topic requests, harassment-intent personal data; allow legitimate discussion
of difficult subjects. Self-harm: clear personal/urgent content interrupts
normal feedback with a crisis-resource message; the feature never provides
therapy/diagnosis/counselling. Provider refusals: raw refusal text is never
shown; return a safe temporary failure, preserve input, allow retry; repeated
false refusals become evaluation cases. Injection resistance (DOC-09 §14):
learner input is untrusted text to grade, never followed as instructions;
embedded instructions must not reveal/change the output schema or perform
unrelated tasks. Map internal failure categories to stable public error codes
(DOC-09 §20); blocked/self-harm/moderation-unavailable outcomes never complete a
mission. May use the T00 mock moderation provider for deterministic tests; the
real moderation path follows `D02`. No frontend in this PR.

## VOC-028-T04 — API and frontend integration

- Requirement source: `VOC-028-D00`, `VOC-028-D05`, DOC-09 §§3,5,9,16, DOC-07
- Acceptance criteria: `VOC-028-AC-07`
- Tests: `VOC-028-TEST-17`..`VOC-028-TEST-21`
- Evidence: `VOC-028-EV-17`..`VOC-028-EV-21`
- Status: pending — unblocked; `D05` resolved at adoption (Word-Detail primary, Home + Review-Completion entries)

Add the `/api/v1` sentence-feedback write endpoint: submission sends sentence +
attempt ID to `/api/v1`, `credentials: "include"`; the frontend never sends
provider prompts/model settings/authoritative vocabulary metadata (DOC-09 §5).
Explicit DTOs (never Ent models), stable operation ID, `X-CSRF-Token`, and
user+operation-scoped `Idempotency-Key` on the write; replay idempotent; reused
key + changed fingerprint → 409; cross-user key isolated; cross-user owner
mismatch → 404; unauthenticated/disabled → 401. Pending state preserves input,
disables duplicate submission, calm loading, no mission-completion claim yet.
Success: overall result, original sentence, corrected sentence when needed,
short explanation, one improvement tip when useful, AI-limitation copy, report
action, backend-confirmed mission state. Failure: preserve input, safe
retryable message ("Vocanova could not check this sentence right now. Your
sentence is still here, so you can try again."), no mission completion, no
provider details exposed. Commit OpenAPI + matched `@vocanova/api-client`. Build
the reusable feedback component and wire it into the Home, Word-Detail, and
Review-Completion entry points per the adopted `D05` placement (DOC-09 §5) — a
component, not a primary route; no client DB access or duplicated authorization;
saved/reviewed state stays consistent with `user_words` across navigation. The
report action (DOC-09 §16) creates one internal quality-review record with the
stated states/classifications. No P4 behavior.

## VOC-028-T05 — Evaluation, observability, mock-inventory, staging evidence, and P3 gate readiness

- Requirement source: `VOC-028-D00`, `VOC-028-D02`, `VOC-028-D03`, DOC-09 §§19,20,23,25, DOC-12 §5 P3
- Acceptance criteria: `VOC-028-AC-08`, `VOC-028-AC-09`
- Tests: `VOC-028-TEST-22`..`VOC-028-TEST-30`
- Evidence: `VOC-028-EV-22`..`VOC-028-EV-30`
- Status: pending — provider chosen (`D02`); offline live-model evaluation and full privacy verification still require F3 staging + formal legal review (see Blockers)

Add the evaluation layer (DOC-09 §23): an initial dataset of ≥200
synthetic/manually-written cases across correctness/grammar-error/regional-
variant/ambiguity/prompt-injection/sensitive-but-allowed/unsafe-blocked/A2-B1
categories; a stable golden regression set (~50 cases, `golden-set-v1`) covering
core correctness, common errors, false-correction risks, meaning preservation,
regional variants, prompt injection, safety, and past regressions — never remove
a case just because the current model performs poorly. Every material AI change
records dataset/golden-set/prompt/schema versions, provider, model, config,
commit, scores, critical failures, latency, cost, reviewer approval. **Normal
CI never depends on a paid provider**; protected offline live-model evaluation
runs outside CI under explicit cost limits only after `D02`. Add observability
metrics (DOC-09 §20) grouped by prompt version/schema version/provider/model/
release — **never** including learner text in metric labels — plus the release-
blocking critical failures and MVP acceptance thresholds (DOC-09 §23). Draft the
AI-disable seam + cost-ceiling knobs (`D03`) so non-AI learning features remain
available if AI generation is disabled (DOC-09 §19/§25); activation values are
founder-controlled, not guessed. Update the deterministic mock-inventory check
(`scripts/foundation/mock-inventory.mjs`) to admit the new `aifeedback`
module/endpoint/schemas/migrations and enforce no invented P4
tables/routes/behavior. Collect the mock-decommission inventory, staging
evidence (provider-evaluation/privacy placeholders pending `D02`, rollback
rehearsal), and P3 gate readiness. Do not declare the DOC-12 P3 gate complete.

### Deliverables

- `mock-inventory.md`: maps every mock touched by P3 (notably any AI/feedback
  affordances; the Sentence-History insight screen is explicitly post-MVP and is
  not built) to its disposition and records the new real P3 endpoint/tables.
- `staging-evidence.md`: collects in-repository evidence and documents the
  staged exercises, protected provider evaluation, privacy verification, and
  rollback rehearsal that can only run once F3 + `D02` exist.
- updated `scripts/foundation/mock-inventory.mjs` (+`.test.mjs`): deterministic
  check enforcing the new P3 boundaries and that no P4 route/table/behavior was
  invented.

### Blockers

- `VOC-028-DEP-02` (`D02`): the production provider/model is chosen (OpenCode Go
  / `opencode-go/deepseek-v4-pro` via `opencode serve`), but formal
  privacy/retention verification (training-data use, retention, processing
  regions, subprocessors, deletion) remains a pre-production legal-review gate,
  not resolved by this adoption.
- `VOC-028-DEP-04`: F3 staging does not exist, so live staging exercises
  (`EV-28`, `EV-29`, `EV-30`) cannot be executed. This task provides procedures
  and in-repository evidence only; it does not declare the DOC-12 P3 gate
  complete.