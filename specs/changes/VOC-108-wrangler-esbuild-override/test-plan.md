# VOC-108 — Test Plan

## VOC-108-TEST-00 — Governance, authority, and exact scope

- Covers: `VOC-108-AC-00`
- Procedure: run governance validation and risk classification; inspect the package
  lifecycle, two-file implementation table, one-task/one-PR mapping, external-action
  exclusions, and automatic-merge drafting.
- Expected result: this draft does not authorize implementation; after adoption only
  the two declared dependency files may change, and no external action is authorized.
- Evidence: `VOC-108-EV-00`

## VOC-108-TEST-01 — Scoped override structure

- Covers: `VOC-108-AC-01`
- Procedure: parse `pnpm-workspace.yaml` with the repository's pnpm/YAML tooling and
  compare its override map to the exact base revision.
- Expected result: the only override-map addition is
  `"wrangler>esbuild": "0.28.2"`; no direct esbuild dependency, Wrangler version
  change, package manifest edit, or other override change exists.
- Evidence: `VOC-108-EV-01`

## VOC-108-TEST-02 — Frozen lockfile reconciliation

- Covers: `VOC-108-AC-02`
- Procedure: run `pnpm install --frozen-lockfile`; inspect the two-file diff and
  query the locked Wrangler dependency edge with pnpm's installed metadata.
- Expected result: frozen installation succeeds, Wrangler reaches esbuild 0.28.2,
  and every lockfile delta is mechanically required for that exact resolution.
- Evidence: `VOC-108-EV-02`

## VOC-108-TEST-03 — No-network resolution regression

- Covers: `VOC-108-AC-03`
- Procedure: after the frozen install, run the exact `createRequire()` assertion in
  the implementation plan for `apps/api-worker` and `apps/web`. Run it with
  `EXPECTED_ESBUILD_VERSION=0.28.1` at the pre-override base and then with
  `EXPECTED_ESBUILD_VERSION=0.28.2` at the final implementation SHA. Also run it
  with an invalid expected-version argument to verify its input guard. A missing
  Wrangler/esbuild module or a non-string package version naturally throws and exits
  nonzero; no fixture or repository test file is required.
- Expected result: only the final installed graph with exact 0.28.2 exits zero. The
  baseline and invalid-input cases exit nonzero. The command makes no network,
  Wrangler, Cloudflare, or credential request and cannot pass from a root esbuild
  module or a lockfile text match.
- Evidence: `VOC-108-EV-03`

## VOC-108-TEST-04 — Local-stack invariants and exact revision

- Covers: `VOC-108-AC-04`
- Procedure: run `pnpm run ci:local-stack`, `pnpm validate`, governance validation,
  risk classification, and `git diff --check`; inspect the exact implementation diff
  and obtain specialist plus independent R3 review at that SHA.
- Expected result: existing local-stack safety and terminal fatal-diagnostic
  classification remain intact; required checks pass; only the two approved files
  differ; distinct non-author reviewers report zero unresolved blockers.
- Evidence: `VOC-108-EV-04`

## Evidence definitions

- `VOC-108-EV-00`: exact plan review/adoption record, package validation, path/risk
  evidence, and normal different-actor plan merge.
- `VOC-108-EV-01`: parsed override-map delta and zero unrelated manifest/override
  changes at the exact implementation SHA.
- `VOC-108-EV-02`: frozen-install result and audited minimal lockfile resolution.
- `VOC-108-EV-03`: baseline failure, final exact-edge success, and negative no-network
  resolution assertion results.
- `VOC-108-EV-04`: focused/workspace/hosted required checks, exact two-file diff,
  and exact-SHA specialist and independent R3 PASS verdicts.

No test may use a secret, production data, live Cloudflare or GitHub mutation,
workflow dispatch, deployment, or D1 migration.
