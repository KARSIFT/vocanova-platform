# VOC-036 — Test Plan

**Draft — not adopted.**

## VOC-036-TEST-00 — Cloudflare transport builds a well-formed Workers AI request

- Covers: `VOC-036-AC-00`
- Preconditions: `VOC-036-T00` merged.
- Procedure: `go test ./apps/api/business/aifeedback/... -run TestCloudflareRequestShape`
  (name illustrative; implementer names the actual test per `VOC-036-T00` step 8).
- Expected result: the fake server's captured request has the account ID and
  model in the URL path, `Authorization: Bearer <token>` set to the configured
  token, and a `response_format.type == "json_schema"` with a non-empty
  `json_schema`.
- Evidence: `VOC-036-EV-00`

## VOC-036-TEST-01 — Cloudflare providers reuse the existing shared prompts/schemas and retry classifiers

- Covers: `VOC-036-AC-01`
- Preconditions: `VOC-036-T00` merged.
- Procedure: a test (or a static code-inspection assertion in the test file)
  confirming `cloudflare.go`'s request-building code calls the same
  `moderationSystemPrompt()`/`moderationDeveloperPrompt()`/
  `moderationOutputSchema()` and `task.go`-equivalent functions
  `moderation.go`/`task.go` already define, and calls `opencode.go`'s existing
  `isRetryableError`/`isRetryableHTTPStatus` functions, rather than defining
  new ones.
- Expected result: the outgoing request's prompt/schema text is
  byte-identical to what `OpenCodeFeedbackProvider`/`GeminiFeedbackProvider`
  already send for the same input, confirmed by comparing captured request
  bodies across all three providers' fake-server tests.
- Evidence: `VOC-036-EV-00`

## VOC-036-TEST-02 — Every new fail-closed path returns an error, never a fabricated result

- Covers: `VOC-036-AC-02`
- Preconditions: `VOC-036-T00` merged.
- Procedure: `go test ./apps/api/business/aifeedback/... -run TestCloudflareFeedbackProvider|TestCloudflareModerationProvider`
  (timeout, non-2xx, `success: false`, empty/missing `result.response`,
  malformed JSON, and — moderation only — unrecognized outcome sub-tests, per
  `VOC-036-T00` step 10).
- Expected result: every sub-test asserts a non-nil error and a nil result;
  none returns a fabricated `ProviderFeedback`/`ModerationResult`.
- Evidence: `VOC-036-EV-00`

## VOC-036-TEST-03 — Injection resistance: learner sentence sent as data, not instructions

- Covers: `VOC-036-AC-03`
- Preconditions: `VOC-036-T00` merged.
- Procedure: `go test ./apps/api/business/aifeedback/... -run TestCloudflareInjection`
  (name illustrative; implementer names the actual test per `VOC-036-T00` step 11).
- Expected result: the fake server's captured request body shows the injected
  instruction text only inside the `user`-role message content, never inside
  the `system`-role message.
- Evidence: `VOC-036-EV-00`

## VOC-036-TEST-04 — All four moderation outcomes and both feedback statuses

- Covers: `VOC-036-AC-04`
- Preconditions: `VOC-036-T00` merged.
- Procedure: `go test ./apps/api/business/aifeedback/... -run TestCloudflareModerationProviderMaps|TestCloudflareFeedbackProviderMaps`.
- Expected result: each sub-test asserts the exact matching outcome/status
  value on the returned result.
- Evidence: `VOC-036-EV-00`

## VOC-036-TEST-05 — `buildAIProviders` selects Cloudflare only when explicitly and completely configured

- Covers: `VOC-036-AC-05`
- Preconditions: `VOC-036-T01` merged.
- Procedure: `go test ./apps/api/app/api/... -run TestBuildAIProviders`.
- Expected result: `TestBuildAIProviders_BuildsRealCloudflareProvidersWhenConfigured`,
  `TestBuildAIProviders_CloudflareFallsBackToMockWhenTokenMissing`,
  `TestBuildAIProviders_CloudflareFallsBackToMockWhenAccountIDMissing`, and the
  pre-existing OpenCode/Gemini/mock tests from `VOC-034-T01`/`VOC-035-T01` all
  pass.
- Evidence: `VOC-036-EV-01`

## VOC-036-TEST-06 — `.env.example` documents Cloudflare's two-part credential without changing existing defaults

