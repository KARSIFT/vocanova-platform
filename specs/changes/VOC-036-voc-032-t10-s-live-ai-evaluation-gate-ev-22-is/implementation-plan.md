# VOC-036 — Implementation Plan

**Draft — do not begin implementation until this package and its tasks are
approved and implementation-authorized (`change.yaml`'s
`implementation_authorized: false`).**

## Preconditions and protected areas

This package is not yet adopted. Nothing in `tasks.md` may be started until a
human reviews this draft, confirms or adjusts the proposed R3 risk
classification, resolves `VOC-036-D02` (the new `AI_PROVIDER_ACCOUNT_ID`
variable proposal), `VOC-036-D04` (retry/backoff sizing), `VOC-036-D06`
(request-pacing mechanism), and `VOC-036-D07` (default model) — or explicitly
defers any of them to the implementer with stated defaults, this draft's own
proposed defaults being recorded in `specification.md` — and records approval in
`change.yaml`.

All planned work touches `apps/api/business/aifeedback`, `apps/api/app/api`, and
`apps/api/cmd/eval-live`, none of which is matched by this repository's
automated R3 path glob on their own (confirmed by
`scripts/governance/classify-change-risk.sh` — see `specification.md` "Risk and
protected areas"); this package proposes **R3** on semantic AI-provider/
safety-consequence grounds per `CLAUDE.md`'s "raise the class when path rules
miss a protected or R4 consequence" instruction, for a human to confirm or
adjust at adoption. Under active A-003, routine R3 requires strengthened
applicable controls and independent verification, not standing
steward/founder approval solely for being R3 — see `CLAUDE.md`.

## File reconciliation and implementation sequence

| File | Current state | This package's change |
| --- | --- | --- |
| `apps/api/business/aifeedback/cloudflare.go` | Does not exist | `VOC-036-T00`: new file — `CloudflareConfig`, `cloudflareTransport`, `CloudflareFeedbackProvider`, `CloudflareModerationProvider` |
| `apps/api/business/aifeedback/cloudflare_test.go` | Does not exist | `VOC-036-T00`: new file — fake-server request-shape/outcome-mapping/fail-closed/injection tests |
| `apps/api/business/aifeedback/opencode.go` | `isRetryableError`/`isRetryableHTTPStatus` free functions | Unchanged — reused as-is by `cloudflare.go`, per `VOC-036-T00` step 3, same as `gemini.go` already does |
| `apps/api/business/aifeedback/gemini.go` | `GeminiConfig`/`geminiTransport`/providers | Unchanged — no dependency between `gemini.go` and `cloudflare.go` |
| `apps/api/business/aifeedback/moderation.go` | Prompt/schema/outcome-matching functions | Unchanged — reused as-is by `CloudflareModerationProvider`, per `VOC-036-D01` |
| `apps/api/business/aifeedback/task.go` | Feedback prompt/schema functions | Unchanged — reused as-is by `CloudflareFeedbackProvider`, per `VOC-036-D01` |
| `apps/api/business/aifeedback/service.go` | Correct, provider-agnostic orchestration | **Unchanged — explicitly out of scope per the founder's own request** |
| `apps/api/business/aifeedback/safety.go` | Correct, provider-agnostic `CompositeSafetyClassifier` | **Unchanged — explicitly out of scope per the founder's own request** |
| `apps/api/app/api/production.go` | `buildAIProviders` has exactly three branches (opencode, gemini, mock fallback) | `VOC-036-T01`: add a fourth `cloudflare` branch; extend `aiProviderModel`/account-ID resolution |
| `apps/api/app/api/production_test.go` | `TestBuildAIProviders_*` (OpenCode/Gemini/mock) already established | `VOC-036-T01`: new `TestBuildAIProviders_*Cloudflare*` tests in the same pattern |
| `apps/api/cmd/eval-live/main.go` | Selects between OpenCode and Gemini via `--provider`/`AI_PROVIDER` | `VOC-036-T02`: add a `cloudflare` case; add `--request-interval`/`EVAL_LIVE_REQUEST_INTERVAL` pacing, applied regardless of selected provider |
| `apps/api/cmd/eval-live/main_test.go` | Existing OpenCode/Gemini provider-selection tests (`VOC-035-T02`) | `VOC-036-T02`: new Cloudflare-selection and pacing tests |
| `apps/api/.env.example` | `AI_PROVIDER_*` comments describe OpenCode/Gemini use | `VOC-036-T01`: comment text updated to mention Cloudflare; new `AI_PROVIDER_ACCOUNT_ID` variable added (per `VOC-036-D02`) |
| Any file outside the above | — | Unchanged — out of scope |

Ordered steps, one PR per task, `T00 → T01 → T02` (see `tasks.md` for the
physical dependency: `T01`'s production wiring imports `cloudflare.go`'s
exported constructors `T00` adds; `T02`'s `cmd/eval-live` wiring imports the
same constructors independently of `T01` but is sequenced after it by
convention, not by a hard compile dependency, mirroring `VOC-035`'s own
`T01`/`T02` relationship exactly; `T03` is a live verification step, not a code
PR):

1. `VOC-036-T00`: add `cloudflare.go`, `cloudflare_test.go`. Run
   `go vet ./apps/api/business/aifeedback/...`,
   `gofmt -l apps/api/business/aifeedback/`, and
   `go test ./apps/api/business/aifeedback/...`; confirm every pre-existing test
   in the package (including `gemini_test.go`) still passes unchanged.
2. `VOC-036-T01`: add the `cloudflare` branch to `buildAIProviders`; add the
   `AI_PROVIDER_ACCOUNT_ID` resolution; update `.env.example`; add
   `TestBuildAIProviders_*Cloudflare*`. Run `go vet ./apps/api/app/api/...`,
   `gofmt -l apps/api/app/api/`, and `go test ./apps/api/app/api/...`.
3. `VOC-036-T02`: add the `cloudflare` provider case and the
   `--request-interval`/`EVAL_LIVE_REQUEST_INTERVAL` pacing decorator to
   `cmd/eval-live`. Run `go vet ./apps/api/cmd/eval-live/...`,
   `gofmt -l apps/api/cmd/eval-live/`, and `go test ./apps/api/cmd/eval-live/...`;
   run `git diff --name-only <base_sha>...<candidate_sha>` and confirm it
   matches `VOC-036-AC-10`'s declared file list.
4. `VOC-036-T03`: after `T00`–`T02` merge, deploy, and the founder provisions a
   Cloudflare API token and account ID, execute the live evaluation with an
   explicit, non-zero request-pacing interval and record it in
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

Claude Code independent review is bound to the exact final SHA of each PR, per
`CLAUDE.md`: confirms scope is limited to the files in the reconciliation table
above, confirms `service.go`/`safety.go`/`task.go`/`moderation.go`/
`opencode.go`/`gemini.go` are unchanged (or, if an implementer found a genuine
reason to touch one, that the reason is explicitly justified and re-reviewed,
not silently expanded — `service.go`/`safety.go` in particular are named
out-of-scope by the founder's own request, so any touch to either is itself a
finding, not a routine diff), confirms the Cloudflare contract fails closed on
every enumerated path (`VOC-036-AC-02`), confirms no live Cloudflare call is
made from any test (`VOC-036-AC-09`), confirms the account-ID configuration
(`VOC-036-D02`) never appears in a log line or error message verbatim alongside
the token in a way that would help reconstruct a valid credential pair,
confirms the request-pacing addition (`VOC-036-D06`) does not alter any existing
OpenCode/Gemini invocation's timing when the new flag/env var is unset, confirms
the risk classification matches the semantic R3 proposal (or explicitly records
why the reviewer disagrees), confirms whichever implementer model is bound did
not approve or merge its own PR, and reports every still-required R3 gate, plus
the fact that this package's adoption itself is a separate, still-outstanding
human decision at the time any of `T00`–`T02` are proposed for implementation.

## Deployment and rollback

`VOC-036-T00`–`T02` deploy nothing by merging to `develop` — see
`release-plan.md`. `VOC-036-T03` is a live-evaluation exercise, not a deployment
authorization; it uses the existing `deploy-staging` pipeline unchanged (this
package touches no `.github/workflows/*` file). If a merged commit from
`T00`–`T02` needs to be undone, the mechanism is a plain `git revert` of the
specific PR's merge commit, which removes the Cloudflare branch/flag entirely
and restores the prior OpenCode/Gemini/mock-only behavior — not a destructive or
data-affecting rollback, since this package touches no schema and no persisted
state shape, and Cloudflare is additive/opt-in so its removal cannot regress any
deployment that never set `AI_PROVIDER=cloudflare`. Independently, the existing
`AI_FEATURES_ENABLED` kill switch (unchanged `GenerationGate`) can disable all
AI generation immediately regardless of which provider is configured, per
DOC-09 §25's rollback guidance. Owner of any such revert or kill-switch
decision: whoever discovers the regression, following this repository's normal
PR process and the founder's own operational access to the kill switch.
Last-known-good reference: this package's own `base_sha`,
`c69b270a164bf2cb386f1b7637a7c3ab96af5bd0`.
