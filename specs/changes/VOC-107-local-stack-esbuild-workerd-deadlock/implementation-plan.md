# VOC-107 — Implementation Plan

## Preconditions

Do not implement until this exact plan package is independently reviewed, adopted,
and present on `develop`. Use one isolated implementation worktree and one PR. The
builder begins from current `develop`, re-reads the active local-stack contract, and
does not treat a stale draft diagnosis as fact.

## Inventory before edit

1. Read the root scripts; local-stack smoke and tests; local-development supervisor
   and tests; workerd collector/smoke tests; app manifests; and lock-resolved package
   tree. Map preparation, D1 initialization, API and web children, probes, restart,
   signal/stdio close, diagnostic collection, and cleanup.
2. Collect the issue/run evidence again at the exact SHA. Record that the known
   symptom followed second-cycle probes and was emitted by the API child, not that
   esbuild or workerd is proven at fault.
3. In clean credential-free worktrees, perform only a bounded number of real local
   attempts set in the implementation PR before execution. Capture redacted compact
   evidence: attempt, phase/cycle, versions, elapsed time, child exit/signal, and
   terminal diagnostic category. Stop at the first reproducible trigger or when the
   declared budget is exhausted; do not create a background loop.
4. Form and test a falsifiable causal hypothesis. If it cannot be distinguished,
   stop before behavioral remediation and report the bounded evidence rather than
   inventing a fix.

## Candidate-path reconciliation

| Candidate path                                                                                 | Allowed only when inventory proves it is causal                                    | Otherwise  |
| ---------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- | ---------- |
| `scripts/foundation/local-stack-smoke.mjs` and `.test.mjs`                                     | Correct lifecycle/probe/diagnostic handling and add focused regression coverage.   | No change. |
| `scripts/foundation/local-development-supervisor.mjs` and `.test.mjs`                          | Correct a shared child ownership, shutdown, or stdio-settlement invariant.         | No change. |
| `apps/web/scripts/test-workerd.mjs` and `apps/web/tests/workerd/workerd-smoke.test.mjs`        | Correct a shared bounded collector/startup invariant without widening retries.     | No change. |
| `apps/web/package.json`, `apps/api-worker/package.json`, root `package.json`, `pnpm-lock.yaml` | Pin only a causally demonstrated compatible tool version and its exact lock delta. | No change. |

No other source path is in scope. `.github/workflows/ci.yml`, Cloudflare configs,
environment/settings records, application behavior, and historical packages remain
excluded.

## Ordered remediation

1. Write the deterministic failing regression for the confirmed trigger and a
   fatal-deadlock diagnostic case. Preserve a pre-fix failure record where the trigger
   is deterministic.
2. Apply the smallest causal correction. Do not suppress a diagnostic, add an
   unbounded delay, or turn a failed child/cleanup into success.
3. Add only necessary focused tests and retain all existing local-stack safety tests.
4. Run the test plan, inspect the diff against the candidate-path table, and verify
   temporary roots/generated output do not enter Git.
5. Obtain CI/local-runtime specialist and independent R3 exact-SHA reviews. Any
   material edit requires fresh checks and review by different non-author actors.

## Validation commands

Run the exact available commands, recording results rather than claiming a missing
check passed:

```bash
node --test scripts/foundation/local-stack-smoke.test.mjs
node --test scripts/foundation/local-development-supervisor.test.mjs
pnpm run ci:local-stack
pnpm validate
bash scripts/governance/validate-governance.sh
bash scripts/governance/classify-change-risk.sh
git diff --check
```

Run the focused app workerd tests and any package-specific compatibility command when
their candidate path changed. Hosted evidence must show successful `local stack` and
`ci required` jobs at the reviewed implementation SHA.
