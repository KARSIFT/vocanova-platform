# VOC-078 — Release Plan

## Authorization

This R4 package requires founder adoption and exact-revision founder approval. It cannot
auto-merge. The implementer and independent verifier cannot approve or merge their own work.

No staging or production deployment is authorized. Repository merge, production release,
deployment, and package closure remain distinct events.

## Rollout

1. Land and prove additive deterministic workflows.
2. Retire external/agent control-plane workflows with matching documentation.
3. Remove local orchestrator assets.
4. Remove server-bound deploy/monitoring workflows with matching documentation.
5. Remove superseded duplicates and prove exactly four workflows remain.
6. Obtain independent verification and founder approval on the exact final revision.

Because `main` executes default-branch scheduled workflows and production deployment on push,
this package does not promote `develop` to `main`. Promotion strategy must be an explicit founder
decision after the reconstruction is proven and before any later server migration.

## Monitoring and outcome

Monitor GitHub Actions itself, not server health:

- expected workflow runs start for representative PR paths;
- irrelevant jobs skip predictably;
- checks complete without external-infra or AI credentials;
- no workflow attempts repository writes or deployment;
- no recurring failed scheduled jobs remain.

Closure requires evidence for every acceptance criterion and an accurate documentation scan.

## Rollback

Trigger rollback if deterministic CI coverage regresses, governance validation becomes
fail-open, unexpected write/deploy capability remains, or required workflows do not start.

Revert task commits in reverse order. Last-known-good is the `develop` revision immediately
before each task. No database, server, DNS, Cloudflare, secret, or production-data rollback is
required because none may be changed.
