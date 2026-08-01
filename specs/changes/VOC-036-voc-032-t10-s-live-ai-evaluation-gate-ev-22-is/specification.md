# VOC-036 — Add a Cloudflare Workers AI AI-Feedback/Moderation Provider Alongside OpenCode and Gemini: Specification

**Draft — not adopted. No decision below is binding until a human adopts this
package.**

## Objective and requirement source

Add Cloudflare Workers AI (a model from its JSON-Schema-structured-output-capable
set, see `VOC-036-D07`) as a real, alternative `FeedbackProvider`/`ModerationProvider`
implementation for `apps/api/business/aifeedback`, operator-selectable via
`AI_PROVIDER=cloudflare`, alongside — not replacing — the existing
`OpenCodeFeedbackProvider`/`OpenCodeModerationProvider` and
`GeminiFeedbackProvider`/`GeminiModerationProvider` pairs.

Requirement authority: a founder free-text request recorded verbatim in
`change.yaml`'s `requirement_source` field, grounded in two pieces of evidence:

1. `specs/changes/VOC-032-begin-milestone-r1-staging-readiness-docs-product/staging-evidence.md`'s
   `EV-22` section — already-recorded, authoritative evidence this package treats
   as given and does not re-derive: the founder-configured OpenCode Go provider
   (`opencode-go/hy3`) timed out on all 56 evaluation cases within the mandated
   8-second per-request budget, and every other model tried on that account either
   timed out, errored, or required an unapproved China-hosting opt-in.
2. The founder's own account, stated directly in this package's requirement free
   text, that `VOC-035`'s Gemini alternative also failed its own live evaluation —
   **not** from a fundamental model-quality problem, but from a combination of a
   stale default Gemini model blocked for new API keys and free-tier rate-limiting
   on an unpaced 56-request burst, which the founder chose not to pursue fixing
   this round.

**Discrepancy this drafting pass found and is flagging, not silently resolving:**
`specs/changes/VOC-035-voc-032-t10-s-live-ai-evaluation-gate-ev-22-is/staging-evidence.md`,
read in full at this package's own `base_sha`
(`c69b270a164bf2cb386f1b7637a7c3ab96af5bd0`), still shows `VOC-035-T03` as
**"Not yet attempted"** / **"blocked by `VOC-035-DEP-00`"** — it does not contain a
recorded Gemini live-evaluation failure, rate-limit note, or stale-model note
anywhere in its text. `VOC-035`'s `tasks.md` in this same checkout shows `T00` and
`T01` merged (PRs #239/#240) and `T02` "authorized" but not itself marked merged,
and `git log` for `VOC-035`'s `staging-evidence.md` shows exactly one commit (the
`T02` PR, which only touched `tasks.md`'s own status line per that PR's own scope,
not `staging-evidence.md`'s content). This package therefore cannot itself confirm,
from the repository alone, that the founder's described Gemini live-run failure has
actually been recorded where the founder says it has — it may have been executed
and reported to the founder through a channel (e.g. a live operator run, or a later
workflow event) not yet reflected in this checkout at `base_sha`, or the record may
still need to be written. **This package takes the founder's own free-text account
of the Gemini failure as the requirement-source fact for why a third provider is
being added** (per this drafting role's own instruction to ground a package in the
request given, and per a founder's free-text request being a valid, if not
canonical-document, requirement source under `AGENTS.md`'s "chat prompt or issue
alone is not implementation authority" rule, which governs *implementation*, not
*drafting a proposal*) — but flags, for the adopting human's own confirmation, that
`VOC-035-T03`/`VOC-035-AC-10`'s own record should be checked and completed
(by that package's own separate closure process, not this one) before or alongside
this package's adoption, so the two packages' evidence trails stay consistent. This
package does not modify `VOC-035`'s own files anywhere (scope discipline).

No GitHub issue exists yet for this request. This package does not itself authorize
its own adoption, implementation, or the opening of that issue — see
`change.yaml`'s `approval_status: not-approved`.

### Root cause / context (confirmed by direct inspection at `base_sha`)

`apps/api/business/aifeedback/opencode.go` and `gemini.go` implement
`FeedbackProvider`/`ModerationProvider` against two real providers today.
`apps/api/app/api/production.go`'s `buildAIProviders` (lines 389–426 at
`base_sha`) selects between three outcomes: a real OpenCode-backed pair
(`cfg.APIProvider == "opencode" && cfg.APIKey != ""`), a real Gemini-backed pair
(`cfg.APIProvider == "gemini" && cfg.APIKey != ""`), or
`aifeedback.NewMockProvider()` for both roles. There is no fourth branch: an
operator cannot select Cloudflare Workers AI today. Per the requirement evidence
above, OpenCode's account is exhausted and Gemini's own live run failed for
reasons unrelated to model quality (a stale blocked default model plus an unpaced
free-tier burst) — this package addresses that by adding a third, genuinely
different provider with its own auth model and its own rate-limit shape, not by
changing OpenCode's or Gemini's own code.

### Cloudflare Workers AI REST contract this package is grounded against

Confirmed against Cloudflare's own current public documentation (`developers.cloudflare.com/workers-ai/`,
fetched 2026-07-31 — no live call was made; this is a documentation read, not a
provider round trip):

