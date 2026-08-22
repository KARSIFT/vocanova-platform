# VOC-081 Implementation Plan

## Sequence

1. **T00 — Contract and fail-closed policy.** Reconcile canonical ports/origins/state,
   disable generated Next agent rules, and add pure validation/negative fixtures before
   adding launch capability.
2. **T01 — Local D1 initialization.** Add the explicit local migration command and
   prove empty/repeat/failure behavior against disposable and persistent roots.
3. **T02 — Supervised development loops.** Add a small provider-neutral Node supervisor
   for `dev` and `dev:workers`, readiness, signals, child failure, and port preflight.
4. **T03 — Local-stack smoke and CI.** Add disposable two-Worker integration evidence,
   required CI coverage inside `ci.yml`, and aggregate failure fixtures.
5. **T04 — F2 record and final verification.** Reconcile docs, inventory every
   requirement, run full suites/rollback, obtain exact-SHA specialist review, and record
   hosted evidence without activating F3.

## Selected technical approach

### Local addresses

- Web: `127.0.0.1:3000`
- API: `127.0.0.1:8080`
- Developer D1 persistence: one ignored directory below the repository's Wrangler
  local-state root, named explicitly by script rather than inherited defaults.
- Test persistence: OS-temporary directory created per run and removed after verified
  child termination.

### Process topology

`dev` uses API Wrangler plus Next hot reload. It uses the HTTP fallback intentionally
and does not claim both-Worker proof. `dev:workers` builds OpenNext and starts two
Wrangler sessions because both web and API require direct local URLs; recent locked
Wrangler supports cross-command service bindings. API starts first; web starts only
after migrated health/config pass.

T00 updates the local OAuth redirect URI and its identity-parity fixture from Wrangler's
old 8787 default to the canonical API port 8080, then runs the existing `types:write`
entry point so `worker-configuration.d.ts` records the same generated binding contract.
It sets the locked Next 16.3.0 top-level `agentRules: false` field and extends the
authority guard to reject generated markers in nested `AGENTS.md`/`CLAUDE.md` files.
Root authority documents are verification surfaces; they change only if their active
guidance needs reconciliation.

Cross-command binding uses the existing web `services` entry
`API → vocanova-api-local` and the matching API Worker name. Tests prove the locked
Wrangler behavior; implementation does not guess an undocumented CLI flag.

The Node supervisor uses `child_process.spawn` without a shell, passes explicit argument
arrays and a minimized inherited environment, rejects forbidden flags, owns all child
PIDs, forwards SIGINT/SIGTERM once, escalates after a bounded grace period, and returns
nonzero if any required child fails. Tests import pure lifecycle/command-construction
helpers and use controlled fixture processes; no redundant process-manager dependency.

### Migration and smoke

The initializer invokes the locked workspace Wrangler with `d1 migrations apply DB`,
the API config, `--local`, and the exact persistence root. It disables experimental
provision/auto-create using the same explicit flags already used by both apps'
credential-free `dry-run:local` scripts where the locked command supports them. The
smoke starts from an empty temporary root, repeats init, checks health/config, observes a technical
service-binding marker, restarts once to prove D1 persistence, and tests failures.

No seed endpoint, magic-link capture, session bypass, debug credential, or provider
adapter is introduced. Product auth remains an A1/F3 acceptance concern.

## Documentation reconciliation

Update every active file that describes root development, Cloudflare local behavior,
ports/origins, migrations, CI jobs, F2 state, generated agent boundaries, or server
retirement. Review `docs/operations/cloudflare-delivery.md` explicitly because it
documents the no-provision flags reused by local initialization; update it only if its
current delivery-only claims become inaccurate. Historical packages remain untouched.

## Review model

Plan: different-role Cloudflare/Workers/D1/security exact-revision review with no test
duplication. Implementation: different builder and exact-SHA specialist reviewer per
task. Material findings produce a new SHA and fresh review/hosted checks. No role may
self-approve or self-merge.
