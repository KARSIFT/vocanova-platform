# VOC-078 — Implementation Plan

## Preconditions

Do not implement until this package is adopted, `implementation.authorized` is true, founder
approval for the R4 decision is recorded, and an independent verifier is assigned.

Before each task, start from current `origin/develop` on a short-lived branch. Never push directly
to `develop` or `main`. Preserve unrelated work.

## Sequence

1. **T00 — Add deterministic workflows in parallel.** Introduce the target `ci.yml`,
   `governance.yml`, `quality.yml`, and `security.yml` without deleting old checks. Add workflow
   inventory/permission tests. Verify the new checks on a real PR.
2. **T01 — Retire external control-plane automation.** Delete `pipeline.yml`,
   `change-package.yml`, and `package-release.yml`; remove `karsift-ai-infra` references; remove
   issue/comment-driven AI automation; reconcile governance documents in the same PR.
3. **T02 — Remove local orchestrator authority.** Delete `orchestrator/`, `.claude/agents/`,
   `.karsift/`, and root package scripts that launch the orchestrator. Supersede ADR-0001 and
   reconcile `AGENTS.md`/`CONTRIBUTING.md`.
4. **T03 — Pause server-bound automation.** Delete staging/production deploy workflows and
   scheduled error monitoring. Update operational docs in the same PR. Do not edit runtime
   infrastructure or live settings.
5. **T04 — Remove superseded workflow duplicates.** Delete old accessibility, Lighthouse,
   governance, and Dependabot-classification workflow files after their replacement jobs have
   passed. Confirm exactly four workflows remain.
6. **T05 — Final proof.** Run the complete deterministic suite, inspect permissions/triggers,
   verify forbidden patterns are absent, test rollback, and obtain exact-revision independent
   verification and founder approval.

T00 must land before destructive workflow deletion. T01–T04 may not claim completion merely
because YAML parses; their replacement controls must have run successfully on the exact PR.

## Required validation

```bash
pnpm validate
pnpm audit --audit-level high
bash scripts/governance/validate-governance.sh
bash scripts/governance/classify-change-risk.sh
git diff --check
```

Additional workflow tests introduced by T00 must run locally and in CI. Validate YAML and inspect
the real GitHub Actions job graph on each task PR. Independent verification checks the exact final
commit, not an earlier revision.

## Deployment and rollback

No deployment is authorized. Merging to `develop` must not trigger a server deployment after
T03. Do not promote to `main` as part of implementation.

Rollback is task-by-task revert in reverse order. If a replacement check fails or a required
safety property disappears, revert the corresponding deletion before continuing. Runtime/data
rollback is unnecessary because no live system mutation is in scope.
