---
evidence_id: VOC-083-EV-00
task_id: VOC-083-T00
acceptance_criteria: VOC-083-AC-00
test: VOC-083-TEST-00
status: provisional-selection-recorded
date: 2026-08-23
related_change: VOC-083
probe_base_sha: 20647e8e1eb4e5bc49e00e5fb186cfd85f98688b
selected_candidate: workers-native-sentry-adapters
selected_versions:
  - "@sentry/cloudflare@10.69.0"
  - "@sentry/react@10.69.0"
---

# VOC-083-T00 — Sentry/workerd candidate evidence and provisional decision

## Outcome and boundary

**Provisional selection:** replace `@sentry/nextjs` with the official, exact-version
platform adapters `@sentry/cloudflare@10.69.0` (Worker/server) and
`@sentry/react@10.69.0` (browser), and make the existing
`sentry.edge.config.ts` affected surface a custom Worker entry which wraps the
generated OpenNext handler with `withSentry`.

This is a T00 direction, not a canonical runtime change or final compatibility
claim. T01 must implement the direction and deterministic reporting seams. T02 still
owns the complete fresh-artifact manifest, prohibited-form classifier, local workerd
log classifier, and Worker/server/browser reporting-equivalence acceptance. If those
checks disprove this choice, implementation must stop and revise T00/T01 before a
replacement can ship.

The canonical T00 branch contains only this record and package status bookkeeping.
All runtime/config/dependency changes described below existed only in a detached,
disposable worktree and were deleted after the probes. No credential, hosted request,
Sentry event/API query, source-map upload, Cloudflare API call, deployment, or settings
mutation occurred.

## Current import, dependency, and generated-artifact inventory

Inventory was taken from exact base
`20647e8e1eb4e5bc49e00e5fb186cfd85f98688b` before changing a candidate.

### Direct Sentry imports

| Source | Direct package/API | Current capture or build role |
| --- | --- | --- |
| `apps/web/next.config.ts` | `withSentryConfig` from `@sentry/nextjs` | Build wrapper; upload disabled, telemetry disabled, debug statements excluded. |
| `apps/web/sentry.server.config.ts` | `@sentry/nextjs` `init` | Node/server initialization from `process.env`. |
| `apps/web/sentry.edge.config.ts` | `@sentry/nextjs` `init` | Edge initialization from `process.env`. |
| `apps/web/src/instrumentation.ts` | `@sentry/nextjs` plus the two config modules | Next registration and `captureRequestError`. |
| `apps/web/src/instrumentation-client.ts` | `@sentry/nextjs` | Browser initialization and App Router transition capture. |
| `apps/web/src/app/global-error.tsx` | `@sentry/nextjs` | Browser/global React error capture. |

There are no other direct `@sentry/*` imports under `apps/web`. The locked direct
package is `@sentry/nextjs@10.69.0` (the manifest range is `^10.69.0`). Its relevant
installed path is:

```text
@sentry/nextjs@10.69.0
  -> @sentry/server-utils@10.69.0
     -> @apm-js-collab/code-transformer-bundler-plugins@0.7.4
        -> @apm-js-collab/code-transformer@0.18.1
```

The server entry also exports the build configuration API. That reaches
`@sentry/server-utils/orchestrion/webpack`, whose transformer contains an inline
base64 Wasm program compiled at module evaluation. This is reachability, not merely
an installed-but-dead transitive package: the generated server handler contains the
code.

### Generated locations

OpenNext's configured entry is `.open-next/worker.js`. It dispatches into generated
modules including `.open-next/middleware/handler.mjs` and
`.open-next/server-functions/default/apps/web/{index,handler}.mjs`, with browser
assets below `.open-next/assets/_next/static/`. On the baseline probe, both observed
unsupported calls were in:

```text
apps/web/.open-next/server-functions/default/apps/web/handler.mjs:205
apps/web/.open-next/server-functions/default/apps/web/handler.mjs:718
```

Line numbers are directional probe evidence and may move after any rebuild. T02 must
not use this short list as its manifest; it must enumerate and classify every fresh
canonical artifact required by AC-01.

## Current primary-source evidence (retrieved 2026-08-23)

