# VOC-036 — Tasks

**Draft — no task below is implementation-authorized until this package is
adopted (`change.yaml`'s `implementation_authorized: false`).**

Ordered PR sequence: `T00 → T01 → T02`. `T03` is a post-merge
operator/founder-gate execution step with its own evidence record, not a code
PR — physically dependent on `T00`–`T02` merging and deploying, and on the
founder provisioning a Cloudflare API token and account ID
(`VOC-036-DEP-00`). Each of `T00`–`T02` is independently reviewable in one
pull request. Risk is proposed **R3** (semantic AI-provider/safety-consequence
grounds — see `specification.md` "Risk and protected areas"); each PR would
require Claude Code exact-SHA review per this repository's `CLAUDE.md`.

## VOC-036-T00 — Cloudflare feedback + moderation providers, shared transport, unit tests

- Requirement source: `VOC-036-D00`, `VOC-036-D01`, `VOC-036-D03`, `VOC-036-D04`,
  `VOC-036-D07`
- Acceptance criteria: `VOC-036-AC-00`, `VOC-036-AC-01`, `VOC-036-AC-02`,
  `VOC-036-AC-03`, `VOC-036-AC-04`, `VOC-036-AC-09`
- Tests: `VOC-036-TEST-00`, `VOC-036-TEST-01`, `VOC-036-TEST-02`,
  `VOC-036-TEST-03`, `VOC-036-TEST-04`, `VOC-036-TEST-09`
- Evidence: `VOC-036-EV-00`
- Status: pending — not authorized (package not adopted)

Add a new file `apps/api/business/aifeedback/cloudflare.go`:

1. `CloudflareConfig` struct: `APIToken`, `AccountID` (no default — required;
   an empty value must never silently construct a request with an empty URL
   path segment), `Model` (default per `VOC-036-D07`'s proposed
   `"@cf/meta/llama-3.3-70b-instruct-fp8-fast"` if empty), `BaseURL` (default
   `"https://api.cloudflare.com/client/v4"` if empty — `VOC-036-D02`),
   `Timeout` (default `8 * time.Second` if `<= 0`, matching
   `OpenCodeConfig`'s/`GeminiConfig`'s own default), `MaxRetries`.
2. An unexported `cloudflareTransport` struct (`config CloudflareConfig`,
   `client *http.Client`) and `newCloudflareTransport(config CloudflareConfig)
   *cloudflareTransport` constructor applying the defaults in step 1,
   mirroring `opencode.go`'s/`gemini.go`'s own transport-helper shape.
3. A `sendWithRetry`-equivalent method on `cloudflareTransport`: builds the
   POST request to `{BaseURL}/accounts/{AccountID}/ai/run/{Model}`, sets
   `Content-Type: application/json` and `Authorization: Bearer {APIToken}`,
   sends the body, reads the response, and retries on the same
   retryable-network-error / retryable-HTTP-status conditions
   `opencode.go`'s `isRetryableError`/`isRetryableHTTPStatus` already define
   (reuse those exact functions — do not duplicate them, exactly as
   `gemini.go` already does).
4. `CloudflareFeedbackProvider` (embeds/wraps `*cloudflareTransport`)
   implementing `FeedbackProvider.GenerateFeedback`: builds the request body
   from `task.go`'s existing prompt/schema functions (the same ones
   `OpenCodeFeedbackProvider.buildMessageRequestBody`/
   `GeminiFeedbackProvider.GenerateFeedback` already call) placed into
   Cloudflare's `messages`/`response_format` shape (a `system`-role message
   carrying `task.SystemPrompt`, a `user`-role message carrying the
   developer-prompt-plus-JSON-payload text, and a `response_format:
   {type: "json_schema", json_schema: <schema>}` object) instead of OpenCode's
   `parts`/`model` shape or Gemini's `contents`/`systemInstruction` shape;
   parses the response per `VOC-036-D03`'s fail-closed contract; maps the
   resulting JSON object to `ProviderFeedback` via the same field-mapping
   logic `mapOpenCodeFeedback` already implements (reuse it directly — it is
   unexported but same-package).
