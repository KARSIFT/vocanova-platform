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
  and every lockfile delta is one of the authorized mechanical records: override,
  esbuild 0.28.2 package/platform snapshot, Wrangler edge, or Vite/Vitest peer-context
  key/reference rewrite and effective toolchain resolution change to the same
  esbuild instance. Vite 8.2.2, Vitest 4.1.11, `@vitest/mocker` 4.1.11, and
  `@cloudflare/vitest-plugin` 1.0.0 remain unchanged.
- Evidence: `VOC-108-EV-02`

## VOC-108-TEST-03 — No-network resolution regression

- Covers: `VOC-108-AC-03`
- Procedure: at the pre-override base, run the inventory command and retain its
  Wrangler 4.125.0/esbuild 0.28.1 output for both consumers. Run the exact assertion
  with `EXPECTED_ESBUILD_VERSION=0.28.2` at that base and retain its nonzero result.
  After the final frozen install, run the same exact-0.28.2 assertion. Its inline
  executable probes inject a missing package, malformed numeric version, and
  different 0.28.1 version into the same extraction/match functions and require all
  three to fail; no fixture or repository test file is added. Also run with a
  malformed expected-version argument to exercise the regex guard.
- Expected result: only the final real graph with exact 0.28.2 exits zero. The
  baseline and malformed-input cases exit nonzero, while all three internal negative
  probes print their rejection confirmation before the real graph is accepted. The
  command makes no network, Wrangler, Cloudflare, or credential request and cannot
  pass from a root esbuild module or a lockfile text match.
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
- `VOC-108-EV-02`: frozen-install result and audited lockfile delta, including the
  enumerated Vite/Vitest peer-context and effective esbuild toolchain re-resolution
  with unchanged package versions.
- `VOC-108-EV-03`: Wrangler 4.125.0/esbuild 0.28.1 baseline inventory, baseline
  exact-0.28.2 failure, final exact-edge success, and executable missing/malformed/
  different-version no-network negative results.
- `VOC-108-EV-04`: focused/workspace/hosted required checks, exact two-file diff,
  and exact-SHA specialist and independent R3 PASS verdicts.

No test may use a secret, production data, live Cloudflare or GitHub mutation,
workflow dispatch, deployment, or D1 migration.