| Source | Material fact used here |
| --- | --- |
| [Cloudflare Workers web standards](https://developers.cloudflare.com/workers/runtime-apis/web-standards/) | Workers disallow runtime `WebAssembly.compile`, `compileStreaming`, buffer-source `instantiate`, and `instantiateStreaming`. |
| [Cloudflare Wasm in JavaScript](https://developers.cloudflare.com/workers/runtime-apis/webassembly/javascript/) | The supported shape imports a precompiled `.wasm` module and instantiates the resulting `WebAssembly.Module`. |
| [Cloudflare Wrangler bundling](https://developers.cloudflare.com/workers/wrangler/bundling/) | Wrangler bundles the configured main and supports the `workerd` export condition; a dry run is useful directional final-entry evidence. |
| [Cloudflare Wrangler module aliasing](https://developers.cloudflare.com/workers/wrangler/configuration/#module-aliasing) | A no-op alias requires a replacement module and applies while Wrangler bundles its input; it cannot retroactively rewrite an unsupported call already embedded inside OpenNext's generated handler. |
| [Sentry issue #22794](https://github.com/getsentry/sentry-javascript/issues/22794) | The upstream issue is still open and reproduces the same Next server-entry → build config → orchestrion/webpack → inline Wasm path. It suggests either aliasing the orchestrion build subpath or using Cloudflare runtime imports. |
| [`@sentry/nextjs@10.70.0` server entry](https://raw.githubusercontent.com/getsentry/sentry-javascript/10.70.0/packages/nextjs/src/index.server.ts) and [build-time source](https://raw.githubusercontent.com/getsentry/sentry-javascript/10.70.0/packages/nextjs/src/config/withSentryConfig/buildTime.ts) | The current stable update still exports the config barrel from the server entry and still statically imports `@sentry/server-utils/orchestrion/webpack`. |
| [`@sentry/cloudflare@10.69.0` README](https://raw.githubusercontent.com/getsentry/sentry-javascript/10.69.0/packages/cloudflare/README.md) and [manifest](https://raw.githubusercontent.com/getsentry/sentry-javascript/10.69.0/packages/cloudflare/package.json) | This is Sentry's official MIT-licensed Workers SDK. It requires the already-present `nodejs_compat` flag and documents wrapping an ESM handler with `withSentry`, plus manual `captureException`. |
| [`@sentry/react@10.69.0` manifest](https://raw.githubusercontent.com/getsentry/sentry-javascript/10.69.0/packages/react/package.json) | This exact MIT-licensed browser adapter supports React 19 and depends on the same 10.69 Sentry core/browser graph already present transitively. |
| [OpenNext custom Worker](https://opennext.js.org/cloudflare/howtos/custom-worker) | A custom Worker may import the generated `.open-next/worker.js` handler and delegate to it; Wrangler `main` then targets that wrapper. |
| [npm package metadata: Next 10.70](https://registry.npmjs.org/@sentry%2fnextjs/10.70.0), [Cloudflare 10.69](https://registry.npmjs.org/@sentry%2fcloudflare/10.69.0), [React 10.69](https://registry.npmjs.org/@sentry%2freact/10.69.0) | Registry metadata and downloaded package contents supplied exact version, license, dependency, integrity, and publish evidence. On retrieval, `10.70.0` (published 2026-08-10) was the latest stable `nextjs` and `cloudflare` tag. |

Reviewed package integrities:

```text
@sentry/nextjs@10.70.0
  sha512-HL6hoEARpdL/NH3uIQ/O9BczP5P3QLSWerQgv8C4/vZl3JPQOWmFsJEN0F8/dU4+OFqlPz3P52InZjaYO3MA+w==
@sentry/cloudflare@10.69.0
  sha512-CO6Tr74cw3Wx2DyWSfBCxR6EDcNfBjn52hxWacxHsLurpdfQ7Bp/J32m1KxzezR5CZXngfBTmemK3iZsMgt5uQ==
@sentry/react@10.69.0
  sha512-f0Il/JMteHjdWPNZQB3rtp1Pcj2Leb3p0KSZuv3rh0EUril9CbWtQVy5zJhoAppi+MWWmgRWa+6BpHbQf+ABQA==
```

## Candidate matrix

| Candidate | Exact reviewed shape | Workerd/Wasm result | Reporting and privacy disposition | Decision |
| --- | --- | --- | --- | --- |
| Scoped configuration fix | Keep `@sentry/nextjs@10.69.0`; retain current `withSentryConfig` privacy options or remove only the wrapper; consider an orchestrion no-op alias. | **Known incompatible / insufficient.** Current diagnostics-channel injection is not enabled, yet the static server barrel still reaches the build module. Upstream's control build reports that removing `withSentryConfig` alone leaves the runtime chunks unchanged. A Wrangler alias is downstream of the already-embedded call; a Turbopack alias needs a new replacement module and would stub internal build exports without a supported Sentry contract. | Keeping the SDK would preserve capture APIs, but the only promising alias is an unsupported internal-module shim whose reporting/build-time side effects cannot be bounded confidently. Existing source-map/telemetry options do not eliminate static reachability. | **Rejected.** Not a robust scoped configuration repair. |
| Reviewed Sentry update | Update only `@sentry/nextjs` to current stable `10.70.0`; package integrity above. | **Failed disposable probe.** Fresh OpenNext output still contained two `WebAssembly.compile` sites in the same generated handler. The transformer remained `0.18.1`. The 10.70 primary source still has the static orchestrion import. | Same public reporting API and privacy settings, but no compatibility improvement. Lockfile probe churn was 141 insertions / 58 deletions. `pnpm audit --audit-level high` exited 0 while still reporting the repository's one moderate advisory; this was not a compatibility reason to update. | **Rejected.** Latest stable package does not contain the required fix. |
| Workers-native adapters | Remove `@sentry/nextjs`; add exact `@sentry/cloudflare@10.69.0` and direct `@sentry/react@10.69.0`; wrap generated OpenNext handler; use Cloudflare `captureException` for Next server request errors and React capture/browser tracing for the client. | **Directional probe passed.** Fresh OpenNext scan: zero observed prohibited calls. Fresh Wrangler 4.125.0 dry-run bundle scan: zero. Local workerd smoke: pass. Removing Next Sentry also removed 93 installed packages in the probe and the orchestrion transformer was no longer in the runtime graph. | Official Worker wrapper owns per-request initialization and uncaught errors; `onRequestError` retains errors caught by Next; React retains browser/global capture and explicit browser tracing. No-DSN smoke made no outbound Sentry call. Enabled reporting, redaction, and all capture paths remain mandatory T01/T02 tests, not claimed by this probe. | **Selected provisionally.** Only candidate with no known Workers incompatibility and a documented reporting design. |

### Package, maintenance, privacy, rollback, and no-live comparison

- The configuration-only alias is the smallest lockfile change and repository-only
  rollback would be trivial, but it would permanently bind this application to an
  undocumented Sentry internal subpath and a locally maintained stub. That maintenance
  and reporting uncertainty outweighs its small diff; no live probe could resolve the
  unsupported contract.
- The 10.70 update is the current maintained stable line and is MIT licensed, but it
  fails the governing compatibility property. Its rollback would be a manifest/lockfile
  revert only and needs no migration or live action.
- The selected packages are both official MIT-licensed Sentry adapters. Exact 10.69
  keeps Worker, browser, and shared Sentry core versions aligned with the reviewed
  existing graph; `@sentry/react` was already transitive. Direct
  `@sentry/cloudflare` adds only its package snapshot against dependencies already in
  the 10.69 graph, while removing `@sentry/nextjs` deleted the much larger Next/Node/
  OpenTelemetry/build-plugin tail (93 installed packages in the probe). A future
  routine version review may move the exact pair only through a revised recorded
  decision and repeat of this compatibility evidence.
- Privacy controls are an acceptance condition, not a trade for compatibility: DSN,
  environment, and release mappings remain; debug and Spotlight stay explicitly off;
  source-map upload and build telemetry remain disabled; T01/T02 must prove redaction
  and no-DSN silence with a test transport. None of the three candidates required a
  secret, live Sentry result, Cloudflare mutation, or hosted deployment to evaluate.
- Rollback for the selected direction is a repository-only revert of the Worker main,
  adapter imports, manifest, and lockfile to this predecessor. There is no data
  migration or external state to reverse. Re-enabling the predecessor is not a release
  authorization and would restore its known local workerd rejection until a different
  reviewed repair exists.

### Native-adapter shape that was rejected inside the selected direction

An initial attempt to put an inline wrapper into OpenNext configuration was rejected:
it required a new direct `@opennextjs/aws` dependency, encountered edge-target Node
builtin resolution, and then hit OpenNext's custom-wrapper validation unless a
dangerous validation bypass was enabled. No bypass is selected. The successful shape
uses OpenNext's documented custom-Worker entry pattern and the already declared
`sentry.edge.config.ts` affected surface instead.

The first outer-wrapper probe also retained browser-side `@sentry/nextjs` imports. A
fresh SSR handler still contained one unsupported compile site because Turbopack chose
the package's server entry while building the server representation of a client
component. This is the important constraint from the probe: **every** app import of
`@sentry/nextjs`, not only the obvious server imports, must be removed. Replacing the
remaining browser/global imports with `@sentry/react` produced the zero-site result.

## Disposable probe record

All probes ran in one detached disposable worktree created at the exact base. Candidate
state was restored before the next candidate where applicable; after final evidence
collection, the entire worktree, ignored build output, package tarballs, and Wrangler
dry-run directories were deleted and `git worktree prune` was run. The canonical branch
was then verified clean at the exact base before this record was edited.

Representative bounded commands (no credentials or remote mode):

```bash
pnpm install --frozen-lockfile
pnpm run build:packages
pnpm --filter @vocanova/web cloudflare:build
pnpm --filter @vocanova/web typecheck
pnpm --filter @vocanova/web exec wrangler deploy --dry-run --env='' --outdir <temporary-directory>
pnpm --filter @vocanova/web cloudflare:preview:test
rg <prohibited-Wasm-forms> apps/web/.open-next <temporary-Wrangler-output>
```

Observed results:

| Probe | Result |
| --- | --- |
| Exact-base baseline build | Passed build; two generated `WebAssembly.compile` sites. |
| Exact-base local workerd request | HTTP assertions passed while workerd logged two unhandled `CompileError: WebAssembly.compile(): Wasm code generation disallowed by embedder` diagnostics. This confirms successful HTTP can mask the rejection. |
| `@sentry/nextjs@10.70.0` only | Build passed; two unsupported sites remained. |
| Incomplete native adapter retaining any `@sentry/nextjs` import | Build passed; one unsupported site remained. |
| Full native adapter, exact 10.69 pair, no `@sentry/nextjs` | OpenNext build and embedded TypeScript pass; zero observed prohibited sites in generated OpenNext JS/MJS. |
| Wrangler 4.125.0 dry run of custom main | Passed; 6,309,624-byte configured-main bundle plus map; zero observed prohibited sites. No deployment occurred. |
| Local workerd smoke with DSNs forced empty | Passed static, SSR, RSC, assets, middleware, auth redirect, service binding, and Sentry-disabled failure assertions. No external Sentry call. |

These scans are candidate evidence only. They did not implement AC-01's complete
manifest or buffer-source `instantiate` classifier and cannot substitute for T02.

## Exact provisional T01 configuration

T01 is unblocked to implement only this shape:

1. Remove `@sentry/nextjs` completely. Add exact, non-range direct dependencies
   `@sentry/cloudflare@10.69.0` and `@sentry/react@10.69.0`; regenerate and review the
   lockfile. Do not update either to 10.70 under this decision.
2. Change Wrangler `main` from `.open-next/worker.js` to the existing
   `sentry.edge.config.ts`. That module imports `.open-next/worker.js` and exports
   `withSentry(optionsFromEnv, openNextWorker)`. Preserve the existing
   `nodejs_compat` flag and service/assets bindings.
3. Worker options read DSN from `env.SENTRY_DSN ?? env.NEXT_PUBLIC_SENTRY_DSN`, use
   the existing environment/release fallbacks, and pin `debug: false` and
   `spotlight: false`. Missing DSN returns no Sentry options and must remain
   network-silent.
4. `src/instrumentation.ts` keeps a no-op `register` (the outer Worker owns request
   initialization) and maps Next's `onRequestError` to Cloudflare
   `captureException`. `sentry.server.config.ts` becomes an explicit no-op so it
   cannot restore the Next server barrel.
5. `instrumentation-client.ts` initializes `@sentry/react` with
   `browserTracingIntegration`, preserves the existing public DSN/environment/release
   mapping and debug/spotlight controls, and supplies a typed App Router transition
   hook using the React browser tracing primitives. `global-error.tsx` uses React
   `captureException`.
6. `next.config.ts` exports the plain Next config, explicitly keeps production browser
   source maps disabled, and contains no Sentry build plugin. The absence of the
   plugin, Sentry upload credentials, upload command, and build telemetry becomes an
   asserted replacement for the former `withSentryConfig` upload/telemetry controls;
   it is not permission to enable uploads or telemetry.
7. Add the T01 deterministic, in-memory reporting seams required by AC-02. They must
   exercise Worker uncaught/request capture, Next-caught request capture, React/global
   capture, no-DSN silence, and redaction without a real DSN or network call.

No new custom-worker path, OpenNext dangerous validation flag, source-map uploader,
telemetry, Sentry/Cloudflare credential, live request, deployment, or settings change
is selected.

## Remaining gate

T00 provisionally satisfies AC-00 and unblocks T01. It does **not** satisfy AC-01
through AC-05. Before the native choice can be accepted canonically, T01 must implement
the exact shape and reporting seams, then T02 must prove on one fresh canonical
revision that:

- every required generated and Wrangler-main JavaScript artifact is inventoried and
  free of every prohibited Wasm form;
- reporting-enabled Worker/server/global/browser errors reach the deterministic
  boundary with redaction, while missing DSN remains network-silent;
- successful HTTP cannot hide an unexpected workerd rejection; and
- all dependency, privacy, source-map, telemetry, service-binding, and no-live
  invariants pass.

Failure of any item returns the package to a revised T00 decision; it does not authorize
an unrecorded fallback.