- Covers: `VOC-036-AC-06`
- Preconditions: `VOC-036-T01` merged.
- Procedure: `grep -n "AI_PROVIDER" apps/api/.env.example` and read the
  updated comment blocks; `git diff apps/api/.env.example` to confirm
  `AI_PROVIDER`'s own default assignment line and every pre-existing variable's
  default value are byte-identical to `base_sha`.
- Expected result: comments mention `cloudflare`; a new
  `AI_PROVIDER_ACCOUNT_ID` block is present and marked required for
  Cloudflare only; `AI_PROVIDER`'s default value line is unchanged.
- Evidence: `VOC-036-EV-01`

## VOC-036-TEST-07 — `cmd/eval-live` selects Cloudflare without changing its default OpenCode or Gemini-selection behavior

- Covers: `VOC-036-AC-07`
- Preconditions: `VOC-036-T02` merged.
- Procedure: `go test ./apps/api/cmd/eval-live/...`.
- Expected result: a test with `--provider cloudflare` (or
  `AI_PROVIDER=cloudflare`) invokes the new Cloudflare constructor seam; a
  test with `--provider gemini` and a test with neither/`opencode` set
  continue to invoke their pre-existing constructor seams exactly as before
  this package.
- Evidence: `VOC-036-EV-02`

## VOC-036-TEST-08 — Request pacing applies when configured and is a no-op otherwise

- Covers: `VOC-036-AC-08`
- Preconditions: `VOC-036-T02` merged.
- Procedure: `go test ./apps/api/cmd/eval-live/... -run TestRunEvalLive.*Pacing|TestRunEvalLive.*Interval`
  (name illustrative; implementer names the actual test per `VOC-036-T02`
  step 7).
- Expected result: a positive `--request-interval`/`EVAL_LIVE_REQUEST_INTERVAL`
  value causes the provider passed to `RunLiveEvaluation` to be wrapped in the
  pacing decorator; the unset/zero default passes the exact same unwrapped
  provider value through as every pre-existing invocation did before this
  package.
- Evidence: `VOC-036-EV-02`

## VOC-036-TEST-09 — No live Cloudflare call from any test in this package

- Covers: `VOC-036-AC-09`
- Preconditions: `VOC-036-T00`, `VOC-036-T02` merged.
- Procedure: `grep -rn "api.cloudflare.com"
  apps/api/business/aifeedback/*_test.go apps/api/cmd/eval-live/*_test.go`.
- Expected result: no match — every test's HTTP client points at a local
  `httptest.Server` URL, never the real Cloudflare host.
- Evidence: `VOC-036-EV-00`, `VOC-036-EV-02`

## VOC-036-TEST-10 — Diff stays within declared scope

- Covers: `VOC-036-AC-10`
- Preconditions: `VOC-036-T00`, `VOC-036-T01`, `VOC-036-T02` merged.
- Procedure: `git diff --name-only <base_sha>...<candidate_sha>`.
- Expected result: matches exactly the file list in `VOC-036-AC-10` — no
  `service.go`, `safety.go`, `task.go`, `moderation.go`, `opencode.go`,
  `gemini.go`, DTO, public-error-code, `VOC-035`-directory, or
  outside-`apps/api` change.
- Evidence: `VOC-036-EV-03`

## VOC-036-TEST-11 — Live Cloudflare evaluation, paced against the free-tier limit

- Covers: `VOC-036-AC-11`
- Preconditions: `VOC-036-T00`–`T02` merged and deployed; `VOC-036-DEP-00`
  resolved (a real Cloudflare API token and account ID provisioned).
- Procedure: `VOC-036-T03`'s documented operator walkthrough, executed by an
  operator with the provisioned credentials and an explicitly chosen
  `--request-interval`.
- Expected result: a full `LiveEvaluationReport` (including the pacing
  interval used) recorded in `staging-evidence.md`, with an honest
  pass/fail/still-blocked outcome — no fabricated pass.
- Evidence: `VOC-036-EV-04`

## Rollback coverage

This package adds no schema, no destructive operation, and no data migration —
see `implementation-plan.md` "Deployment and rollback". If a merged commit
needs to be undone, the correct mechanism is a plain `git revert` of the
specific PR's merge commit, which removes the new `cloudflare` branch/flag/
pacing decorator entirely and restores the prior OpenCode/Gemini-only-or-mock
behavior exactly (a safe prior state, not a broken one, since Cloudflare is
additive and operator-opt-in). No `.down.sql.example` file is added or needed.
Independent of any code revert, the existing `AI_FEATURES_ENABLED` kill switch
(`GenerationGate`, unchanged by this package) remains available to disable all
AI generation immediately regardless of which provider is configured.
