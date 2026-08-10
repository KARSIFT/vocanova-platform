# VOC-065 — Implementation Plan

## Preconditions and protected areas

Do not begin any task until this package is adopted and implementation is
authorized. `VOC-065-T01` must not start until `VOC-065-T00` names a specific
evidence-backed cause.

Protected / sensitive areas:

- `apps/api/app/api/production.go` — primary expected edit (composition root).
- `apps/api/business/reviews/` — read for confirmation; edit only if T00 finds
  a defect beyond nil wiring.
- `apps/api/migrations/` — **out of default scope**; only if adoption expands
  `VOC-065-DEP-01`.
- `apps/web/tests/staging-e2e/core-loop.staging.spec.ts` — verification target;
  edit only if T00 proves a test false-positive (and still preserve step 7).
- `specs/changes/VOC-065-real-backend-write-path-bug-reviews-completed` — this
  package's evidence files.

Explicitly out of scope by default: governance docs, workflow YAML,
VOC-053/VOC-063 package authorization fields, production secrets.

## File reconciliation and implementation sequence

1. **`VOC-065-T00`** — Investigation only. Produce `t00-evidence.md`. Prefer
   confirming/falsifying the `production.go` wiring gap first (see
   `tasks.md`).
2. **`VOC-065-T01`** — Narrow fix + regression test per T00's confirmed cause.
   Produce `t01-evidence.md`. Run API/`apps/api` tests applicable to the change
   and workspace validation per `docs/development.md`.
3. **`VOC-065-T02`** — No file change expected. After T01 merges to `develop`,
   record a real staging pass in `t02-evidence.md`.

Prefer separate PRs per task for reviewability. T00 may be documentation-only
inside this package directory (evidence) plus any temporary investigative notes
committed only under this package — do not leave debug instrumentation in
production paths from T00.

## Validation and independent verification

Deterministic commands before claiming any task complete:

```bash
bash scripts/governance/validate-governance.sh
bash scripts/governance/classify-change-risk.sh
git diff --check
```

For `VOC-065-T01`, additionally run the applicable `apps/api` test targets for
the touched packages (at minimum the reviews P4 wiring tests and the new
regression test), and any workspace validation `docs/development.md` requires
for Go API changes. Do not invent unavailable checks as passing.

Independent verification (per `CLAUDE.md`) must confirm against the exact
implemented revision:

- T00 evidence actually supports the cause T01 fixed.
- Fix is narrow; no unrelated refactor.
- Regression test would catch the confirmed gap.
- Path risk floor re-measured; semantic R3 proposal still justified (or raised).
- Step 7 invariant / VOC-063 retry behavior unchanged unless a documented
  test-only fix was required and still preserves the invariant.
- No migration introduced unless `VOC-065-DEP-01` was explicitly expanded at
  adoption.
- Codex/implementer did not approve or merge its own work.

## Deployment and rollback

No separate deployment authorization beyond the existing governed
`develop` → (automatic) `main` / production path described in AGENTS.md. This
package does not itself authorize production deployment; closing the task
roster participates in the existing auto-release mechanism once adopted and
implemented.

Rollback trigger: after T01, staging (or production) review submissions fail,
mission counters double-increment, or independent review finds the wiring
incorrect.

Rollback mechanism: revert T01's diff. Last-known-good reference: the
`production.go` (and any related) revision immediately preceding T01's merge.

Owner: implementer of the affected task.