- Endpoint: `POST https://api.cloudflare.com/client/v4/accounts/{account_id}/ai/run/{model}`
  (e.g. `.../accounts/<id>/ai/run/@cf/meta/llama-3.3-70b-instruct-fp8-fast`) — a
  single synchronous HTTP round trip per request, matching DOC-09 §18's 8-second
  single-provider-call budget the same way `opencode.go`'s and `gemini.go`'s single
  calls do.
- Auth: an `Authorization: Bearer <api_token>` request header, **plus** the
  Cloudflare account ID embedded as a path segment in the URL itself — this is
  the founder's own explicitly-called-out "does not map onto the existing
  single-API-key convention as cleanly" distinction: OpenCode and Gemini each need
  exactly one secret value (a bearer token or an `x-goog-api-key` value); Cloudflare
  needs a secret (the API token) **and** a non-secret-but-required identifier (the
  account ID) that is not itself a credential but is required to construct the
  request URL, and is not read from a header at all.
- Request body: an OpenAI-compatible chat shape —
  `{"messages": [{"role": "system", "content": "..."}, {"role": "user", "content":
  "..."}], "response_format": {"type": "json_schema", "json_schema": {...}}}`.
  Cloudflare's own JSON-Mode documentation states this `response_format` field is
  supported on a named subset of models, including Meta's Llama 3.3 family and
  DeepSeek variants (`VOC-036-D07` selects one from that set) — this package must
  not select an arbitrary Workers AI model that lacks `response_format` support,
  since the whole fail-closed design depends on structured output being at least
  attempted at the provider layer, exactly as `VOC-035-D03` already established for
  Gemini's `responseSchema`.
- Response body: `{"result": {"response": "..."}, "success": true, "errors": [],
  "messages": []}`. `success: false` (with a non-empty `errors` array) is
  Cloudflare's own request-level failure signal, distinct from an HTTP non-2xx
  status — both must be treated as a non-nil error, never a fabricated result. When
  `response_format`'s schema cannot be satisfied, Cloudflare's own documentation
  states the request fails with a `"JSON Mode couldn't be met"`-shaped error rather
  than returning a best-effort non-conforming payload — this package's parser must
  still defensively re-parse and re-validate whatever `result.response` contains
  (a string, in every documented example) exactly as `VOC-034-D04`/`VOC-035-D03`
  already established for the other two providers, never trusting Cloudflare's own
  schema-enforcement claim as the sole guarantee.

## Scope and non-goals

In scope:

1. A new `CloudflareConfig` struct and shared, unexported `cloudflareTransport`
   helper in a new file `apps/api/business/aifeedback/cloudflare.go`, mirroring
   `opencode.go`'s `OpenCodeConfig`/`openCodeTransport` and `gemini.go`'s
   `GeminiConfig`/`geminiTransport` split (`VOC-036-D00`).
2. `CloudflareFeedbackProvider` implementing `FeedbackProvider` and
   `CloudflareModerationProvider` implementing `ModerationProvider`, both against
   the real `POST /accounts/{account_id}/ai/run/{model}` endpoint above, reusing
   `moderation.go`'s existing moderation system/developer prompts and output
   schema and `task.go`'s existing feedback prompts/schema unchanged — only the
   transport and request/response mapping are new (`VOC-036-D01`).
