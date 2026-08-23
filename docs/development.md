# Local development

## Prerequisites

- Node.js `24.18.0` (LTS), declared in `.nvmrc` and `package.json`.
- pnpm `11.14.0`, declared by the root `packageManager` field.
- Go `1.26.5`, declared by `apps/api/go.mod` (`go1.26.0` language level and
  `go1.26.5` toolchain).

From a clean checkout, enable Corepack and install the exact frozen dependency graph:

```bash
corepack enable
corepack prepare pnpm@11.14.0 --activate
pnpm install --frozen-lockfile
```

Go downloads the declared toolchain when needed. This requires ordinary access to the
official Go toolchain distribution and no repository secret.

## Root commands

| Command             | Purpose                                                                         |
| ------------------- | ------------------------------------------------------------------------------- |
| `pnpm dev`          | Run the Next.js development server with local Cloudflare binding simulation.    |
| `pnpm validate`     | Run workspace, format, lint/vet, type, test, and build validation.              |
| `pnpm lint`         | Lint web, packages, Worker API, and run `go vet` on the reference API.          |
| `pnpm typecheck`    | Type-check the web, Worker API, and shared packages.                            |
| `pnpm test`         | Run foundation, client, web, Worker/D1, and Go-reference tests.                 |
| `pnpm build`        | Build the web, Worker API, shared packages, and Go parity reference.            |
| `pnpm format:check` | Check Prettier and `gofmt` formatting without writing.                          |
| `pnpm format`       | Apply Prettier and `gofmt` formatting.                                          |
| `pnpm audit`        | Fail when the pnpm production dependency graph has a high or critical advisory. |

The full `pnpm validate` command remains the pre-review local gate. GitHub Actions
uses the following stable subsystem entry points so a failure names the affected
surface while preserving the same underlying scripts:

| Command              | Hosted check surface                                                                                    |
| -------------------- | ------------------------------------------------------------------------------------------------------- |
| `pnpm ci:foundation` | Workspace shape, formatting, shared-package prerequisite build, and foundation tests                    |
| `pnpm ci:packages`   | Shared-package lint, typecheck, build, and API-client tests                                             |
| `pnpm ci:web`        | Web lint/type/unit plus OpenNext build, typed config, dry-run/limits, and workerd proof                 |
| `pnpm ci:worker-api` | API-client compatibility plus Hono/Worker/D1 lint, types, safety, workerd, contract, build, and dry-run |
| `pnpm ci:api`        | Transitional Go API vet, tests, and build                                                               |

The commands intentionally overlap where a subsystem must prove its own prerequisites.
The `CI / ci required` job succeeds only when every named subsystem succeeds. Quality and
Security have equivalent stable `quality required` and `security required` aggregates. The shared
`.github/actions/setup-toolchain` action reads the exact versions already declared in
the repository, installs with the frozen lockfile, and caches only package-manager or
Go download/build stores. Cache contents are an optimization: `node_modules` is never
cached, and a miss cannot skip installation or validation.

The audit policy permits moderate and low advisories to be reported without failing;
all reported advisories remain visible and must be recorded in the pull request.

## Project-specific commands

Use `pnpm --filter @vocanova/web dev`, `build`, `start`, `lint`, or `typecheck` for
the Next.js application. `build`/`start` remain fast Node-based UI and legacy parity
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
ID, credential, route, or deploy authority. Local preview uses only simulation. T03
does not run `deploy`, `upload`, remote development, or any Cloudflare account query.
Wrangler's local startup profile is diagnostic because host CPUs differ; a future held
version upload must supply the authoritative platform startup measurement.

The TypeScript API target lives at `apps/api-worker`; `apps/api` remains the Go
contract and behavior reference until full parity. Its credential-free commands are:

| Command                                             | Purpose                                                                                          |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `pnpm --filter @vocanova/api-worker types:write`    | Regenerate D1/runtime binding types from the local Wrangler configuration.                       |
| `pnpm --filter @vocanova/api-worker types:check`    | Fail when committed Wrangler types are stale.                                                    |
| `pnpm --filter @vocanova/api-worker test`           | Run Hono, CORS, redaction, repository, migration, and D1 tests inside local workerd.             |
| `pnpm --filter @vocanova/api-worker safety:check`   | Reject dynamic/unsafe SQL, destructive foundation migrations, sensitive logs, and remote config. |
| `pnpm --filter @vocanova/api-worker openapi:check`  | Compare Hono's generated operational OpenAPI with the committed deterministic artifact.          |
| `pnpm --filter @vocanova/api-worker contract:check` | Bind the Worker migration baseline to the canonical Go `/api/v1` OpenAPI and API client.         |
| `pnpm --filter @vocanova/api-worker dry-run`        | Bundle the Worker without uploading, provisioning, or querying Cloudflare.                       |
| `pnpm ci:worker-api`                                | Run the complete Worker API/local-D1 hosted command, including API-client compatibility.         |

`wrangler.jsonc` contains one local D1 name and the non-remote sentinel ID
`local`; it contains no Cloudflare account/resource identifier or credential.
Vitest applies the forward migration to isolated local D1 storage twice, proving
from-empty and replay behavior. T10 owns future staging/production D1 identifiers,
environment secrets, routes, and held deployment/migration commands.

Run API commands from `apps/api`:

```bash
gofmt -l .
go vet ./...
go build ./...
go test ./...
```

`ent/` and `migrations/` are non-executable structural foundations only.

## Troubleshooting

- An engine or package-manager mismatch means the exact declared Node/pnpm versions
  are not active; switch versions and repeat the frozen install.
- A frozen-install failure means `package.json` and `pnpm-lock.yaml` disagree. Do not
  bypass it with a non-frozen CI install; reconcile dependencies in an authorized
  change.
- `pnpm validate` stops at the first failing child command and preserves its output.
- A `ci:*` command is useful for reproducing one hosted subsystem, but it is not a
  substitute for the full local gate when several surfaces changed.
- Go may download `go1.26.5` on first use. A network failure is not a passing API
  check; restore official toolchain access and rerun it.
- An agent/CI sandbox may have an unreachable internal `GOPROXY` (e.g. a private-network
  mirror) and/or `GOSUMDB=off` set by default. Neither is a repository requirement -
  `go env GOPROXY` / `go env GOSUMDB` show the active values. If the toolchain download
  or a module fetch fails, retry with the public defaults rather than assuming the
  build is broken:
  ```bash
  GOPROXY=https://proxy.golang.org,direct GOSUMDB=sum.golang.org go build ./...
  ```
  `GOSUMDB=off` specifically blocks the Go _toolchain_ download itself (distinct from
  disabling module checksum verification, which it also does) - re-enabling it is
  required to fetch a missing `go1.26.5`, e.g. via `go install golang.org/dl/go1.26.5@latest`
  then `go1.26.5 download`.
- Worker/D1 migration and integration checks are local-only. No command in the current
  repository deploys, runs a remote migration, or accesses staging/production state.
