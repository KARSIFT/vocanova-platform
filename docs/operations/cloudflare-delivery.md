# Held Cloudflare delivery and rollback

Status: active repository-only design for `VOC-080-T10`. Staging and production are
both **held**. This revision creates no Cloudflare resource, GitHub environment,
credential, route, deployment, remote migration, DNS record, or production-data
access.

## What exists now

The repository still has exactly four workflow files. `ci.yml` now has three kinds
of Cloudflare delivery behavior:

1. Pull requests and protected-branch pushes run credential-free dry runs for the
   local, staging, and production configuration of both Workers. Every dry run uses
   `--experimental-provision=false` and `--experimental-auto-create=false`.
2. A credential-free policy job validates the manifest, distinct environment names,
   D1 bindings, service bindings, placeholder routes, migration ceiling, workflow
   sequence, secret placement, non-cancellation rule, and active holds.
3. A manual delivery event first runs the complete CI graph and then the
   credential-free gate. The committed manifest is `held`, uses non-resource D1 IDs
   and `.invalid` routes, and has no authority URLs, so the gate must fail before
   either environment job can start or read a secret.

The canonical machine-readable record is
`infrastructure/cloudflare/delivery-manifest.json`. The `held-*` D1 identifiers and
`.invalid` routes are deliberate non-resource sentinels. They are not Cloudflare IDs,
DNS names, credentials, or deployable production configuration.

## Environment isolation

| Surface                       | Staging                  | Production                  |
| ----------------------------- | ------------------------ | --------------------------- |
| Action hold                   | `VOC-080-HOLD-00`        | `VOC-080-HOLD-01`           |
| Required branch at activation | `develop`                | `main`                      |
| GitHub environment name       | `cloudflare-staging`     | `cloudflare-production`     |
| API Worker                    | `vocanova-api-staging`   | `vocanova-api-production`   |
| Web Worker                    | `vocanova-web-staging`   | `vocanova-web-production`   |
| D1 database                   | `vocanova-staging`       | `vocanova-production`       |
| D1 ID in this held revision   | `held-staging-d1`        | `held-production-d1`        |
| Route in this held revision   | `.invalid` staging names | `.invalid` production names |
| GitHub/Worker secret scope    | staging only             | production only             |

The two environment jobs use the same _secret names_ because Wrangler recognizes
them, but GitHub resolves their values from different named environments. Those jobs
do not exist in pull-request execution, and credentials are attached only to the
remote migration, version upload, exact promotion, and rollback steps—not checkout,
dependency installation, build, gate, policy, or smoke steps. No environment or
secret has been created by T10; activation must verify that the real settings match
this contract.

## Fail-closed activation contract

The current revision cannot activate. A future separately reviewed activation change
must replace the sentinels, change the manifest/policy from `held` to an exact
authorized state, and record all evidence required by the named hold. Merely adding a
secret or manually running the workflow is insufficient.

For either environment, the gate requires:

- `workflow_dispatch`, never a PR, push, issue, comment, Ruflo decision, or local
  agent command;
- the dispatched ref required by that environment;
- a 40-character `reviewed_sha` exactly equal to the workflow revision;
- an exact `DEPLOY <environment> <sha>` acknowledgement;
- matching action-authority, resource-manifest, and rollback-rehearsal evidence;
- an unexpired authorization record;
- real, distinct D1 IDs and non-placeholder HTTPS routes;
- exact previous API and web version UUIDs for rollback; and
- an integer release-cost estimate at or below the reviewed ceiling.

Production additionally requires exact staging/soak and D1 backup/Time Travel
evidence matching the reviewed manifest. Production learner data remains governed by
`VOC-080-HOLD-02`; the delivery workflow has no export/conversion input or learner-data
credential.

