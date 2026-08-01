# VOC-037 — Implementation Plan

## Preconditions and protected areas

Do not begin any task in this package until the package itself is founder-adopted
(`change.yaml`'s `approval_status: approved` and `implementation_authorized: true`)
and, per the active A-003 model, each individual task's own PR is independently
classified and reviewed rather than inheriting this package's proposed risk as
settled. Potentially protected areas once tasks begin: `apps/api/app/api`
(production config/kill switches), `infra/` (deploy infrastructure),
`.github/workflows/deploy-*.yml` (deploy automation), any new `docs/legal/`
directory `T02` creates, and `docs/operations/11-devops-and-ci-cd.md` itself if a
task amends it (following the existing `VOC-032-§1-amendment` annotate-don't-delete
convention).

## File reconciliation and implementation sequence

No existing file is modified by this drafting package itself. For the future tasks
it proposes:

1. `VOC-037-T00` — new decision-record document (path to be chosen by whoever
   implements it, likely alongside this package or as its own follow-up package,
   per the founder's preference recorded at adoption). No existing file
   necessarily changes unless the founder's decision requires amending
   `docs/operations/11-devops-and-ci-cd.md` §1 again (as `VOC-032-§1-amendment`
   already did once for staging).
2. `VOC-037-T01` — depends on `T00`'s outcome; may touch
   `apps/api/.env.example`/`apps/web/.env.example` comments (variable-name changes
   only, never real values) and any new production-specific deploy workflow.
3. `VOC-037-T02` — new `docs/legal/` (or equivalent) privacy-policy and
   terms-of-service documents; no existing file necessarily changes.
4. `VOC-037-T03` — depends on `T00`; verification only, likely no source-file
   change unless a defect is found in the existing kill-switch implementation.
5. `VOC-037-T04` — depends on `T00`; monitoring configuration, likely outside this
   repository (Sentry/Better Stack/UptimeRobot dashboards) plus any repository-side
   DSN/config wiring already scaffolded by prior packages.
6. `VOC-037-T05` — the release PR itself; touches whatever the prior five tasks
   touched, plus the go/no-go record (likely a GitHub issue comment, mirroring
   issue #256's R1 pattern, rather than a new document).

Each task preserves all existing work; none proposes deleting or rewriting an
existing control, only adding the production-tier equivalent or verifying reuse.

## Validation and independent verification

Deterministic commands to run once tasks exist (per `AGENTS.md`'s "Current
validation" section, extended as the application package matures):

```bash
bash scripts/governance/validate-governance.sh
bash scripts/governance/classify-change-risk.sh
git diff --check
```

Plus each task's own applicable CI (unit/integration/contract/deployment tests,
per DOC-12 §9) once that task's implementation exists. Claude Code performs
exact-SHA independent verification of each task's final PR revision per
`CLAUDE.md`; it cannot substitute for the founder's required R4 approval on `T02`
or `T05`.

## Deployment and rollback

This package authorizes no deployment. Once adopted and each task implemented,
deployment authorization and rollback ownership follow `docs/operations/11-devops-and-ci-cd.md`
§§2–3 and the active A-003 model's distinct develop-merge versus production-release
gates (`AGENTS.md`'s "Automatic merge into `develop`... RL1/RL2 technical
activation and autonomous production release... remain disabled" statement).
`T05`'s go/no-go record is the founder-controlled trigger for any production
release this package's tasks make possible — no task in this package deploys
autonomously to production.
