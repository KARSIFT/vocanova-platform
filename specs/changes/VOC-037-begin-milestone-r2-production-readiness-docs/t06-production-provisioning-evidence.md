# VOC-037-EV-06 — Production provisioning evidence (T06)

## Standing of `VOC-037-AC-06` at this revision

`VOC-037-AC-06` is **not closed by this task** and is not claimed as closed.
Its observable outcome has a repository half (deploy automation, compose
project, isolation controls, rehearsal) and a host half (the tree actually
existing on the shared host, the `production` GitHub Actions environment
actually existing with founder-controlled reviewers, a real deploy run).
The host half requires founder-held SSH credentials, founder-held GitHub
repository-settings access, and provider credentials that no implementation
environment has or should have. It is recorded below as outstanding, not as
passing.

| AC-06 clause | Status |
| --- | --- |
| `/opt/vocanova/production/` exists, fully separate from `/opt/vocanova/infra/` | **Outstanding (host).** Deploy automation creates and isolates it; the tree does not exist yet. |
| `vocanova-production` Compose project with explicit per-service resource limits | **Met (repository).** `infra/docker-compose.production.yml`, validated by `docker compose config`. |
| `production` GitHub Actions environment with founder-controlled required reviewers | **Outstanding (founder).** The workflow declares `environment: production`; creating it and setting its reviewers is a repository-settings action only the founder can take. |
| `deploy-production.yml` deploys without touching staging's tree, user, or Compose project | **Met in the workflow's own paths; outstanding as a live run.** Verified statically and by rehearsal; no run has occurred. |
| Negative-access rehearsal proves staging cannot read production secrets (`INS-9`–`INS-11`) | **Executed against a disposable mirror, outstanding on the real host.** See `t01-production-secrets-boundary-evidence.md` (`VOC-037-EV-01`). |

## Repository deliverables (implemented and verified here)

| Deliverable | Verification performed |
| --- | --- |
| `.github/workflows/deploy-production.yml` | YAML parses; gated on `environment: production`; consumes only `PRODUCTION_*` secrets; writes only under `/opt/vocanova/production/`; operates only on the `vocanova-production` Compose project; deploys the immutable `sha-<short-sha>` image tag so DOC-11 §3's redeploy-by-digest rollback has a specific artifact to name; fails before starting anything if the compose file references a path outside the production root. |
| `infra/docker-compose.production.yml` | `docker compose -f infra/docker-compose.production.yml config` exits 0; project name `vocanova-production`; production-only network and volume names; per-service `mem_limit`/`cpus`; no `build:` block (see below); every path anchored at `${VOCANOVA_PRODUCTION_ROOT}`. |
| `infra/docker-compose.yml` (staging) | `docker compose config` exits 0; per-service `mem_limit`/`cpus` added, budgeted against production's on the shared 2 vCPU / 4 GB host. |
| `.github/workflows/deploy-staging.yml` | Ownership fix narrowed to staging's own subtrees; bundle contents verified against an `infra`/`apps` allowlist before extraction. |
| `infra/nginx-production/` | Production-only config tree with founder-confirmable hostname placeholders. |
| `infra/scripts/rehearse-production-secrets-boundary.sh` | Executed; see `VOC-037-EV-01`. |
| `infra/scripts/rehearse-production-secrets-boundary.selftest.sh` | Executed; eight cases, `SELFTEST PASS`. |
| `infra/README.md` | Production path layout, resource budget, Cloudflare origin-port routing, and isolation conventions documented. |

## Isolation defects found and fixed during this task

1. **Staging's deploy re-owned the production tree.** `deploy-staging.yml`
   ran `sudo chown -R "$(id -un)":"$(id -gn)" /opt/vocanova`. With
   `VOC-037-D00` co-locating both tiers under that root, the next staging
   deploy after any production provision would have handed
   `/opt/vocanova/production/secrets/` to the staging deploy user, defeating
   `VOC-037-D01`'s `INV-4`. The `chown` is now scoped to
   `/opt/vocanova/infra /opt/vocanova/apps`, and the deploy bundle is
   rejected before extraction if it contains any path outside those two
   subtrees. Both the fixed and the pre-fix ownership commands are
   exercised as rehearsal cases, so the regression cannot silently return.
