# VOC-034 — Test Plan

## VOC-034-TEST-00 — Shared transport extraction does not change feedback-path behavior

- Covers: `VOC-034-AC-00`
- Preconditions: `VOC-034-T00` merged.
- Procedure: `go test ./apps/api/business/aifeedback/... -run TestOpenCodeFeedbackProvider`
  (every existing test name in `opencode_test.go`, unmodified); `git diff --name-only`
  confirms `opencode_test.go` itself has zero lines changed.
- Expected result: all existing `OpenCodeFeedbackProvider` tests pass unchanged;
  `opencode_test.go` has no diff.
- Evidence: `VOC-034-EV-00`

## VOC-034-TEST-01 — buildAIProviders selects real providers only when opencode+key configured

- Covers: `VOC-034-AC-01`
- Preconditions: `VOC-034-T01` merged.
- Procedure: `go test ./apps/api/app/api/... -run TestBuildAIProviders`.
- Expected result:
  `TestBuildAIProviders_BuildsRealOpenCodeProvidersWhenConfigured` confirms
  `*aifeedback.OpenCodeFeedbackProvider` and a moderation provider of type
  `*aifeedback.OpenCodeModerationProvider` wrapped inside the returned
  `*aifeedback.CompositeSafetyClassifier`;
  `TestBuildAIProviders_FallsBackToMockWhenNotConfigured` confirms both wrap
  `*aifeedback.MockProvider` when `cfg.APIProvider` or `cfg.APIKey` is empty.
- Evidence: `VOC-034-EV-01`

## VOC-034-TEST-02 — Local interception still precedes the (now real) moderation provider

- Covers: `VOC-034-AC-02`
- Preconditions: `VOC-034-T00` merged.
- Procedure: `go test ./apps/api/business/aifeedback/... -run TestCompositeSafetyClassifierPrefersLocalOverProvider`
  (pre-existing test, unchanged) plus the new `VOC-034-T00` step-12 test using a
  real `OpenCodeModerationProvider` pointed at a fake server with a call counter.
- Expected result: both tests pass; the new test's fake-server call counter is
  zero for a weapon-pattern sentence.
- Evidence: `VOC-034-EV-02`

## VOC-034-TEST-03 — Every new fail-closed path returns an error, never a fabricated allowed result

- Covers: `VOC-034-AC-03`
- Preconditions: `VOC-034-T00` merged.
- Procedure: `go test ./apps/api/business/aifeedback/... -run TestOpenCodeModerationProvider`
  (timeout, 401/403 auth, malformed JSON, provider-refusal-text, and
  unrecognized-outcome sub-tests, per `VOC-034-T00` step 10).
- Expected result: every sub-test asserts a non-nil `error` and a nil
  `*ModerationResult` from `Classify`; none returns `SafetyAllowed` or any other
  fabricated outcome.
- Evidence: `VOC-034-EV-00`

## VOC-034-TEST-04 — Injection resistance: learner sentence is sent as data, not instructions

- Covers: `VOC-034-AC-04`
- Preconditions: `VOC-034-T00` merged.
- Procedure: `go test ./apps/api/business/aifeedback/... -run TestOpenCodeModerationProviderInjection`
  (name illustrative; implementer names the actual test per `VOC-034-T00` step 11).
- Expected result: the fake server's captured request body shows the injected
  instruction text appears only inside the JSON user-payload data field, never in
  the `system` field or the developer-prompt text sent to the model.
- Evidence: `VOC-034-EV-00`

## VOC-034-TEST-05 — All four real outcome mappings

- Covers: `VOC-034-AC-05`
- Preconditions: `VOC-034-T00` merged.
- Procedure: `go test ./apps/api/business/aifeedback/... -run TestOpenCodeModerationProviderMaps`
  (four sub-tests: allowed, allowed_sensitive, blocked, self_harm_intervention).
