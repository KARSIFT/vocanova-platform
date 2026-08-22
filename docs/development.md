# Local development

## Prerequisites

- Node.js `24.18.0` (LTS), declared in `.nvmrc` and `package.json`.
- pnpm `11.14.0`, declared by the root `packageManager` field.

From a clean checkout, enable Corepack and install the exact frozen dependency graph:

```bash
corepack enable
corepack prepare pnpm@11.14.0 --activate
pnpm install --frozen-lockfile
```

## Root commands

| Command                         | Purpose                                                                                                    |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `pnpm dev`                      | Run the Next.js development server with local Cloudflare binding simulation.                               |
| `pnpm validate`                 | Run workspace, format, lint, type, test, and build validation.                                             |
| `pnpm lint`                     | Lint web, packages, and Worker API.                                                                        |
| `pnpm typecheck`                | Type-check the web, Worker API, and shared packages.                                                       |
| `pnpm test`                     | Run foundation, client, web, and Worker/D1 tests.                                                          |
| `pnpm build`                    | Build the web, Worker API, and shared packages.                                                            |
| `pnpm format:check`             | Check Prettier formatting without writing.                                                                 |
| `pnpm format`                   | Apply Prettier formatting.                                                                                 |
| `pnpm audit`                    | Fail when the pnpm production dependency graph has a high or critical advisory.                            |
| `pnpm run test:data-conversion` | Rehearse the versioned synthetic PostgreSQL-to-local-D1 conversion, recovery, and reconciliation contract. |

The full `pnpm validate` command remains the pre-review local gate. GitHub Actions
uses the following stable subsystem entry points so a failure names the affected
surface while preserving the same underlying scripts:

| Command              | Hosted check surface                                                                                           |
| -------------------- | -------------------------------------------------------------------------------------------------------------- |
| `pnpm ci:foundation` | Workspace shape, formatting, shared-package prerequisite build, and foundation tests                           |
| `pnpm ci:packages`   | Shared-package lint, typecheck, build, and API-client tests                                                    |
| `pnpm ci:web`        | Web lint/type/unit plus OpenNext build, typed config, dry-run/limits, and workerd proof                        |
| `pnpm ci:worker-api` | API-client compatibility plus Hono/Worker/D1 lint, types, safety, workerd, contract, build, and dry-run        |
| `pnpm ci:retirement` | Prove the active Go/server runtime, host assets, dependencies, and stale execution instructions remain retired |

The commands intentionally overlap where a subsystem must prove its own prerequisites.
The `CI / ci required` job succeeds only when every named subsystem succeeds. Quality and
Security have equivalent stable `quality required` and `security required` aggregates. The shared
`.github/actions/setup-toolchain` action reads the exact versions already declared in
the repository, installs with the frozen lockfile, and caches only the package-manager
download store. Cache contents are an optimization: `node_modules` is never
cached, and a miss cannot skip installation or validation.

The audit policy permits moderate and low advisories to be reported without failing;
all reported advisories remain visible and must be recorded in the pull request.

## Project-specific commands

Use `pnpm --filter @vocanova/web dev`, `build`, `start`, `lint`, or `typecheck` for
the Next.js application. `build`/`start` remain fast Node-based UI
checks; a plain `next build` is not Worker compatibility or deployment evidence. The
root page is a technical framework-validation placeholder and contains no product UI.

The credential-free Cloudflare path is:

| Command                                                | Purpose                                                                                                                                          |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `pnpm --filter @vocanova/web cloudflare:typegen`       | Regenerate `worker-configuration.d.ts` from `wrangler.jsonc`.                                                                                    |
| `pnpm --filter @vocanova/web cloudflare:typecheck`     | Fail if committed binding/runtime types are stale.                                                                                               |
| `pnpm --filter @vocanova/web cloudflare:build`         | Run `next build` and transform its standalone intermediate into `.open-next/worker.js`.                                                          |
| `pnpm --filter @vocanova/web cloudflare:preview`       | Serve an existing OpenNext build locally in workerd for manual inspection.                                                                       |
| `pnpm --filter @vocanova/web cloudflare:preview:test`  | Run representative static, SSR, RSC, middleware, auth, service-binding, and disabled-Sentry requests in local workerd.                           |
| `pnpm --filter @vocanova/web cloudflare:dry-run`       | Bundle with Wrangler using `--dry-run`; it performs no upload or resource mutation.                                                              |
| `pnpm --filter @vocanova/web cloudflare:limits`        | Enforce the 3 MiB compressed target and record the local startup profile against the 1,000 ms platform limit.                                    |
| `pnpm --filter @vocanova/web cloudflare:compatibility` | Scan the request runtime for unsupported globals, unbounded body buffering, floating Promises, remote bindings, and missing service-binding use. |

Run `cloudflare:build` before `cloudflare:typegen` or `cloudflare:typecheck`.
Wrangler includes the configured OpenNext main-module declaration in its generated
hash only after `.open-next/worker.js` exists; enforcing this order keeps clean and
incremental checkouts byte-consistent. The stable `pnpm ci:web` command owns that
ordering.