2. **Production compose built from staging's directory tree.** The compose
   file is deployed to `/opt/vocanova/production/`, so its relative build
   contexts (`../apps/api`, `..`) resolved to `/opt/vocanova/apps/api` and
   `/opt/vocanova/`. Production now runs pulled images only, with no
   `build:` block, and the rehearsal fails if one reappears.
3. **The cross-tier compose check was blind to `env_file`.** `docker compose
   config` folds `env_file` entries into `environment:` and drops their
   paths, so a production compose file reading staging's `api.env` rendered
   completely clean. Both the deploy-time guard and the rehearsal script now
   scan the raw compose source in addition to the rendered output.
4. **Secret files were briefly world-readable during a deploy.** The
   AI-provider sync step created `/opt/vocanova/production/secrets/` with
   the default `0755` and only tightened it later. Modes are now set before
   the first secret byte is written, and the file baseline is re-asserted on
   every deploy.
5. **The rehearsal script could pass without checking anything.** It printed
   directory modes without asserting them, ignored `*.env` modes entirely,
   and treated a missing file or a refused `sudo -u` as success. Every check
   now asserts, and an unevaluated check is a failure.

## Shared-host resource budget

`VOC-037-D00` accepted co-location on one 2 vCPU / 4 GB host and required
the contention risk to be addressed rather than assumed away. Memory limits
across both compose files:

| Service | Production | Staging |
| --- | --- | --- |
| postgres | 768m | 512m |
| api | 512m | 384m |
| web | 512m | 384m |
| nginx | 192m | 128m |
| **total** | **~1.9 GB** | **~1.4 GB** |

~3.3 GB of 4 GB committed, leaving headroom for the host itself. CPU limits
are per-service ceilings, so their sum may exceed 2 vCPU by design. Raising
a limit in one file without lowering the other oversubscribes the host; both
files carry that note.

## Outstanding founder/operator actions before AC-06 can close

1. Create the `production` GitHub Actions environment and set founder-
   controlled required reviewers on it.
2. Populate its `PRODUCTION_SSH_HOST`, `PRODUCTION_SSH_USER`,
   `PRODUCTION_SSH_PRIVATE_KEY`, `PRODUCTION_SSH_KNOWN_HOSTS`,
   `PRODUCTION_CLOUDFLARE_API_TOKEN`, and `PRODUCTION_CLOUDFLARE_ACCOUNT_ID`
   secrets with production-tier values distinct from staging's (`INV-1`).
3. Create the production deploy OS account on the shared host, distinct from
   staging's, with passwordless `sudo`, and populate
   `/opt/vocanova/production/secrets/` with the founder-held credentials and
   the Cloudflare origin certificate.
4. Confirm the production hostnames (the workflow's inputs default to
   `production.vocanova.site` / `api-production.vocanova.site`, which
   `VOC-037-D00` left as founder-confirmable placeholders) and point them at
   the origin's `8443` port per `infra/README.md`.
5. Run `deploy-production` once and attach the run log, the resulting
   `/opt/vocanova/production/` listing, and the workflow's own rehearsal
   output to this file.

## Notes

- This task provisions the production deployment shape and isolation
  controls. It does not close R2, authorize launch, or activate autonomous
  production release; founder go/no-go remains `VOC-037-T05`.
- `apps/api/migrations/*.sql` still carry the invalid
  `-- atlas:txmode transaction` directive and the duplicate-index collision
  recorded in `.karsift/lessons.md`. The production deploy runs `migrate.sh`
  and will fail on the first apply until those are fixed. That is a
  pre-existing R1 follow-up, untouched by this task, and it blocks a green
  production deploy independently of anything here.
