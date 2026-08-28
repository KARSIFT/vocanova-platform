# Standard staging and held production Cloudflare delivery

Status: VOC-100 PR1 repository transition. This document describes the prospective
standard delivery model while its GitHub environment and secrets are still absent.
This revision performs no Cloudflare, GitHub settings, secret, dispatch, migration,
promotion, rollback, DNS, production-data, or spending action. Consequently staging
fails closed. Production remains held by `VOC-080-HOLD-01`; learner data remains held
by `VOC-080-HOLD-02`.

VOC-100 prospectively supersedes the still-future VOC-094–VOC-099 custom runtime
binder instructions. Those packages and their evidence are immutable history; they
do not describe the active prospective delivery procedure.

## Current hosted posture (observed 2026-08-24)

The repository is public, current as observed at 2026-08-24. The canonical settings
record covers public visibility and absent branch restrictions; it does not inspect
environments or secrets. The repository therefore makes no
claim that hosted environment approvals, secrets, or branch restrictions are
configured. Any later GitHub settings mutation remains held by `VOC-085-HOLD-00` and
requires an immediate governed documentation-only follow-up; Cloudflare delivery
activation remains separately held by the VOC-080 holds above.
It also records VOC-092's enabled automatic deletion of merged branches, which is
neither branch protection nor deployment.

## What exists now

The repository has exactly four workflow files. `ci.yml` has three relevant
Cloudflare delivery behaviours:

1. Pull requests and protected-branch pushes run credential-free dry runs for local,
   staging, and production configurations of both Workers. Every dry run uses the
   committed non-provisioning configuration.
2. A credential-free policy job validates the manifest, resources, migration ceiling,
   secret placement, zero-cost limit, workflow sequence, and production holds.
3. A manual delivery event is the only prospective live trigger. In the current PR1
   state, the missing `cloudflare-staging` environment makes its pre-environment
   protection readback fail before any environment job or secret is available.

The canonical machine-readable record is
`infrastructure/cloudflare/delivery-manifest.json`. Real values exist only for the
previously verified synthetic staging tuple. Production `held-*` identifiers and
`.invalid` routes remain deliberate non-resource sentinels.

The prepared staging tuple binds account `0a9eda28b96d77c24dcde74f3e074d47`, zone
`63286d93b5f32925ac7366b4e97908be`, D1
`22ae386f-e3f5-4d98-a3ad-18b39d3b8556`, API Worker
`vocanova-api-staging` at `api-stag.vocanova.site`, and web Worker
`vocanova-web-staging` at `stag.vocanova.site`. Seven schema-only migrations, zero
application rows, active Custom Domains, Free Workers/D1, and zero incremental
VocaNova cost are closed historical Phase-1 evidence. The resource tuple is retained;
this PR does not query or mutate it.

## Environment and credential boundary

| Surface                          | Staging, current PR1 state                  | Production                                |
| -------------------------------- | ------------------------------------------- | ----------------------------------------- |
| State                            | fail-closed; environment and secrets absent | held                                      |
| Required branch after activation | `develop`                                   | `main`                                    |
| GitHub environment               | `cloudflare-staging` planned, not created   | `cloudflare-production` held, not created |
| Worker / D1 tuple                | retained synthetic staging tuple            | non-resource sentinels                    |
| Credentials                      | no values exist in GitHub                   | no values exist in GitHub                 |

After separately authorized settings action, `cloudflare-staging` will contain exactly
the environment secret names `CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_API_TOKEN`; neither
name may exist as a repository or organization Actions secret. The account ID is a
non-sensitive canonical identifier retained in this secret interface for Wrangler;
the API-token value is confidential and is never placed in a repository file, input,
output, log, comment, artifact, or agent record.

The staging token is reusable for ordinary dispatches but expires no later than 90
days. It is restricted to account `0a9eda28b96d77c24dcde74f3e074d47` with exactly
Workers Scripts Edit and D1 Edit. It has no DNS, billing, user, organization, Access,
Pages, R2, AI, production-data, or token-management permission. The Cloudflare
dashboard policy readback, sanitized before recording, proves scope, permissions,
status, and expiry; a verify endpoint and Wrangler account readback do not prove its
permission policy. Rotation is create, dashboard verify, local status/account verify,
install, environment-reviewed no-write credential check, then revoke the old token.
Rotation is independent of a deployment, plan, or pull request.

## Standard manual staging delivery after settings action