- Expected result: each sub-test asserts the exact matching `Safety*` constant on
  the returned `ModerationResult.Outcome`.
- Evidence: `VOC-034-EV-00`

## VOC-034-TEST-06 — Production-wiring regression: ordinary sentence reaches the real feedback-provider seam

- Covers: `VOC-034-AC-06`
- Preconditions: `VOC-034-T02` merged.
- Procedure: `go test ./apps/api/app/api/... -run TestSubmitSentenceFeedback.*RealModeration`
  (name illustrative; implementer names the actual test per `VOC-034-T02`).
- Expected result: HTTP 200; response error code is not
  `SAFETY_MODERATION_UNAVAILABLE`; fake server's moderation-call counter ≥ 1;
  fake server's feedback-call counter ≥ 1.
- Evidence: `VOC-034-EV-03`

## VOC-034-TEST-07 — Missing moderation provider still fails closed

- Covers: `VOC-034-AC-07`
- Preconditions: `VOC-034-T00` merged (no code change to `safety.go` — this
  re-confirms existing behavior is untouched).
- Procedure: `go test ./apps/api/business/aifeedback/... -run TestCompositeSafetyClassifierMapsProviderErrorToUnavailable`
  and `-run TestProviderSafetyClassifierNilProvider` (pre-existing tests,
  unchanged).
- Expected result: both continue to pass, returning `SafetyModerationUnavailable`.
- Evidence: `VOC-034-EV-02`

## VOC-034-TEST-08 — .env.example documents dual use; no new variable

- Covers: `VOC-034-AC-08`
- Preconditions: `VOC-034-T01` merged.
- Procedure: `grep -n "AI_PROVIDER" apps/api/.env.example` and read the updated
  comment blocks; `git diff apps/api/.env.example` and confirm no line adds a new
  `KEY=` assignment, only comment text changes.
- Expected result: comments mention moderation; no new variable name appears.
- Evidence: `VOC-034-EV-01`

## VOC-034-TEST-09 — Diff stays within declared scope

- Covers: `VOC-034-AC-09`
- Preconditions: `VOC-034-T00`, `VOC-034-T01`, `VOC-034-T02` merged.
- Procedure: `git diff --name-only <base_sha>...<candidate_sha>`.
- Expected result: matches exactly the file list in `VOC-034-AC-09` — no
  `service.go`, `safety.go`, `task.go`, DTO, public-error-code, or
  outside-`apps/api` change.
- Evidence: `VOC-034-EV-04`

## VOC-034-TEST-10 — Live staging verification

- Covers: `VOC-034-AC-10`
- Preconditions: `VOC-034-T00`–`T02` merged and deployed to staging
  (`VOC-034-DEP-01` resolved).
- Procedure: `VOC-034-T03`'s documented disposable-identity walkthrough, executed
  by an operator with staging access.
- Expected result: a real, non-`SAFETY_MODERATION_UNAVAILABLE` response;
  `learner_sentences`/`ai_feedback_attempts` rows created and then deleted along
  with the disposable identity; results recorded in `staging-evidence.md`.
- Evidence: `VOC-034-EV-05`

## Rollback coverage

This package adds no schema, no destructive operation, and no data migration —
see `implementation-plan.md` "Deployment and rollback". If a merged commit needs
to be undone, the correct mechanism is a plain `git revert` of the specific PR's
merge commit, which restores the prior `nil`-safety-classifier wiring (i.e.,
restores the fail-closed `SAFETY_MODERATION_UNAVAILABLE` behavior for all
sentences — a safe, if non-functional, prior state, not a broken one). No
`.down.sql.example` file is added or needed. Independent of any code revert, the
existing `AI_FEATURES_ENABLED` kill switch (`GenerationGate`, unchanged by this
package) remains available to disable all AI generation immediately if a live
issue is discovered after this package deploys — matching DOC-09 §25's rollback
guidance ("roll back or disable generation immediately on unsafe feedback
reaching learners...").
