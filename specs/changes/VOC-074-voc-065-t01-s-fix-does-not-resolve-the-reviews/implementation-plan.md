# VOC-074 — Implementation Plan

## Preconditions and protected areas

Do not begin any task until this package is adopted and implementation is
authorized. `VOC-074-T01` must not start until `VOC-074-T00` names a specific
evidence-backed cause (or explicitly scopes product work to T02 only).
`VOC-074-T03` must not start until `VOC-074-T02` merges.

Protected / sensitive areas:

- `apps/api/business/missions/` — conditional edit if T00 finds increment or
  snapshot defect.
- `apps/api/business/reviews/` — read for confirmation; edit only if T00 finds
  a defect beyond VOC-065-T01's wiring fix.
- `apps/api/app/api/production.go` — read-only unless T00 finds runtime wiring
  still incomplete.
- `apps/web/tests/staging-e2e/core-loop.staging.spec.ts` — T02 primary edit;
  T03 verification target.
- `.github/workflows/deploy-staging.yml` — edit only if T00/`VOC-074-DEP-03`
  requires queue reset or diagnostic enrichment.
- `apps/api/migrations/` — **out of default scope**; only if adoption expands
  `VOC-074-DEP-01`.
- `specs/changes/VOC-074-voc-065-t01-s-fix-does-not-resolve-the-reviews` —
  this package's evidence files.

Explicitly out of scope by default: governance docs, VOC-065 package adoption
fields, production secrets, reverting VOC-065-T01 unless T00 proves it wrong.

## File reconciliation and implementation sequence

1. **`VOC-074-T00`** — Investigation only. Produce `t00-evidence.md`. Prefer
   runtime tracing of the increment path and explaining the
   `updated_at`-without-increment clue (see `tasks.md`).
2. **`VOC-074-T01`** — Narrow fix + regression test per T00's confirmed cause
   (may be no-op if T00 routes all product work elsewhere — document in
   evidence). Produce `t01-evidence.md`. Run applicable `apps/api` tests and
   workspace validation per `docs/development.md`.
3. **`VOC-074-T02`** — E2E hardening (+ optional queue reset per
   `VOC-074-DEP-03`). Produce `t02-evidence.md`. Run applicable web lint/type
   checks for the touched spec.
4. **`VOC-074-T03`** — No file change expected. After T01/T02 merge to
   `develop`, record a real staging pass in `t03-evidence.md`.

Prefer separate PRs per task for reviewability. T02 may land in parallel with
T01 when causes are independent, but T03 requires both.

## Validation and independent verification

Deterministic commands before claiming any task complete:

```bash
bash scripts/governance/validate-governance.sh
bash scripts/governance/classify-change-risk.sh
git diff --check
```

For `VOC-074-T01`, additionally run applicable `apps/api` test targets for the
touched packages and workspace validation `docs/development.md` requires for
Go API changes.

For `VOC-074-T02`, run applicable checks for `apps/web` test changes per
`docs/development.md`.

Do not invent unavailable checks as passing.

Independent verification (per `CLAUDE.md`) must confirm against the exact
implemented revision:

- T00 evidence supports T01/T02 scope (including `reviewedCards` disposition).
- Fix is narrow; no unrelated refactor; VOC-065-T01 wiring preserved unless T00
  proved it wrong.
- T02 eliminates vacuous step-7 pass; VOC-063 retry unchanged.
- T03 staging evidence includes `reviewedCards >= 1` and diagnostic dump
  movement — not only a green Playwright line.
- Path risk floor re-measured; semantic R3 proposal still justified (or raised).
- VOC-065-T02 not treated as closure without T03 evidence.
- No unauthorized migration/`VOC-074-DEP-01` expansion.
- Implementer did not approve or merge their own work.

## Deployment and rollback

No separate deployment authorization beyond the existing governed
`develop` → (automatic) `main` / production path described in AGENTS.md. Closing
this package's task roster participates in the existing auto-release mechanism
once adopted and implemented.

Rollback trigger: after T01, review submissions fail, mission counters
double-increment, E2E gate becomes flaky for wrong reasons, or independent
review finds the fix incorrect.

Rollback mechanism: revert T01 and/or T02 commits separately as appropriate.

Last-known-good reference: the revision immediately preceding the affected
task's merge.

Owner: implementer of the affected task.
