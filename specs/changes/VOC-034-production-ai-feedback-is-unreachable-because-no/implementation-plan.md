# VOC-034 — Implementation Plan

## Preconditions and protected areas

This package was adopted by the founder gate on 2026-07-30. `change.yaml` records
approval, implementation authority, and automatic merge authority for this exact
R3 scope.

All work touches `apps/api/business/aifeedback` and `apps/api/app/api`, which are not
matched by this repository's automated R3 path glob on their own (confirmed by
`scripts/governance/classify-change-risk.sh` — see `specification.md` "Risk and
protected areas"); this package proposes **R3** on semantic AI-provider/safety-
consequence grounds per `CLAUDE.md`'s "raise the class when path rules miss a
protected or R4 consequence" instruction, for a human to confirm or adjust at
adoption. Under active A-003, routine R3 requires strengthened applicable controls
and independent verification, not standing steward/founder approval solely for being
R3 — see `CLAUDE.md`.

## File reconciliation and implementation sequence

| File | Current state | This package's change |
| --- | --- | --- |
| `apps/api/business/aifeedback/opencode.go` | `OpenCodeFeedbackProvider` owns its own session/retry/error-mapping logic directly | `VOC-034-T00`: behavior-preserving extraction of a shared `openCodeTransport` |
| `apps/api/business/aifeedback/opencode_test.go` | Existing feedback-provider tests | Unchanged — required to pass unmodified (`VOC-034-AC-00`) |
| `apps/api/business/aifeedback/moderation.go` | Does not exist | `VOC-034-T00`: new file — `OpenCodeModerationProvider` |
| `apps/api/business/aifeedback/moderation_test.go` | Does not exist | `VOC-034-T00`: new file — outcome/fail-closed/injection tests |
| `apps/api/business/aifeedback/aifeedback.go` | Existing constants | `VOC-034-T00`: add `PromptVersionModerationV1`/`SchemaVersionModerationV1` constants only |
| `apps/api/business/aifeedback/service.go` | Correct orchestration; safety check at line 205 | Unchanged — confirmed correct at `base_sha`, out of scope |
| `apps/api/business/aifeedback/safety.go` | Correct `CompositeSafetyClassifier`, already fails closed on `nil`/error | Unchanged — confirmed correct at `base_sha`, out of scope |
| `apps/api/business/aifeedback/task.go` | Feedback `TaskBuilder`/`OutputValidator` | Unchanged — moderation builds its own prompt internally, no shared `TaskBuilder` interface change |
| `apps/api/app/api/production.go` | Passes literal `nil` as `safety` to `aifeedback.NewService` (the defect) | `VOC-034-T01`: new `buildAIProviders` helper; `nil` replaced with its real return value |
| `apps/api/app/api/production_test.go` | `TestBuildEmailSender_*`/`TestBuildOAuthProvider_*` pattern already established | `VOC-034-T01`: new `TestBuildAIProviders_*` tests in the same pattern |
| `apps/api/app/api/aifeedback_test.go` | `testAIFeedbackAPI` already wires `MockProvider`-backed classifier correctly | `VOC-034-T02`: new regression test using real provider types against a fake server |
| `apps/api/.env.example` | `AI_PROVIDER_*` comments describe feedback-only use | `VOC-034-T01`: comment text updated to mention moderation too |
| Any file outside the above | — | Unchanged — out of scope |

Ordered steps, one PR per task, `T00 → T01 → T02` (see `tasks.md` for why this order
is physically required; `T03` is a live-verification step, not a code PR):

1. `VOC-034-T00`: extract the shared transport; add the moderation provider, its
   prompts/schema, and its tests. Run `go vet ./apps/api/business/aifeedback/...`,
   `gofmt -l apps/api/business/aifeedback/`, and
   `go test ./apps/api/business/aifeedback/...`; confirm `opencode_test.go` has zero
   diff and its tests still pass.
2. `VOC-034-T01`: add `buildAIProviders`; rewire `NewProductionAPI`; update
   `.env.example` comments; add `TestBuildAIProviders_*`. Run
   `go vet ./apps/api/app/api/...`, `gofmt -l apps/api/app/api/`, and
   `go test ./apps/api/app/api/...`.
3. `VOC-034-T02`: add the route-level regression test. Run
   `go test ./apps/api/app/api/...` again and confirm the new test passes; run
   `git diff --name-only <base_sha>...<candidate_sha>` and confirm it matches
   `VOC-034-AC-09`'s declared file list.
4. `VOC-034-T03`: after `T00`–`T02` merge and staging redeploys, execute the live
   verification and record it in `staging-evidence.md`.

## Validation and independent verification

Deterministic commands, run per PR at the exact final SHA:

```bash
cd apps/api && go vet ./business/aifeedback/... ./app/api/...
cd apps/api && gofmt -l business/aifeedback/ app/api/
cd apps/api && go test ./business/aifeedback/... ./app/api/...
bash scripts/governance/classify-change-risk.sh --base <base_sha> --head <head_sha>
bash scripts/governance/validate-governance.sh
git diff --check <base_sha> <head_sha>
```

Claude Code independent review is bound to the exact final SHA of each PR, per
`CLAUDE.md`: confirms scope is limited to the files in the reconciliation table
above, confirms `opencode_test.go` and `service.go`/`safety.go`/`task.go` are
unchanged (or, if an implementer found a genuine reason to touch one, that the
reason is explicitly justified and re-reviewed, not silently expanded), confirms the
moderation contract fails closed on every enumerated path (`VOC-034-AC-03`),
confirms the risk classification matches the semantic R3 proposal (or explicitly
records why the reviewer disagrees), confirms whichever implementer model is bound
did not approve or merge its own PR, and reports every still-required R3 gate.
Codex (or whichever implementer model is bound) may implement and prepare the PR; it
cannot approve or merge its own work.

## Deployment and rollback

`VOC-034-T00`–`T02` deploy nothing by merging to `develop` — see `release-plan.md`.
`VOC-034-T03` is a live-staging exercise, not a deployment authorization; it uses
the existing `deploy-staging` pipeline unchanged. If a merged commit from `T00`–`T02`
needs to be undone, the mechanism is a plain `git revert` of the specific PR's merge
commit, which restores the prior (safe, fail-closed) `nil`-classifier wiring — not a
destructive or data-affecting rollback, since this package touches no schema and no
persisted state shape. Independently, the existing `AI_FEATURES_ENABLED` kill switch
(unchanged `GenerationGate`, per `docs/operations/11-devops-and-ci-cd.md` §3) can
disable all AI generation immediately without a code revert, per DOC-09 §25's
rollback guidance. Owner of any such revert or kill-switch decision: whoever
discovers the regression, following this repository's normal PR process and the
founder's own operational access to the kill switch — no special authority beyond
the routine R3 review this package's own PRs already require. Last-known-good
reference: this package's own `base_sha`, `fd4cc636815d6a87f7696b998b5c9304b4b34467`.
