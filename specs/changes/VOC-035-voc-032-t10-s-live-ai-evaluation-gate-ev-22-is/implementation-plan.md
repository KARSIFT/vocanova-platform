# VOC-035 — Implementation Plan

**Draft — do not begin implementation until this package and its tasks are
approved and implementation-authorized (`change.yaml`'s
`implementation_authorized: false`).**

## Preconditions and protected areas

This package is not yet adopted. Nothing in `tasks.md` may be started until a
human reviews this draft, confirms or adjusts the proposed R3 risk
classification, resolves `VOC-035-D02` and `VOC-035-D05`'s open questions (or
explicitly defers them to the implementer with stated defaults — this draft's
own proposed defaults are recorded in `specification.md`), and records
approval in `change.yaml`.

All planned work touches `apps/api/business/aifeedback`,
`apps/api/app/api`, and `apps/api/cmd/eval-live`, none of which is matched by
this repository's automated R3 path glob on their own (confirmed by
`scripts/governance/classify-change-risk.sh` — see `specification.md` "Risk
and protected areas"); this package proposes **R3** on semantic AI-provider/
safety-consequence grounds per `CLAUDE.md`'s "raise the class when path rules
miss a protected or R4 consequence" instruction, for a human to confirm or
adjust at adoption. Under active A-003, routine R3 requires strengthened
applicable controls and independent verification, not standing
steward/founder approval solely for being R3 — see `CLAUDE.md`.

## File reconciliation and implementation sequence

| File | Current state | This package's change |
| --- | --- | --- |
| `apps/api/business/aifeedback/gemini.go` | Does not exist | `VOC-035-T00`: new file — `GeminiConfig`, `geminiTransport`, `GeminiFeedbackProvider`, `GeminiModerationProvider` |
| `apps/api/business/aifeedback/gemini_test.go` | Does not exist | `VOC-035-T00`: new file — fake-server request-shape/outcome-mapping/fail-closed/injection tests |
| `apps/api/business/aifeedback/opencode.go` | `isRetryableError`/`isRetryableHTTPStatus` free functions | Unchanged — reused as-is by `gemini.go`, per `VOC-035-T00` step 3 |
| `apps/api/business/aifeedback/moderation.go` | `moderationSystemPrompt`/`moderationDeveloperPrompt`/`moderationOutputSchema`/outcome-matching logic | Unchanged — reused as-is by `GeminiModerationProvider`, per `VOC-035-D01` |
| `apps/api/business/aifeedback/task.go` | Feedback prompt/schema functions | Unchanged — reused as-is by `GeminiFeedbackProvider`, per `VOC-035-D01` |
| `apps/api/business/aifeedback/service.go` | Correct, provider-agnostic orchestration | Unchanged — out of scope, confirmed provider-agnostic at `base_sha` |
| `apps/api/business/aifeedback/safety.go` | Correct, provider-agnostic `CompositeSafetyClassifier` | Unchanged — out of scope |
| `apps/api/app/api/production.go` | `buildAIProviders` has exactly two branches (opencode, mock fallback) | `VOC-035-T01`: add a third `gemini` branch |
| `apps/api/app/api/production_test.go` | `TestBuildAIProviders_*` (OpenCode/mock) already established | `VOC-035-T01`: new `TestBuildAIProviders_*Gemini*` tests in the same pattern |
| `apps/api/cmd/eval-live/main.go` | Unconditionally builds an `OpenCodeFeedbackProvider` | `VOC-035-T02`: add `--provider`/`AI_PROVIDER` selection; default behavior unchanged |
| `apps/api/cmd/eval-live/main_test.go` (or equivalent) | Existing tests, if any (check first) | `VOC-035-T02`: new provider-selection tests |
| `apps/api/.env.example` | `AI_PROVIDER_*` comments describe OpenCode-only use | `VOC-035-T01`: comment text updated to mention Gemini; no default value changed |
| Any file outside the above | — | Unchanged — out of scope |

Ordered steps, one PR per task, `T00 → T01 → T02` (see `tasks.md` for the
physical dependency: `T01`'s production wiring imports `gemini.go`'s exported
constructors `T00` adds; `T02`'s `cmd/eval-live` wiring imports the same
constructors independently of `T01` but is sequenced after it by convention,
not by a hard compile dependency — an implementer could reorder `T01`/`T02`
if a reviewer prefers, since neither imports the other; `T03` is a live
verification step, not a code PR):