`wrangler.jsonc` defines local, staging, and production names but contains no resource
ID, credential, route, or deploy authority. Local preview uses only simulation. The
credential-free commands do not upload, use remote development, or query an account.
Wrangler's local startup profile is diagnostic because host CPUs differ; a future held
version upload must supply the authoritative platform startup measurement.

The API runtime lives at `apps/api-worker`. T11 retired the former Go runtime after
the full parity chain; immutable Git history plus compact contract/schema snapshots
retain only the deterministic migration oracle. Credential-free commands are:

| Command                                                        | Purpose                                                                                                                        |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `pnpm --filter @vocanova/api-worker types:write`               | Regenerate D1/runtime binding types from the local Wrangler configuration.                                                     |
| `pnpm --filter @vocanova/api-worker types:check`               | Fail when committed Wrangler types are stale.                                                                                  |
| `pnpm --filter @vocanova/api-worker test`                      | Run Hono, CORS, redaction, identity, content, reviews, missions, AI/email-boundary parity, migration, and D1 tests in workerd. |
| `pnpm --filter @vocanova/api-worker safety:check`              | Reject dynamic/unsafe SQL, destructive foundation migrations, sensitive logs, and remote config.                               |
| `pnpm --filter @vocanova/api-worker data-conversion:inventory` | Bind all 25 PostgreSQL source tables/columns to their D1 conversion schema and classify D1-only runtime tables.                |
| `pnpm --filter @vocanova/api-worker test:data-conversion`      | Run the synthetic type conversion, local D1 chunk/import, resume, replay, correction, reconciliation, and privacy suite.       |
| `pnpm --filter @vocanova/api-worker openapi:check`             | Compare Hono's generated operational OpenAPI with the committed deterministic artifact.                                        |
| `pnpm --filter @vocanova/api-worker contract:check`            | Bind the Worker contract to the retired-source `/api/v1` snapshot and API client.                                              |
| `pnpm --filter @vocanova/api-worker dry-run`                   | Bundle local, held staging, and held production Worker configs without uploading, provisioning, or querying Cloudflare.        |
| `pnpm ci:worker-api`                                           | Run the complete Worker API/local-D1 hosted command, including API-client compatibility.                                       |
| `pnpm ci:delivery`                                             | Validate the held Cloudflare manifest, environment isolation, workflow sequence, action holds, and migration ceiling.          |

`wrangler.jsonc` contains the local D1 name/sentinel plus distinct staging/production
names with `held-*` non-resource sentinels; it contains no Cloudflare account/resource
identifier or credential.
Vitest applies all seven forward migrations to isolated local D1 storage twice,
proving from-empty and replay behavior. T05 adds requester-scoped identity, OAuth
state, magic links, sessions, onboarding, settings, email change, and account
deactivation. T06-T08 add content/review, mission/progress, and AI-feedback parity,
including persistent D1 limits, mocked provider/email boundaries, and privacy-safe
`waitUntil` telemetry. The committed runtime AI kill switch remains off; normal CI
uses no paid provider or provider secret.
Email and OAuth providers remain injected boundaries in tests; no local command sends
email or contacts a provider. T10 now owns the held staging/production manifest,
placeholder D1/routes, environment names, dry runs, and delivery state machine. Real
identifiers, environment secrets, routes, authority, and live actions remain absent;
see the [delivery runbook](operations/cloudflare-delivery.md).

The active repository contains no Go module, Dockerfile, Compose/Nginx configuration,
host operation script, or remote staging-server test. `pnpm ci:retirement` validates
that boundary. The retirement manifest is
`infrastructure/cloudflare/server-retirement-manifest.json`; deletion changed only
repository history and did not inspect, stop, or modify any live server.

T09's data-conversion command accepts only the committed synthetic PostgreSQL-shaped
fixture. It applies prepared, bounded D1 batches to local test storage, checkpoints
each mutation, and reconciles through bounded resumable pages. It proves rerun,
interrupted-resume, forward-correction, foreign-key, checksum, count, domain-aggregate,
and privacy-safe evidence. It cannot use production data or a remote D1 binding. The
complete contract and recovery rules are in the
[conversion runbook](operations/postgresql-to-d1-conversion.md).

## Troubleshooting

- An engine or package-manager mismatch means the exact declared Node/pnpm versions
  are not active; switch versions and repeat the frozen install.
- A frozen-install failure means `package.json` and `pnpm-lock.yaml` disagree. Do not
  bypass it with a non-frozen CI install; reconcile dependencies in an authorized
  change.
- `pnpm validate` stops at the first failing child command and preserves its output.
- A `ci:*` command is useful for reproducing one hosted subsystem, but it is not a
  substitute for the full local gate when several surfaces changed.
- Worker/D1 migration and integration checks are local-only. The held manual delivery
  state machine is ineligible in the committed manifest; ordinary development and PR
  commands do not deploy, run a remote migration, or access staging/production state.
