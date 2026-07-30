# VOC-033 — Impact Analysis

## Security and privacy

No secret, credential, or personal-data surface is touched. The new integration
test (`VOC-033-T02`) runs a local, disposable `postgres:16-alpine` container with
a fixed non-secret placeholder credential (matching the pattern
`apps/api/atlas.hcl`'s existing `dev` env block already uses for the same
purpose), bound to `127.0.0.1` only, torn down at test end via `t.Cleanup`. No
production or staging credential is read, written, or referenced by any file
this package adds or edits.

## Data and migrations

This package's entire scope is a migration-directory correctness fix — see
`specification.md`. Both defects fixed here predate this package and were never
successfully applied against any real database (Atlas aborts at directive
parsing before running any SQL, so the duplicate-index defect has never even
been reached in a real apply attempt); there is no live-data compatibility
concern and no rollback of already-applied state to reason about. Draft-time
verification performed directly (not simulated, not assumed):

- Downloaded the exact pinned `atlas` v1.2.0 binary
  (`https://release.ariga.io/atlas/atlas-linux-amd64-v1.2.0`, the same URL
  `.github/workflows/deploy-staging.yml` line 548 installs) and confirmed
  `atlas version` reports `v1.2.0`.
- Copied `apps/api/migrations` to a scratch directory, applied both fixes
  exactly as `VOC-033-T00` specifies (13 one-line directive changes, one
  3-line-including-blank-line deletion), and regenerated `atlas.sum` with
  `atlas migrate hash --dir "file://."`.
- Started a disposable `postgres:16-alpine` container
  (`docker run --rm -d -p 15432:5432 ...`, non-default host port, bound to the
  loopback default Docker uses) and ran
  `atlas migrate apply --url "postgres://vocanova:vocanova@127.0.0.1:15432/vocanova?sslmode=disable" --dir "file://."`
  against it from a completely empty database.
- Result: **success** — 13 migrations, 74 SQL statements, ~370ms, zero errors.
  The exact same command run a second time reported "No migration files to
  execute" (confirms idempotent re-apply).
- Removed the container immediately afterward. No repository file was modified
  during this verification; all of it happened in a scratch directory outside
  the working tree, exactly so this planning pass would not itself violate the
  planner's scope-discipline rule against writing outside this package's own
  directory.

This is strong, concrete evidence the proposed fix is correct and sufficient —
not a substitute for `VOC-033-T02`'s own committed, repeatable test, which an
implementer must still add so the proof is reproducible by anyone, not only
recorded as this draft's own one-time manual run.

## Analytics and accessibility

None. No analytics event and no user-facing surface exists anywhere in this
package's scope (`apps/api/migrations` is server-side schema tooling only) —
evidence-backed non-applicability, not omission.

## Risks, dependencies, and evidence

- `VOC-033-R00`: **Low.** The fix is mechanical and was verified end to end
  during drafting (see "Data and migrations" above); the residual risk is an
  implementer introducing an unrelated change while touching the same files,
  mitigated by `VOC-033-T00`'s explicit "change nothing else" instruction and
  by `VOC-033-TEST-06`'s diff-scope check.
- `VOC-033-R01`: **Low, informational.** `VOC-033-T02`'s integration test
  depends on Docker and outbound network access to `release.ariga.io` being
  available wherever it is run; neither is guaranteed on every future CI
  runner tier, and this package deliberately does not add a workflow-level
  guarantee (`VOC-033-D02`). Mitigated by the build-tag gate, which makes the
  test's absence-of-tooling case a clean skip, not a failure.
- `VOC-033-R02`: **Resolved informational dependency, not a package risk.** GitHub Actions run
  30555539008 (`deploy-staging`, push to `develop` @ this package's own
  `base_sha`) shows a real deploy attempt reaching the "Deploy to staging
  host" step (after build/push/SSH-configure/copy all succeeded) before
  failing, with health-check polling skipped. Authenticated founder-gate
  inspection at adoption confirmed the exact failure: Atlas rejected
  `-- atlas:txmode transaction` in the first migration. The same deployment
  proved the Actions SSH credentials and private healthy PostgreSQL path;
  Cloudflare DNS and the matching Origin Certificate were also independently
  verified. The application and nginx remain stopped until this package
  repairs the migration set.
- `VOC-033-DEP-00`, `VOC-033-DEP-01`, `VOC-033-DEP-02`: see `change.yaml`.
- `VOC-033-EV-00`: `git diff` of the 13 directive-line changes and the
  3-line deletion in `20260725130002_voc030_p4_gamification_tables.sql`.
- `VOC-033-EV-01`: regenerated `apps/api/migrations/atlas.sum` plus the
  `atlas migrate hash` re-run confirming no further diff.
- `VOC-033-EV-02`: `go test ./apps/api/migrations/...` output showing the four
  new `VOC-033-T01` tests (two real-file, two synthetic-fixture) passing
  alongside the unchanged existing tests.
- `VOC-033-EV-03`: `go test -tags=integration ./apps/api/migrations/...`
  output showing the full apply-from-empty-state and idempotent-re-apply
  proof passing.
- `VOC-033-EV-04`: diff-scope confirmation (`git diff --name-only`) showing
  only `apps/api/migrations/*` changed.
- `VOC-033-EV-05`: exact-SHA independent Claude Code verification per PR, per
  `CLAUDE.md`.
