# VOC-035 — Test Plan

**Draft — not adopted.**

## VOC-035-TEST-00 — Gemini transport builds a well-formed `generateContent` request

- Covers: `VOC-035-AC-00`
- Preconditions: `VOC-035-T00` merged.
- Procedure: `go test ./apps/api/business/aifeedback/... -run TestGeminiRequestShape`
  (name illustrative; implementer names the actual test per `VOC-035-T00` step 8).
- Expected result: the fake server's captured request has the model in the URL
  path, `x-goog-api-key` set to the configured key, no `Authorization` header,
  and a `generationConfig.responseMimeType == "application/json"` with a
  non-empty `responseSchema`.
- Evidence: `VOC-035-EV-00`

## VOC-035-TEST-01 — Gemini providers reuse the existing shared prompts/schemas

- Covers: `VOC-035-AC-01`
- Preconditions: `VOC-035-T00` merged.
- Procedure: a test (or a static code-inspection assertion in the test file)
  confirming `gemini.go`'s request-building code calls the same
  `moderationSystemPrompt()`/`moderationDeveloperPrompt()`/
  `moderationOutputSchema()` and `task.go`-equivalent functions
  `moderation.go`/`task.go` already define, rather than defining new ones.
- Expected result: the outgoing request's prompt/schema text is
  byte-identical to what `OpenCodeModerationProvider`/`OpenCodeFeedbackProvider`
  already send for the same input, confirmed by comparing captured request
  bodies from both providers' fake-server tests.
- Evidence: `VOC-035-EV-00`

## VOC-035-TEST-02 — Every new fail-closed path returns an error, never a fabricated result

- Covers: `VOC-035-AC-02`
- Preconditions: `VOC-035-T00` merged.
- Procedure: `go test ./apps/api/business/aifeedback/... -run TestGeminiFeedbackProvider|TestGeminiModerationProvider`
  (timeout, non-2xx, empty candidates, blockReason set, non-STOP finishReason,
  malformed JSON, and — moderation only — unrecognized outcome sub-tests, per
  `VOC-035-T00` step 10).
- Expected result: every sub-test asserts a non-nil error and a nil result;
  none returns a fabricated `ProviderFeedback`/`ModerationResult`.
- Evidence: `VOC-035-EV-00`

## VOC-035-TEST-03 — Injection resistance: learner sentence sent as data, not instructions

- Covers: `VOC-035-AC-03`
- Preconditions: `VOC-035-T00` merged.
- Procedure: `go test ./apps/api/business/aifeedback/... -run TestGeminiInjection`
  (name illustrative; implementer names the actual test per `VOC-035-T00` step 11).
- Expected result: the fake server's captured request body shows the injected
  instruction text only inside `contents`' data payload, never inside
  `systemInstruction`.
- Evidence: `VOC-035-EV-00`

## VOC-035-TEST-04 — All four moderation outcomes and both feedback statuses

- Covers: `VOC-035-AC-04`
- Preconditions: `VOC-035-T00` merged.
- Procedure: `go test ./apps/api/business/aifeedback/... -run TestGeminiModerationProviderMaps|TestGeminiFeedbackProviderMaps`.
- Expected result: each sub-test asserts the exact matching outcome/status
  value on the returned result.
- Evidence: `VOC-035-EV-00`

## VOC-035-TEST-05 — `buildAIProviders` selects Gemini only when explicitly configured

- Covers: `VOC-035-AC-05`
- Preconditions: `VOC-035-T01` merged.
- Procedure: `go test ./apps/api/app/api/... -run TestBuildAIProviders`.
- Expected result: `TestBuildAIProviders_BuildsRealGeminiProvidersWhenConfigured`,
  `TestBuildAIProviders_GeminiFallsBackToMockWhenKeyMissing`, and the
  pre-existing OpenCode/mock tests from `VOC-034-T01` all pass.
- Evidence: `VOC-035-EV-01`

## VOC-035-TEST-06 — `.env.example` documents Gemini without changing existing defaults

- Covers: `VOC-035-AC-06`
- Preconditions: `VOC-035-T01` merged.
- Procedure: `grep -n "AI_PROVIDER" apps/api/.env.example` and read the
  updated comment blocks; `git diff apps/api/.env.example` to confirm
  `AI_PROVIDER`'s own default assignment line is unchanged.
- Expected result: comments mention `gemini`; `AI_PROVIDER`'s default value
  line is byte-identical to `base_sha`.
- Evidence: `VOC-035-EV-01`

## VOC-035-TEST-07 — `cmd/eval-live` selects Gemini without changing its default OpenCode behavior

- Covers: `VOC-035-AC-07`
- Preconditions: `VOC-035-T02` merged.
- Procedure: `go test ./apps/api/cmd/eval-live/...`.
- Expected result: a test with `--provider gemini` (or `AI_PROVIDER=gemini`)
  invokes the new Gemini constructor seam; a test with neither set invokes
  the existing OpenCode constructor seam, exactly as before this package.
- Evidence: `VOC-035-EV-02`

## VOC-035-TEST-08 — No live Gemini call from any test in this package

- Covers: `VOC-035-AC-08`
- Preconditions: `VOC-035-T00`, `VOC-035-T02` merged.
- Procedure: `grep -rn "generativelanguage.googleapis.com"
  apps/api/business/aifeedback/*_test.go apps/api/cmd/eval-live/*_test.go`.
- Expected result: no match — every test's HTTP client points at a local
  `httptest.Server` URL, never the real Google host.
- Evidence: `VOC-035-EV-00`, `VOC-035-EV-02`

## VOC-035-TEST-09 — Diff stays within declared scope

- Covers: `VOC-035-AC-09`
- Preconditions: `VOC-035-T00`, `VOC-035-T01`, `VOC-035-T02` merged.
- Procedure: `git diff --name-only <base_sha>...<candidate_sha>`.
- Expected result: matches exactly the file list in `VOC-035-AC-09` — no
  `service.go`, `safety.go`, `task.go`, `moderation.go`, `opencode.go`, DTO,
  public-error-code, or outside-`apps/api` change.
- Evidence: `VOC-035-EV-03`

## VOC-035-TEST-10 — Live Gemini evaluation

- Covers: `VOC-035-AC-10`
- Preconditions: `VOC-035-T00`–`T02` merged and deployed; `VOC-035-DEP-00`
  resolved (a real Gemini API key provisioned).
- Procedure: `VOC-035-T03`'s documented operator walkthrough, executed by an
  operator with the provisioned key.
- Expected result: a full `LiveEvaluationReport` recorded in
  `staging-evidence.md`, with an honest pass/fail/still-blocked outcome — no
  fabricated pass.
- Evidence: `VOC-035-EV-04`

## Rollback coverage

This package adds no schema, no destructive operation, and no data migration
— see `implementation-plan.md` "Deployment and rollback". If a merged commit
needs to be undone, the correct mechanism is a plain `git revert` of the
specific PR's merge commit, which removes the new `gemini` branch/flag
entirely and restores the prior OpenCode-only-or-mock behavior exactly (a
safe prior state, not a broken one, since Gemini is additive and
operator-opt-in). No `.down.sql.example` file is added or needed. Independent
of any code revert, the existing `AI_FEATURES_ENABLED` kill switch
(`GenerationGate`, unchanged by this package) remains available to disable
all AI generation immediately regardless of which provider is configured.
