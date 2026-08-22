# PostgreSQL-to-D1 conversion rehearsal

Status: active repository-only runbook for VOC-080-T09. It does not authorize or
perform production-data access, Cloudflare resource mutation, or a remote D1 import.

## Boundary

The conversion contract is deliberately separate from a PostgreSQL dump. It accepts
only a normalized, versioned object with these exact top-level fields:

```json
{
  "schema_version": "vocanova-postgres-export-v1",
  "export_id": "operator-chosen-stable-id",
  "source": {
    "dialect": "postgresql",
    "synthetic": true,
    "exported_at": "2026-08-22T00:00:00.000Z"
  },
  "tables": {}
}
```

`tables` must contain exactly the 25 active PostgreSQL tables. Every row must contain
exactly the versioned fields in
`apps/api-worker/src/data-conversion/schema.ts`; missing and unknown fields fail closed.
The committed inventory check compares that contract against every active PostgreSQL
column and its D1 destination column so schema drift cannot silently omit data.

The T09 implementation rejects `source.synthetic != true`. Accessing, exporting,
transforming, uploading, or deleting production learner data remains prohibited until
`VOC-080-HOLD-02` has separately recorded its data-minimization plan, protected
execution boundary, reconciliation queries, backup/restore readiness, audit trail,
operator, dataset, and time-bounded authority. Removing the synthetic-only guard is a
future reviewed change; a chat instruction or repository merge is not sufficient.

## Deterministic conversion

The converter applies these canonical representations before any D1 write:

- UUIDs become lowercase 36-character text.
- `timestamptz` values require an explicit timezone and become millisecond UTC ISO-8601.
- PostgreSQL `date` values remain validated `YYYY-MM-DD` text.
- booleans become constrained `0` or `1` integers.
- integers may arrive as JSON integers or canonical decimal strings, but values outside
  JavaScript's safe-integer range are rejected before D1 binding.
- `jsonb` becomes recursively key-sorted JSON text.
- 32-byte `bytea` hashes become lowercase 64-character hexadecimal text.
- nullable PostgreSQL display/avatar/provider-email fields use the D1 empty-string
  representation where the D1 contract is non-null.
- a null legacy review `client_attempt_id` becomes `legacy:<review-attempt-uuid>`.
- deleted user email is cleared, and soft-deleted external identities are explicitly
  counted as excluded because the D1 identity table represents only active identities.

Unsupported OAuth providers and app languages fail rather than being coerced. Duplicate
IDs, missing parents, unsafe precision, invalid timestamps/JSON/hashes, and unknown
shape fail before import. Tables and rows are sorted in foreign-key-safe deterministic
order, and the entire normalized plan receives a SHA-256 checksum.

## Local D1 import and recovery

Each table is split into bounded chunks (default 50 rows, maximum 500). A chunk uses
prepared D1 statements and one atomic `batch()` containing both its deterministic
upserts and its checkpoint update. The checkpoint lives in `platform_metadata` under
`data_conversion:<export_id>` and records the plan checksum and next chunk.

This gives the following recovery rules:

1. A failure before a chunk leaves the previous checkpoint intact.
2. Retrying the same export ID and checksum resumes at the first unapplied chunk.
3. Re-running a completed export is a no-op.
4. Reusing an export ID with different normalized data is rejected as stale.
5. A forward correction is a complete corrected export with a new export ID; upserts
   make the correction idempotent while reconciliation proves the final full state.

T09 runs this path only through the local workerd/D1 test binding. It does not run
`wrangler d1 execute --remote`, query an account, create a database, or use a credential.
D1 Time Travel restoration is not a code rollback and remains a separately authorized
destructive production action.

## Reconciliation and privacy

`reconcileD1Import` emits `vocanova-d1-reconciliation-v1` with:

- source, excluded, expected, and actual count for every table;
- expected and actual SHA-256 checksum for canonical target rows;
- `PRAGMA foreign_key_check` violation count;
- active-user, active-saved-word, review-attempt, completed-mission, Confidence Point
  delta, and successful-AI-feedback aggregates;
- the number of sensitive fields withheld from evidence.

The report contains no row values, email, provider subject, token/hash, idempotency key,
typed answer, sentence, AI feedback, or error content. Full converted rows remain an
in-memory protected import plan and are never written to routine logs.

## Commands

From the repository root:

```bash
pnpm run test:data-conversion
pnpm --filter @vocanova/api-worker data-conversion:inventory
```

The first command runs exact shape/type/adversarial tests, fresh local D1 import,
idempotent replay, interrupted resume, stale-checkpoint rejection, forward correction,
foreign-key/count/checksum/domain reconciliation, and log-redaction assertions. The
second command proves all 25 PostgreSQL tables/columns map exactly and classifies the
six D1-only runtime tables that have no PostgreSQL source rows.

## Repository rollback

Reverting VOC-080-T09 removes only the converter, fixture, local rehearsal, command,
and this documentation. It does not reverse a remote schema or dataset because T09
performs no remote action. If a future authorized migration has begun, data recovery
uses its recorded forward-correction or separately authorized restore procedure; a
source-code revert alone is not data rollback.
