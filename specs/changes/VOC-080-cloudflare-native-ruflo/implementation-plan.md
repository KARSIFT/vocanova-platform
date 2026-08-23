# VOC-080 — Implementation Plan

## Reconciled implementation outcome

The plan was implemented after adoption. VOC-080-T00 through VOC-080-T12 and AC-00
through AC-11 are complete for the repository at final head
`3d6699c5eb378b9a00679d61a5c28b6b7e27c32c`, merged through PR #100 as
`a05ab5c60534f36d1b89d9b9d32296469e9942bf`. Exact task evidence, hosted results,
preserved failures, and rollback records are in the VOC-084 closure inventory.
This is repository completion only; all three VOC-080 action holds remain held.

## Preconditions and protected areas

Implementation began only after the exact package candidate received independent architecture,
Cloudflare, security, data, CI/CD, and governance review, adoption metadata was complete, and the
plan PR was merged by a role other than the planner. Each completed task used a short-lived
branch/worktree from the previous stacked task and a different-role exact-SHA review.

Repository-only tasks may proceed without Cloudflare credentials. `VOC-080-HOLD-00` gates live
staging resource mutation, `HOLD-01` gates production deployment/routes/migrations, and `HOLD-02`
gates production data. A task stops its conflicting portion if new product, legal, privacy, billing,
or exceptional uncertainty appears.

## Existing-file reconciliation

- Preserve: product behavior, UI, OpenAPI surface, deterministic domain rules, tests, historical
  change packages, governance/evidence rules, design tokens, and api-client usage.
- Reconcile: the four workflows, repository settings guide, canonical technical/database/backend/
  web/AI/workflow/CI/CD/roadmap docs, AGENTS/CONTRIBUTING/PR guidance, and ADR index.
- Replace after parity: Next standalone Docker output, Go HTTP runtime, Ent/lib-pq/PostgreSQL
  repositories and migrations, Docker/Compose/Nginx/host operations.
- Create: accepted Cloudflare and Ruflo ADRs; local CI scripts/composite actions; OpenNext/Wrangler
  config; Worker API workspace; D1 migrations; workerd tests; synthetic conversion/reconciliation;
  deployment manifest/evidence format.
- Do not revive: `orchestrator/`, `.claude/agents`, `.karsift`, issue/comment workflow triggers,
  external `karsift-ai-infra`, SSH deployment, automatic merge/close, or scheduled server monitoring.

## Ordered implementation sequence

1. T00 adopted the ADRs and reconciled canonical documents before incompatible code was written.
2. T01 refactored CI and documented supported repository settings, retaining current
   evidence; it did not mutate hosted settings.
3. T02 defined the pinned external Ruflo adapter/runbook and strengthened authority guards.
4. T03 adapted the web to OpenNext and workerd without live deployment.
5. T04 added the Worker API/D1/contract foundation.
6. T05-T08 migrated bounded domains in dependency order with Go/Worker parity fixtures.
7. T09 built and rehearsed synthetic PostgreSQL-to-D1 conversion and reconciliation.
8. T10 added fail-closed staging/production version, migration, smoke, promotion, and rollback
   controls; live activation remained held.
9. T11 removed old active runtime/infra after parity evidence was complete.
10. T12 completed validation, hosted proof, rollback rehearsal, exact-SHA review, inventory, and
    closure. Production activation remains separately held.

Each task is independently revertible. No later task rewrites an earlier proven SHA unless fixing a
real defect, in which case fresh exact-SHA review and hosted checks are mandatory.

## Validation and independent verification

Baseline and task-specific commands include:

```bash
bash scripts/governance/validate-governance.sh
bash scripts/governance/classify-change-risk.sh
python3 -m unittest discover -s tooling/governance/tests -p 'test_*.py'
pnpm install --frozen-lockfile
pnpm validate
pnpm audit --audit-level high
pnpm --filter @vocanova/web test:e2e
pnpm --filter @vocanova/web test:lighthouse
pnpm --filter @vocanova/web cloudflare:build
pnpm --filter @vocanova/web cloudflare:preview:test
pnpm --filter @vocanova/web cloudflare:dry-run
pnpm --filter @vocanova/worker-api test
pnpm --filter @vocanova/worker-api test:workerd
pnpm --filter @vocanova/worker-api d1:migrations:test
pnpm run test:contract-parity
pnpm run test:data-conversion
git diff --check
```

Commands are added only by the task that implements them; earlier tasks do not claim unavailable
checks. Reviewers receive the exact SHA, diff range, completed evidence, threat/data/rollback notes,
and an instruction not to duplicate long-running suites or start background processes. They inspect
semantics and may run targeted read-only checks. Blocking findings are fixed and the entire exact-SHA
review is renewed.

## Deployment and rollback

Repository implementation does not deploy. Before activation, Wrangler performs credential-free
dry runs. When a named hold is complete, the deployment sequence in `VOC-080-D07` runs against exact
versions and records Worker version IDs, D1 migration state, smoke results, and outcome. Staging and
production use distinct resources and credentials.

Rollback of code promotes the recorded previous Worker version. D1 rollback is forward-corrective
unless a specifically rehearsed Time Travel restore is authorized. Mixed-version compatibility is
maintained through expand/migrate/contract schema changes. Ruflo/config rollback removes the external
MCP/plugin state and does not change repository history. T11 rollback restores old repository assets
without claiming to restore or modify a live server.
