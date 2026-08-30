# Standard staging and held production Cloudflare delivery

Status: VOC-100 PR2 settings-truth record. This document describes the standard
delivery model after the separately authorized `cloudflare-staging` GitHub
environment and its two environment secret names were created. This revision records
only sanitized settings truth. It performs no Cloudflare, GitHub settings, secret,
dispatch, migration, promotion, rollback, DNS, production-data, or spending action.
Production remains held by `VOC-080-HOLD-01`; learner data remains held by
`VOC-080-HOLD-02`.

VOC-100 prospectively supersedes the still-future VOC-094–VOC-099 custom runtime
binder instructions. Those packages and their evidence are immutable history; they
do not describe the active prospective delivery procedure.

## Current hosted posture (observed 2026-08-24)

The repository is public, current as observed at 2026-08-24. The canonical settings
record covers public visibility and absent branch restrictions; it does not inspect
environments or secrets. The repository therefore makes no
claim that hosted environment approvals, secrets, or branch restrictions are
configured. That statement is limited to the 2026-08-24 snapshot; VOC-100 PR2
environment truth is recorded below. Any later GitHub settings mutation remains held
by `VOC-085-HOLD-00` and requires an immediate governed documentation-only follow-up;
Cloudflare delivery activation remains separately held by the VOC-080 holds above.
It also records VOC-092's enabled automatic deletion of merged branches, which is
neither branch protection nor deployment.

## VOC-100 settings truth (observed 2026-08-30 UTC)

Under the separately authorized operator action recorded in
<https://github.com/KARSIFT/vocanova-platform/issues/158#issuecomment-5471341449>,
the operator accepted the shared GitHub identity receipt-forgery residual and created
only the staging GitHub environment and environment secret names described here.
Production, DNS, billing, spending, learner-data, launch, and unrelated settings
actions remained prohibited. The sanitized completion receipt is
<https://github.com/KARSIFT/vocanova-platform/issues/158#issuecomment-5471376705>.

Sanitized pre-state evidence recorded `GET cloudflare-staging` as HTTP 404, with no
matching `CLOUDFLARE_ACCOUNT_ID` or `CLOUDFLARE_API_TOKEN` names at repository or
organization Actions secret scope.

The created environment is `cloudflare-staging` with GitHub environment ID
`20890778457`, wait timer `0`, admin bypass disabled, required reviewer user
`m-e-h-r-d-a-a-d` with numeric ID `7955432`, GitHub identity-layer self-review allowed,
custom deployment branch policies enabled, protected-branch deployment disabled, and
the sole branch policy `develop` of type `branch`. The exact payload was:
environment name `cloudflare-staging`; wait timer `0`; `can_admins_bypass: false`;
required reviewer type `User`, login `m-e-h-r-d-a-a-d`, ID `7955432`;
`prevent_self_review: false`; deployment branch policy `protected_branches: false`
and `custom_branch_policies: true`; one branch policy named `develop` of type
`branch`; and exactly the two environment secret names below, without values.

The `cloudflare-staging` environment secret names are exactly
`CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_API_TOKEN`. Readback showed no matching
repository Actions secret names and no matching organization Actions secret names.
No secret values were read, disclosed, logged, commented, or committed.

The operator-created standing Cloudflare token is scoped to account
`0a9eda28b96d77c24dcde74f3e074d47` with exactly `Workers Scripts Edit` and `D1 Edit`;
it is valid until operator revocation. The operator entered it directly into GitHub,
with no disclosure to any agent, chat, log, comment, artifact, or repository file.
No dispatch or deployment occurred.

Settings rollback deletes the two environment secret names and the
`cloudflare-staging` environment, or otherwise restores the documented pre-state. No
rollback step requires or records a secret value. If token scope or disclosure
evidence is wrong, revoke the token and remove the environment API-token secret before
staging can resume.

## What exists now

The repository has exactly four workflow files. `ci.yml` has three relevant
Cloudflare delivery behaviours:

