# VOC-028 — Begin Milestone P3: Sentence Practice and AI Feedback

**Draft package — not adopted, not approved, and not implementation authority.**
Human adoption, resolution of the stated open decisions (notably the production
provider/model + privacy choice), and separate implementation authorization are
required before work begins. No authorization, approval, activation, deployment,
or closure field is set by this draft.

## Identity and lifecycle

- Package ID: `VOC-028`; canonical path:
  `specs/changes/VOC-028-begin-milestone-p3-sentence-practice-and-ai/`.
- Lifecycle: `draft`; every authorization field in `change.yaml` remains at its
  unadopted default (`approval_status: not-approved`,
  `implementation_authorized: false`, `automatic_merge_allowed: false`,
  `production_impact: unknown`, `repository_adoption_status: not-adopted`).
- Proposed risk: **R3** (proposal only — not a determination). This milestone adds
  the `learner_sentences` and `ai_feedback_attempts` tables and their migration
  (`/apps/api/migrations`, `/apps/api/ent/schema` — R3 path floor), exposes the
  first AI-orchestration + provider path, a requester-scoped write that persists
  learner-generated content and AI feedback, and commits OpenAPI/client contract
  drift. The path-based classifier (`scripts/governance/classify-change-risk.sh`)
  floors these paths at R3; the implementation-time classifier, builder, verifier,
  and applicable human authority govern the actual class. Several founder-level
  decisions below (`D02` production provider/model + privacy, `D03` AI-disable /
  cost ceilings, `D04` retention/legal, `D05` entry-point UX placement) are
  **open** and become R4 once decided; the production-provider PR (T02) cannot be
  accepted until `D02` is resolved and recorded (DOC-09 §18/§21/§24; DOC-12 §5 P3
  gate). This draft does not decide them and does not select a concrete
  commercial provider/model or wire real credentials.
- Decision owner: founder; target branch: `develop`; request source: free text
  (the DOC-12 §5 P3 paragraph plus the supplied request, grounding DOC-09 in
  full).
- A-003 is active: routine R3 requires strengthened controls and exact-SHA
  independent verification but not standing steward/founder approval solely
  because it is R3. An R4 product/scope, privacy, vendor/cost, or material
  user-trust decision remains founder-controlled. Every P3 PR requires Claude
  Code review; safety/privacy/injection/cross-user/cost failures block release.
  EHR is not presumed (this is a new external paid provider + safety feature, not
  the historical A-003 migration; any exceptional review is not a standing layer).

## Objective and requirement source

Begin DOC-12 §5 P3: original-sentence practice with focused, accurate,
encouraging AI feedback — one MVP capability, Learner Sentence Feedback (DOC-09
§3): validate the sentence → check target-vocabulary presence → apply safety
controls → call the configured AI model → validate the structured result → store
it → update the daily sentence mission → display concise feedback (DOC-09 §3, §17
request lifecycle). Ground the AI-feature design in DOC-09 **in full** and follow
its §24 mandatory six-PR order exactly: (1) AI domain and persistence, (2)
validation and orchestration foundation, (3) prompt and production provider, (4)
safety and moderation, (5) API and frontend integration, (6) evaluation and
observability. Ground persistence in DOC-05 §11 (`learner_sentences`,
`ai_feedback_attempts`) and DOC-05 §15 (the AI feedback workflow — **never hold a
DB transaction during the external AI call**). Ground input validation in DOC-09
§6, prompt architecture in DOC-09 §14, safety/moderation in DOC-09 §15, the
public result contract in DOC-09 §9, and evaluation/observability in DOC-09 §23.
The A1 auth/session/requester-context and OpenAPI/commit pattern established by
VOC-025, the P1 content/learning foundation established by VOC-026, and the P2
`reviews` business module + `review_attempts` history established by VOC-027
carry forward unchanged. The production provider/model choice, secrets
provisioning, and privacy verification are explicitly **open founder decisions**
(`D02`) — not selected or wired by this draft.

## Scope, non-goals, risk, and protected areas

