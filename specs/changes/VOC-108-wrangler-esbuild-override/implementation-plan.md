# VOC-108 — Implementation Plan

## Preconditions and delivery shape

Do not implement until this exact package is independently reviewed, adopted, and
present on `develop`. Use one isolated branch/worktree, one minimum-sufficient task,
and one coherent implementation PR into `develop`.

## Existing-file reconciliation

| Path                                                                                            | Classification                     | Reconciliation                                                                                                                                               |
| ----------------------------------------------------------------------------------------------- | ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `pnpm-workspace.yaml`                                                                           | present-needs-reconciliation       | Add only `"wrangler>esbuild": "0.28.2"` inside the existing `overrides` map; preserve every current setting and override.                                    |
| `pnpm-lock.yaml`                                                                                | present-needs-reconciliation       | Regenerate only the entries required by the scoped override, then inspect the diff for unrelated version or integrity changes.                               |
| local-stack scripts/tests, package manifests, workflows, configs, docs, and historical packages | present-compatible-or-out-of-scope | Do not edit. The deterministic resolution assertion is an implementation evidence command, so a source test harness would exceed the approved two-file diff. |

## Ordered implementation

1. Record the exact base SHA and use `createRequire()` rooted at each installed local
   `wrangler/package.json` to record its current esbuild package version. Run the
   planned exact-0.28.2 assertion and retain its expected nonzero baseline result.
2. Add only the scoped workspace override under the existing root `overrides` map.
3. Regenerate the lockfile with the repository's pinned pnpm version, without
   changing package manifests or unrelated overrides. Inspect `git diff --
pnpm-workspace.yaml pnpm-lock.yaml` and stop for a separate plan if unrelated
   dependency changes appear.
4. Run a frozen install. Re-run the `createRequire()` assertion for every local
   Wrangler consumer; require esbuild package version exactly `0.28.2` and prove
   nonzero failure for missing, malformed, or altered expected versions in an
   isolated fixture/context. Do not use network, Wrangler commands, or Cloudflare
   credentials for this evidence.
5. Run the focused local-stack and workspace validations. Confirm the deadlock
   diagnostic remains fail-closed and the implementation diff contains exactly the
   two approved files.
6. Obtain exact-SHA dependency/local-runtime specialist review and a separate
   independent R3 verdict. Resolve every blocker with fresh checks and fresh
   different-actor review of any changed SHA; a separate non-author actor merges.

## Validation commands

- `pnpm install --frozen-lockfile`
- the no-network assertion below, first with `EXPECTED_ESBUILD_VERSION=0.28.1`
  against the pre-override base (expected nonzero), then with
  `EXPECTED_ESBUILD_VERSION=0.28.2` after the frozen install (expected zero):

  ```sh
  EXPECTED_ESBUILD_VERSION=0.28.2 node --input-type=module --eval '
  import { createRequire } from "node:module";
  const expected = process.env.EXPECTED_ESBUILD_VERSION;
  if (!/^0\\.28\\.\\d+$/.test(expected ?? "")) throw new Error("invalid expected esbuild version");
  for (const workspace of ["apps/api-worker", "apps/web"]) {
    const fromWorkspace = createRequire(new URL(`./${workspace}/package.json`, import.meta.url));
    const wranglerPackage = fromWorkspace.resolve("wrangler/package.json");
    const fromWrangler = createRequire(wranglerPackage);
    const esbuild = fromWrangler("esbuild/package.json");
    if (typeof esbuild.version !== "string" || esbuild.version !== expected) {
      throw new Error(`${workspace}: Wrangler resolved ${String(esbuild.version)}, expected ${expected}`);
    }
  }'
  ```

- `pnpm run ci:local-stack`
- `pnpm validate`
- `bash scripts/governance/validate-governance.sh`
- `bash scripts/governance/classify-change-risk.sh`
- `git diff --check`

The assertion resolves `esbuild` from Wrangler's module context, so a top-level copy
cannot satisfy it. It runs offline after the frozen install, needs no credential, and
must not expose unrelated environment values. Do not claim an unavailable command
passed.

## Deployment and rollback

No deployment, dispatch, Cloudflare command, D1 migration, or external action is
part of this change. Before merge, close the PR with no effect. After merge, use a
separately reviewed revert PR that restores the two implementation files to the
last-known-good pre-implementation revision and reruns the same checks.
