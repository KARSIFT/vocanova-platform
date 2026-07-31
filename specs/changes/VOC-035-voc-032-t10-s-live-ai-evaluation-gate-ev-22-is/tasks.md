# VOC-035 — Tasks

**Draft — no task below is implementation-authorized until this package is
adopted (`change.yaml`'s `implementation_authorized: false`).**

Ordered PR sequence: `T00 → T01 → T02`. `T03` is a post-merge
operator/founder-gate execution step with its own evidence record, not a code
PR — physically dependent on `T00`–`T02` merging and deploying, and on the
founder provisioning a Gemini API key (`VOC-035-DEP-00`). Each of `T00`–`T02`
is independently reviewable in one pull request. Risk is proposed **R3**
(semantic AI-provider/safety-consequence grounds — see `specification.md`
"Risk and protected areas"); each PR would require Claude Code exact-SHA
review per this repository's `CLAUDE.md`.

## VOC-035-T00 — Gemini feedback + moderation providers, shared transport, unit tests

- Requirement source: `VOC-035-D00`, `VOC-035-D01`, `VOC-035-D03`, `VOC-035-D04`
- Acceptance criteria: `VOC-035-AC-00`, `VOC-035-AC-01`, `VOC-035-AC-02`,
  `VOC-035-AC-03`, `VOC-035-AC-04`, `VOC-035-AC-08`
- Tests: `VOC-035-TEST-00`, `VOC-035-TEST-01`, `VOC-035-TEST-02`,
  `VOC-035-TEST-03`, `VOC-035-TEST-04`, `VOC-035-TEST-08`
- Evidence: `VOC-035-EV-00`
- Status: pending (not authorized)

Add a new file `apps/api/business/aifeedback/gemini.go`:

1. `GeminiConfig` struct: `APIKey`, `Model` (default `"gemini-2.5-flash"` if
   empty), `BaseURL` (default `"https://generativelanguage.googleapis.com"` if
   empty — `VOC-035-D02`), `Timeout` (default `8 * time.Second` if `<= 0`,
   matching `OpenCodeConfig`'s own default), `MaxRetries`.
2. An unexported `geminiTransport` struct (`config GeminiConfig`, `client
   *http.Client`) and `newGeminiTransport(config GeminiConfig)
   *geminiTransport` constructor applying the defaults in step 1, mirroring
   `opencode.go`'s `openCodeTransport`/`newOpenCodeTransport` shape.
3. A `sendWithRetry`-equivalent method on `geminiTransport`: builds the POST
   request to `{BaseURL}/v1beta/models/{Model}:generateContent`, sets
   `Content-Type: application/json` and `x-goog-api-key: {APIKey}` (never an
   `Authorization` header — `VOC-035-D00`'s auth-model distinction from
   OpenCode), sends the body, reads the response, and retries on the same
   retryable-network-error / retryable-HTTP-status conditions
   `opencode.go`'s `isRetryableError`/`isRetryableHTTPStatus` already define
   (reuse those exact functions — do not duplicate them; they are
   provider-agnostic name-wise but currently unexported in the same package,
   so they are directly callable from `gemini.go`).
4. `GeminiFeedbackProvider` (embeds/wraps `*geminiTransport`) implementing
   `FeedbackProvider.GenerateFeedback`: builds the request body from
   `task.go`'s existing prompt/schema functions (the same ones
   `OpenCodeFeedbackProvider.buildMessageRequestBody` already calls) placed
   into Gemini's `contents`/`systemInstruction`/`generationConfig.responseSchema`
   shape instead of OpenCode's `parts`/`model` shape; parses the response
   per `VOC-035-D03`'s fail-closed contract; maps the resulting JSON object
   to `ProviderFeedback` via the same field-mapping logic
   `mapOpenCodeFeedback` already implements (reuse or extract a shared
   helper — implementer's call, whichever avoids duplicating the mapping
   logic).
5. `GeminiModerationProvider` (embeds/wraps `*geminiTransport`, `MaxRetries`
   forced to `0` at construction per `VOC-035-D04`) implementing
   `ModerationProvider.Classify`: builds the request from `moderation.go`'s
   existing `moderationSystemPrompt()`/`moderationDeveloperPrompt()`/
   `moderationOutputSchema()` functions; parses the response and matches
   `outcome` against the exact same four `Safety*` constants
   `moderation.go`'s `parseModerationResponse` already matches against (reuse
   that matching logic or extract a shared helper — implementer's call).
6. Response parsing: extract `candidates[0].content.parts[*].text`
   (concatenated, mirroring `opencode.go`'s multi-part concatenation), check
   `promptFeedback.blockReason` and `candidates[0].finishReason` before
   trusting the text (`VOC-035-D03`) — an empty `candidates` list, a non-empty
   `blockReason`, or a `finishReason` other than `"STOP"` all short-circuit to
   a non-nil error before any JSON parsing is attempted.
7. `var _ FeedbackProvider = (*GeminiFeedbackProvider)(nil)` and
   `var _ ModerationProvider = (*GeminiModerationProvider)(nil)` compile-time
   checks, mirroring `opencode.go`/`moderation.go`'s existing convention.

Add `apps/api/business/aifeedback/gemini_test.go` (mirroring
`opencode_test.go`'s/`moderation_test.go`'s fake-server pattern — a fake
`httptest.Server` standing in for `generativelanguage.googleapis.com`, never a
real Gemini call):

8. A request-shape test asserting the outgoing request's URL path includes
   the configured model, the `x-goog-api-key` header carries the configured
   key, `Authorization` is absent, and the body's `generationConfig` includes
   `responseMimeType: "application/json"` and a non-empty `responseSchema`
   (`VOC-035-AC-00`).
9. One test per moderation outcome mapping: `allowed`, `allowed_sensitive`,
   `blocked`, `self_harm_intervention` (`VOC-035-AC-04`), plus feedback-status
   coverage for `GenerateFeedback`.
10. Fail-closed tests: HTTP timeout, non-2xx status, empty `candidates`,
    non-empty `promptFeedback.blockReason`, `finishReason: "SAFETY"`,
    malformed JSON in the returned text, and (moderation only) an
    unrecognized `outcome` value — each asserting a non-nil error and a nil
    result (`VOC-035-AC-02`).
11. An injection-resistance test asserting the literal outgoing request body:
    an embedded-instruction learner sentence appears only inside `contents`'
    data payload, never inside `systemInstruction` (`VOC-035-AC-03`).
12. A retry-count test confirming `MaxRetries: 0` on `GeminiModerationProvider`
    results in exactly one attempt even when the fake server returns a
    retryable status, mirroring `moderation_test.go`'s equivalent OpenCode
    coverage.
13. A `grep`-verifiable confirmation (a code comment or a build-tag-free
    static check, implementer's call) that no test in this file constructs a
    request against `https://generativelanguage.googleapis.com` itself
    (`VOC-035-AC-08`).

## VOC-035-T01 — Wire Gemini into `buildAIProviders`; document env vars

- Requirement source: `VOC-035-D00`, `VOC-035-D02`, `VOC-035-D05`
- Acceptance criteria: `VOC-035-AC-05`, `VOC-035-AC-06`, `VOC-035-AC-09`
- Tests: `VOC-035-TEST-05`, `VOC-035-TEST-06`, `VOC-035-TEST-09`
- Evidence: `VOC-035-EV-01`, `VOC-035-EV-03`
- Status: pending (not authorized)

In `apps/api/app/api/production.go`:

1. Add a third branch to `buildAIProviders`: when `cfg.APIProvider ==
   "gemini"` and `cfg.APIKey != ""`, build one shared
   `aifeedback.GeminiConfig{APIKey: cfg.APIKey, Model: cfg.APIModel, BaseURL:
   cfg.APIBaseURL, Timeout: cfg.APITimeout, MaxRetries: 1}` (per `VOC-035-D02`,
   `cfg.APIBaseURL` is passed through as-is — an operator who has not set
   `AI_PROVIDER_BASE_URL` gets Gemini's own zero-value default resolved
   inside `GeminiConfig`'s own defaulting, per `VOC-035-T00` step 1; an
   operator who has customized it for OpenCode and then also sets
   `AI_PROVIDER=gemini` without resetting it would send Gemini requests to
   the OpenCode host, which is an explicit, documented operator
   responsibility this task's `.env.example` update calls out, not silently
   guarded against in code — flag this trade-off in the PR description for
   reviewer awareness rather than silently deciding it). Return
   `aifeedback.NewGeminiFeedbackProvider(geminiCfg)` and
   `aifeedback.NewCompositeSafetyClassifier(aifeedback.NewDefaultLocalAbuseChecker(),
   aifeedback.NewGeminiModerationProvider(geminiCfg))`.
2. Preserve existing branch order and behavior for `cfg.APIProvider ==
   "opencode"` and the mock fallback exactly unchanged — the new branch is
   additive, checked as a genuinely separate `case`/`else if`, never
   reordered ahead of the existing checks.
3. Update the stderr logging line convention (matching the existing
   `buildEmailSender`/`buildOAuthProvider`/existing `buildAIProviders`
   style) to name which concrete pair was selected, never logging the API
   key value.

In `apps/api/.env.example`, per `VOC-035-D02`/`VOC-035-D05` (resolved as
proposed unless the adopting human overrides at adoption):

4. Update the comment blocks above `AI_PROVIDER`, `AI_PROVIDER_API_KEY`,
   `AI_PROVIDER_BASE_URL`, and `AI_PROVIDER_MODEL` to state
   `AI_PROVIDER` also accepts `"gemini"`, that `AI_PROVIDER_API_KEY` becomes
   the Gemini API key in that mode, that `AI_PROVIDER_MODEL` defaults to
   `"gemini-2.5-flash"` for Gemini, and that `AI_PROVIDER_BASE_URL` is
   ignored by Gemini unless explicitly set (Gemini has a fixed default
   endpoint). Do not change `AI_PROVIDER`'s own existing default value.

In `apps/api/app/api/production_test.go`:

5. `TestBuildAIProviders_BuildsRealGeminiProvidersWhenConfigured` — with
   `cfg.APIProvider = "gemini"` and a non-empty `cfg.APIKey`, asserts the
   returned feedback provider is `*aifeedback.GeminiFeedbackProvider` and the
   returned safety classifier wraps a `*aifeedback.GeminiModerationProvider`.
6. `TestBuildAIProviders_GeminiFallsBackToMockWhenKeyMissing` — with
   `cfg.APIProvider = "gemini"` and an empty `cfg.APIKey`, asserts both wrap
   `*aifeedback.MockProvider` (same fallback as the existing OpenCode
   no-key case).
7. `TestBuildAIProviders_OpenCodeBranchUnchangedByGeminiAddition` — re-run
   (or confirm still present and passing) the existing
   `TestBuildAIProviders_BuildsRealOpenCodeProvidersWhenConfigured` and
   `TestBuildAIProviders_FallsBackToMockWhenNotConfigured` from `VOC-034-T01`
   unchanged, proving the new branch did not alter OpenCode's own selection
   logic.

## VOC-035-T02 — Extend `cmd/eval-live` to select Gemini for the T10-equivalent live run

- Requirement source: `VOC-035-D06`
- Acceptance criteria: `VOC-035-AC-07`, `VOC-035-AC-09`
- Tests: `VOC-035-TEST-07`, `VOC-035-TEST-09`
- Evidence: `VOC-035-EV-02`, `VOC-035-EV-03`
- Status: pending (not authorized)

In `apps/api/cmd/eval-live/main.go`:

1. Add a `--provider` flag (default resolved from `AI_PROVIDER` env var,
   falling back to `"opencode"` if both are unset — preserving every existing
   invocation's default behavior byte-for-byte).
2. Replace the current unconditional `newProvider(aifeedback.OpenCodeConfig{...})`
   construction with a small selection: when `*provider == "gemini"`, build
   `aifeedback.GeminiConfig{APIKey: *apiKey, Model: *model, BaseURL:
   *baseURL, Timeout: *timeout, MaxRetries: 1}` (reusing the existing
   `--api-key`/`--model`/`--base-url`/`--timeout` flags and their existing
   `AI_PROVIDER_*`-env-var-or-default resolution unchanged — Gemini's model
   default should resolve to `"gemini-2.5-flash"` when `--model`/
   `AI_PROVIDER_MODEL` is unset and `--provider gemini` is set, not
   `DefaultOpenCodeModel`) and call a new `newGeminiProvider` package-level
   variable (mirroring the existing `newProvider` test-seam pattern) instead
   of `newProvider`; otherwise keep today's exact `newProvider` call
   unchanged.
3. Keep `--base-url`'s existing required-ness check scoped to the
   OpenCode branch only (Gemini does not require an explicit base URL per
   `VOC-035-D02`'s default) — do not make `--base-url` newly required for
   `--provider gemini`.
4. Update the command's own doc comment (the block at the top of the file)
   to mention the new `--provider`/`AI_PROVIDER` selection and that
   Gemini's own required variable is only `AI_PROVIDER_API_KEY`
   (no base URL requirement).

In `apps/api/cmd/eval-live/main_test.go` (new file, or added to an existing
one if `cmd/eval-live` already has tests — check first):

5. A test overriding both `newProvider` and the new `newGeminiProvider`
   package variables with fakes, confirming `--provider gemini` (or
   `AI_PROVIDER=gemini`) calls the Gemini constructor and not the OpenCode
   one, and that the default (no flag, no env var) still calls the OpenCode
   constructor.
6. A test confirming `--provider gemini` without `--base-url`/
   `AI_PROVIDER_BASE_URL` set does not trip the existing `--base-url`
   required-ness check (asserts exit code is not `exitUsageError` for that
   reason).

## VOC-035-T03 — Live Gemini evaluation (T10-equivalent for EV-22)

- Requirement source: founder request; `VOC-035-D04`
- Acceptance criteria: `VOC-035-AC-10`
- Tests: `VOC-035-TEST-10`
- Evidence: `VOC-035-EV-04`
- Status: pending, blocked on `VOC-035-T00`–`T02` merging and on
  `VOC-035-DEP-00` (founder provisioning a free Gemini API key at
  `aistudio.google.com`)

Not a code PR. Once `T00`–`T02` merge and a Gemini API key is provisioned:

1. Run `apps/api/cmd/eval-live --provider gemini --api-key
   <the-key> [--model gemini-2.5-flash]` (or the equivalent `AI_PROVIDER=gemini
   AI_PROVIDER_API_KEY=<key>` env invocation) against the real Gemini API,
   exactly mirroring the operator procedure `VOC-032-T10`'s own
   `staging-evidence.md` section already documents for OpenCode, substituting
   the provider selection.
2. Record the full rendered `LiveEvaluationReport` (every named field, per
   `VOC-032-T10`'s own "the report the operator copies into this document is
   machine-parseable" design) into this package's own `staging-evidence.md`
   `EV-22`-equivalent section, including the operator's post-run cost value
   from Google AI Studio's own usage dashboard (free tier — expected `$0.00`,
   recorded as a fact, not assumed).
3. If every DOC-09 §23 threshold passes and no cost-ceiling violation
   occurs: mark `VOC-035-AC-10`'s `Result` field `pass`, and separately note
   in `staging-evidence.md` that this unblocks `VOC-032-T10`'s own `EV-22`
   row using Gemini as the qualifying provider (does not itself edit
   `VOC-032`'s own `staging-evidence.md` — that remains that package's
   separate closure bookkeeping, per this drafting role's scope-discipline
   rule).
4. If any threshold fails or the run cannot complete (rate limit, timeout,
   quota exhaustion on the free tier, or any other real failure): record the
   failure exactly as observed, with the same honesty discipline
   `VOC-032`/`VOC-034` already established — **do not retry silently until a
   pass is produced and do not omit a failing run from the record.** A
   failed live run is valid, informative evidence, not a reason to withhold
   recording it.
5. If `VOC-035-DEP-00` remains unresolved (no key provisioned) at the time
   this package's other tasks are otherwise ready to close, record that
   status explicitly in `staging-evidence.md` and leave `VOC-035-AC-10`'s
   `Result` at `pending — blocked by VOC-035-DEP-00` — never inferred as a
   pass by omission.
