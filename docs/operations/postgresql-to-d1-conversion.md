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
The committed inventory check parses inline definitions and `ALTER TABLE ... ADD
COLUMN`, then compares every active PostgreSQL/D1 column name and declared type with
the conversion field kind. Unparseable or newly added schema fails the inventory until
the versioned contract is deliberately reconciled.

The T09 implementation rejects `source.synthetic != true`. Accessing, exporting,
transforming, uploading, or deleting production learner data remains prohibited until
`VOC-080-HOLD-02` has separately recorded its data-minimization plan, protected
execution boundary, reconciliation queries, backup/restore readiness, audit trail,
operator, dataset, and time-bounded authority. Removing the synthetic-only guard is a
future reviewed change; a chat instruction or repository merge is not sufficient.

## Deterministic conversion

The converter applies these canonical representations before any D1 write:

- UUIDs become lowercase 36-character text.
- `timestamptz` values require an explicit timezone and become millisecond UTC ISO-8601;
  PostgreSQL microseconds are deterministically truncated by that representation.
- PostgreSQL `date` values remain validated `YYYY-MM-DD` text.
- booleans become constrained `0` or `1` integers.
- the legacy synthetic-smoke-account marker is preserved as a constrained integer and
  retains its one-marked-account uniqueness rule in D1.
- integers may arrive as JSON integers or canonical decimal strings, but values outside
  JavaScript's safe-integer range are rejected before D1 binding.
- `jsonb` becomes recursively key-sorted JSON text. Fractional values use canonical
  finite JavaScript-number serialization; unsafe integral precision is rejected.
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

Every new export ID is a full replacement of the 25 converted tables. The plan first
clears them in reverse foreign-key order and then imports in forward dependency order.
Each bounded clear/upsert mutation and its checkpoint are one atomic `batch()`. Clears
select at most 41 ordered IDs, delete at most 40, and stay on the same checkpoint until
the table is empty. This deliberately targets an offline cutover database: running it
against an application accepting writes would discard concurrent data and remains
prohibited without `VOC-080-HOLD-02`.