1. Pull requests and protected-branch pushes run credential-free dry runs for local,
   staging, and production configurations of both Workers. Every dry run uses the
   committed non-provisioning configuration.
2. A credential-free policy job validates the manifest, resources, migration ceiling,
   secret placement, zero-cost limit, workflow sequence, and production holds.
3. A manual delivery event is the only prospective live trigger. In the current PR2
   truth state, `cloudflare-staging` exists and the workflow still requires exact
   environment-protection readback before any environment job or secret is available.

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

| Surface                          | Staging, current PR2 truth state            | Production                                |
| -------------------------------- | ------------------------------------------- | ----------------------------------------- |
| State                            | environment configured; no dispatch run     | held                                      |
| Required branch after activation | `develop`                                   | `main`                                    |
| GitHub environment               | `cloudflare-staging` ID `20890778457`       | `cloudflare-production` held, not created |
| Worker / D1 tuple                | retained synthetic staging tuple            | non-resource sentinels                    |
| Credentials                      | two environment secret names only           | no values exist in GitHub                 |

`cloudflare-staging` contains exactly the environment secret names
`CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_API_TOKEN`; neither name may exist as a
repository or organization Actions secret. The account ID is a non-sensitive canonical
identifier retained in this secret interface for Wrangler; the API-token value is
confidential and is never placed in a repository file, input, output, log, comment,
artifact, or agent record.

<!-- VOC-101-STAGING-CREDENTIAL-POLICY-BEGIN -->
The operator-revoked standing Cloudflare staging token is valid until revoked. It
is restricted to account `0a9eda28b96d77c24dcde74f3e074d47` with exactly Workers
Scripts Edit and D1 Edit; it has no DNS, billing, user, organization, Access, Pages,
R2, AI, production-data, token-management, or unrelated-product permission. When
separately authorized and installed, `CLOUDFLARE_ACCOUNT_ID` and
`CLOUDFLARE_API_TOKEN` may exist only as `cloudflare-staging` environment secrets,
never at repository or organization scope; values never enter the repository, logs,
comments, artifacts, or agent records.

Mandatory revocation triggers are suspected disclosure, account or permission drift,
shared-identity fabrication, loss of operator control, and an explicit operator
revocation request. A trigger requires revocation first and leaves staging disabled
until a replacement passes sanitized dashboard policy readback, local status/account
verification without logging, installation, and the protected no-write credential
check. Only voluntary replacement when no mandatory trigger exists may retain the
prior token through those checks and revoke it afterward. A failed voluntary
replacement restores the prior environment secret, passes the protected no-write
check, and revokes the failed replacement. A failed trigger-driven replacement is
revoked and removed while staging stays disabled.

If required revocation cannot be confirmed, remove the environment API-token secret,
reject new approvals, cancel in-flight staging runs, open an incident, retry
revocation, and verify the affected token is inactive without logging it. Staging
cannot resume until that verification succeeds and a valid credential passes the
protected no-write check.

Ordinary dispatch, revocation, and replacement under this stable policy require
neither a change package nor a pull request and are not coupled to deployment; any
later meaningful policy or behavior change requires governed intake, adoption, and
implementation. The credential lifecycle grants no dispatch or review judgment.
<!-- VOC-101-STAGING-CREDENTIAL-POLICY-END -->

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
The delivery policy treats the complete Wrangler files—including every inheritable
top-level setting—and each staging and production environment as closed tuples.
Worker names, routes, the sole D1 and service bindings, assets, compatibility,
migration settings, disabled preview surfaces, and every safety/feature variable must
match exactly; unknown root capabilities, extra bindings, or enabled signup/provider
features fail validation.

## Ordered implementation and truth boundary

PR1 changed repository delivery controls and documented the then-current
absent-environment state. A separately authorized operator then created and read back
the exact environment, two secret names, protections, branch policy, and sanitized
token policy while proving those secret names were absent from repository and
organization scope. This documentation-only PR2 records that sanitized post-state.
The two-PR boundary occurs once because settings could not be truthfully preclaimed.
It is not repeated for ordinary dispatches, token revocations, or token replacements.

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
