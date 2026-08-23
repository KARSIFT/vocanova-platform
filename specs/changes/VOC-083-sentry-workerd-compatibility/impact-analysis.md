# VOC-083 — Impact Analysis

## Consequence classification

R3 is the effective floor: the likely implementation changes a production-targeted
Worker runtime dependency/instrumentation boundary and CI-required local evidence.
It has no authorized live effect. R4 is required if a candidate would alter product
privacy policy, require a material architecture decision, expand autonomous authority,
or execute a held external action.

## Runtime, dependency, and bundle impact

`apps/web/next.config.ts` imports `withSentryConfig`; `apps/web/open-next.config.ts`,
`apps/web/wrangler.jsonc`, generated `worker-configuration.d.ts`, and `.env.example`
are candidate/configuration review surfaces. Server/edge instrumentation, Next request-
error capture, and `global-error.tsx` import `@sentry/nextjs`.
`pnpm-lock.yaml` resolves `@sentry/nextjs@10.69.0` and the
`@apm-js-collab/code-transformer@0.18.1` path. The bundle boundary is therefore
affected even where source code has no explicit `WebAssembly` reference. The selected
candidate must prove the generated Worker, not infer safety from source-level imports.

`apps/web/scripts/test-workerd.mjs` currently accumulates Wrangler output only for a
request assertion failure. `scripts/foundation/local-stack-smoke.mjs` owns the
two-Worker evidence. Both must be reviewed for bounded capture, process cleanup, and
redaction so a successful response cannot conceal a runtime failure. The local
development supervisor/policy and their tests are protected review surfaces because
they strip DSNs/tokens; modify them only if the selected candidate requires a proven,
bounded adjustment. Any candidate requiring a file outside `affected_areas` must stop
for a separately reviewed scope change rather than edit it opportunistically.

## Security and privacy

The principal risk is treating an empty local DSN or a source-only scan as proof that
reporting remains functional. Controls are a test-only/in-memory transport, synthetic
exceptions, explicit enabled/disabled configuration branches, static/bundle analysis,
and a specialist review of event filtering. Logs must not include DSNs, auth tokens,
cookies, request bodies, learner data, or provider payloads.

No Sentry API token, `sentry-cli`, org/project/auth token, source-map upload, remote
event assertion, or Sentry account query is permitted. Existing source-map disablement,
build telemetry disablement, browser debug/spotlight disablement, and local supervisor
DSN/token stripping are protected behaviors, not optional cleanup.

## Service binding, accessibility, and product behavior

The web-to-API `API` service binding and existing static/SSR/RSC/middleware/auth paths
remain required smoke coverage. No endpoint, accessibility semantics, error UI,
authentication behavior, or product analytics changes are planned. A candidate that
cannot preserve a relevant Sentry capture feature must document it as a blocker, not
silently drop it.

## Documentation and CI/CD

Potential active documentation targets are `docs/development.md` (local command and
workerd guarantees), DOC-11 (runtime error-monitoring statement), and ADR-0003
(OpenNext/Worker compatibility). Update them only if implementation changes their
current truthful claims; historical Sentry packages remain historical evidence. CI may
change commands/jobs only inside `ci.yml`; all four workflows and credential-free
pull-request behavior remain invariant.

## Risks, dependencies, and evidence

- `VOC-083-RISK-00`: a broad alias/update hides runtime Wasm by removing required
  capture. Mitigation: three-way evidence matrix plus capture-equivalence tests.
- `VOC-083-RISK-01`: a source scan misses a generated/minified call or stale/subset
  output makes a scan look clean. Mitigation: same-job fresh build/dry-run, deterministic
  complete artifact manifest, missing/zero/partial-inventory failures, positive and
  supported-module fixtures, and real workerd execution.
- `VOC-083-RISK-02`: log matching is so broad that it creates false passes/failures or
  leaks data. Mitigation: narrow classified diagnostics, bounded redacted output, and
  positive/negative parser fixtures.
- `VOC-083-RISK-03`: an Sentry update alters transitive packages or build behavior.
  Mitigation: minimal lockfile diff, frozen install, audit, license/provenance review,
  generated-bundle diff, and rollback.
- `VOC-083-DEP-00`: selection evidence is deliberately unresolved at drafting time.
  After adoption it authorizes T00 evidence-only selection; it blocks T01+ runtime
  changes, not package adoption itself.
- `VOC-083-EV-00` through `EV-06`: candidate matrix, bundle scan, capture contract,
  smoke-log fixtures, CI/docs inventory, and exact-SHA review/rollback evidence.

## Rollback

Repository rollback reverts the selected instrumentation/configuration, dependency
lockfile, tests, and documentation in reverse task order and reruns the predecessor's
checks. It neither contacts Sentry/Cloudflare nor deletes local state. A regression in
error reporting is a rollback trigger, but rollback evidence must clearly say that it
restores repository code only—not a live Sentry configuration or Worker deployment.
