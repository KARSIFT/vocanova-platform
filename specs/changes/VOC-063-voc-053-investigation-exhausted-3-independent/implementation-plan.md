# VOC-063 — Implementation Plan

## Preconditions and protected areas

Do not begin any task until this package is adopted and implementation is
authorized. `VOC-063-T01` reverses an adopted VOC-053 non-goal; the adopting
human must explicitly accept `VOC-063-DEP-01` at adoption time.

Protected areas:

- `apps/web/tests/staging-e2e/core-loop.staging.spec.ts` — sole application
  code target (`VOC-063-T01`).
- `specs/changes/VOC-053-staging-core-loop-e2e-words-reviewed-today/` —
  documentation-only edits (`VOC-063-T00`). Do not modify VOC-053's adopted
  `change.yaml` authorization fields.
- `specs/changes/VOC-063-voc-053-investigation-exhausted-3-independent` —
  this package's own evidence files.

Explicitly out of scope: `apps/web/src/`, `apps/api/`, `.github/workflows/`,
`apps/api/migrations/`, production configuration.

## File reconciliation and implementation sequence

1. **`VOC-063-T00`** (can run first or in parallel with T01) — Update VOC-053
   package docs per `tasks.md`. No code change. Closes superseded VOC-053 task
   issues.
2. **`VOC-063-T01`** — Edit `apps/web/tests/staging-e2e/core-loop.staging.spec.ts`:
   remove diagnostic; add bounded retry helper for step 7. Record parameters in
   evidence.
3. **`VOC-063-T02`** — No file change expected. Merge T01 to `develop`, wait for
   or trigger a real staging deploy, record passing run evidence.

`VOC-063-T00` and `VOC-063-T01` may land in either order or the same PR if
the implementer keeps task boundaries clear in the PR description; prefer
separate PRs per task for reviewability.

## Validation and independent verification

Deterministic commands before claiming any task complete:

```bash
bash scripts/governance/validate-governance.sh
bash scripts/governance/classify-change-risk.sh
git diff --check
```

For `VOC-063-T01`, additionally run workspace validation for `apps/web` per
`docs/development.md` (at minimum `pnpm lint` and `pnpm typecheck` scoped to
`apps/web`; run the staging E2E spec locally only if the implementer has staging
credentials — otherwise rely on `VOC-063-T02`'s real deploy run).

Independent verification (per `CLAUDE.md`) must confirm against the exact
implemented revision:

- `VOC-063-T00`: VOC-053 task statuses and supersession notes are correct;
  VOC-053 `change.yaml` adoption fields are untouched.
- `VOC-063-T01`: diagnostic fully removed; retry loop is bounded per
  `VOC-063-DEP-02`; invariant unchanged; annotations present when retries fire.
- `VOC-063-T02`: real staging run evidence matches `VOC-063-AC-03`/`AC-04`.
- No unrelated change introduced.
- Semantic risk: confirm retry implementation is not an unbounded poll-until-pass
  despite path floor R1.

## Deployment and rollback

No separate deployment authorization beyond the existing `develop`-merge path.
`VOC-063-T01` affects only the staging E2E spec executed post-deploy; it does
not change what gets deployed.

Rollback trigger: step 7 begins failing persistently on staging after this
change, or independent review finds the retry bounds are effectively unbounded.

Rollback mechanism: revert `VOC-063-T01`'s diff. The staging gate returns to
the pre-VOC-063 one-shot assertion (and the original intermittent failure mode
may return). `VOC-063-T00` documentation changes are harmless to revert but
may be left in place if they accurately record history.

Owner: implementer of the affected task. Last-known-good reference: the spec
file revision immediately preceding `VOC-063-T01`'s merge.
