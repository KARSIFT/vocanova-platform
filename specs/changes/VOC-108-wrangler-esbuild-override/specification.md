# VOC-108 — Specification

## Objective and requirement source

[Issue #196](https://github.com/KARSIFT/vocanova-platform/issues/196) records the
bounded correction needed to remediate the esbuild deadlock investigated by adopted
VOC-107: esbuild 0.28.2 contains the upstream repair, but the active pnpm override
location is `pnpm-workspace.yaml`, a path deliberately absent from VOC-107's adopted
candidate inventory.

This package authorizes no change until it is independently reviewed and adopted.
Its sole dependency-policy edit is the exact `wrangler>esbuild: 0.28.2` workspace
override. The intended implementation also includes the resulting mechanically
coupled lockfile reconciliation and deterministic command evidence of the effective
toolchain resolutions.

## Requirements

### VOC-108-D00 — Record the exact starting resolution

At the reviewed base, both local consumers declare and lock Wrangler `4.125.0`, and
a `createRequire()` rooted at that Wrangler package resolves esbuild `0.28.1`.
Issue #196 instead says Wrangler `4.127.1`; that statement is stale intake narrative,
not repository evidence. Re-record the exact versions at the implementation base
and stop for reconciliation if either differs. This is not authority to update
Wrangler or any other declared dependency.

### VOC-108-D01 — Use pnpm's canonical override location

Add the exact scoped override `"wrangler>esbuild": "0.28.2"` to the existing
`overrides` section of `pnpm-workspace.yaml`. Do not place it in package manifests,
add direct dependencies, or change another override.

### VOC-108-D02 — Preserve a frozen, minimal dependency graph

Regenerate `pnpm-lock.yaml` only to represent the scoped override. The locked
Wrangler dependency must resolve esbuild 0.28.2, and `pnpm install
--frozen-lockfile` must remain valid. Pnpm mechanically reuses that esbuild instance
in the existing Vite `8.2.2` context, so the resulting Vite/Vitest,
`@vitest/mocker`, and `@cloudflare/vitest-plugin` peer-context keys and references
may change from esbuild 0.28.1 to 0.28.2. This mechanically coupled effective
esbuild toolchain resolution change is authorized and must be tested; the Vite,
Vitest, `@vitest/mocker`, and `@cloudflare/vitest-plugin` package versions may not
change. Any delta outside the override, esbuild 0.28.2 package/platform snapshots,
Wrangler edge, and those exact context rewrites is a blocking scope finding.

### VOC-108-D03 — Establish deterministic regression evidence

After a frozen install, a no-network Node assertion must resolve the `esbuild`
package using a `createRequire()` rooted at each actual local Wrangler package, not
the root module path. A separate baseline inventory must record Wrangler `4.125.0`
and esbuild `0.28.1`; the exact-`0.28.2` assertion against that baseline must fail.
The inline verifier must execute negative probes for a missing package, malformed
version, and different version, confirming each is rejected without a committed
fixture or test file. This demonstrates the deterministic regression gap without
trying to reproduce the intermittent hosted race.

### VOC-108-D04 — Retain every existing local-stack control

This dependency-resolution correction must not hide the deadlock or change the
fail-closed local-stack behavior. The topology, process lifecycle, cleanup, timeout,
retry, D1, credentials, remote-mode, service-binding, diagnostic, workflow, and
application boundaries established by VOC-107 remain unchanged.

### VOC-108-D05 — Bound delivery and authority

One implementation PR may modify only `pnpm-workspace.yaml` and `pnpm-lock.yaml`.
It may run deterministic evidence commands, but it may not add a test harness,
modify source or workflows, contact Cloudflare, dispatch a workflow, deploy, migrate
D1, change settings or secrets, access production/data, spend, change DNS/traffic,
or launch anything.

## Risk and protected areas

The plan and implementation are R3 because the target resolution controls esbuild
inside the required local-stack CI boundary. This is not R4: no external mutation,
privacy impact, launch, strategic decision, or hard-to-reverse action is included.
EHR is not triggered.
