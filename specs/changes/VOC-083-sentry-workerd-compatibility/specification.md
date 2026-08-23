# VOC-083 — Specification

## Objective and requirement source

Resolve the reproducible OpenNext/workerd Sentry APM runtime failure in issue #105
without losing required web error reporting or weakening privacy/credential controls.
Cloudflare currently forbids runtime `WebAssembly.compile`, `compileStreaming`, buffer
`instantiate`, and `instantiateStreaming`; supported Worker Wasm is bundled/imported
as a precompiled module. The issue's generated bundle instead evaluates an unawaited
`WebAssembly.compile(...).then(WebAssembly.instantiate)` in the Sentry transformer
path. Cloudflare consequently reports an unhandled rejection even though the request
succeeds.

The authoritative implementation inputs, after adoption, are the selected candidate's
then-current primary Cloudflare and Sentry evidence, this package, ADR-0003, and the
VOC-080/VOC-081 boundaries. The external references below are research inputs, not
authority to change a live service.

## Scope and non-goals

In scope:

- establish a reproducible build-to-generated-bundle-to-local-workerd evidence chain;
- select and implement one Workers-safe Sentry server-runtime/bundling approach;
- preserve browser and server error capture appropriate to their runtimes, including
  Next request-error and global-error paths where the selected SDK supports them;
- add a generated-bundle invariant and a workerd smoke failure for unexpected
  unhandled rejection/error output, including the HTTP-success case; and
- reconcile affected scripts, lockfile/dependency rationale, CI command ownership, and
  active documentation.

Out of scope:

- silently disabling Sentry, stripping all Sentry imports, changing product error UX,
  source-map upload, Sentry project/account administration, API queries, DSN rotation,
  real event verification, pricing, new analytics, deployment, Cloudflare resource
  changes, or modification of VOC-080 holds;
- accepting a successful HTTP response as evidence when workerd emits an unexpected
  runtime error/rejection; and
- adopting or relying on VOC-082.

## Requirements

### VOC-083-R00 — Evidence-based candidate selection

Before changing runtime code, the builder must record a version-pinned comparison of
all three candidates below, including direct imports/exports, generated-bundle reach-
ability, supported reporting semantics, dependency/license/audit effects, maintenance
status, rollback, and test evidence. Primary Cloudflare and Sentry documentation and
the relevant Sentry upstream defect/release evidence must be captured with access date.

1. A **configuration fix**: an OpenNext/Next/Sentry build configuration or alias that
   excludes only a verified build-time transformer path from the Worker runtime.
2. A **package update**: a minimal locked `@sentry/nextjs` and/or related Sentry update
   only if upstream evidence identifies a compatible fix and the regenerated lockfile,
   licenses, audit, API surface, and generated bundle are reviewed.
3. A **Workers-native adapter**: use the official Workers-targeted Sentry runtime (for
   example `@sentry/cloudflare`) for server-side Worker instrumentation while retaining
   an appropriate browser SDK and every required Next integration only where it is
   demonstrably Worker-safe.

The comparison must reject any option that relies on unsupported runtime Wasm, removes
required capture merely to pass, adds an unreviewed broad alias, or requires a secret,
Sentry API/live query, or Cloudflare action. The selected option must be recorded as a
bounded implementation decision with its rejected alternatives and exact versions; if
no option preserves required capture, stop and open a new decision rather than degrade
observability.

### VOC-083-R01 — Workers-safe generated bundle

The generated OpenNext Worker and all runtime chunks reachable on its module-evaluation
or request paths must not call `WebAssembly.compile`, `WebAssembly.compileStreaming`,
`WebAssembly.instantiate` with a buffer/source, or `WebAssembly.instantiateStreaming`.
The invariant must inspect actual generated output after the canonical OpenNext build,
not merely TypeScript source or `next build` intermediates. It must include positive
fixtures proving that the detector fails on each prohibited spelling/compiled path and
must avoid false claims that the absence of the current base64 blob proves future
compatibility.

### VOC-083-R02 — Reporting and privacy are preserved

The selected approach must retain enabled-DSN runtime initialization and capture paths
for the supported server/Worker request-error surface, global errors, and browser
errors; disabled-DSN local behavior remains a no-network no-op. Tests may use an
in-memory/test transport or equivalent injected boundary, but must not send an event,
query Sentry, or use a real DSN. A capture test must prove that a synthetic exception
reaches the selected SDK boundary without exposing cookie, token, learner, request-body,
or provider content.

`withSentryConfig`/build configuration behavior must be retained or replaced only with
evidence that source-map upload remains explicitly disabled, no `org`/`project`/
`authToken` or Sentry CLI is introduced, Sentry build telemetry remains disabled, and
browser debug/spotlight output remains disabled. Existing local-loop environment
allowlists must continue to blank Sentry DSNs/tokens and reject their inheritance.

### VOC-083-R03 — Workerd logs are first-class smoke evidence

The canonical workerd test and the two-Worker local-stack smoke must collect bounded
stdout/stderr from both Wrangler processes. After readiness and before successful exit,
they must fail on an unexpected unhandled rejection or runtime error diagnostic even if
all HTTP assertions return success. The allowlist, if any, must be narrow, documented,
and fixture-tested; it must never blanket-ignore `unhandledRejection`,
`unhandledrejection`, `CompileError`, or generic error text. On failure, diagnostics
must be redacted, bounded, and emitted without secrets or personal data.

### VOC-083-R04 — Deterministic, credential-free integration

The selected work must remain within the existing four workflow inventory. The named
web/local-stack jobs and required aggregate must run the bundle invariant and real
workerd negative fixture where applicable. Frozen installs, disabled source-map upload,
local service binding, local D1 state, disabled Sentry DSNs, no Sentry API/live query,
and no remote Cloudflare operation remain mandatory. Any dependency change must be
minimal, locked, audited at the documented threshold, and independently reviewed.

## Compatibility, failure, and accessibility

No user-visible error page, route, status, accessibility behavior, auth redirect, or
service-binding contract may change. A rejected candidate must leave the current
instrumentation intact until a replacement has passed its reporting-equivalence and
workerd tests. Build or log-invariant failure blocks CI; an unexpected rejection is not
made acceptable by changing the log parser or suppressing reporting.

## External research references

- Cloudflare Workers JavaScript restrictions: https://developers.cloudflare.com/workers/runtime-apis/web-standards/
- Cloudflare Wasm JavaScript guidance: https://developers.cloudflare.com/workers/runtime-apis/webassembly/javascript/
- Sentry JavaScript SDK repository/package support inventory: https://github.com/getsentry/sentry-javascript
- Upstream reproduction and candidate workarounds (not an adopted solution): https://github.com/getsentry/sentry-javascript/issues/22794
