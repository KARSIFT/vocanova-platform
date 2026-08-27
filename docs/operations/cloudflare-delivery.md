# Prepared staging and held production Cloudflare delivery

Status: VOC-096 PR1 repository transition. Phase 1 created and independently verified
only the exact synthetic staging resources below. This revision performs no live
Cloudflare, GitHub settings, secret, dispatch, migration, promotion, rollback, DNS,
production-data, or spending action. Staging ordinary delivery remains
dispatch-ineligible until ACT-03, exact five-file PR2, and an unexpired runtime binder
pass. Production remains held by `VOC-080-HOLD-01`; learner data remains held by
`VOC-080-HOLD-02`.

## What exists now

The repository has exactly four workflow files. `ci.yml` now has three kinds
of Cloudflare delivery behavior:

1. Pull requests and protected-branch pushes run credential-free dry runs for the
   local, staging, and production configuration of both Workers. Every dry run uses
   `--experimental-provision=false` and `--experimental-auto-create=false`.
2. A credential-free policy job validates the manifest, exact staging tuple and
   schema digests, bindings/routes, migration ceiling, workflow sequence, secret
   placement, non-cancellation rule, and production holds.
3. A manual delivery event first runs the complete CI graph and then the
   credential-free gate. Staging is `prepared`, but its runtime evidence is `null`
   and the required live records do not exist yet, so PR1 remains dispatch-ineligible.
   Production retains non-resource sentinels and fails before its environment job.

The canonical machine-readable record is
`infrastructure/cloudflare/delivery-manifest.json`. Real values exist only under
staging. Production's `held-*` identifiers and `.invalid` routes remain deliberate
non-resource sentinels.

The prepared tuple binds account `0a9eda28b96d77c24dcde74f3e074d47`, zone
`63286d93b5f32925ac7366b4e97908be`, D1
`22ae386f-e3f5-4d98-a3ad-18b39d3b8556`, API Worker
`vocanova-api-staging` at `api-stag.vocanova.site`, and web Worker
`vocanova-web-staging` at `stag.vocanova.site`. API baseline
`ace13c0b-c148-4ef1-ad9a-fdfdb07f264f` and web baseline
`5255e64d-872e-469f-90b6-bea49efd5e75` each receive 100% traffic. Probes
`858009b5-0840-499d-92f4-e0a0483e0b33`,
`0dc15f45-d178-480e-ba32-ca5279cc2c17`, and
`7b694392-8f38-4329-bd2f-af982c3c6a56` receive 0%. Seven schema-only migrations,
zero application rows, active Custom Domains, Free Workers/D1, and exactly $0
incremental VocaNova cost are closed by
[Phase-1 evidence](https://github.com/KARSIFT/vocanova-platform/issues/158#issuecomment-5438014817).

## Environment isolation

| Surface                       | Staging                                    | Production                |
| ----------------------------- | ------------------------------------------ | ------------------------- |
| State                         | `prepared`, dispatch-ineligible            | `held`                    |
| Required branch at activation | `develop`                                  | `main`                    |
| GitHub environment name       | `cloudflare-staging` (absent/held/planned) | `cloudflare-production`   |
| API Worker                    | `vocanova-api-staging`                     | `vocanova-api-production` |
| Web Worker                    | `vocanova-web-staging`                     | `vocanova-web-production` |
| D1 database                   | `vocanova-staging`                         | `vocanova-production`     |
| D1 ID                         | `22ae386f-e3f5-4d98-a3ad-18b39d3b8556`     | `held-production-d1`      |
| Routes                        | exact active `stag` / `api-stag` hostnames | `.invalid` sentinels      |
| GitHub/Worker secret scope    | staging only after held ACT-03             | production only; held     |

The two environment jobs use the same _secret names_ because Wrangler recognizes
them, but GitHub resolves their values from different named environments. Those jobs
do not exist in pull-request execution, and credentials are attached only to the
remote migration, version upload, exact promotion, and rollback steps—not checkout,
dependency installation, build, gate, policy, or smoke steps. No staging environment
or secret is claimed by PR1. ACT-03 is the separately held
settings action that must create/read back only that environment and its two names.

## Fail-closed staging runtime binder

PR1 cannot dispatch staging. It commits the complete prepared tuple (digest
`25ac2748678adb7d41c8a525bf05443154ba8ac1678ce6647a75e6ceeca45871`) and closed
record/envelope schemas, but no runtime evidence. After PR1 merge, ACT-03 and exact
five-file PR2 remain required. Merely adding a secret or manually running the workflow
is insufficient.

For staging, the gate fetches five closed canonical issue-comment records: settings
authority, ACT-03 result, exact merged-PR2 review, ACT-04 authority, and independent
binder review. It validates raw-body digests, trusted publisher identity, closed JSON
schemas and cross-record equality, exact five-file PR2 metadata, three successful
event-filtered `push` workflow runs and GitHub-hosted checks, the current first-attempt
dispatch revision/title, rate/request/page/size bounds, time bounds, and replay
absence. The nonce/authority are one-use and validity is at most 1,800 seconds. The
complete evaluator runs once in the gate and again immediately before the first
secret-bearing staging step.

Common gate requirements include:

- `workflow_dispatch`, never a PR, push, issue, comment, Ruflo decision, or local
  agent command;
- the dispatched ref required by that environment;
- a 40-character `reviewed_sha` exactly equal to the workflow revision;
- an exact `DEPLOY <environment> <sha>` acknowledgement;
- matching runtime authority, resource tuple, and rollback evidence;
- an unexpired five-record authorization chain;
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
