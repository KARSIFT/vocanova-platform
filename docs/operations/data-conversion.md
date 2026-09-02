# Synthetic PostgreSQL-to-D1 conversion

The converter under `apps/api-worker/src/data-conversion` is a local verification and migration-rehearsal tool. It accepts only the committed synthetic export shape and rejects non-synthetic input. It is not a production importer and must never receive production data or remote D1 credentials.

## Validate

```bash
pnpm --filter @vocanova/api-worker data-conversion:inventory
pnpm --filter @vocanova/api-worker test:data-conversion
```

The inventory command binds the retired PostgreSQL schema snapshot to the current D1 destinations. The test suite exercises conversion, bounded chunks, atomic failure, restart, replay, forward correction, foreign keys, checksums, domain aggregates, and privacy-safe reconciliation.

## Recovery model

- Every import plan is bound to its export ID and checksum.
- Each bounded D1 chunk and its checkpoint update are atomic.
- An interrupted run resumes from the last committed chunk.
- A changed export creates a new plan; stale checkpoints fail closed.
- Reconciliation reads bounded pages and persists its own checkpoint.
- Converted tables stay write-locked while reconciliation is incomplete.
- A failed or inconsistent import is corrected with a new complete synthetic export; destructive rollback is not automatic.

Any future production-data migration needs a separately designed operator process with explicit authorization, backups, validation, observability, and rollback. Do not adapt this synthetic harness by simply removing its input guard.
