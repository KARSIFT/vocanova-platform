# VOC-035 — Add a Google Gemini AI-Feedback/Moderation Provider Alongside OpenCode: Specification

**Draft — not adopted. No decision below is binding until a human adopts this
package.**

## Objective and requirement source

Add Google Gemini (model `gemini-2.5-flash`, free tier) as a real, alternative
`FeedbackProvider`/`ModerationProvider` implementation for
`apps/api/business/aifeedback`, operator-selectable via `AI_PROVIDER=gemini`,
alongside — not replacing — the existing `OpenCodeFeedbackProvider`/
`OpenCodeModerationProvider`.

Requirement authority: a founder free-text request recorded verbatim in
`change.yaml`'s `requirement_source` field, grounded in
`specs/changes/VOC-032-begin-milestone-r1-staging-readiness-docs-product/staging-evidence.md`'s
`EV-22` section, which this package treats as already-recorded, authoritative
evidence and does not re-derive or re-litigate:

> The T10 deliverable is the runnable one-shot procedure the founder will
> invoke once the staging AI-provider credentials (`VOC-032-DEP-03`) are
> provisioned... [EV-22's own live-execution-status note records that] the
> founder-configured OpenCode Go provider (opencode-go/hy3) timed out on all
> 56 evaluation cases within the mandated 8-second per-request budget
> (DOC-09 §18 / DOC-06 §12), and every other model tried on that account
> either timed out, errored, or required an unapproved China-hosting opt-in.

No GitHub issue exists yet for this request. This package does not itself
authorize its own adoption, implementation, or the opening of that issue — see
`change.yaml`'s `approval_status: not-approved`.

### Root cause / context (confirmed by direct inspection at `base_sha`)

`apps/api/business/aifeedback/opencode.go` and `apps/api/business/aifeedback/moderation.go`
implement `FeedbackProvider`/`ModerationProvider` against the real
`opencode serve` session/message HTTP API only, using whichever underlying
model the founder's OpenCode Go account is configured with
(`AI_PROVIDER_MODEL`). `apps/api/app/api/production.go:336-358`'s
`buildAIProviders` selects between that real OpenCode-backed pair and
`aifeedback.NewMockProvider()` based on `cfg.APIProvider ==
string(aifeedback.ProviderOpenCode) && cfg.APIKey != ""`
(`apps/api/business/aifeedback/aifeedback.go:69`'s `ProviderOpenCode =
"opencode"` constant). There is no third branch: an operator cannot select any
provider other than OpenCode or the deterministic mock today. Per the
requirement evidence above, every model tried against the founder's OpenCode
account has failed the DOC-09 §18 8-second budget or required an unapproved
hosting opt-in — this is not a bug in `opencode.go`/`moderation.go` (both are
confirmed correct against `VOC-034`'s own independent review), it is an
exhausted-provider-account problem this package addresses by adding a genuinely
different provider, not by changing OpenCode's own code.

### Gemini REST contract this package is grounded against

Confirmed against Google's own current public API reference
(`ai.google.dev/api/generate-content`, fetched 2026-07-31 — no live call was
made; this is a documentation read, not a provider round trip):

- Endpoint:
  `POST https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent`
  (e.g. `.../models/gemini-2.5-flash:generateContent`) — a single synchronous
  HTTP round trip per request, matching DOC-09 §18's 8-second single-provider-call
  budget the same way `opencode.go`'s single `POST /session/{id}/message` call
  does.
- Auth: an `x-goog-api-key: <key>` request header — no OAuth, no session
  creation step (unlike OpenCode's own `POST /session` + `POST
  /session/{id}/message` two-call shape). This is the "single API key, no
  OAuth" auth model the founder's request explicitly calls out.
- Request body: `{"contents": [{"role": "user", "parts": [{"text": "..."}]}],
  "systemInstruction": {"parts": [{"text": "..."}]}, "generationConfig":
  {"responseMimeType": "application/json", "responseSchema": {...}}}`. Setting
  both `responseMimeType: "application/json"` and a `responseSchema` is
  Google's own documented mechanism for constraining output to valid JSON
  matching a schema — the direct Gemini-side analogue of the schema text
  `opencode.go`'s `buildMessageRequestBody` appends to the prompt as
  instructional text (OpenCode's session/message API has no native
  structured-output parameter; Gemini's does, and this package uses it).
- Response body: `{"candidates": [{"content": {"parts": [{"text":
  "..."}]}, "finishReason": "..."}], "promptFeedback": {"blockReason":
  "..."}}`. A `promptFeedback.blockReason` present (Gemini's own safety-filter
  refusal signal) or a `finishReason` other than `"STOP"` (e.g. `"SAFETY"`,
  `"RECITATION"`, `"MAX_TOKENS"`) is treated as a non-nil error, never a
  fabricated result — the Gemini-specific analogue of `opencode.go`'s
  `isProviderRefusal` text-sniffing, but driven by a structured field Gemini
  actually returns rather than parsing prose.

## Scope and non-goals

In scope:

1. A new `GeminiConfig` struct and shared, unexported `geminiTransport` helper
   in a new file `apps/api/business/aifeedback/gemini.go`, mirroring
   `opencode.go`'s `OpenCodeConfig`/`openCodeTransport` split (`VOC-035-D00`).
2. `GeminiFeedbackProvider` implementing `FeedbackProvider` and
   `GeminiModerationProvider` implementing `ModerationProvider`, both against
   the real `generateContent` endpoint above, reusing `moderation.go`'s
   existing moderation system/developer prompts and output schema
   (`SafetyAllowed`/`SafetyAllowedSensitive`/`SafetyBlocked`/`SafetySelfHarmIntervention`)
   and `task.go`'s existing feedback prompts/schema unchanged — only the
   transport and request/response mapping are new (`VOC-035-D01`).
3. Strict output-schema validation via Gemini's own `responseSchema` parameter
   plus the same defense-in-depth JSON-parse-and-field-validate step
   `opencode.go`/`moderation.go` already do on the returned text, so a
   provider that ignores `responseSchema` (or a proxy/mock that doesn't
   enforce it) still cannot produce a fabricated result (`VOC-035-D03`).
4. `MaxRetries` sized for the 8-second total DOC-09 §18 per-request budget:
   this draft proposes `MaxRetries: 1` for feedback (mirroring
   `OpenCodeFeedbackProvider`'s existing budget) and `MaxRetries: 0` for
   moderation (mirroring `OpenCodeModerationProvider`'s `VOC-034-D03`
   rationale for the same combined-latency reason), flagged as an open
   question for the adopting human to confirm given Gemini's own unknown
   real-world per-call latency until `VOC-035-T03`'s live run measures it
   (`VOC-035-D04`).
5. Wiring into `apps/api/app/api/production.go`'s `buildAIProviders`: a new
   `cfg.APIProvider == "gemini"` branch returning a real
   `GeminiFeedbackProvider` and a `CompositeSafetyClassifier` wrapping a real
   `GeminiModerationProvider`, added as a third branch alongside (not
   replacing) the existing OpenCode and mock branches (`VOC-035-D00`).
6. Deterministic unit tests against a fake `httptest.Server` standing in for
   `generativelanguage.googleapis.com` — no live Gemini call from CI, matching
   the founder's own explicit instruction.
7. A T10-equivalent live-evaluation path: extend `apps/api/cmd/eval-live`
   (added by `VOC-032-T10`) with a provider-selection flag/env var so the
   existing harness can re-run the exact same `GoldenSet()`/
   `DefaultGoldenThresholdSpec()` evaluation against a real
   `GeminiFeedbackProvider` instead of `OpenCodeFeedbackProvider`, reusing
   `RunLiveEvaluation`/`FormatLiveEvaluationReport` unchanged (`VOC-035-D06`).
8. A post-merge live-evaluation task (`VOC-035-T03`) that runs the extended
   `cmd/eval-live` against the real Gemini API once the founder has
   provisioned a free Gemini API key (`aistudio.google.com`), recording the
   result — pass, fail, or still-blocked — honestly in this package's own
   `staging-evidence.md`, the same way `VOC-032`/`VOC-034` did. **This package
   does not, and cannot, fabricate a pass**; if the key is not yet provisioned
   at implementation time, `VOC-035-T03`'s evidence entry records exactly that
   and nothing more.

Explicitly out of scope (non-goals), mirroring `VOC-034`'s own non-goals list
for the same design pattern:

- Any change to `apps/api/business/aifeedback/service.go`'s orchestration
  logic. `service.go`'s safety-classification step, outcome switch, and
  telemetry calls are provider-agnostic already (they operate on the
  `FeedbackProvider`/`ModerationProvider`/`SafetyClassifier` interfaces, not on
  a concrete OpenCode type) — no change is needed for a new implementation of
  those same interfaces to work. This package's diff must not touch
  `service.go`.
- Any change to `apps/api/business/aifeedback/safety.go`'s
  `CompositeSafetyClassifier`/`DefaultLocalAbuseChecker` logic. Both are
  provider-agnostic and already correct.
- Any change to `apps/api/business/aifeedback/moderation.go`'s or `task.go`'s
  existing prompt/schema content. Gemini reuses the exact same prompt and
  schema text those files already define (`moderationSystemPrompt()`,
  `moderationDeveloperPrompt()`, `moderationOutputSchema()`, and their
  feedback-path equivalents in `task.go`) — Gemini's `gemini.go` calls these
  existing unexported functions rather than duplicating their text, so the
  two providers cannot silently drift on what "allowed" vs. "blocked" means.
  If those functions are unexported and unreachable from a new file in the
  same package, they remain reachable (same Go package,
  `apps/api/business/aifeedback`) — no exporting or restructuring is needed
  and none is in scope.
- Removing, deprecating, or changing the default value/behavior of
  `AI_PROVIDER` (stays `opencode`'s existing default per
  `apps/api/app/api/production.go`'s `getenv("AI_PROVIDER",
  string(aifeedback.ProviderOpenCode))`), or of `OpenCodeFeedbackProvider`/
  `OpenCodeModerationProvider` themselves. Gemini is additive and
  operator-opt-in only.
- OAuth, service-account, or any multi-step Gemini auth flow. Gemini's own
  single-API-key `x-goog-api-key` header model is used as-is, per the
  founder's own explicit instruction ("a single API key, no OAuth").
- Any new public API contract, DTO, or error code on
  `POST /api/v1/sentence-feedback` or any other route.
- A distinct, independently-configurable moderation model or timeout for
  Gemini beyond what `VOC-035-D02`'s env-var proposal below covers — mirrors
  `VOC-034-D02`'s own explicitly-deferred equivalent decision.
- Any live Gemini API call performed by this drafting pass, by CI, or by any
  task before `VOC-035-T03` and before the founder has provisioned a real key.
- Any change to `.github/workflows/*`. `cmd/eval-live` is already,
  deliberately, not CI-invoked (per `VOC-032-T10`'s own design, DOC-12 §9);
  this package's extension to it does not change that.

## Risk and protected areas

`docs/governance/change-risk-classification.md`'s R3 row names "AI-provider
controls" as a defining criterion, independent of path matching — the same
semantic ground `VOC-034` was adopted under. This package adds a second
production adapter that calls a real external LLM provider with
learner-authored content and makes a safety/moderation decision gating whether
that content is shown to a learner; this is squarely an AI-provider-controls
and safety-consequence change. This draft proposes **R3** on those semantic
grounds, for a human to confirm or adjust at adoption — **not a
determination**.

Path-based floor, confirmed directly against this package's anticipated file
set using `scripts/governance/classify-change-risk.sh --files-from` at draft
time (2026-07-31):

```
R1  apps/api/business/aifeedback/opencode.go            (unchanged by this package — listed only if touched)
R1  apps/api/business/aifeedback/gemini.go              (new)
R1  apps/api/business/aifeedback/gemini_test.go         (new)
R1  apps/api/business/aifeedback/aifeedback.go
R1  apps/api/app/api/production.go
R1  apps/api/app/api/production_test.go
R3  apps/api/.env.example
R1  apps/api/business/aifeedback/live_eval.go           (unchanged by this package — listed only if touched)
R1  apps/api/cmd/eval-live/main.go
Detected path-based risk floor: R3
Paths establishing the floor:
  - apps/api/.env.example
```

None of the `.go` files this package plans to touch match this repository's R3
glob list (`*/auth/*`, `*/payments/*`, `*/migrations/*`, `packages/ai/*`,
etc. — `aifeedback` and `eval-live` are not path-matched names); the automated
floor reaches R3 only because this package's `VOC-035-D02` env-var
documentation touches `apps/api/.env.example` (matching the classifier's
`*/.env.*` rule) — the same mechanical reason `VOC-034` reached R3. Per this
repository's own `CLAUDE.md` ("raise the class when path rules miss a
protected or R4 consequence"), this package proposes R3 on the semantic
AI-provider/safety-consequence grounds above independent of that coincidence.
Nothing in scope touches an R4 path (`CODEOWNERS`,
`.github/workflows/governance-policy.yml`, `scripts/governance/*`,
`docs/governance/amendments/*`, etc.) or an identified R4 consequence (no
pricing, legal, or public-launch decision) — flagged as an open question below
for a human to independently confirm, since this package's own author cannot
grant that confirmation.

Protected areas touched: `apps/api/business/aifeedback/*` (new files only),
`apps/api/app/api/production.go` and `production_test.go` (new branch, new
tests), `apps/api/cmd/eval-live/main.go` and its tests (new flag, new tests),
`apps/api/.env.example` (new/updated comments). Active governance model: A-003
(routine R3, strengthened controls, independent verification — see
`CLAUDE.md`). No EHR trigger identified in this draft; no R4 consequence
identified — both are stated as this draft's own assessment, not as a
foreclosed conclusion, per this drafting role's own instruction to flag rather
than guess past an ambiguity.

## Decisions

`VOC-035-D00` — **Proposed, not resolved.** Add Gemini as a third branch in
`buildAIProviders`, selected by `cfg.APIProvider == "gemini"`, alongside the
existing `opencode` branch and the mock fallback — never replacing either.
Rationale: mirrors `VOC-034-D00`'s own `buildAIProviders`
fallback-logging-and-branching pattern exactly, and satisfies the founder's own
explicit "alongside (not replacing in the interface sense)" instruction. Open
for adoption-time confirmation: the exact branch ordering/precedence if an
operator somehow sets both an OpenCode and a Gemini configuration
simultaneously (this draft proposes: `cfg.APIProvider`'s literal value is the
sole selector, so only one branch is ever active — no simultaneous-both case
exists by construction).

`VOC-035-D01` — **Proposed, not resolved.** `gemini.go` reuses
`moderation.go`'s existing `moderationSystemPrompt()`, `moderationDeveloperPrompt()`,
and `moderationOutputSchema()` functions and `task.go`'s existing feedback
prompt/schema functions unchanged, rather than duplicating their text.
Rationale: mirrors `VOC-034-D01`'s own "one design, one source of truth"
reasoning for the transport, extended here to the prompt/schema content
itself — the two providers must classify the same sentence against the same
rules, or a genuine outcome-divergence between OpenCode and Gemini would be
indistinguishable from a self-inflicted prompt drift. Open for adoption-time
confirmation: whether a future package should ever introduce
provider-specific prompt tuning (this draft says no, not decided here either
way beyond "not built in this scope," mirroring `VOC-034-D02`'s own explicit
deferral pattern).

`VOC-035-D02` — **Open question, not resolved by this draft.** Environment
variable naming for Gemini's config. Gemini's auth model (a single API key, no
OAuth, no separate base-URL-per-deployment need since Google's endpoint is
fixed) does not map cleanly onto every existing `AI_PROVIDER_*` name. This
draft proposes, for a human to confirm or reject at adoption:

- `AI_PROVIDER_API_KEY` — **reused as-is** for the Gemini key when
  `AI_PROVIDER=gemini` (same variable name, different provider's key value,
  matching the founder's own "reusing the existing AI_PROVIDER_* config
  naming convention where it fits" instruction).
- `AI_PROVIDER_MODEL` — **reused as-is**, defaulting to `"gemini-2.5-flash"`
  when `AI_PROVIDER=gemini` and the variable is otherwise unset (mirrors
  `AI_PROVIDER_MODEL`'s existing OpenCode default,
  `aifeedback.DefaultOpenCodeModel`, being a per-provider default rather than
  a single hard-coded global one).
- `AI_PROVIDER_TIMEOUT` — **reused as-is**, same per-request timeout meaning
  for either provider.
- `AI_PROVIDER_BASE_URL` — **not required** for Gemini (Google's REST endpoint
  is a fixed, well-known host, unlike OpenCode's operator-hosted server this
  variable exists for). This draft proposes: when `AI_PROVIDER=gemini` and
  `AI_PROVIDER_BASE_URL` is unset, default to
  `https://generativelanguage.googleapis.com`; when it *is* set (e.g. for a
  test harness or a future Gemini-compatible proxy), honor the override. This
  reuses the existing variable rather than adding a new one, at the cost of a
  slightly awkward "this variable exists for OpenCode but is overridable for
  Gemini too" shared meaning — flagged explicitly for the adopting human to
  accept or to instead require a new `AI_PROVIDER_GEMINI_BASE_URL`-style name
  if the shared meaning is judged too confusing for `.env.example` to document
  clearly. This draft's own preference, stated but not decided: reuse, because
  it introduces zero new variables and Gemini operators are extremely unlikely
  to ever need to override the endpoint.

No new environment variable is proposed by this draft's own preferred option
above; if the adopting human instead requires
`AI_PROVIDER_GEMINI_BASE_URL`, that is a small, contained change to
`VOC-035-T01`'s implementation, not a scope change to this package.

`VOC-035-D03` — **Proposed, not resolved.** Fail-closed contract: Gemini's own
`responseSchema` parameter is used as a first line of defense, but
`GeminiFeedbackProvider`/`GeminiModerationProvider` additionally re-parse and
re-validate the returned JSON exactly as `opencode.go`/`moderation.go` already
do for OpenCode (never trusting a provider's own schema-enforcement claim as
the sole guarantee) — an empty candidate list, a `promptFeedback.blockReason`,
a `finishReason` other than `"STOP"`, unparseable JSON, or a JSON object
missing/mismatching a required field all return a non-nil error, never a
fabricated `ProviderFeedback`/`ModerationResult`. Rationale: mirrors
`VOC-034-D04`'s own "never trust an unrecognized output" principle; Gemini's
`responseSchema` reduces how often this path is hit but is documented by
Google itself as "acts only as a strong hint... doesn't ensure 100% valid
JSON" for JSON-mode-without-schema and is not a substitute for server-side
validation even with a schema, per the cited API reference.

`VOC-035-D04` — **Open question, not resolved by this draft.** `MaxRetries`
sizing against the 8-second DOC-09 §18 per-request budget. This draft proposes
`MaxRetries: 1` for feedback and `MaxRetries: 0` for moderation, mirroring
`OpenCode`'s existing budget split (`VOC-034-D03`) — but Gemini's real-world
per-call latency on the free tier is genuinely unknown until `VOC-035-T03`'s
live run measures it (the free tier may have different rate-limit/latency
characteristics than a paid OpenCode account). Flagged explicitly, not
silently assumed equivalent: if `VOC-035-T03`'s live evaluation shows Gemini's
own latency profile makes this retry budget wrong (e.g. it needs `MaxRetries:
0` for feedback too, or a shorter per-call `AI_PROVIDER_TIMEOUT` default), that
finding is recorded in `staging-evidence.md` as a follow-up, not silently
patched over by declaring the live run "close enough."

`VOC-035-D05` — **Open question, not resolved by this draft.** Whether
`AI_PROVIDER=gemini` should ever become this repository's *default* value
(today's default is `opencode`, via
`apps/api/app/api/production.go`'s `getenv("AI_PROVIDER",
string(aifeedback.ProviderOpenCode))`). This draft's own scope explicitly
proposes: **no** — the default stays `opencode` unchanged; an operator must
explicitly set `AI_PROVIDER=gemini` to opt in, per the founder's own
"alongside" framing. Given `EV-22`'s own evidence that the current
`opencode-go/hy3` account has failed every model tried on it, a human may
reasonably decide at adoption that Gemini should instead become the *new*
default once verified — that is explicitly not decided here, and doing so
would be a small, separately-flagged change to `VOC-035-T01`'s implementation
(a one-line default-value change plus updated tests), not a reason to block
this package's narrower "add it as a real, selectable alternative" scope.

`VOC-035-D06` — **Proposed, not resolved.** Extend `apps/api/cmd/eval-live`
(rather than adding a wholly separate `cmd/eval-live-gemini` binary) with a
provider-selection flag (`--provider`, default resolved from `AI_PROVIDER` env
var, falling back to `"opencode"` to preserve every existing invocation's
behavior unchanged) that swaps which concrete `FeedbackProvider`
`RunLiveEvaluation` is called against. Rationale: `RunLiveEvaluation`,
`GoldenSet()`, `DefaultGoldenThresholdSpec()`, `FormatLiveEvaluationReport`,
and the entire `LiveEvaluationReport` shape are already provider-agnostic
(confirmed by reading `live_eval.go` at `base_sha` — `RunLiveEvaluation`'s
signature takes a `FeedbackProvider` interface value, not a concrete OpenCode
type); a second binary would duplicate `cmd/eval-live/main.go`'s entire
flag-parsing/reporting/exit-code logic for zero behavioral difference beyond
which provider constructor is called. This is the "T10-equivalent
live-evaluation task" the founder's request asks for, reusing rather than
forking the existing harness. `cmd/eval-live`'s existing default behavior
(no `--provider` flag, no `AI_PROVIDER` env var set) is unchanged: it still
builds a real `OpenCodeFeedbackProvider` exactly as before, preserving every
existing operator runbook and `EV-22` procedure step verbatim for the
already-adopted `VOC-032`/`VOC-034` OpenCode path.
