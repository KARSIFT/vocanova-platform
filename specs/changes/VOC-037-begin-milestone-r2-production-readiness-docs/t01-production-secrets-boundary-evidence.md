# VOC-037-EV-01 — Production/staging secret-boundary rehearsal evidence

Produced by `VOC-037-T06`, which `tasks.md` charges with executing
`VOC-037-T01`'s `INS-9` through `INS-11` and recording `VOC-037-EV-01`
alongside its own `EV-06`.

`VOC-037-D01` section 5.2 left `INS-9`–`INS-11` explicitly unexecuted and
unclaimed, because they need a host that mirrors the production shape.
`VOC-037-TEST-01`'s preconditions allow that host to be "a disposable/
staging-equivalent rehearsal of the production shape" rather than the real
production host. This record covers the disposable rehearsal. It does **not**
claim the real host, which is still unprovisioned — see "What this evidence
does not cover".

## What was executed

| Item | Value |
| --- | --- |
| Harness | `infra/scripts/rehearse-production-secrets-boundary.selftest.sh` |
| Checker under test | `infra/scripts/rehearse-production-secrets-boundary.sh` |
| Command | `sudo infra/scripts/rehearse-production-secrets-boundary.selftest.sh` |
| Rehearsal root | `/srv/vocanova-boundary-rehearsal/{infra,apps,production}` (created and destroyed by the harness) |
| Disposable accounts | `vocstgrehearsal` (staging deploy identity), `vocprodrehearsal` (production deploy identity) |
| Platform | Ubuntu 24.04.4 LTS, Linux 6.17, Docker 28.0.4 |
| Date | 2026-08-01 |
| Result | `SELFTEST PASS` (exit 0) — all eight cases behaved as expected |

The rehearsal uses placeholder credential strings only
(`postgres://production-placeholder@...`). No real secret, no real
certificate, and no production host were involved, per this package's own
"no test uses a real secret" rule in `test-plan.md`.

## `INS-9` — permission baseline on the production tree

Observed on the correctly provisioned rehearsal shape:

```
[INS-9] production secret tree exists and matches the D01 permission baseline
  ok: .../production mode 750 is within 750
  ok: .../production/secrets mode 700 is within 700
  ok: .../production/secrets/nginx mode 700 is within 700
  ok: .../production is owned by vocprodrehearsal (not vocstgrehearsal)
  ok: .../production/secrets is owned by vocprodrehearsal (not vocstgrehearsal)
  ok: .../production/secrets/api.env mode 600 is within 600
  ok: .../production/secrets/postgres.env mode 600 is within 600
  ok: 2 production env file(s) checked
  ok: .../production/secrets/nginx/key.pem mode 600 is within 600
  ok: .../production/secrets/nginx/cert.pem mode 600 is within 600
```

This is the exact baseline `VOC-037-D01` section 4A states: `0750` or
stricter on the production root, `0700` on directories holding key
material, `0600` on env files and private keys, and ownership by a
production-only deploy user rather than staging's.

## `INS-10` — production compose reads only the production tree

```
[INS-10] production compose reads the production tree only
  ok: no rendered compose path outside .../production
  ok: production compose declares no build context
  ok: no compose source path outside .../production
  ok: compose references the production secrets tree
```

Two findings came out of executing this check rather than merely writing it:

1. **`docker compose config` does not show `env_file` paths.** It folds
   them into `environment:` and drops the paths, so the previous
   implementation's rendered-output scan passed a compose file whose
   `api.env` pointed straight at `/opt/vocanova/infra/secrets/`. The
   checker now scans the raw compose source as well, and the deliberate
   "compose points at the staging secrets tree" case below is what proves
   the gap is closed.
2. **Relative build contexts resolved into staging's tree.** With the
   compose file deployed at `/opt/vocanova/production/`, the previous
   `context: ../apps/api` and `context: ..` resolved to `/opt/vocanova/apps/api`
   and `/opt/vocanova/` — staging's tree. `infra/docker-compose.production.yml`
   no longer declares any `build:` block (images are built and pushed by CI
   and consumed by immutable tag), and the checker now fails if one
   reappears.

## `INS-11` — negative access between the two deploy identities

```
[INS-11] neither tier's deploy identity can read the other's secrets
  ok: vocstgrehearsal cannot read .../production/secrets/api.env
  ok: vocstgrehearsal cannot list .../production
  ok: vocprodrehearsal cannot read .../infra/secrets/api.env
```

A probe that cannot be executed (no `sudo` rights, missing account) is
reported as a failure, not a pass: `sudo -u` returns exit 1 both for
"unreadable" and for "refused", so the probe carries its real status out
through a marker and an absent marker fails the check.

## Negative cases — the rehearsal fails when the boundary is broken

A checker only ever run against a correct tree proves nothing, so each
control was deliberately broken and the checker re-run:

| Case | Expected | Observed |
| --- | --- | --- |
| Correctly isolated production tree | PASS | PASS |
| Production root world-traversable (`0755`) | FAIL | FAIL (2 checks) |
| Production `api.env` world-readable (`0644`) | FAIL | FAIL (1 check) |
| Staging deploy user owns the production tree | FAIL | FAIL (6 checks) |
| Production secrets absent | FAIL | FAIL (2 checks) |
| Production compose points at the staging secrets tree | FAIL | FAIL (1 check) |
| Staging deploy re-owns only its own subtrees (current workflow) | PASS | PASS |
| Staging deploy re-owns the whole shared root (pre-fix workflow) | FAIL | FAIL (6 checks) |

The last two cases reproduce the co-location regression this task's first
review found. `.github/workflows/deploy-staging.yml` ran
`sudo chown -R "$(id -un)":"$(id -gn)" /opt/vocanova` after extracting its
bundle; once production is co-located under the same root, the next staging
deploy would hand `/opt/vocanova/production/secrets/` to the staging deploy
user and silently break `INV-4`. The command is now scoped to
`/opt/vocanova/infra /opt/vocanova/apps`, and the bundle is verified to
contain only those two subtrees before extraction. The two cases above are
the before/after of exactly that command, so the regression cannot return
unnoticed.

## What this evidence does not cover

- The real shared host. `/opt/vocanova/production/` does not exist yet; this
  rehearsal used a disposable mirror of its shape on a CI runner.
- The real deploy accounts. The rehearsal created two disposable system
  accounts rather than using the founder's staging and production deploy
  users.
- The `production` GitHub Actions environment, its required reviewers, and
  the `PRODUCTION_*` secret values — all founder-controlled and unverifiable
  from here.
- Real credentials of any kind.

`VOC-037-AC-01` therefore still requires the same rehearsal to be re-run on
the real host after provisioning, via the deploy workflow's own final step,
which invokes `rehearse-production-secrets-boundary.sh` and fails the deploy
if any check fails. This record closes the "can the boundary be verified at
all, and does the verifier actually catch violations" question; it does not
close AC-01.

## Reproducing

```bash
sudo infra/scripts/rehearse-production-secrets-boundary.selftest.sh
```

Requires root (it creates and removes two disposable system accounts) and
the Docker CLI (`INS-10` renders the compose file). Everything it creates is
removed on exit.
