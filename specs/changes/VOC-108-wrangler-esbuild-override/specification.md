# VOC-108 — Specification

## Objective and requirement source

[Issue #196](https://github.com/KARSIFT/vocanova-platform/issues/196) records the
bounded correction needed to remediate the esbuild deadlock investigated by adopted
VOC-107: esbuild 0.28.2 contains the upstream repair, but the active pnpm override
location is `pnpm-workspace.yaml`, a path deliberately absent from VOC-107's adopted
candidate inventory.

This package authorizes no change until it is independently reviewed and adopted.
Its intended implementation is only the exact `wrangler>esbuild: 0.28.2` workspace
override, the resulting lockfile reconciliation, and deterministic command evidence
of the resolved dependency edge.

## Requirements

### VOC-108-D00 — Record the exact starting resolution

At the implementation SHA, record the precise Wrangler and esbuild versions that
pnpm resolves for each local Wrangler consumer. Issue #196's version narrative is
input evidence; a changed intervening Wrangler version is not authority to update
Wrangler or any other dependency. The only permitted resolution change is the
specified `wrangler>esbuild` edge.

### VOC-108-D01 — Use pnpm's canonical override location

Add the exact scoped override `"wrangler>esbuild": "0.28.2"` to the existing
`overrides` section of `pnpm-workspace.yaml`. Do not place it in package manifests,
add direct dependencies, or change another override.

### VOC-108-D02 — Preserve a frozen, minimal dependency graph

Regenerate `pnpm-lock.yaml` only to represent the scoped override. The locked
Wrangler dependency must resolve esbuild 0.28.2, and `pnpm install
--frozen-lockfile` must remain valid. Any unrelated lockfile delta is a blocking
scope finding until separately authorized.

### VOC-108-D03 — Establish deterministic regression evidence

After a frozen install, a no-network Node assertion must resolve the `esbuild`
package using a `createRequire()` rooted at each actual local Wrangler package, not
the root module path. It must require package version exactly `0.28.2`; missing,
malformed, or other versions must exit nonzero. The same assertion against the
pre-override baseline must fail, demonstrating the deterministic regression gap
without trying to reproduce the intermittent hosted race.

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