5. `CloudflareModerationProvider` (embeds/wraps `*cloudflareTransport`,
   `MaxRetries` forced to `0` at construction per `VOC-036-D04`) implementing
   `ModerationProvider.Classify`: builds the request from `moderation.go`'s
   existing `moderationSystemPrompt()`/`moderationDeveloperPrompt()`/
   `moderationOutputSchema()` functions; parses the response and matches
   `outcome` against the exact same four `Safety*` constants
   `moderation.go`'s `parseModerationResponse` already matches against (reuse
   that matching logic directly, e.g. by re-wrapping the extracted text into
   an `openCodeMessageResponse`-shaped payload and calling
   `parseModerationResponse`, mirroring `gemini.go`'s own
   `GeminiModerationProvider.Classify` precedent for exactly this reuse
   pattern — implementer's call on the exact wiring, but the parsing logic
   itself must not be duplicated).
6. Response parsing: read the response envelope's top-level `success`
   boolean and `errors` array before trusting `result.response` — a
   `success: false` envelope (regardless of HTTP status) is a non-nil error.
   Extract `result.response` (documented as a string containing the model's
   raw text/JSON); an empty or missing value, or unparseable JSON inside it,
   is a non-nil error before any field mapping is attempted (`VOC-036-D03`).
7. `var _ FeedbackProvider = (*CloudflareFeedbackProvider)(nil)` and
   `var _ ModerationProvider = (*CloudflareModerationProvider)(nil)`
   compile-time checks, mirroring `opencode.go`'s/`gemini.go`'s existing
   convention.

Add `apps/api/business/aifeedback/cloudflare_test.go` (mirroring
`opencode_test.go`'s/`gemini_test.go`'s/`moderation_test.go`'s fake-server
pattern — a fake `httptest.Server` standing in for `api.cloudflare.com`, never
a real Cloudflare call):

8. A request-shape test asserting the outgoing request's URL path includes
   `/accounts/{account_id}/ai/run/{model}` with the configured account ID and
   model, the `Authorization: Bearer {token}` header carries the configured
   token, and the body's `response_format` has `type: "json_schema"` and a
   non-empty `json_schema` (`VOC-036-AC-00`).
9. One test per moderation outcome mapping: `allowed`, `allowed_sensitive`,
   `blocked`, `self_harm_intervention` (`VOC-036-AC-04`), plus feedback-status
   coverage for `GenerateFeedback`.
10. Fail-closed tests: HTTP timeout, non-2xx status, `success: false`
    envelope, empty/missing `result.response`, malformed JSON in
    `result.response`, and (moderation only) an unrecognized `outcome` value
    — each asserting a non-nil error and a nil result (`VOC-036-AC-02`).
11. An injection-resistance test asserting the literal outgoing request body:
    an embedded-instruction learner sentence appears only inside the
    `user`-role message content, never inside the `system`-role message
    (`VOC-036-AC-03`).
12. A retry-count test confirming `MaxRetries: 0` on
    `CloudflareModerationProvider` results in exactly one attempt even when
    the fake server returns a retryable status, mirroring
    `moderation_test.go`'s/`gemini_test.go`'s equivalent coverage.
