# VOC-108 — Acceptance Criteria

## VOC-108-AC-00 — Scope and authority remain exact

- Requirements: `VOC-108-D00`, `VOC-108-D05`, `VOC-108-D06`
- Task: `VOC-108-T00`
- Tests: `VOC-108-TEST-00`, `VOC-108-TEST-04`
- Evidence: `VOC-108-EV-00`, `VOC-108-EV-04`

The package remains draft and implementation-unauthorized until independently
reviewed and adopted. Its future implementation diff is exactly limited to
`pnpm-workspace.yaml` and `pnpm-lock.yaml`, is one task/one PR, and records no
external action authority.

## VOC-108-AC-01 — Only the intended override changes policy

- Requirements: `VOC-108-D01`
- Task: `VOC-108-T00`
- Tests: `VOC-108-TEST-01`
- Evidence: `VOC-108-EV-01`

`pnpm-workspace.yaml` contains exactly one added scoped override,
`"wrangler>esbuild": "0.28.2"`, in the existing root override map. Wrangler,
other dependency versions, override entries, package manifests, and pnpm settings
are unchanged.

## VOC-108-AC-02 — The frozen lockfile resolves the correct edge

- Requirements: `VOC-108-D00`, `VOC-108-D02`
- Task: `VOC-108-T00`
- Tests: `VOC-108-TEST-02`
- Evidence: `VOC-108-EV-02`

A frozen install succeeds and the lockfile's Wrangler resolution reaches esbuild
0.28.2. Its diff contains only the override, esbuild 0.28.2 package/platform
snapshots and Wrangler edge, plus mechanically coupled Vite 8.2.2/Vitest
4.1.11 peer-context re-resolution to the same esbuild instance. Vite, Vitest,
`@vitest/mocker`, and `@cloudflare/vitest-plugin` versions remain unchanged and
unrelated refreshes are absent.

## VOC-108-AC-03 — The regression assertion proves the actual edge

- Requirements: `VOC-108-D03`, `VOC-108-D04`
- Task: `VOC-108-T00`
- Tests: `VOC-108-TEST-03`
- Evidence: `VOC-108-EV-03`

The baseline inventory records Wrangler 4.125.0/esbuild 0.28.1 for both consumers,
then the exact-0.28.2 no-network assertion exits nonzero at that baseline. At the
final graph it succeeds only when each Wrangler context resolves esbuild 0.28.2.
Executable inline negative probes prove rejection of a missing package, malformed
version, and substituted version. It does not pass based on a root-level package or
a text search. All existing local-stack failure classification remains terminal.

## VOC-108-AC-04 — Exact revision receives R3 verification

- Requirements: `VOC-108-D06`
- Task: `VOC-108-T00`
- Tests: `VOC-108-TEST-04`
- Evidence: `VOC-108-EV-04`

Focused, workspace, governance, and hosted required checks pass at the reviewed
implementation SHA. A dependency/local-runtime specialist and a separate independent
R3 reviewer, neither of whom authored that SHA, record PASS with zero unresolved
blockers before a separate non-author merges it.