Only `workflow_dispatch` may request staging. It must be started—and any attempt
rerun—by `m-e-h-r-d-a-a-d` on `develop`, name the exact event SHA in the confirmation
`DEPLOY staging <sha>`, and pass all required validation in that same run. The
manifest/resource tuple, zero-cost ceiling, branch, actor, confirmation, and
production holds are deterministic gates.

The future environment uses sole GitHub reviewer identity `m-e-h-r-d-a-a-d`, permits
identity-layer self-review because GitHub cannot represent an ephemeral AI participant,
disables admin bypass, and has exactly one custom deployment branch policy: `develop`.
A fresh non-author AI subagent makes the review decision for each run and records a
structured, SHA/attempt-bound PASS receipt. For agent-mediated dispatch, its model
differs from the coordinator model; it receives neither Cloudflare secrets nor an
authenticated GitHub approval credential. A separately authorized approval proxy may
post the exact receipt unchanged with the operator's GitHub identity but has no review
judgment.

This is an auditable process boundary, not cryptographic identity separation. GitHub
cannot distinguish the dispatcher/proxy from the AI reviewer when they share an
account, and a valid forged receipt is not technically detectable. A separate R4
staging-action record must explicitly accept that residual before settings or a
dispatch; rejection keeps staging disabled. Detected fabrication cancels the run and,
after any write, stops delivery, revokes the token, disables/removes environment
secrets, audits the run, and requires a reviewed correction.

Before an environment job is released, a credential-free readback requires the live
environment's sole reviewer, self-review setting, disabled admin bypass, and exact
`develop` branch policy. The first environment-job step then uses only an
`actions: read` GitHub token to validate the current run's approval history: exactly
one matching approved record and receipt, including run ID, attempt, SHA, environment
ID/name, shared GitHub identity, provenance, and PASS verdict. Missing, stale,
malformed, extra, altered, or conflicting records fail before a Cloudflare secret is
evaluated. No job-level environment expression, condition, or earlier step may
reference either secret.

Only then do bounded credential steps check the exact account, capture the unique
100%-traffic API/web deployment UUIDs as rollback targets, run the exact ordered D1
migration ledger, upload immutable SHA-prefix/run-ID/attempt-tagged Worker versions,
promote the exact UUIDs, and run bounded staging smoke. The workflow uses the locked
Wrangler commands; no credential-free test or `--help` result is treated as live
deployment evidence.
The delivery policy treats each staging and production Wrangler environment as a
closed tuple: Worker names, routes, the sole D1 and service bindings, migration
settings, disabled preview surfaces, and every safety/feature variable must match
exactly; extra bindings or enabled signup/provider features fail validation.

## Ordered implementation and truth boundary

PR1 changes repository delivery controls and documents the current absent-environment
state. It does not create secrets or enable staging. A separately authorized operator
may then create/read back the exact environment, two secret names, protections, branch
policy, and sanitized token policy while proving those secret names are absent from
repository and organization scope. An immediate documentation-only PR2 records that
sanitized post-state. This two-PR boundary occurs once because settings cannot be
truthfully preclaimed. It is not repeated for ordinary dispatches or token rotations.

## Cancellation, failure, and rollback

Manual delivery runs cannot be automatically cancelled after migration starts.
Failures before promotion leave traffic unchanged. Promotion or smoke failure attempts
both API and web restoration independently and fails visibly if either exact
pre-promotion Worker version cannot be restored. Worker rollback does not reverse D1:
migrations remain expand-compatible and database recovery is forward correction.
Missing settings, account/resource/cost drift, receipt defects, or production drift
stop before writes. A compromised or over-scoped token is revoked immediately.

## Deterministic evidence

`pnpm run ci:delivery` and the foundation suite validate event/actor/branch/SHA
confirmation, manifest/resources, zero cost, environment protection readback, secret
isolation, receipt schema, approval-history-first ordering, rollback discovery,
migration ordering, and production holds. Locked Wrangler migration, status,
promotion, and rollback argv are tested in isolated no-network processes: valid argv
must reach only the expected missing-auth boundary and unknown-option controls must
fail in argument parsing. PR/push evidence remains credential-free. A successful
staging delivery may be claimed only from the separately authorized, environment-
reviewed run's sanitized evidence.

## Local development is not delivery

VOC-081's `pnpm dev:init`, `pnpm dev`, `pnpm dev:workers`, and
`pnpm test:local-stack` are local-only capabilities. The D1 initializer uses the
locked Wrangler local migration command and `.wrangler/state/vocanova-local`.
Nothing in local development releases staging or production holds.
