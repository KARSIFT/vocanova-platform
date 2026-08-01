# VOC-035 — Add a Google Gemini AI-Feedback/Moderation Provider Alongside OpenCode

**Draft — not adopted. Not implementation-authorized.**

## Identity and lifecycle

- Package ID: `VOC-035`; canonical path:
  `specs/changes/VOC-035-voc-032-t10-s-live-ai-evaluation-gate-ev-22-is/`.
- Lifecycle: **draft**. `change.yaml`'s `approval_status: not-approved`,
  `implementation_authorized: false`, `automatic_merge_allowed: false` are the
  template's own unadopted defaults and are not changed by this drafting run —
  adoption is a distinct, later human action.
- Risk: proposed **R3**, on the same semantic "AI-provider controls" grounds
  `VOC-034` was adopted under (`docs/governance/change-risk-classification.md`'s R3
  row), and independently confirmed as the path-based floor because this
  package's planned diff touches `apps/api/.env.example` — see
  `specification.md` "Risk and protected areas" for the full
  `classify-change-risk.sh` output. **This is a draft proposal for a human to
  review at adoption time, never a determination** — the repository's own
  deterministic path-based floor and a human's own judgment govern the
  implemented tasks, not this proposal.
- Decision owner: founder; target branch: `develop`; base:
  `56d47cf5fe1b425b3c87be43274506300468e304`.
- Request source: a founder free-text request (recorded verbatim in
  `change.yaml`'s `requirement_source`), grounded against
  `specs/changes/VOC-032-begin-milestone-r1-staging-readiness-docs-product/staging-evidence.md`'s
  `EV-22` section and this repository's own `apps/api/business/aifeedback/`
  and `apps/api/app/api/production.go` at this package's `base_sha`. No GitHub
  issue exists yet for this request.
- A-003 is active: routine R3 requires strengthened controls and exact-SHA
  independent verification but not standing steward/founder approval solely
  because it is R3 — that authority question is separate from, and does not by
  itself resolve, the adoption decision this package still requires.

## Objective and requirement source

`VOC-032-T10`'s live AI-evaluation gate (`EV-22`) is currently release-blocking:
the founder-configured OpenCode Go provider (`opencode-go/hy3`) timed out on all
56 evaluation cases within DOC-09 §18 / DOC-06 §12's mandated 8-second
per-request budget, and every other model tried on that same OpenCode account
either timed out, errored, or required an unapproved China-hosting opt-in — see
`specs/changes/VOC-032-begin-milestone-r1-staging-readiness-docs-product/staging-evidence.md`'s
`EV-22` section for the full recorded evidence this package treats as
authoritative and does not re-litigate. The founder has decided to add Google
Gemini (`gemini-2.5-flash`, free tier) as a real, alternative AI-feedback and
moderation provider for `apps/api/business/aifeedback`, implementing the same
`FeedbackProvider`/`ModerationProvider` interfaces `VOC-034` established,
following that package's own design pattern (shared internal HTTP-transport
helper, strict output-schema validation, fail-closed on any
malformed/unrecognized model output). See `specification.md` for the full
design and the exact Gemini REST contract this package is grounded against.

## Scope, non-goals, risk, and protected areas

Scope: a new `GeminiFeedbackProvider`/`GeminiModerationProvider` pair in
`apps/api/business/aifeedback/` against the real Gemini `generateContent` REST
API; a shared, unexported `geminiTransport` helper (mirroring `opencode.go`'s
`openCodeTransport`); wiring into `apps/api/app/api/production.go`'s
`buildAIProviders` so `AI_PROVIDER=gemini` selects it; deterministic unit tests
against a fake HTTP transport (no live Gemini call from CI); a T10-equivalent
provider-selectable live-evaluation path in `apps/api/cmd/eval-live`; and a
post-merge live-evaluation task recording an honest result — pass, fail, or
still-blocked — in this package's own `staging-evidence.md` once the founder
provisions a free Gemini API key. Full four-task breakdown in `tasks.md`
(`T00 → T01 → T02 → T03`).

Non-goals: any change to `service.go`'s orchestration logic or `safety.go`'s
`CompositeSafetyClassifier` (both explicitly out of scope, mirroring `VOC-034`'s
own non-goals); removing, replacing, or changing the default behavior of
`OpenCodeFeedbackProvider`/`OpenCodeModerationProvider` (Gemini is additive,
selected by an explicit operator env-var choice, not a default-changing
replacement); OAuth or any multi-step Gemini auth flow (Gemini's own
single-API-key model is used as-is); any new public API contract, DTO, or error
code; any live Gemini call performed by this drafting or implementation pass.
Full list in `specification.md`.

Protected areas touched: `apps/api/business/aifeedback/*` (new files only, no
existing-file behavior change), `apps/api/app/api/production.go` and its tests
(new branch in an existing helper, new tests), `apps/api/cmd/eval-live/main.go`
and its tests (new provider-selection flag), `apps/api/.env.example`
(new/updated comments, at most one new variable — see `VOC-035-D02`). Active
governance model: A-003 (routine R3, strengthened controls, independent
verification — see `CLAUDE.md`). No EHR trigger identified; no R4 consequence
identified in scope, so R4 founder authority is not implicated by this
package's own scope as drafted — flagged as an open question in
`specification.md` for a human to confirm, not assumed.

This package leaves two decisions explicitly open for the adopting human,
recorded as open questions rather than guessed past (see `specification.md`
`VOC-035-D02` and `VOC-035-D05`): the exact `AI_PROVIDER_*` environment-variable
naming for Gemini's single-API-key model where it does not cleanly map onto the
existing OpenCode-shaped names, and whether `AI_PROVIDER=gemini` should ever
become this repository's *default* fallback (this draft proposes: no — the
default stays `opencode`, per `apps/api/app/api/production.go`'s existing
`ProviderOpenCode` default, until a human decides otherwise).

## Verification, approvals, release, and closure

Not yet applicable — this package is a draft. Once adopted, every PR in this
package would require Claude Code review bound to the exact final SHA per
`CLAUDE.md`; the deterministic commands in `implementation-plan.md`
(Go vet/format/test, this repository's own governance/risk-classification
scripts) would run per PR; and `VOC-035-T03`'s live-evaluation task would
require the founder's own provisioned Gemini API key and would record its
result — pass, fail, or still-blocked — honestly in `staging-evidence.md`,
never a fabricated pass. See `release-plan.md` for the full (currently
not-yet-authorized) release posture.
