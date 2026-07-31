# VOC-036 — Add a Cloudflare Workers AI AI-Feedback/Moderation Provider Alongside OpenCode and Gemini

**Draft — not adopted. Not implementation-authorized.**

## Identity and lifecycle

- Package ID: `VOC-036`; canonical path:
  `specs/changes/VOC-036-voc-032-t10-s-live-ai-evaluation-gate-ev-22-is/`.
- Lifecycle: **draft**. `change.yaml`'s `approval_status: not-approved`,
  `implementation_authorized: false`, `automatic_merge_allowed: false` are the
  template's own unadopted defaults and are not changed by this drafting run —
  adoption is a distinct, later human action.
- Risk: proposed **R3**, on the same semantic "AI-provider controls" grounds
  `VOC-034` and `VOC-035` were proposed under, and independently confirmed as the
  path-based floor because this package's planned diff touches
  `apps/api/.env.example` — see `specification.md` "Risk and protected areas"
  for the full `classify-change-risk.sh` output. **This is a draft proposal for
  a human to review at adoption time, never a determination.**
- Decision owner: founder; target branch: `develop`; base:
  `c69b270a164bf2cb386f1b7637a7c3ab96af5bd0`.
- Request source: a founder free-text request (recorded verbatim in
  `change.yaml`'s `requirement_source`), grounded against
  `specs/changes/VOC-032-.../staging-evidence.md`'s `EV-22` section, the
  founder's own account that `VOC-035`'s Gemini alternative also failed its live
  evaluation (a stale, new-key-blocked default model plus an unpaced free-tier
  rate-limit burst — not a model-quality problem), and this repository's own
  `apps/api/business/aifeedback/` (`opencode.go`, `gemini.go`, `moderation.go`,
  `task.go`) and `apps/api/app/api/production.go`/`apps/api/cmd/eval-live/main.go`
  at this package's `base_sha`. No GitHub issue exists yet for this request.
- **This drafting pass found and flags, rather than silently resolves, a
  discrepancy**: `VOC-035`'s own `staging-evidence.md`, as read at this
  package's `base_sha`, still records `VOC-035-T03` as not-yet-attempted/blocked
  — it does not yet contain the Gemini live-run failure the founder's request
  describes. See `specification.md` "Objective and requirement source" for the
  full detail; this package proceeds on the founder's own stated account as its
  requirement-source fact, while flagging that `VOC-035`'s own evidence record
  should be reconciled by that package's own separate closure process.
- A-003 is active: routine R3 requires strengthened controls and exact-SHA
  independent verification but not standing steward/founder approval solely
  because it is R3 — that authority question is separate from, and does not by
  itself resolve, the adoption decision this package still requires.

## Objective and requirement source

`VOC-032-T10`'s live AI-evaluation gate (`EV-22`) remains release-blocking:
OpenCode's account is exhausted (per `VOC-032`'s own recorded `EV-22` evidence)
and Gemini's own live evaluation (`VOC-035`) also failed, per the founder's own
account, for reasons unrelated to model quality (a stale default model blocked
for new API keys, and free-tier rate-limiting on an unpaced 56-request burst).
The founder has decided to add Cloudflare Workers AI as a third real,
alternative AI-feedback and moderation provider for `apps/api/business/aifeedback`,
implementing the same `FeedbackProvider`/`ModerationProvider` interfaces
`VOC-034`/`VOC-035` already established (shared internal HTTP-transport helper,
strict output-schema validation via Cloudflare's own `response_format:
{type: "json_schema", ...}` parameter, fail-closed on any malformed/blocked
output, `MaxRetries` appropriate for the 8-second DOC-09 §18 total budget), using
a model from Cloudflare's documented JSON-Schema-structured-output-capable set
(Llama 3.3 or DeepSeek variants, per Cloudflare's own current documentation —
see `specification.md` `VOC-036-D07`). See `specification.md` for the full
design and the exact Cloudflare Workers AI REST contract this package is
grounded against.

## Scope, non-goals, risk, and protected areas

Scope: a new `CloudflareFeedbackProvider`/`CloudflareModerationProvider` pair in
`apps/api/business/aifeedback/` against the real Cloudflare Workers AI
`POST /accounts/{account_id}/ai/run/{model}` REST API; a shared, unexported
`cloudflareTransport` helper (mirroring `opencode.go`'s/`gemini.go`'s own
transport helpers); wiring into `apps/api/app/api/production.go`'s
`buildAIProviders` so `AI_PROVIDER=cloudflare` selects it; a proposed extension
to the `AI_PROVIDER_*` env-var convention adding one new variable,
`AI_PROVIDER_ACCOUNT_ID`, to carry Cloudflare's required (non-secret) account
identifier alongside the reused `AI_PROVIDER_API_KEY` (the Cloudflare API
token) — **explicitly flagged for the founder to confirm or reject at
adoption**, per the founder's own instruction; deterministic unit tests against
a fake HTTP transport (no live Cloudflare call from CI); a T10-equivalent
provider-selectable live-evaluation path in `apps/api/cmd/eval-live`, extended
with a new request-pacing mechanism (`--request-interval` /
`EVAL_LIVE_REQUEST_INTERVAL`) that VOC-035's own unpaced-burst rate-limit
failure motivates; and a post-merge live-evaluation task recording an honest
result — pass, fail, or still-blocked — in this package's own
`staging-evidence.md` once the founder provisions a Cloudflare API token and
account ID. Full six-task breakdown in `tasks.md` (`T00 → T01 → T02 → T03`).

Non-goals: any change to `service.go`'s orchestration logic or `safety.go`'s
`CompositeSafetyClassifier` — **both explicitly named as out of scope by the
founder's own request**; removing, replacing, or changing the default behavior
of `OpenCodeFeedbackProvider`/`OpenCodeModerationProvider` or
`GeminiFeedbackProvider`/`GeminiModerationProvider` (Cloudflare is additive,
operator-opt-in, not a default-changing replacement); any Cloudflare Worker,
`wrangler.*` config, or edge-compute deployment (this package calls Cloudflare's
inference REST API over plain HTTPS from the existing Go backend, exactly like
the other two providers — it deploys nothing to Cloudflare's edge network); any
new public API contract, DTO, or error code; any live Cloudflare call performed
by this drafting or implementation pass; reconciling `VOC-035`'s own
`staging-evidence.md` discrepancy noted above (flagged for that package's own
separate closure, not resolved here). Full list in `specification.md`.

Protected areas touched: `apps/api/business/aifeedback/*` (new files only, no
existing-file behavior change), `apps/api/app/api/production.go` and its tests
(new branch, new tests), `apps/api/cmd/eval-live/main.go` and its tests (new
provider case, new pacing flag, new tests), `apps/api/.env.example` (new
comments and one genuinely new variable — see `VOC-036-D02`). Active
governance model: A-003 (routine R3, strengthened controls, independent
verification — see `CLAUDE.md`). No EHR trigger identified; no R4 consequence
identified in scope as drafted, though this draft separately flags (rather than
resolves) whether accumulating a *second* third-party AI data processor (after
Gemini) is a fact worth an R4-adjacent, fresh-eyes founder review before
adoption — see `specification.md` "Risk and protected areas".

This package leaves three decisions explicitly open for the adopting human,
recorded as open questions rather than guessed past (see `specification.md`
`VOC-036-D02`, `VOC-036-D04`, and `VOC-036-D07`): the exact env-var shape for
Cloudflare's two-part credential (token + account ID), the `MaxRetries`/backoff
sizing given Cloudflare's own unknown rate-limit behavior, and the exact default
model to select from Cloudflare's JSON-Schema-capable set.

## Verification, approvals, release, and closure

Not yet applicable — this package is a draft. Once adopted, every PR in this
package would require Claude Code review bound to the exact final SHA per
`CLAUDE.md`; the deterministic commands in `implementation-plan.md` (Go
vet/format/test, this repository's own governance/risk-classification scripts)
would run per PR; and `VOC-036-T03`'s live-evaluation task would require the
founder's own provisioned Cloudflare API token and account ID and would record
its result — pass, fail, or still-blocked — honestly in `staging-evidence.md`,
never a fabricated pass, with request pacing designed against the free tier's
shared 10,000-neurons/day pool per `VOC-036-D06`. See `release-plan.md` for the
full (currently not-yet-authorized) release posture.
