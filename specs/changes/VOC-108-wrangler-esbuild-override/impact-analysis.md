# VOC-108 — Impact Analysis

## Dependency and local-stack impact

The sole dependency-policy edit is the scoped `wrangler>esbuild: 0.28.2` override,
the narrow upstream remediation identified in issue #196. The local-stack scripts,
CI workflow, Worker configuration, D1 state, and application code are untouched.
The reviewed base actually uses Wrangler 4.125.0/esbuild 0.28.1 in both local
consumers, not issue #196's stated Wrangler 4.127.1. The implementation must recheck
that baseline and stop if it changes; this is never license for a Wrangler update.

Pnpm's mechanical lock re-resolution also moves existing Vite 8.2.2 and Vitest
4.1.11 peer-context references from esbuild 0.28.1 to the new 0.28.2 instance. This
is an authorized and tested effective esbuild toolchain resolution change. It does
not change the Vite, Vitest, `@vitest/mocker`, or `@cloudflare/vitest-plugin`
package versions.

## Security and privacy

No secret, credential, personal data, production data, external API, or network
request is needed for the deterministic resolution assertion. Existing credential
stripping, loopback-only, no-remote-mode, and fail-closed diagnostic handling remain
unchanged. A dependency resolution error or failed assertion blocks validation.

## Data, migrations, analytics, and accessibility

There is no application data, database, migration, analytics, UI, or accessibility
change. D1 state and all Cloudflare environments remain outside scope.

## Rollback and external effects

Before merge, closing the PR has no effect. After merge, a separately reviewed revert
PR restores the two permitted files to the last known good `develop` revision and
reruns the same frozen-install and resolution checks. A repository merge does not
dispatch or deploy, and no external effect is authorized by this package.

## Risks, dependencies, and evidence

- `VOC-108-R00`: A broad or direct dependency update could alter unrelated toolchain
  behavior. Mitigation: exact two-file allowance and zero-unrelated-lockfile-delta
  review.
- `VOC-108-R01`: A top-level esbuild package could make a superficial assertion pass.
  Mitigation: resolve esbuild through each Wrangler package's `createRequire()`
  context and run negative cases.
- `VOC-108-R02`: Pnpm's coupled Vite/Vitest peer-context rewrite could be mistaken
  for representation-only or unrelated churn and its effective toolchain change
  could be left untested. Mitigation: authorize only the enumerated effective
  resolution and context-key/reference changes, prohibit package-version changes,
  and run the full workspace validation.
- `VOC-108-DEP-00`: Issue #196 and its cited upstream remediation.
- `VOC-108-DEP-01`: Adopted VOC-107 local-stack control boundaries.
- `VOC-108-EV-00` through `VOC-108-EV-04`: defined in the test plan.
