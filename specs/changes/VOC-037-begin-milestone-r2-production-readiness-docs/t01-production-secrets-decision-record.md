---
decision_id: VOC-037-D01
task_id: VOC-037-T01
status: accepted
decision_owner: founder-gate-delegate
approved_mechanism: 4A-corrected (same host as staging, separate directory tree/compose project/deploy user)
risk: R3
date: 2026-08-01
accepted_date: 2026-08-01
related_change: VOC-037
depends_on:
  - VOC-037-D00
depends_on_outcome: true
inspection_bound_revision: 0e1f7813bce6f25654f46307a6331be260177e8f
correction_note: 'Drafted before this file could see VOC-037-D00''s acceptance
  despite branching from a commit that included it; corrected 2026-08-01 to
  reflect D00''s actual accepted outcome (Option A-modified, same host) and
  to fix section 4A''s now-invalid "must be a distinct host" conclusion.'
---

# VOC-037-D01 — Production Secrets Management Decision Record

## Decision requested

Approve the production secrets mechanism for R2:

- Storage location and ownership model for production-only secrets.
- Injection path from CI/deploy into the production runtime.
- Rotation and revocation process.
- Isolation controls proving production secrets are unreachable from preview, staging, and CI runtime.

This task defines the mechanism, its alternatives, and its verification criteria. It does not create real credentials, write secret values, provision infrastructure, or deploy production.

## Relationship to `VOC-037-D00` (production hosting decision)

**Correction (2026-08-01, founder-gate):** the text below was drafted from a
revision where `VOC-037-D00` still showed `status: proposed`. `VOC-037-D00`
is now **`status: accepted`**: the founder approved **Option A-modified**
— production runs on the **same physical host as staging** (not a separate
host), with full logical isolation required (separate compose project,
separate env files/secrets, separate database instance, separate ports/
domains, no shared volumes) and portability to a future dedicated host kept
open. The founder explicitly acknowledged the shared-host resource/fault-
domain risk this implies, and required this task (T01) and T04 to address it
directly rather than assume it away. See
`t00-production-hosting-decision-record.md`'s "Founder approval record"
section for the full text.

This changes which mechanism below is operative, and invalidates one
conclusion this record originally drew (see the correction inside section
4A below: same-host colocation does **not** make INV-4 unsatisfiable, it
just requires the isolation to be enforced by directory/project separation
instead of by host separation). Sections 2 (target-independent invariants),
3 (alternatives), and 5 (inspection results) are unaffected by this
correction and stand as originally drafted.

## Recommendation