13. A `grep`-verifiable confirmation (a code comment or a build-tag-free
    static check, implementer's call) that no test in this file constructs a
    request against `https://api.cloudflare.com` itself (`VOC-036-AC-09`).

## VOC-036-T01 — Wire Cloudflare into `buildAIProviders`; add the account-ID variable; document env vars

- Requirement source: `VOC-036-D00`, `VOC-036-D02`, `VOC-036-D05`
- Acceptance criteria: `VOC-036-AC-05`, `VOC-036-AC-06`, `VOC-036-AC-10`
- Tests: `VOC-036-TEST-05`, `VOC-036-TEST-06`, `VOC-036-TEST-10`
- Evidence: `VOC-036-EV-01`, `VOC-036-EV-03`
- Status: pending — not authorized (package not adopted)

In `apps/api/app/api/production.go`:

1. Add a new `ProductionConfig` field, e.g. `APIAccountID`, populated from a
   new `AI_PROVIDER_ACCOUNT_ID` env var read unconditionally in
   `LoadProductionConfig` (per `VOC-036-D02`; the value is simply ignored by
   `buildAIProviders`' OpenCode/Gemini branches, matching how `cfg.APIKey`
   itself is already read once and used differently per branch).
2. Extend `aiProviderModel` (or add an equivalent per-provider default
   resolver) with a `cloudflare` case defaulting to `VOC-036-D07`'s proposed
   model when `AI_PROVIDER_MODEL` is unset.
3. Add a fourth branch to `buildAIProviders`: when `cfg.APIProvider ==
   "cloudflare"` and `cfg.APIKey != ""` and `cfg.APIAccountID != ""`, build one
   shared `aifeedback.CloudflareConfig{APIToken: cfg.APIKey, AccountID:
   cfg.APIAccountID, Model: cfg.APIModel, BaseURL: cfg.APIBaseURL, Timeout:
   cfg.APITimeout, MaxRetries: 1}` (per `VOC-036-D02`, `cfg.APIBaseURL` is
   passed through as-is — an operator who has not set `AI_PROVIDER_BASE_URL`
   gets Cloudflare's own zero-value default resolved inside
   `CloudflareConfig`'s own defaulting, per `VOC-036-T00` step 1). If either
   `cfg.APIKey` or `cfg.APIAccountID` is empty while `cfg.APIProvider ==
   "cloudflare"`, fall through to the existing mock-fallback branch — do not
   construct a `CloudflareConfig` with a missing required value
   (`VOC-036-AC-05`). Return
   `aifeedback.NewCloudflareFeedbackProvider(cloudflareCfg)` and
   `aifeedback.NewCompositeSafetyClassifier(aifeedback.NewDefaultLocalAbuseChecker(),
   aifeedback.NewCloudflareModerationProvider(cloudflareCfg))`.
4. Preserve existing branch order and behavior for `cfg.APIProvider ==
   "opencode"`, `"gemini"`, and the mock fallback exactly unchanged — the new
   branch is additive, checked as a genuinely separate `case`/`else if`, never
   reordered ahead of the existing checks.
5. Update the stderr logging line convention (matching the existing
   `buildEmailSender`/`buildOAuthProvider`/existing `buildAIProviders` style)
   to name which concrete pair was selected, never logging the API token or
   the account ID's value in a way that would help reconstruct a working
   credential pair (naming that Cloudflare was selected is fine; printing the
   account ID value is not, per `impact-analysis.md`'s security note).

In `apps/api/.env.example`, per `VOC-036-D02`/`VOC-036-D05` (resolved as
proposed unless the adopting human overrides at adoption):

6. Update the comment blocks above `AI_PROVIDER`, `AI_PROVIDER_API_KEY`,
   `AI_PROVIDER_BASE_URL`, and `AI_PROVIDER_MODEL` to state `AI_PROVIDER` also
   accepts `"cloudflare"`, that `AI_PROVIDER_API_KEY` becomes the Cloudflare
   API token in that mode, that `AI_PROVIDER_MODEL` defaults to
   `VOC-036-D07`'s proposed model for Cloudflare, and that
   `AI_PROVIDER_BASE_URL` defaults to Cloudflare's fixed REST prefix unless
   explicitly set. Add a new `AI_PROVIDER_ACCOUNT_ID` variable block
   (marked `[REQUIRED when AI_PROVIDER=cloudflare]`, unused by the other two
   providers) explaining it is the Cloudflare account ID, not a secret in
   itself but required to construct the request URL, and that an
   empty/missing value with `AI_PROVIDER=cloudflare` falls back to the mock
   provider rather than erroring at startup (matching the existing
   "incomplete real-provider config falls back to mock" convention). Do not
   change `AI_PROVIDER`'s own existing default value.

In `apps/api/app/api/production_test.go`:

7. `TestBuildAIProviders_BuildsRealCloudflareProvidersWhenConfigured` — with
   `cfg.APIProvider = "cloudflare"`, a non-empty `cfg.APIKey`, and a non-empty
   `cfg.APIAccountID`, asserts the returned feedback provider is
   `*aifeedback.CloudflareFeedbackProvider` and the returned safety classifier
   wraps a `*aifeedback.CloudflareModerationProvider`.
8. `TestBuildAIProviders_CloudflareFallsBackToMockWhenTokenMissing` and
   `TestBuildAIProviders_CloudflareFallsBackToMockWhenAccountIDMissing` — each
   asserting both roles wrap `*aifeedback.MockProvider` (same fallback as the
   existing OpenCode/Gemini no-key cases).
9. `TestBuildAIProviders_OpenCodeAndGeminiBranchesUnchangedByCloudflareAddition`
   — re-run (or confirm still present and passing) the existing OpenCode and
   Gemini `TestBuildAIProviders_*` tests from `VOC-034-T01`/`VOC-035-T01`
   unchanged, proving the new branch did not alter either prior provider's own
   selection logic.

## VOC-036-T02 — Extend `cmd/eval-live` to select Cloudflare and to pace requests for the T10-equivalent live run

- Requirement source: `VOC-036-D06`
- Acceptance criteria: `VOC-036-AC-07`, `VOC-036-AC-08`, `VOC-036-AC-10`
- Tests: `VOC-036-TEST-07`, `VOC-036-TEST-08`, `VOC-036-TEST-10`
- Evidence: `VOC-036-EV-02`, `VOC-036-EV-03`
- Status: pending — not authorized (package not adopted)

In `apps/api/cmd/eval-live/main.go`:

1. Add a `cloudflare` case to the existing `--provider`/`AI_PROVIDER`
   selection switch: when `*provider == "cloudflare"`, build
   `aifeedback.CloudflareConfig{APIToken: *apiKey, AccountID: *accountID,
   Model: *model, BaseURL: *baseURL, Timeout: *timeout, MaxRetries: 1}` and
   call a new `newCloudflareProvider` package-level variable (mirroring the
   existing `newProvider`/`newGeminiProvider` test-seam pattern) instead of
   either existing constructor variable.
2. Add a new `--account-id` flag (default resolved from a new
   `AI_PROVIDER_ACCOUNT_ID` env var, matching every other flag's
   env-var-or-default resolution convention already in this file).
3. Keep `--base-url`'s existing required-ness check scoped to the OpenCode
   branch only (unchanged from `VOC-035-T02`); add an analogous
   `--account-id` required-ness check scoped to the `cloudflare` branch only
   (Cloudflare requires it; OpenCode and Gemini do not use it at all).
4. Add a `--request-interval` flag (default resolved from a new
   `EVAL_LIVE_REQUEST_INTERVAL` env var, falling back to `0` — no pacing —
   when both are unset, per `VOC-036-D06`). When the resolved value is
   positive, wrap the constructed `feedbackProvider` (whichever provider was
   selected — OpenCode, Gemini, or Cloudflare) in a new unexported
   `pacedFeedbackProvider` type (implementing `FeedbackProvider`, confined to
   this file) that sleeps for the configured interval immediately before
   calling through to the wrapped provider's `GenerateFeedback`, then calls
   `RunLiveEvaluation` with the (possibly wrapped) provider exactly as before.
   A zero/unset interval must produce byte-for-byte the same behavior as
   before this task (no wrapper constructed at all, not merely a
   zero-duration sleep, so an OpenCode or Gemini run that never sets this flag
   is provably unaffected).
5. Update the command's own doc comment (the block at the top of the file) to
   mention the new `cloudflare` provider option, its required `--account-id`/
   `AI_PROVIDER_ACCOUNT_ID` value, and the new `--request-interval`/
   `EVAL_LIVE_REQUEST_INTERVAL` pacing option and why it exists (Cloudflare's
   free-tier shared daily rate limit, and the specific unpaced-burst failure
   mode this repository already observed once against a different provider's
   free tier).

In `apps/api/cmd/eval-live/main_test.go` (extending the existing file
`VOC-035-T02` added):

6. A test overriding `newCloudflareProvider` with a fake, confirming
   `--provider cloudflare` (or `AI_PROVIDER=cloudflare`) calls the Cloudflare
   constructor and not either existing constructor; a test confirming
   `--provider cloudflare` without `--account-id`/`AI_PROVIDER_ACCOUNT_ID` set
   exits with `exitUsageError`; a test confirming `--provider cloudflare`
   without `--base-url`/`AI_PROVIDER_BASE_URL` set does *not* trip the
   OpenCode-scoped base-URL check (mirroring `VOC-035-T02`'s own
   `TestRunEvalLive_GeminiDoesNotRequireBaseURL`, extended for Cloudflare).
7. A test confirming a positive `--request-interval` (or
   `EVAL_LIVE_REQUEST_INTERVAL`) value causes the constructed
   `FeedbackProvider` passed to `RunLiveEvaluation` to be a
   `*pacedFeedbackProvider` (or equivalent, implementer-named type) wrapping
   the provider the selected `--provider` value would otherwise construct
   directly; a test confirming the default (no flag, no env var) results in
   the exact same unwrapped provider value being passed through as before
   this task (no behavior change for any pre-existing invocation).

## VOC-036-T03 — Live Cloudflare Workers AI evaluation (T10-equivalent for EV-22)

- Requirement source: founder request; `VOC-036-D04`, `VOC-036-D06`
- Acceptance criteria: `VOC-036-AC-11`
- Tests: `VOC-036-TEST-11`
- Evidence: `VOC-036-EV-04`
- Status: pending, blocked on `VOC-036-T00`–`T02` merging and on
  `VOC-036-DEP-00` (founder provisioning a Cloudflare API token and account ID)

Not a code PR. Once `T00`–`T02` merge and Cloudflare credentials are
provisioned:

1. Choose a request-pacing interval before running anything: with 56 golden
   cases and Cloudflare's shared free-tier pool of 10,000 neurons/day, compute
   (from Cloudflare's own published per-model neuron cost for the selected
   model, read from its dashboard/documentation at run time, not guessed) a
   pacing interval that keeps the run comfortably inside both the per-minute
   rate limit and the daily neuron budget, erring toward slower rather than
   faster given `VOC-035`'s own reported unpaced-burst failure. Record the
   chosen interval and the reasoning in `staging-evidence.md` before or
   alongside the run, not only after.
2. Run `apps/api/cmd/eval-live --provider cloudflare --api-key <token>
   --account-id <account_id> --request-interval <chosen interval> [--model
   <model>]` (or the equivalent `AI_PROVIDER=cloudflare
   AI_PROVIDER_API_KEY=<token> AI_PROVIDER_ACCOUNT_ID=<account_id>
   EVAL_LIVE_REQUEST_INTERVAL=<interval>` env invocation) against the real
   Cloudflare Workers AI API, mirroring the operator procedure
   `VOC-032-T10`'s and `VOC-035-T03`'s own `staging-evidence.md` sections
   already document, substituting the provider selection and adding the
   pacing parameter.
3. Record the full rendered `LiveEvaluationReport` (every named field, plus
   the pacing interval actually used) into this package's own
   `staging-evidence.md` `EV-22`-equivalent section, including the operator's
   post-run neuron/cost usage from Cloudflare's own dashboard (free tier —
   expected `$0.00` billed, recorded as a fact, not assumed).
4. If every DOC-09 §23 threshold passes and no cost-ceiling violation occurs:
   mark `VOC-036-AC-11`'s `Result` field `pass`, and separately note in
   `staging-evidence.md` that this unblocks `VOC-032-T10`'s own `EV-22` row
   using Cloudflare as the qualifying provider (does not itself edit
   `VOC-032`'s own `staging-evidence.md` — that remains that package's
   separate closure bookkeeping).
5. If any threshold fails or the run cannot complete (rate limit, timeout,
   quota exhaustion on the free tier despite pacing, or any other real
   failure): record the failure exactly as observed, with the same honesty
   discipline `VOC-032`/`VOC-034`/`VOC-035` already established — **do not
   retry silently until a pass is produced and do not omit a failing run from
   the record.** A failed live run is valid, informative evidence, not a
   reason to withhold recording it. If the failure is itself a rate-limit hit
   despite the chosen pacing interval, record the interval used and the
   observed failure so a future attempt can choose a more conservative value
   — do not silently retry with a different interval and report only the
   eventually-successful attempt as if it were the first.
6. If `VOC-036-DEP-00` remains unresolved (no credentials provisioned) at the
   time this package's other tasks are otherwise ready to close, record that
   status explicitly in `staging-evidence.md` and leave `VOC-036-AC-11`'s
   `Result` at `pending — blocked by VOC-036-DEP-00` — never inferred as a
   pass by omission.
