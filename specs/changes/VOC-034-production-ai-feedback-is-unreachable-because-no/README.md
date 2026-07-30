# VOC-034 — Wire a Real Moderation Provider into Production AI Feedback

**Draft — not adopted. Nothing in this package is implementation-authorized.**

## Identity and lifecycle

- Package ID: `VOC-034`; canonical path:
  `specs/changes/VOC-034-production-ai-feedback-is-unreachable-because-no/`.
- Lifecycle: **draft**, pending human founder/steward review
  (`approval_status: not-approved`, `implementation_authorized: false`,
  `automatic_merge_allowed: false` in `change.yaml`). Nothing here may be treated as
  adopted, approved, or ready to implement until a human changes those fields.
- Risk: proposed **R3** on semantic AI-provider/safety-consequence grounds
  (`docs/governance/change-risk-classification.md`'s R3 row explicitly names
  "AI-provider controls"), independent of path matching — see `specification.md`
  "Risk and protected areas" for the full path-floor command output and the
  reasoning for proposing R3 regardless of it. This is a proposal for a human to
  review at adoption time, not a determination.
- Decision owner: founder; target branch: `develop`; base:
  `fd4cc636815d6a87f7696b998b5c9304b4b34467`.
- Request source: GitHub issue
  [#216](https://github.com/KARSIFT/vocanova-platform-sandbox/issues/216),
  "Production AI feedback is unreachable because no moderation provider is wired" —
  see `specification.md` for the full requirement traceability, including the exact
  file/line root-cause citations this draft confirmed by direct inspection at
  `base_sha`.
- A-003 is active: routine R3 requires strengthened controls and exact-SHA
  independent verification but not standing steward/founder approval solely because
  it is R3.

## Objective and requirement source

Fix a production-wiring defect that makes real AI-feedback generation unreachable
on the live `POST /api/v1/sentence-feedback` route: `apps/api/app/api/production.go`
passes a literal `nil` `SafetyClassifier` into `aifeedback.NewService`, which the
service layer already, correctly, replaces with a `CompositeSafetyClassifier` that
has no moderation provider — so every ordinary sentence (one that doesn't match a
deterministic local weapon/self-harm pattern) fails closed with
`SAFETY_MODERATION_UNAVAILABLE`, and the real feedback provider is never called. No
staging environment variable can fix this; `OpenCodeFeedbackProvider` (the real,
already-working feedback adapter) implements only `FeedbackProvider`, not the
separate `ModerationProvider` interface DOC-09's architecture calls for. See
`specification.md` for the full root-cause citation and design.

## Scope, non-goals, risk, and protected areas

Scope: a new `OpenCodeModerationProvider` against the real `opencode serve`
session/message API with a strict, injection-resistant contract; a behavior-
preserving shared-transport extraction in `opencode.go`; production wiring via a new
`buildAIProviders` helper (mirroring this file's existing
`buildEmailSender`/`buildOAuthProvider` pattern) that replaces the `nil`; a
production-wiring regression test at the actual product route; a comment-only
`.env.example` accuracy update; and a post-merge live-staging-verification task.
Full four-task breakdown in `tasks.md` (`T00 → T01 → T02 → T03`).

Non-goals: any change to `service.go`'s orchestration or `safety.go`'s
`CompositeSafetyClassifier` logic (both already correct); any new environment
variable or independently-configurable moderation model/timeout (flagged as an open
question, not decided); any public API contract change; any full sqlmock-backed
`NewProductionAPI` HTTP test (a smaller two-level test strategy is proposed instead,
`VOC-034-D06`, explicitly flagged for the adopting human to weigh); any change to
`.github/workflows/*`; any live deployment performed by this planning pass. Full
list in `specification.md`.

Protected areas touched: `apps/api/business/aifeedback/*` (new files, one
behavior-preserving refactor), `apps/api/app/api/production.go` and its tests
(new helper, new tests), `apps/api/app/api/aifeedback_test.go` (new regression
test), `apps/api/.env.example` (comment-only). Active governance model: A-003
(routine R3, strengthened controls, independent verification — see `CLAUDE.md`). No
EHR trigger; no R4 consequence in scope, so R4 founder authority is not implicated by
this package's own scope.

An open decision, `VOC-034-D06` in `specification.md`, is explicitly flagged rather
than silently resolved: the production-wiring regression test is proposed at two
smaller, targeted levels (a `buildAIProviders` unit test plus a route-level test
using in-memory fakes and a fake HTTP server) rather than one full
`NewProductionAPI`-plus-real-Postgres HTTP test, to keep the diff proportionate to
this package's narrow scope. An adopting human may instead require the heavier test.

## Verification, approvals, release, and closure

Every PR in this package requires Claude Code review bound to the exact final SHA;
authorization, safety-contract-correctness, and diff-scope findings block release.
Run the deterministic commands in `implementation-plan.md` per PR (Go
vet/format/test, this repository's own governance/risk-classification scripts),
plus `VOC-034-T02`'s own route-level regression-test run as evidence. This package
authorizes no deployment; `VOC-034-T03`'s live-staging verification runs after
`T00`–`T02` merge using the existing, unmodified `deploy-staging` pipeline — see
`release-plan.md` and `staging-evidence.md`.
