# VOC-104 — Implementation Plan

## Preconditions and delivery shape

Do not implement until this exact package is independently reviewed, adopted, and
present on `develop`. Use one isolated branch/worktree, one minimum-sufficient task,
and one coherent implementation PR into `develop`.

## Existing-file reconciliation

| Path                                                     | Classification               | Reconciliation                                                                                                                                                                                                                                                                 |
| -------------------------------------------------------- | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `.github/workflows/ci.yml`                               | present-needs-reconciliation | Replace only the two direct version-list pipes with distinct secure temporary captures, completed producer exits, separate file-backed resolution, and reliable cleanup. Preserve the surrounding staging sequence and production sentinel.                                    |
| `scripts/foundation/cloudflare-delivery-policy.mjs`      | present-needs-reconciliation | Extend only workflow-shape inspection needed to require the completed file handoff, exact mapping/order, cleanup, and fail-before-promotion boundary. Preserve version resolver semantics and all unrelated policy checks.                                                     |
| `scripts/foundation/cloudflare-delivery-policy.test.mjs` | present-needs-reconciliation | Add focused workflow mutations and no-network complete/truncated/ambiguous JSON child-process coverage with synthetic IDs. Preserve the existing suite.                                                                                                                        |
| `docs/operations/cloudflare-delivery.md`                 | present-compatible           | No edit. Its ordered staging description and cancellation/failure section already state that pre-promotion failures leave traffic unchanged, D1 remains expand-compatible, and database recovery is forward correction. The transport correction does not change those claims. |
| `infrastructure/cloudflare/delivery-manifest.json`       | present-compatible           | No edit. Resource, cost, migration, Wrangler-version, staging, and production-hold tuples do not change.                                                                                                                                                                       |

All settings records, applications, dependencies, Wrangler configurations,
migrations, smoke implementation, and historical packages are present-compatible or
outside this defect and excluded from the implementation diff.

## Ordered implementation

1. Add focused failing workflow-shape tests for both current direct
   `versions list --json | node ... --resolve-version-tag` handoffs.
2. Add negative mutations for missing or shared captures, mismatched API/web resolver
   input, resolver ordering before list completion, missing failure-safe cleanup, and
   promotion consuming a value not produced by the exact resolver assignment.
3. Add a no-network child-process fixture that creates only synthetic JSON, completes
   the temporary file first, then invokes the policy CLI with that file as stdin.
   Assert exact success for a complete document and failure for truncated or
   ambiguous input. Do not run Wrangler.
4. Extend `inspectDeliveryWorkflow()` narrowly so the valid workflow shape passes
   and every negative mutation fails closed without duplicating `resolveVersionId()`.
5. In the immutable upload step, create two distinct temporary files using a secure
   runner-local facility, install cleanup before capture, run each locked list command
   with stdout redirected to its file, and start the matching resolver only after the
   list command exits successfully. Keep JSON and paths out of logs and outputs.
6. Retain the exact tag, UUID-only output assignment, promotion input expressions,
   step boundaries, secret environment, D1 ordering, smoke, rollback, and production
   hold unchanged.
7. Run focused delivery tests, complete foundation/workspace checks, governance
   validation, risk classification, and whitespace validation. Confirm the exact
   three-file implementation diff and zero historical-package diff.
8. Obtain exact-SHA Cloudflare/CI-security specialist review and a separate
   independent R3 verdict. Resolve every blocker with fresh checks and fresh
   different-actor review of any changed SHA; use a separate non-author merge actor.

## Validation commands

- `node --test scripts/foundation/cloudflare-delivery-policy.test.mjs`
- `node scripts/foundation/cloudflare-delivery-policy.mjs`
- `pnpm run ci:delivery`
- `pnpm run ci:foundation`
- `pnpm validate`
- `bash scripts/governance/validate-governance.sh`
- `bash scripts/governance/classify-change-risk.sh`
- `git diff --check`

The tests use no network and no Wrangler credentials. Do not run a live Wrangler
command, workflow dispatch, or deployment as implementation validation. Do not report
an unavailable command as passing; separate environmental failures from behavioral
failures.

## Rollback

Before merge, close the implementation PR with no effect. After merge, use a
separately reviewed revert PR that restores the three implementation files to the
last-known-good pre-implementation `develop` revision and reruns the same checks. The
implementation owner owns repository rollback. Revert does not remove already
applied staging migrations or immutable versions and authorizes no Cloudflare action.