The repository is public, current as observed at 2026-08-24. The [point-in-time
settings record](../governance/repository-settings-current.yaml) covers public
visibility and absent branch restrictions; it does not inspect environments or
secrets. It also records VOC-092's enabled automatic deletion of merged branches,
which is neither branch protection nor deployment. The repository therefore makes no
claim that hosted environment approvals, secrets, or branch restrictions are
configured. Public availability does not mean those controls exist. The committed
fail-closed state does not pretend those settings exist. Any later GitHub settings
mutation remains held by `VOC-085-HOLD-00` and requires an immediate governed
documentation-only follow-up; Cloudflare delivery activation remains separately held
by the VOC-080 holds above.

## Ordered execution after future authorization

An authorized environment job uses the repository-locked Wrangler `4.125.0` CLI and
the exact workflow SHA:

```text
all CI jobs pass at dispatched SHA
  -> action hold / branch / SHA / evidence / cost gate passes
  -> build API and OpenNext web without credentials
  -> apply ordered compatible D1 migrations
  -> upload API and web as immutable SHA-tagged versions (strict mode)
  -> resolve the unique version UUID for each SHA tag
  -> deploy exactly those two UUIDs at 100%
  -> bounded health/config/contract/web smoke at the reviewed routes
  -> record SHA, version UUIDs, migration, promotion, smoke, and hold outcome
```

Cloudflare separates versions from deployments: uploading a version does not by
itself assign traffic, while deploying a version ID does. D1 migrations are applied
before version promotion and must remain expand-compatible with both the new and
last-known-good code. The workflow never uses `wrangler deploy` for live publication.
It uses `versions upload`, then `versions deploy` with exact UUIDs. See Cloudflare's
[versions and deployments](https://developers.cloudflare.com/workers/versions-and-deployments/),
[Wrangler Worker commands](https://developers.cloudflare.com/workers/wrangler/commands/workers/),
and [D1 migration commands](https://developers.cloudflare.com/d1/wrangler-commands/).

## Cancellation, failure, and rollback

PR/push validation keeps superseded-run cancellation. A manual delivery run sets
`cancel-in-progress` to false for the entire workflow, so a newer run cannot
automatically cancel it after migration begins.

Failure before promotion leaves traffic unchanged. If either exact promotion or the
bounded smoke fails, the job invokes `wrangler rollback` with both operator-supplied,
gate-validated previous version UUIDs and records the failed outcome. Rollback changes
Worker traffic only; it does not reverse D1. Schema changes therefore remain
expand-compatible and data recovery is forward correction by default. A Time Travel
restore is a separate destructive action and is never started by this workflow.

Cloudflare documents that a Worker rollback immediately changes active traffic and
can be blocked by incompatible binding/resource changes. The previous version IDs and
rollback rehearsal are therefore activation preconditions, not values inferred after
failure. See [Cloudflare rollback constraints](https://developers.cloudflare.com/workers/versions-and-deployments/rollbacks/).

## Deterministic evidence

`pnpm run ci:delivery` and the foundation test suite use mocked events and HTTP
responses to cover PR/fork denial, the active holds, valid synthetic authorization,
missing/stale SHA, authority mismatch, wrong ref, staging/production mix-up, missing
production staging/backup proof, bad rollback IDs, expired evidence, cost overflow,
secret placement, cancellation, migration ordering, version resolution, bounded
retry, unhealthy D1, release drift, and non-HTML web output.

Real PR evidence consists only of local/workerd tests and credential-free Wrangler
dry runs. A live delivery may be claimed only from a separately authorized run that
records its actual version IDs and outcome.

## Local development is not delivery

VOC-081's `pnpm dev:init`, `pnpm dev`, `pnpm dev:workers`, and
`pnpm test:local-stack` are separate local-only capabilities. The D1 initializer uses
the locked Wrangler `d1 migrations apply DB --local` command, the API config, and the
explicit `.wrangler/state/vocanova-local` persistence root. Wrangler 4.125.0 does not
accept the delivery dry-run `--experimental-provision=false` or
`--experimental-auto-create=false` flags on `d1 migrations apply`; the explicit
`--local` selection and fail-closed command policy provide that boundary instead.
Nothing in the local commands releases this runbook's staging or production holds.