Upserts are bounded by both count and encoded size: at most 40 row statements plus one
checkpoint, at most 1,000,000 estimated encoded bytes for a row statement, and at most
1,500,000 bytes per import batch (including conservative SQL/transport and checkpoint
allowances). The schema inventory also proves fewer than D1's 100 bound parameters and
less than its 100,000-byte SQL limit per upsert. These repository caps are stricter than
Cloudflare's current 2,000,000-byte row and free-plan 50-query invocation ceilings; see
the [official D1 limits](https://developers.cloudflare.com/d1/platform/limits/).
`applyD1ImportPlan` advances at most one batch per call: an upsert invocation uses at
most 42 D1 queries including checkpoint load, while a clear invocation uses at most 43
including its bounded ID lookup. The checkpoint lives in `platform_metadata` under
`data_conversion:<export_id>` and records the plan checksum and next chunk; the caller
re-invokes until the machine-readable result reports `completed: true`.

This gives the following recovery rules:

1. A failure before a chunk leaves the previous checkpoint intact.
2. Retrying the same export ID and checksum resumes at the first unapplied chunk.
3. Re-running a completed export is a no-op.
4. Reusing an export ID with different normalized data is rejected as stale.
5. A forward correction is a complete corrected export with a new export ID. Its
   reverse-order clear removes stale/newly excluded rows before deterministic re-import,
   and reconciliation proves the final full state.

T09 runs this path only through the local workerd/D1 test binding. It does not run
`wrangler d1 execute --remote`, query an account, create a database, or use a credential.
D1 Time Travel restoration is not a code rollback and remains a separately authorized
destructive production action.

## Reconciliation and privacy

`reconcileD1Import` emits `vocanova-d1-reconciliation-v1` with:

- source, excluded, expected, and actual count for every table;
- expected and actual SHA-256 checksum for canonical target rows;
- bounded per-row parent-reference violation count across every canonical page;
- active-user, active-saved-word, review-attempt, completed-mission, Confidence Point
  delta, and successful-AI-feedback aggregates;
- the number of sensitive fields withheld from evidence.

Reconciliation is also a resumable state machine. Each call uses a
[primary-anchored D1 Session](https://developers.cloudflare.com/d1/best-practices/read-replication/#start-a-session-with-all-latest-data)
and fetches at most 11 ordered rows from one table (10 hashed rows plus one
completion lookahead), rejects a
canonicalized 10-row page above 12,000,000 bytes, advances a SHA-256 page chain, checks
that page's declared parent references with bounded indexed lookups, and accumulates
the six domain aggregates from those same rows. It stores only its generation nonce,
last ID, row count, rolling checksum, cumulative counters, and completed-table evidence
inside the global `data_reconciliation_write_lock` row. Retrying after a read or state
transition failure re-reads at most the same page and cannot double-count because each
cursor advance is a compare-and-swap update of that exact generation. The signed
Confidence Point delta
uses exact `BigInt` arithmetic and a canonical decimal checkpoint value across pages;
only the final safe-integer total is emitted as a JSON number.

Before the first page, reconciliation atomically acquires a plan-bound, random-generation
row named `data_reconciliation_write_lock`; its initial zero cursor is part of that same
row, so no stale prefix can survive lock loss or a failed restart. The seventh local D1
migration installs
insert/update/delete triggers on every converted table; while that row exists, any
target mutation aborts with a canonical error. A missing lock necessarily starts a new
generation from the first table under the newly acquired guard. This
makes the page chain one stable database generation rather than relying only on the
offline-cutover instruction. A page invocation uses one conditional lock insert, one
lock load, one 11-row page query, one compare-and-swap state update, and one confirming
load. A concurrent completed-generation release can add one bounded insert/load retry,
for at most seven queries. This remains below the committed 50-query ceiling.

The protected conversion step precomputes the identical 10-row expected checksum chain
with its page-ending row IDs, plus expected aggregate totals, and binds them into the
overall plan checksum. Every resumed non-empty cursor must match one of those exact
page endpoints by direct page-index lookup; no invocation linearly scans prior page
evidence. A well-shaped cursor that skips or rewrites an unverified prefix fails closed.
Reconciliation therefore never iterates an expected table, performs a D1 full-table
aggregate, or materializes a D1 table/result set in one Worker invocation. Persisted
table evidence is checked back against the plan's counts and checksums, and the
`matches` flag is recomputed semantically. A completed receipt is reusable only while
its exact generation lock remains, because the triggers make later target mutation
impossible. A completed report deliberately leaves that write lock active while its
evidence is recorded. The caller then invokes `releaseD1ReconciliationWriteLock`; it
conditionally deletes only the exact plan-bound, generation-bound completed state it
verified. A concurrent fresh generation cannot be deleted by the old release. After
release, the next invocation creates a new generation and starts a bounded pass, so a
later database mutation cannot return a stale PASS. Releasing an incomplete or
different plan fails closed. If
a process stops mid-pass, retry the same plan to resume; do not delete the lock or run a
forward correction until that pass completes or a separately reviewed recovery records
why its prefix is being abandoned.

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
idempotent replay, interrupted resume, malformed/stale-checkpoint rejection, byte and
statement bounds, alternate/composite uniqueness, deletion-safe forward correction,
multi-page reconciliation interruption/retry without expected-table scans,
semantically inconsistent reconciliation-checkpoint rejection, completed-receipt
revalidation, lock-loss/reacquisition failure recovery, concurrent release/restart,
mutation rejection while an in-progress prefix exists, exact signed
aggregate cancellation/overflow, bounded foreign-key/count/checksum/domain
reconciliation, and log-redaction assertions. The
second command proves all 25 PostgreSQL tables/columns map exactly and classifies the
six D1-only runtime tables that have no PostgreSQL source rows.

## Repository rollback

Reverting VOC-080-T09 removes the converter, D1 synthetic-account parity and
reconciliation-guard migrations, fixture, local rehearsal, command, and this
documentation. It does not reverse a remote schema or dataset because T09 performs no
remote action. If a future authorized migration has begun, data recovery uses its
recorded forward-correction or separately authorized restore procedure; a source-code
revert alone is not data rollback.