**Operative mechanism: 4A, as corrected below for same-host colocation**
(D00's actual accepted option). Approve the target-independent invariants in
section 2, and the corrected 4A mechanism: a founder-approved GitHub
Actions `production` environment as control plane, production-only
credentials delivered to `0600` root-owned files under a **production-only
directory tree, separate from staging's**, on the shared host, with
containers reading only those files via a **separate Docker Compose
project** from staging's. Section 4B (managed platform) is retained below
for the record but is not operative, since D00 selected Option A-modified,
not Option B.

## 1) Secret inventory and naming boundary

Production values exist only as production-tier credentials for the variable names already documented in:

- `apps/api/.env.example`
- `apps/web/.env.example`

No variable-name changes are required for `VOC-037-T01`; therefore those files are unchanged in this task.

Provider accounts and credentials must be distinct per tier:

- Production database credentials are not reused by staging.
- Production AI-provider keys are not reused by staging.
- Production email-provider keys are not reused by staging.
- Production OAuth client credentials are not reused by staging.
- Production monitoring DSN/tokens are not reused by staging.

## 2) Target-independent invariants

These hold under either `VOC-037-D00` option and are what approval of `VOC-037-D01` primarily grants.

- **INV-1 (separate credential material).** Every production credential is a distinct provider-issued credential from its staging counterpart, per the inventory above. No credential is shared across tiers, and no staging credential is ever promoted in place.
- **INV-2 (scoped control plane).** Production secret material is readable only by a deploy path that is explicitly scoped to production and gated by founder-controlled approval. Repository-global or otherwise tier-ambiguous secret scope is not acceptable for production.
- **INV-3 (no secret in the repository or image).** No production secret value appears in a tracked file, a Docker image layer, a build argument, a compose file, or a workflow literal.
- **INV-4 (no lower-tier reachability).** No preview, staging, or non-production CI execution context can read a production secret value, whether by workflow secret scope, shared host path, shared volume, or shared provider account.
- **INV-5 (no secret in logs).** Deploy, health-check, and rotation steps do not print secret values; logs are treated as lower-tier readable.
- **INV-6 (rotatable and revocable).** Every production credential can be rotated and revoked on the schedule in section 6 without editing a tracked file and without a code release.
- **INV-7 (verifiable by inspection).** Each invariant above has a check in section 5 that produces an observable result, rather than resting on assertion.

## 3) Alternatives considered

| Mechanism | Fit under D00 Option A | Fit under D00 Option B | Benefits | Costs/risks |
| --- | --- | --- | --- | --- |
| **A1. Hardened GitHub Actions `production` environment + `0600` host files (recommended under Option A)** | Direct | Partial (control plane reusable, host plane not) | No new vendor or spend; reuses a delivery path the founder already operates; environment protection rules give founder-gated access and an approval audit trail | Secret material is at rest on a founder-operated host, so host compromise is credential compromise; rotation is manual; no per-secret access log beyond workflow run history |
| **A2. Dedicated secrets manager (vault product) with agent/CLI pull at deploy** | Possible | Possible | Per-secret access logging, dynamic/short-lived credentials, mature rotation primitives | Adds a vendor, spend, and an availability dependency in the deploy path; a bootstrap credential still has to live somewhere; significant operational learning cost during R2 |
| **A3. Cloud provider KMS/parameter store** | Possible | Direct if the platform is that provider | Managed durability and IAM-scoped access; access logging | Introduces a cloud account and IAM model the project does not otherwise use under Option A; couples secret handling to a provider before the hosting decision itself is made |
| **A4. Docker/systemd secrets on the host without a scoped control plane** | Possible | Not applicable | Slightly better runtime isolation than plain env files (tmpfs-backed, not in container env) | Does not by itself solve delivery or scoping, which is where the actual tier-leak risk lives; would still need A1's control plane |
| **B1. Managed platform's first-party secret store (recommended under Option B)** | Not applicable | Direct | Nothing at rest on a founder-operated host; platform-native scoping, audit, and rotation tooling | Platform-specific coupling; isolation guarantees depend on correct project/workspace separation, which must be inspected rather than assumed |

A2 and A3 are the "dedicated secrets manager" options that `specification.md`'s open question 2 asked to be weighed. Both are rejected for R2 on scope grounds, not on merit: they add a vendor, spend, and a new failure mode to the deploy path during the milestone whose objective is to make the existing path releasable. Either remains a clean later migration, because INV-1 through INV-7 are written against the invariant, not against the storage product.

## 4) Option-conditional mechanism specification

Exactly one of the following becomes operative, determined by the option the founder accepts in `VOC-037-D00`.

### 4A) D00's accepted option — same host as staging, logically isolated (corrected)

**Correction to this section's original text:** the paragraph below
originally concluded that colocating production and staging on one host
"breaks INV-4" and that Option A "must therefore be implemented as a
distinct host." That conclusion only followed from reusing staging's
existing directory tree unchanged; it does not follow once production gets
its **own, separate directory tree and its own Compose project**, which is
what D00's accepted decision actually requires ("separate compose project,
separate env files/secrets... no shared volumes"). The corrected mechanism
below enforces INV-4 by directory/project separation on the shared host,
rather than by host separation.

**Control plane.** A GitHub Actions environment named `production` holds all production secrets at environment scope, never at repository-global scope. Required reviewers on that environment are founder-controlled. Only the production deploy workflow declares `environment: production`; preview and staging workflows must not.

**Runtime plane.** The production deploy job writes runtime secret files on
the shared host, under a **production-only directory tree, distinct from
staging's `/opt/vocanova/infra/secrets/` tree**:

- `/opt/vocanova/production/secrets/api.env`
- `/opt/vocanova/production/secrets/web.env` (if needed)
- `/opt/vocanova/production/secrets/postgres.env`
- `/opt/vocanova/production/secrets/nginx/*` (TLS keypair)

Staging's existing tree (`/opt/vocanova/infra/secrets/...`) is left
untouched and continues to serve staging only; no path, symlink, or bind
mount ever crosses between the two trees. Production runs as its own
Docker Compose project (distinct `-p`/`COMPOSE_PROJECT_NAME`, e.g.
`vocanova-production`, separate from staging's implicit/default project
name) reading only `/opt/vocanova/production/...`, with its own compose
file (final path chosen in the T00 follow-up implementation, e.g.
`infra/docker-compose.production.yml`) so a stray `docker compose` command
run from the wrong directory cannot address the wrong tier's containers or
secrets.

Permissions baseline: owner `root` or a dedicated least-privilege
production-only deploy user (**not** the same OS user staging's deploy
path uses, so a compromised staging deploy credential cannot read
production's files by shared file ownership); mode `0600` for `*.env` and
private keys; mode `0700` for directories holding private key material;
mode `0750` or stricter on `/opt/vocanova/production/` itself so staging's
deploy user has no directory-listing access either.

Because both stacks share the same physical CPU/RAM (D00's acknowledged
shared-host risk), the production compose file must also set explicit
per-service resource limits (`deploy.resources.limits` equivalents under
plain `docker compose`, e.g. `mem_limit`/`cpus`) so a runaway staging
container cannot starve production, and vice versa — this is a follow-up
implementation item (section 7), not something this decision record itself
configures.

**Injection flow.**

1. The production deploy workflow obtains production-scoped secrets from the `production` environment after required approval.
2. It connects to the shared host and writes/updates only the files under `/opt/vocanova/production/secrets/`, never touching `/opt/vocanova/infra/secrets/`.
3. It runs deploy/update commands scoped to the `vocanova-production` compose project only, reading those host files at runtime (`env_file`), never build args.
4. It verifies health checks without printing secret values.

**Disallowed.** Production secrets as Docker build args for `apps/api`/`apps/web`; production secrets written into any compose file; reuse of the existing `STAGING_SSH_*` secrets, the staging host directory tree, the staging OS deploy user, or the staging Compose project for production.

### 4B) If D00 selects Option B — managed platform or multi-instance target

**Control plane.** Production secrets live in the platform's own secret store, scoped to a production-only project/workspace/service. CI holds at most a deploy credential for that production scope, itself stored in a founder-gated GitHub Actions `production` environment; CI never holds the application secrets themselves.

**Runtime plane.** The platform injects secrets into the production runtime directly. No production secret file is written to any founder-operated host, and no production secret is materialized in a CI runner's filesystem or environment.

**Isolation.** Tier separation is enforced by platform-level project/role separation rather than by file permissions: the staging scope's principals must have no read grant on the production scope. This substitution is why INV-1 through INV-7 are stated independently of storage medium.

**Disallowed.** A single platform project serving both tiers; a shared service account across tiers; platform build logs echoing injected values.

## 5) Inspection results

`VOC-037-AC-01` requires confirmation "by inspection of the chosen mechanism, not assertion alone." The checks below were executed against the working tree at `0e1f7813bce6f25654f46307a6331be260177e8f`. Results are recorded as observed, including where the current state does not yet satisfy the invariant.

### 5.1 Checks executed at this revision

| ID | Command | Observed output | Invariant | Result |
| --- | --- | --- | --- | --- |
| `INS-1` | `rg -c "^\s*environment:" .github/workflows/*.yml` | no matches — zero workflows declare a GitHub Actions environment | INV-2 | **Gap confirmed.** All existing secrets are repository-global; the scoped control plane in 4A/4B does not exist yet and is the substantive change this decision authorizes. |
| `INS-2` | `rg -l "secrets\." .github/workflows/*.yml` | `.github/workflows/deploy-staging.yml` only (15 references) | INV-4 | **Pass, by convention not enforcement.** Exactly one workflow consumes secrets today. |
| `INS-3` | Trigger inspection of all six workflows (`rg -n "^on:\|^\s{2}(push\|pull_request\|pull_request_target\|workflow_dispatch\|schedule):"`) | `deploy-staging.yml`: `push: branches: [develop]` + `workflow_dispatch` (lines 185–203). `accessibility.yml`, `governance-policy.yml`, `lighthouse.yml`, `pipeline.yml`, `repository-governance.yml`: `pull_request` (and `push` for repository-governance). No workflow uses `pull_request_target`. | INV-4 | **Pass.** The only secret-consuming workflow is not PR-triggered, and no `pull_request_target` job exists, so no fork or preview PR execution context can read repository secrets today. |
| `INS-4` | `git ls-files infra/secrets` | `infra/secrets/.gitignore` only | INV-3 | **Pass.** `infra/secrets/.gitignore` lines 40–41 are `*` plus `!.gitignore`, so every secret file in that directory is untracked by construction. |
| `INS-5` | `git ls-files \| rg "\.env$"` and `git ls-files "*.env"` | no tracked `.env` file; only `apps/api/.env.example` and `apps/web/.env.example` are tracked | INV-3 | **Pass.** |
| `INS-6` | `rg -n "PROD(UCTION)?_[A-Z_]*(KEY\|SECRET\|TOKEN\|PASSWORD\|URL\|HOST\|USER)" --glob '!specs/**' .` | no matches | INV-1, INV-3 | **Pass (vacuously).** No production-tier secret name is referenced anywhere outside this package's own documents, consistent with no production tier existing yet. |
| `INS-7` | Read of `deploy-staging.yml` lines 503, 528–544 | the staging job writes `/opt/vocanova/infra/secrets/api.env` and applies `chmod 600` to it; comments at line 503 record that `DATABASE_URL` and other secrets stay on the host | INV-5, INV-6 | **Pass for staging; carries over to 4A.** The `0600` file-permission baseline in 4A is the mechanism already in use for staging, so it is inspected behavior rather than an untested proposal. |
| `INS-8` | Read of `infra/docker-compose.yml` lines 122–138, 187–196, 268–270, 333–337 | services load secrets via `env_file: ./secrets/*.env` and mount `./secrets/nginx/{cert,key}.pem` read-only; non-secret values are set inline in `environment:` | INV-3 | **Pass.** No secret literal is present in the compose file; all secret material is referenced by path. This is also the finding behind 4A's separate-host requirement, since those paths are tier-agnostic. |

### 5.2 Checks that cannot be executed at this revision

The following checks from `VOC-037-TEST-01` require a provisioned production target and therefore **cannot be satisfied by this task**. They are not claimed as passing:

| ID | Check | Blocker |
| --- | --- | --- |
| `INS-9` | Production secret files exist only under the production host path, with permissions `0600` or stricter, and the staging host path holds staging secrets only | No production host exists; blocked on `VOC-037-D00` acceptance and the provisioning follow-up in section 7 |
| `INS-10` | Production containers start from production host env files (Option A) or platform-injected values (Option B) | Same |
| `INS-11` | Negative-access rehearsal: preview, staging, and non-production CI attempts to read a production secret each fail | Same; requires a disposable/staging-equivalent rehearsal of the production shape per `VOC-037-TEST-01`'s preconditions |

### 5.3 Standing of `VOC-037-AC-01` at this revision

- The first clause of AC-01 — "a document states the production secret storage/injection/rotation mechanism, distinct from staging's" — is met by sections 1–4 and 6.
- The second clause — inspection-based confirmation of unreachability — is met **only for the repository and CI planes** (`INS-1` through `INS-8`). The host/runtime plane and the negative-access rehearsal (`INS-9`–`INS-11`) remain open and are the substance of `VOC-037-EV-01`.
- AC-01 therefore remains `pending` after this task. It cannot be fully closed by any design task, because the mechanism it asks to be inspected does not exist until D00 is accepted and the section 7 follow-ups are implemented. Closing it is the job of the rehearsal named in `VOC-037-TEST-01`.

## 6) Rotation and revocation

Minimum rotation policy:

- Rotate all production provider credentials on a fixed 90-day cadence, and immediately after suspected exposure.
- Rotation execution order:
  1. issue new provider credential
  2. update the production-scoped secret (GitHub `production` environment under 4A; platform secret store under 4B)
  3. redeploy production
  4. verify service health and critical flows
  5. revoke the old credential
- Keep the previous credential active only for the shortest overlap window required to avoid an outage.

Emergency revocation policy:

- On suspected exposure, disable the affected feature via the existing kill switches where possible (`AI_FEATURES_ENABLED`, `EMAIL_MAGIC_LINK_ENABLED`, `GOOGLE_OAUTH_ENABLED`, `NEW_USER_SIGNUP_ENABLED`), then rotate and revoke immediately.
- Record the incident and follow-up under DOC-11's incident process.

## 7) Follow-up implementation scope after founder approval

`VOC-037-D00` is now accepted; the operative mechanism is 4A (corrected).
These remain outside `VOC-037-T01` itself (this task is design/decision only)
and are scoped for T03/T04/T05 or a dedicated provisioning follow-up:

- Configure the production-scoped control plane: a GitHub Actions
  `production` environment with founder-controlled required reviewers.
- Create `/opt/vocanova/production/` on the shared host (mode `0750` or
  stricter), fully separate from `/opt/vocanova/infra/`, with its own
  least-privilege deploy user distinct from staging's.
- Add a production deploy workflow (`.github/workflows/deploy-production.yml`,
  a protected path requiring its own classification and review) that writes
  only under `/opt/vocanova/production/secrets/` and operates only on the
  `vocanova-production` Compose project.
- Add a production compose file (e.g. `infra/docker-compose.production.yml`)
  with its own project name and explicit per-service resource limits
  (shared-host contention mitigation, per D00's acknowledged risk).
- Document the production secret-path and resource-limit conventions in
  `infra/README.md`.
- Add an operator runbook for rotation and emergency revocation.
- Execute `INS-9`–`INS-11` (adapted for same-host colocation: the negative-
  access rehearsal must specifically prove staging's deploy user/path cannot
  read `/opt/vocanova/production/secrets/`, not just that no shared host
  exists) and record `VOC-037-EV-01` with redacted evidence.

## 8) Relationship to `VOC-032-DEP-07`

Informational only, per `change.yaml`'s `VOC-037-DEP-02`. Whenever the still-open email-provider and Google-OAuth production credentials are eventually provisioned, they are provisioned through whichever mechanism this decision selects. This record neither re-opens nor resolves that R1 follow-up.

## Founder approval record

- Decision: **Approved (2026-08-01, founder-gate delegate).** This is an R3
  technical-mechanism decision (secrets storage/injection/rotation design),
  distinct from `VOC-037-D00`'s R4 production-architecture decision, which
  the founder decided directly. Per this project's founder-gate delegation,
  R3 decisions of this kind are approved by the delegate; this record's
  correction (section "Relationship to D00" and the corrected 4A above) is
  itself part of what is being approved here.
- Approved invariants (section 2): INV-1 through INV-7, as drafted.
- Approved mechanism: **4A, corrected for same-host colocation** — separate
  `/opt/vocanova/production/` directory tree, separate Compose project
  (`vocanova-production`), separate least-privilege deploy user, explicit
  per-service resource limits. 4B is not operative (D00 selected Option
  A-modified, not Option B).
- Required conditions: the section 7 follow-up implementation (T03-scoped or
  a dedicated provisioning task) must include the resource-limit and
  negative-access-rehearsal items added by this correction, not just the
  original 4A scope.
- Approval date: 2026-08-01

`status: accepted`.
