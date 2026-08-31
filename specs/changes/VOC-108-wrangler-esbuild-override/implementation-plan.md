# VOC-108 — Implementation Plan

## Preconditions and delivery shape

Do not implement until this exact package is independently reviewed, adopted, and
present on `develop`. Use one isolated branch/worktree, one minimum-sufficient task,
and one coherent implementation PR into `develop`.

## Existing-file reconciliation

| Path                                                                                            | Classification                     | Reconciliation                                                                                                                                                                                          |
| ----------------------------------------------------------------------------------------------- | ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm-workspace.yaml`                                                                           | present-needs-reconciliation       | Add only `"wrangler>esbuild": "0.28.2"` inside the existing `overrides` map; preserve every current setting and override.                                                                               |
| `pnpm-lock.yaml`                                                                                | present-needs-reconciliation       | Regenerate the override, esbuild 0.28.2 package/platform snapshots and Wrangler edge, plus the mechanically coupled Vite/Vitest peer-context references; reject package-version changes or other churn. |
| local-stack scripts/tests, package manifests, workflows, configs, docs, and historical packages | present-compatible-or-out-of-scope | Do not edit. The deterministic resolution assertion is an implementation evidence command, so a source test harness would exceed the approved two-file diff.                                            |

## Ordered implementation

1. Record the exact base SHA and run the baseline inventory command below. Require
   both consumers to report Wrangler 4.125.0/esbuild 0.28.1; stop if repository
   state differs. Then run the exact-0.28.2 assertion unchanged and retain its
   expected nonzero baseline result.
2. Add only the scoped workspace override under the existing root `overrides` map.
3. Regenerate the lockfile with the repository's pinned pnpm version, without
   changing package manifests or unrelated overrides. Inspect `git diff --
pnpm-workspace.yaml pnpm-lock.yaml` and stop for a separate plan if unrelated
   dependency changes appear. Permit only the enumerated Vite/Vitest peer-context
   key/reference rewrites to esbuild 0.28.2; do not permit their package versions to
   change.
4. Run a frozen install. Re-run the `createRequire()` assertion for every local
   Wrangler consumer; require esbuild package version exactly `0.28.2` and prove
   the inline executable negative probes for missing, malformed, and different
   versions. Do not add a fixture or repository test file and do not use network,
   Wrangler commands, or Cloudflare credentials for this evidence.
5. Run the focused local-stack and workspace validations. Confirm the deadlock
   diagnostic remains fail-closed and the implementation diff contains exactly the
   two approved files.
6. Obtain exact-SHA dependency/local-runtime specialist review and a separate
   independent R3 verdict. Resolve every blocker with fresh checks and fresh
   different-actor review of any changed SHA; a separate non-author actor merges.

## Validation commands

- `pnpm install --frozen-lockfile`
- the baseline inventory below, which must report Wrangler `4.125.0` and esbuild
  `0.28.1` for both consumers before the override:

  ```sh
  node --input-type=module --eval '
  import { createRequire } from "node:module";
  for (const workspace of ["apps/api-worker", "apps/web"]) {
    const fromWorkspace = createRequire(new URL(`./${workspace}/package.json`, import.meta.url));
    const wranglerPackage = fromWorkspace.resolve("wrangler/package.json");
    const wrangler = fromWorkspace(wranglerPackage);
    const esbuild = createRequire(wranglerPackage)("esbuild/package.json");
    console.log(`${workspace}: wrangler=${String(wrangler.version)} esbuild=${String(esbuild.version)}`);
  }'
  ```

- the no-network assertion below with `EXPECTED_ESBUILD_VERSION=0.28.2` both at
  the pre-override base (expected nonzero after recording observed 0.28.1) and after
  the frozen install (expected zero):

  ```sh
  EXPECTED_ESBUILD_VERSION=0.28.2 node --input-type=module --eval '
  import { createRequire } from "node:module";
  const expected = process.env.EXPECTED_ESBUILD_VERSION;
  if (!/^0\.28\.\d+$/.test(expected ?? "")) throw new Error("invalid expected esbuild version");
  function assertExact(label, version) {
    if (typeof version !== "string" || version !== expected) {
      throw new Error(`${label}: resolved ${String(version)}, expected ${expected}`);
    }
  }
  function versionFrom(load) {
    return load("esbuild/package.json")?.version;
  }
  function requireFailure(label, operation) {
    try { operation(); } catch {
      console.log(`${label}: rejected as required`);
      return;
    }
    throw new Error(`${label}: negative probe unexpectedly passed`);
  }
  requireFailure("missing package", () => assertExact("missing package", versionFrom(() => {
    const error = new Error("synthetic missing package");
    error.code = "MODULE_NOT_FOUND";
    throw error;
  })));
  requireFailure("malformed version", () => assertExact("malformed version", versionFrom(() => ({ version: 28 }))));
  requireFailure("different version", () => assertExact("different version", versionFrom(() => ({ version: "0.28.1" }))));
  for (const workspace of ["apps/api-worker", "apps/web"]) {
    const fromWorkspace = createRequire(new URL(`./${workspace}/package.json`, import.meta.url));
    const wranglerPackage = fromWorkspace.resolve("wrangler/package.json");
    const fromWrangler = createRequire(wranglerPackage);
    assertExact(`${workspace}: Wrangler esbuild`, versionFrom(fromWrangler));
  }'
  ```

- `pnpm run ci:local-stack`
- `pnpm validate`
- `bash scripts/governance/validate-governance.sh`
- `bash scripts/governance/classify-change-risk.sh`
- `git diff --check`

The assertion resolves `esbuild` from Wrangler's module context, so a top-level copy
cannot satisfy it. Its inline negative probes exercise the same version extraction
and exact-match functions for missing, malformed, and different results without a
committed test file. It runs offline after the frozen install, needs no credential,
and must not expose unrelated environment values. Do not claim an unavailable
command passed.

## Deployment and rollback

No deployment, dispatch, Cloudflare command, D1 migration, or external action is
part of this change. Before merge, close the PR with no effect. After merge, use a
separately reviewed revert PR that restores the two implementation files to the
last-known-good pre-implementation revision and reruns the same checks.
