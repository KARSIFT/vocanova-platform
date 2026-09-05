# Account anonymization operation

Account deletion first disables access and records `purge_after`. The internal
processor in `apps/api-worker/src/identity/anonymization.ts` is the only
purge path; it is not an HTTP endpoint and is not scheduled or deployed.

Run only against a synthetic local D1 database. `pnpm --filter @vocanova/api-worker
anonymize:local` is the executable dry-run rehearsal. Initialize the synthetic
local database separately using `pnpm --filter @vocanova/api-worker migrate:local`.
The command uses Wrangler's local platform proxy against the fixed local
persistence directory; dry-run only reads and does not apply migrations.
`pnpm --filter @vocanova/api-worker anonymize:local --apply` explicitly processes
at most 25 due accounts, with each account deleted atomically. Neither form accepts
remote configuration, and this repository provides no production command or
authorization.

For each due account the processor atomically removes identity links, sessions
and attributable session-rate buckets, saved-word/review metadata, missions,
points, learner text, AI feedback/reports, per-user AI controls, settings, and
the deletion request/account root. Shared vocabulary, global AI counters,
OAuth states, and IP/client rate buckets remain because they are not safely
attributable to a deleted learner. A retry after success is a no-op because
the request and user no longer exist; a failed batch remains retryable.

This is a technical deletion process, not a legal retention determination.
Production execution and legal authorization remain separate from this
repository change.