3. Strict output-schema validation via Cloudflare's own `response_format:
   {type: "json_schema", ...}` parameter plus the same defense-in-depth
   JSON-parse-and-field-validate step `opencode.go`/`gemini.go`/`moderation.go`
   already do on the returned text, so a provider (or a mock/proxy standing in for
   one) that ignores or only partially honors `response_format` still cannot
   produce a fabricated result (`VOC-036-D03`).
4. `MaxRetries` sized for the 8-second total DOC-09 §18 per-request budget: this
   draft proposes `MaxRetries: 1` for feedback and `MaxRetries: 0` for moderation,
   mirroring `OpenCodeFeedbackProvider`'s/`GeminiModerationProvider`'s existing
   budget split, flagged as an open question for the adopting human given
   Cloudflare's own unknown real-world per-call latency and shared free-tier
   rate-limit behavior until `VOC-036-T03`'s live run measures it (`VOC-036-D04`).
5. Wiring into `apps/api/app/api/production.go`'s `buildAIProviders`: a new
   `cfg.APIProvider == "cloudflare"` branch returning a real
   `CloudflareFeedbackProvider` and a `CompositeSafetyClassifier` wrapping a real
   `CloudflareModerationProvider`, added as a fourth branch alongside (not
   replacing) the existing OpenCode, Gemini, and mock branches (`VOC-036-D00`).
6. A proposed extension to the `AI_PROVIDER_*` environment-variable convention to
   carry both the Cloudflare API token and the Cloudflare account ID without
   breaking `AI_PROVIDER_API_KEY`/`AI_PROVIDER_BASE_URL`/`AI_PROVIDER_MODEL`'s
   existing meaning for OpenCode and Gemini (`VOC-036-D02`) — **explicitly
   presented here for the founder to confirm or reject at adoption**, per the
   founder's own explicit request that this exact question be proposed rather than
   silently decided.
7. Deterministic unit tests against a fake `httptest.Server` standing in for
   `api.cloudflare.com` — no live Cloudflare call from CI, matching the founder's
   own explicit instruction.
8. A T10-equivalent live-evaluation path: extend `apps/api/cmd/eval-live` (already
   extended once by `VOC-035-T02` for Gemini) with a `cloudflare` provider option,
   **and** a request-pacing mechanism the existing harness does not have today
   (`VOC-036-D06`) — this is the founder's own explicit instruction to "explicitly
   account for Cloudflare's own free-tier rate limits... given the exact
   rate-limiting failure mode VOC-035 already hit once," i.e. do not repeat the
   unpaced-56-request-burst mistake for a third provider.
9. A post-merge live-evaluation task (`VOC-036-T03`) that runs the extended
   `cmd/eval-live` against the real Cloudflare Workers AI API once the founder has
   provisioned a Cloudflare API token and account ID (`VOC-036-DEP-00`), recording
   the result — pass, fail, or still-blocked — honestly in this package's own
   `staging-evidence.md`, the same discipline `VOC-032`/`VOC-034`/`VOC-035`
   established. **This package does not, and cannot, fabricate a pass**; if the
   credentials are not yet provisioned at implementation time, `VOC-036-T03`'s
   evidence entry records exactly that and nothing more.

Explicitly out of scope (non-goals), mirroring `VOC-034`'s and `VOC-035`'s own
non-goals lists for the same design pattern:

- Any change to `apps/api/business/aifeedback/service.go`'s orchestration logic.
  `service.go`'s safety-classification step, outcome switch, and telemetry calls
  are provider-agnostic already — no change is needed for a third implementation
  of the same interfaces to work. **The founder's own request explicitly names
  this file as out of scope; this package's diff must not touch `service.go`.**
- Any change to `apps/api/business/aifeedback/safety.go`'s
  `CompositeSafetyClassifier`/`DefaultLocalAbuseChecker` logic. **The founder's own
  request explicitly names this file as out of scope.**
- Any change to `apps/api/business/aifeedback/moderation.go`'s or `task.go`'s
  existing prompt/schema content, or to `opencode.go`'s or `gemini.go`'s existing
  behavior. Cloudflare reuses the exact same prompt and schema text those files
  already define, and calls `opencode.go`'s existing
  `isRetryableError`/`isRetryableHTTPStatus` free functions unchanged, exactly as
  `gemini.go` already does (`VOC-035-T00` step 3's own precedent) — no third,
  independently-maintained copy of that retry-classification logic.
- Removing, deprecating, or changing the default value/behavior of `AI_PROVIDER`
  (stays `opencode`, unchanged), or of either existing provider pair. Cloudflare is
  additive and operator-opt-in only, mirroring `VOC-035-D05`'s own precedent
  (`VOC-036-D05`).
- Building or introducing a Cloudflare Worker, `wrangler.json`/`wrangler.toml`
  configuration, or any Cloudflare *edge-compute* deployment artifact. This
  package calls Cloudflare's **Workers AI REST inference API** from the existing
  Go backend over plain HTTPS, the same way `opencode.go`/`gemini.go` call their
  respective providers — it does not deploy anything to Cloudflare's edge network,
  and does not add a `wrangler.*` file (which would itself independently trip this
  repository's R3 path glob, per `scripts/governance/classify-change-risk.sh`'s own
  `*/wrangler.json` etc. rule — avoided entirely because none is needed).
- Any new public API contract, DTO, or error code on
  `POST /api/v1/sentence-feedback` or any other route.
- A distinct, independently-configurable moderation model or timeout for
  Cloudflare beyond what `VOC-036-D02`'s env-var proposal below covers.
- Any live Cloudflare API call performed by this drafting pass, by CI, or by any
  task before `VOC-036-T03` and before the founder has provisioned real
  credentials.
- Any change to `.github/workflows/*`. `cmd/eval-live` remains deliberately not
  CI-invoked (DOC-12 §9); this package's extension to it does not change that.
- Reconciling or editing `VOC-035`'s own `staging-evidence.md` or any other
  `VOC-035` file. The discrepancy noted above under "Objective and requirement
  source" is flagged for the adopting human and for `VOC-035`'s own separate
  closure process, not resolved by this package (scope discipline — this drafting
  role may write only inside this package's own directory).

## Risk and protected areas

`docs/governance/change-risk-classification.md`'s R3 row names "AI-provider
controls" as a defining criterion, independent of path matching — the same
semantic ground `VOC-034` and `VOC-035` were proposed under. This package adds a
third production adapter that calls a real external LLM provider with
learner-authored content and makes a safety/moderation decision gating whether
that content is shown to a learner; this is squarely an AI-provider-controls and
safety-consequence change. This draft proposes **R3** on those semantic grounds,
for a human to confirm or adjust at adoption — **not a determination**.

Path-based floor, confirmed directly against this package's anticipated file set
using `scripts/governance/classify-change-risk.sh --files-from` at draft time
(2026-07-31):

```
R1  apps/api/business/aifeedback/cloudflare.go        (new)
R1  apps/api/business/aifeedback/cloudflare_test.go   (new)
R1  apps/api/app/api/production.go
R1  apps/api/app/api/production_test.go
R1  apps/api/cmd/eval-live/main.go
R1  apps/api/cmd/eval-live/main_test.go
R3  apps/api/.env.example
Detected path-based risk floor: R3
Paths establishing the floor:
  - apps/api/.env.example
```

None of the `.go` files this package plans to touch match this repository's R3 glob
list (`*/auth/*`, `*/payments/*`, `*/migrations/*`, `packages/ai/*`,
`*/wrangler.json` etc. — `aifeedback` and `eval-live` are not path-matched names,
and this package deliberately adds no `wrangler.*` file, see "Scope and
non-goals"); the automated floor reaches R3 only because
`apps/api/.env.example` matches the classifier's `*/.env.*` rule — the identical
mechanical reason `VOC-034` and `VOC-035` each reached R3. Per `CLAUDE.md`'s
"raise the class when path rules miss a protected or R4 consequence"
instruction, this package proposes R3 on the semantic AI-provider/safety-
consequence grounds above independent of that coincidence.

Nothing in scope touches an R4 path (`CODEOWNERS`,
`.github/workflows/governance-policy.yml`, `scripts/governance/*`,
`docs/governance/amendments/*`, etc.) or an identified R4 consequence (no pricing,
legal, or public-launch decision) — flagged as an open question below for a human
to independently confirm, since this package's own author cannot grant that
confirmation. **One R4-adjacent question this draft explicitly flags rather than
resolves:** whether adding a *second* third-party AI data processor after Gemini
(Cloudflare, in addition to Google) is itself a fact a human should weigh under
DOC-09 §21/privacy-policy review before adoption — this draft's own assessment is
that it is not a strategy/pricing/legal-position change on the evidence available,
but it is exactly the kind of accumulating-processor-count question a founder
should decide with fresh eyes rather than by pattern-matching to VOC-035's own
prior "no R4 consequence" conclusion.

Protected areas touched: `apps/api/business/aifeedback/*` (new files only, no
existing-file behavior change), `apps/api/app/api/production.go` and
`production_test.go` (new branch, new tests), `apps/api/cmd/eval-live/main.go`
and its tests (new provider case, new pacing flag, new tests),
`apps/api/.env.example` (new comments, at least one genuinely new variable — see
`VOC-036-D02`, unlike `VOC-035` which added zero new variables). Active
governance model: A-003 (routine R3, strengthened controls, independent
verification — see `CLAUDE.md`). No EHR trigger identified in this draft; no R4
consequence identified beyond the flagged question above — both are this draft's
own assessment, not a foreclosed conclusion.

## Decisions

`VOC-036-D00` — **Proposed, not resolved.** Add Cloudflare as a fourth branch in
`buildAIProviders`, selected by `cfg.APIProvider == "cloudflare"`, alongside the
existing `opencode` and `gemini` branches and the mock fallback — never replacing
any of them. Rationale: mirrors `VOC-034-D00`'s/`VOC-035-D00`'s own
`buildAIProviders` fallback-logging-and-branching pattern exactly, and satisfies
the founder's own explicit "as a third selectable option... opt-in" instruction.
Open for adoption-time confirmation: branch ordering/precedence if an operator
somehow configures more than one provider's credentials simultaneously — this
draft proposes, as `VOC-035-D00` did: `cfg.APIProvider`'s literal value is the
sole selector, so exactly one branch is ever active by construction.

`VOC-036-D01` — **Proposed, not resolved.** `cloudflare.go` reuses
`moderation.go`'s existing `moderationSystemPrompt()`, `moderationDeveloperPrompt()`,
and `moderationOutputSchema()` functions and `task.go`'s existing feedback
prompt/schema functions unchanged, and reuses `opencode.go`'s existing
`isRetryableError`/`isRetryableHTTPStatus` free functions unchanged, rather than
duplicating any of them. Rationale: mirrors `VOC-035-D01`'s own "one design, one
source of truth" reasoning, extended to a third provider — three providers
classifying the same sentence against three independently-worded prompts would
make a genuine outcome-divergence indistinguishable from self-inflicted prompt
drift, and three copies of the same retry-classification logic would be a
maintenance liability with no compensating benefit.

`VOC-036-D02` — **Open question, explicitly not resolved by this draft — the
founder's own request asks this be proposed for confirmation or rejection at
adoption, not decided here.** How to extend the `AI_PROVIDER_*` env-var
convention to carry both a Cloudflare API token and a Cloudflare account ID,
without breaking the existing convention for OpenCode/Gemini. Cloudflare's auth
model is the first of the three providers that needs **two** required values (a
secret token and a non-secret-but-required account identifier used to build the
URL path, not sent as a header value at all) rather than one. This draft's
proposed mapping, for the founder to accept or amend:

- `AI_PROVIDER_API_KEY` — **reused as-is** for the Cloudflare API token when
  `AI_PROVIDER=cloudflare` (same variable name, third provider's credential
  value — same "reuse the existing convention where it fits" instruction
  `VOC-035-D02` already applied to Gemini's key).
- **A genuinely new variable, `AI_PROVIDER_ACCOUNT_ID`**, read only when
  `AI_PROVIDER=cloudflare` (empty/unused for `opencode`/`gemini`). This is new
  because no existing `AI_PROVIDER_*` name has ever carried a non-secret required
  identifier — `AI_PROVIDER_API_KEY` is documented and (by every existing caller,
  `opencode.go`'s `Authorization: Bearer` header and `gemini.go`'s
  `x-goog-api-key` header) used as a literal credential value sent in a header,
  never as a URL path component; overloading it to also carry a second,
  differently-shaped value (e.g. `"<token>:<account_id>"`, requiring a
  provider-specific parse/split) was considered and rejected in this draft as
  more surprising and more fragile (a malformed separator silently breaking
  request construction) than one clearly-named additional variable. This is the
  specific proposal the founder's request asked to be surfaced for
  confirmation or rejection — **an alternative the adopting human may prefer
  instead**, listed for completeness: reusing `AI_PROVIDER_BASE_URL` to embed the
  account ID as part of a full URL the code parses apart (rejected here as more
  implicit than a separate named variable, and as overloading a variable whose
  existing meaning — "override the provider's fixed endpoint host" — does not
  naturally include "and also carry a required account identifier").
- `AI_PROVIDER_MODEL` — **reused as-is**, defaulting to the model
  `VOC-036-D07` proposes when `AI_PROVIDER=cloudflare` and the variable is
  otherwise unset (mirrors the existing per-provider-default pattern
  `aiProviderModel` in `production.go` already implements for OpenCode and
  Gemini — this task's implementation extends that same function with a third
  case, not a new mechanism).
- `AI_PROVIDER_TIMEOUT` — **reused as-is**, same per-request timeout meaning for
  any of the three providers.
- `AI_PROVIDER_BASE_URL` — **reused as-is** for the fixed prefix
  `https://api.cloudflare.com/client/v4` (Cloudflare's own well-known REST host,
  matching `AI_PROVIDER_BASE_URL`'s existing "override the provider's fixed
  endpoint host" meaning for Gemini) when `AI_PROVIDER=cloudflare` and the
  variable is unset; an explicitly-set value is honored as an override exactly as
  it already is for the other two providers. The account ID is **never** appended
  to or parsed out of this variable — it is carried exclusively by the new
  `AI_PROVIDER_ACCOUNT_ID` variable above, keeping `AI_PROVIDER_BASE_URL`'s
  existing single-purpose meaning ("which host") unchanged across all three
  providers.

This draft's own preference, stated but not decided: the one-new-variable
(`AI_PROVIDER_ACCOUNT_ID`) proposal above, because it keeps every existing
variable's meaning single-purpose and unambiguous across all three providers at
the cost of exactly one new name to document — flagged explicitly for the
adopting human to accept or to instead require a different shape (e.g. a
Cloudflare-specific-prefixed variable name, `AI_PROVIDER_CLOUDFLARE_ACCOUNT_ID`,
if the adopting human prefers namespacing new per-provider variables rather than
extending the shared `AI_PROVIDER_*` family with a value only one provider uses).

`VOC-036-D03` — **Proposed, not resolved.** Fail-closed contract: Cloudflare's own
`response_format: {type: "json_schema", ...}` parameter is used as a first line of
defense, but `CloudflareFeedbackProvider`/`CloudflareModerationProvider`
additionally re-parse and re-validate the returned JSON exactly as
`opencode.go`/`gemini.go`/`moderation.go` already do (never trusting a provider's
own schema-enforcement claim as the sole guarantee) — a non-2xx HTTP status, a
`success: false` response envelope with a non-empty `errors` array, an empty or
missing `result.response`, unparseable JSON inside `result.response`, or a JSON
object missing/mismatching a required field all return a non-nil error, never a
fabricated `ProviderFeedback`/`ModerationResult`. Rationale: mirrors
`VOC-034-D04`'s/`VOC-035-D03`'s own "never trust an unrecognized output"
principle; Cloudflare's own documentation states `response_format` "doesn't
ensure 100%" schema compliance and can itself fail with a distinct
"JSON Mode couldn't be met" error condition, which this contract must map to a
non-nil error like any other malformed-output path, not treat as a special case.

`VOC-036-D04` — **Open question, not resolved by this draft.** `MaxRetries`
sizing against the 8-second DOC-09 §18 per-request budget. This draft proposes
`MaxRetries: 1` for feedback and `MaxRetries: 0` for moderation, mirroring
`OpenCode`'s/`Gemini`'s existing budget split — but Cloudflare's real-world
per-call latency and, more importantly, its shared free-tier rate-limit behavior
(the 10,000-neurons/day pool named in the founder's own request) are genuinely
unknown until `VOC-036-T03`'s live run measures them, and **VOC-035's own reported
failure mode (an unpaced burst tripping a free-tier rate limit) is exactly the
kind of thing a naive retry-on-429 policy could make worse, not better**, if a
retry immediately re-hits the same limit. Flagged explicitly, not silently
assumed equivalent: if `VOC-036-T03`'s live evaluation shows this retry budget is
wrong for Cloudflare specifically (e.g. a 429 needs a backoff delay before
retrying, not an immediate retry), that finding is recorded in
`staging-evidence.md` as a follow-up, not silently patched over.

`VOC-036-D05` — **Proposed, not resolved.** Whether `AI_PROVIDER=cloudflare`
should ever become this repository's *default* value (today's default is
`opencode`). This draft's own scope explicitly proposes: **no** — the default
stays `opencode` unchanged; an operator must explicitly set
`AI_PROVIDER=cloudflare` to opt in, per the founder's own "as a third selectable
option... opt-in" framing, mirroring `VOC-035-D05`'s own precedent exactly.

`VOC-036-D06` — **Proposed, not resolved.** Extend `apps/api/cmd/eval-live`
(already extended once by `VOC-035-T02`) with a `cloudflare` provider case,
**and** add a request-pacing mechanism this repository's live-evaluation harness
does not have today: a new flag (this draft proposes `--request-interval`,
default `0`, resolved from a new `EVAL_LIVE_REQUEST_INTERVAL` env var — an
explicit opt-in delay inserted between successive provider calls during a single
`cmd/eval-live` run) that, when set to a positive duration, wraps the constructed
`FeedbackProvider` in a small pacing decorator (a new unexported type confined to
`cmd/eval-live/main.go`, implementing the same `FeedbackProvider` interface,
sleeping for the configured interval before each `GenerateFeedback` call) before
passing it to the existing, unchanged `RunLiveEvaluation`. Rationale: the founder's
own request explicitly requires "explicitly account[ing] for Cloudflare's own
free-tier rate limits... when designing the live-evaluation task's request
pacing, given the exact rate-limiting failure mode VOC-035 already hit once" — a
56-case golden set run unpaced against a shared daily-neuron-budget free tier
risks repeating that exact failure. A decorator confined to `cmd/eval-live/main.go`
(rather than a change to `live_eval.go`'s `RunLiveEvaluation` or to
`InstrumentedProvider`) keeps the pacing mechanism out of the shared,
provider-agnostic library every existing OpenCode/Gemini invocation already
depends on — an OpenCode or Gemini live run that never sets
`EVAL_LIVE_REQUEST_INTERVAL` is byte-for-byte unaffected by this addition. This is
this draft's own proposed mechanism, not a foreclosed design — the adopting human
or implementer may prefer a different pacing shape (e.g. a fixed per-provider
default interval rather than an operator-supplied one); flagged for confirmation,
not assumed final.

`VOC-036-D07` — **Open question, not resolved by this draft.** Default Cloudflare
model. Cloudflare's own JSON-Mode documentation names a specific subset of models
supporting `response_format`'s `json_schema` type, including Meta's Llama 3.3
family and DeepSeek variants (the founder's own request names both families as
acceptable). This draft proposes `@cf/meta/llama-3.3-70b-instruct-fp8-fast` as the
default `AI_PROVIDER_MODEL` value when `AI_PROVIDER=cloudflare` and the variable
is unset — chosen because Cloudflare's own model catalog page (fetched
2026-07-31) documents it as an actively supported, non-deprecated, `response_format`-capable
model with function-calling support, distinct from `@cf/meta/llama-3.1-8b-instruct-fp8-fast`-class
smaller models this draft did not select as the default (an operator may still
choose any JSON-Schema-capable model, including a DeepSeek variant, via
`AI_PROVIDER_MODEL`). This is explicitly a proposed default, not a determination:
this draft cannot itself verify the model's real-world quality, latency, or
neuron-cost-per-request against DOC-09 §18/§23 without `VOC-036-T03`'s live run,
and the founder or implementer may prefer a different model from the same
JSON-Schema-capable set at adoption time (e.g. a DeepSeek variant, if the founder
has a specific reason to prefer it) — that substitution is a one-line default-value
change to `VOC-036-T00`'s implementation, not a scope change to this package.