1. `VOC-035-T00`: add `gemini.go`, `gemini_test.go`. Run
   `go vet ./apps/api/business/aifeedback/...`,
   `gofmt -l apps/api/business/aifeedback/`, and
   `go test ./apps/api/business/aifeedback/...`; confirm every pre-existing
   test in the package still passes unchanged.
2. `VOC-035-T01`: add the `gemini` branch to `buildAIProviders`; update
   `.env.example` comments; add `TestBuildAIProviders_*Gemini*`. Run
   `go vet ./apps/api/app/api/...`, `gofmt -l apps/api/app/api/`, and
   `go test ./apps/api/app/api/...`.
3. `VOC-035-T02`: add `--provider`/`AI_PROVIDER` selection to
   `cmd/eval-live`. Run `go vet ./apps/api/cmd/eval-live/...`,
   `gofmt -l apps/api/cmd/eval-live/`, and
   `go test ./apps/api/cmd/eval-live/...`; run
   `git diff --name-only <base_sha>...<candidate_sha>` and confirm it matches
   `VOC-035-AC-09`'s declared file list.
4. `VOC-035-T03`: after `T00`–`T02` merge, deploy, and the founder provisions
   a Gemini API key, execute the live evaluation and record it in
   `staging-evidence.md`.

## Validation and independent verification

Deterministic commands, run per PR at the exact final SHA:

```bash
cd apps/api && go vet ./business/aifeedback/... ./app/api/... ./cmd/eval-live/...
cd apps/api && gofmt -l business/aifeedback/ app/api/ cmd/eval-live/
cd apps/api && go test ./business/aifeedback/... ./app/api/... ./cmd/eval-live/...
bash scripts/governance/classify-change-risk.sh --base <base_sha> --head <head_sha>
bash scripts/governance/validate-governance.sh
git diff --check <base_sha> <head_sha>
```

Claude Code independent review is bound to the exact final SHA of each PR,
per `CLAUDE.md`: confirms scope is limited to the files in the reconciliation
table above, confirms `service.go`/`safety.go`/`task.go`/`moderation.go`/
`opencode.go` are unchanged (or, if an implementer found a genuine reason to
touch one, that the reason is explicitly justified and re-reviewed, not
silently expanded), confirms the Gemini contract fails closed on every
enumerated path (`VOC-035-AC-02`), confirms no live Gemini call is made from
any test (`VOC-035-AC-08`), confirms the risk classification matches the
semantic R3 proposal (or explicitly records why the reviewer disagrees),
confirms whichever implementer model is bound did not approve or merge its
own PR, and reports every still-required R3 gate, plus the fact that this
package's adoption itself is a separate, still-outstanding human decision at
the time any of `T00`–`T02` are proposed for implementation.

## Deployment and rollback

`VOC-035-T00`–`T02` deploy nothing by merging to `develop` — see
`release-plan.md`. `VOC-035-T03` is a live-evaluation exercise, not a
deployment authorization; it uses the existing `deploy-staging` pipeline
unchanged (this package touches no `.github/workflows/*` file). If a merged
commit from `T00`–`T02` needs to be undone, the mechanism is a plain `git
revert` of the specific PR's merge commit, which removes the Gemini branch/
flag entirely and restores the prior OpenCode-only-or-mock behavior — not a
destructive or data-affecting rollback, since this package touches no schema
and no persisted state shape, and Gemini is additive/opt-in so its removal
cannot regress any deployment that never set `AI_PROVIDER=gemini`.
Independently, the existing `AI_FEATURES_ENABLED` kill switch (unchanged
`GenerationGate`) can disable all AI generation immediately regardless of
which provider is configured, per DOC-09 §25's rollback guidance. Owner of
any such revert or kill-switch decision: whoever discovers the regression,
following this repository's normal PR process and the founder's own
operational access to the kill switch. Last-known-good reference: this
package's own `base_sha`, `56d47cf5fe1b425b3c87be43274506300468e304`.