Scope is the DOC-09 §24 mandatory six-PR sequence: (T00) `learner_sentences` +
`ai_feedback_attempts` persistence + migration + the narrow `FeedbackProvider`
and `ModerationProvider` interfaces + a mock provider (no real provider call);
(T01) deterministic input validation (DOC-09 §6), target-word/inflection/phrase
matching, and the full orchestration service using **only the mock provider**
(no real provider call yet), with the DOC-05 §15 pending-row workflow and the
mission-completion step implemented as a **stub/interface point flagged for P4**
because the daily-mission/streak tables do not exist yet (`D01`/`DEP-03` — do not
invent P4 tables); (T02) prompt architecture (system/developer/user-payload
layering per DOC-09 §14), prompt versioning, structured-output validation with
one repair attempt, and a production adapter drafted against the narrow T00
interface — **without selecting/hard-configuring a concrete commercial
provider/model or wiring real credentials** (`D02`); (T03) safety and moderation
per DOC-09 §15 (`allowed`/`allowed_sensitive`/`blocked`/`self_harm_intervention`/
`moderation_unavailable` outcomes, injection resistance); (T04) the `/api/v1`
endpoint and a reusable feedback component wired into the Home, Word-Detail, and
Review-Completion entry points per DOC-09 §5; (T05) evaluation and observability
per DOC-09 §23 (deterministic tests, mock-provider integration tests, golden
regression set, CI never depends on a paid provider) plus mock-inventory,
staging-evidence, and P3 gate readiness.

Excluded (DOC-09 §4): open-ended AI chat, general AI tutor, essay correction,
pronunciation scoring/speech recognition, roleplay, AI-generated courses/
vocabulary definitions as authoritative source, automated CEFR certification,
unrestricted follow-ups, user-selectable models, automatic multi-provider
routing/fallback, model fine-tuning, semantic result-sharing across learners,
streaming output, production prompt self-optimization, emotion/personality
inference, content-based advertising. Also excluded: missions, streaks,
Confidence Points, daily-mission snapshots, daily-activity summaries, grace days,
and any P4 behavior — the mission-completion step is a P4-flagged stub, no P4
tables are invented; account deletion/anonymization of AI content (DOC-09 §22)
is owned by the future account-deletion work, not built here; production
deployment; real secrets; a concrete commercial provider/model selection
(`D02`).

Protected: database migrations, Ent schemas, immutable `ai_feedback_attempts`
history and learner-owned `learner_sentences` content, the pending-row workflow
(never hold a transaction across the external AI call), requester-scoped
authorization, idempotency/dedup, injection resistance, safety/moderation
outcomes (blocked/self-harm content never completes a mission), privacy
minimization (no learner text in logs/metrics, no raw provider payload retained
by default), provider keys backend-only, cost controls (validate before paid
calls, dedup, per-user/global limits, AI-disable switch with non-AI features
remaining available), and the committed OpenAPI/client contract. Rollback must
preserve feedback history and learner sentences; a reverted migration must never
destroy learner content or immutable feedback history.

## Verification, approvals, release, and closure

Every P3 PR requires Claude Code review bound to the exact final SHA;
safety/privacy/injection/cross-user/cost/persistence/authorization findings
block release. Run installed commands (`pnpm validate`, `pnpm test`, `pnpm build`,
the `scripts/governance/*` checks as applicable, plus the Go format/vet/test/build
and web lint/typecheck/build suites discovered at the adopted base) and the
deterministic validation/orchestration/provider-mock/safety/contract/privacy/
evaluation tests this package adds. Staging validation, a protected
dev/staging provider evaluation with cost ceiling, rollback rehearsal, provider
privacy verification, and AI-disable validation are required before the DOC-12
P3 gate can be evaluated; live staging evidence is blocked until the F3 staging
environment exists (`DEP-04`). This draft grants no approval, merge, activation,
credentials, deployment, or closure authority, and the package is not adopted.
The production-provider PR (T02) additionally cannot be accepted until `D02`
candidates and privacy settings are evaluated and recorded (DOC-09 §24; DOC-12 §5).