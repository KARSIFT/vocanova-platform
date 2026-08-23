# VOC-083 — Implementation Plan

## Preconditions and protected areas

Do not begin until this draft receives independent exact-revision plan review, the
applicable decision owner adopts it, and `implementation_authorized` becomes true.
The builder must start from the adopted revision, re-check locked versions and current
primary Cloudflare/Sentry documentation, and remain within `apps/web`, local smoke/CI,
lockfile, and active documentation. No Sentry/Cloudflare credentials, API calls,
source-map upload, deployment, account query, billing action, or inherited-hold action
is authorized.

## File reconciliation and implementation sequence

1. **T00 — Reproduce and select from evidence.** Reproduce #105 on the locked base;
   capture sanitized generated-bundle locations and workerd output. Compare the three
   candidates in `VOC-083-R00`; verify exact version exports, upstream status, and the
   supported reporting surface. Record a selection decision only when all required
   evidence is present. Stop/escalate if none qualifies.
2. **T01 — Implement the selected narrow repair.** Modify only the selected
   configuration/import/adapter and necessary lockfile. Keep client/server behavior
   explicitly separated, preserve capture hooks, and make test transport injection
   impossible in normal runtime configuration. Do not remove error reporting as an
   alternative to compatibility.
3. **T02 — Make bundle and log safety executable.** Add a generated OpenNext bundle
   scanner with fixtures for prohibited Wasm forms. Harden `test-workerd.mjs` and the
   two-Worker local-stack owner to classify bounded output and fail on unexpected
   rejection/error diagnostics despite HTTP success. Add this evidence to the existing
   web/local-stack CI paths and required aggregate without adding a workflow.
4. **T03 — Reconcile and verify.** Review every affected runtime/config/test/doc/
   lockfile file, update only documentation made inaccurate, run deterministic checks,
   obtain a different-role exact-SHA Cloudflare/Workers/Sentry specialist verdict, and
   perform an ordinary repository rollback rehearsal in a disposable worktree.

## Selection constraints

The decision record must show why configuration-only, version update, and native adapter
were accepted or rejected. A configuration alias may be chosen only if it is scoped to
the proven build-only path and cannot mask unrelated runtime imports. A package update
may be chosen only with a reviewed lockfile and upstream compatibility proof. A native
adapter may be chosen only with a documented mapping for Next request errors, global
errors, browser capture, trace/context behavior if retained, and non-network test
transport. Do not retain an obsolete `@sentry/nextjs` server import merely for API
convenience if it reintroduces the unsafe graph.

## Validation and independent verification

At minimum, run the commands that exist on the implementation revision:

```bash
pnpm install --frozen-lockfile
pnpm --filter @vocanova/web cloudflare:build
pnpm --filter @vocanova/web cloudflare:compatibility
pnpm --filter @vocanova/web cloudflare:preview:test
pnpm test:local-stack
pnpm ci:web
pnpm ci:local-stack
pnpm audit --audit-level high
pnpm validate
bash scripts/governance/validate-governance.sh
bash scripts/governance/classify-change-risk.sh
git diff --check
```

Run a narrower command only when the revision demonstrates that a listed command is
unavailable; record that fact rather than reporting it as passing. The independent
Cloudflare/Workers/Sentry specialist receives the exact SHA, candidate matrix, bundle
scan output, sanitized smoke logs, lockfile diff/audit, reporting-equivalence evidence,
and rollback result. They independently inspect the final diff and do not start live
services or duplicate long-running suites.

## Deployment and rollback

There is no deployment or live release. A merged implementation only changes repository
history; VOC-080-HOLD-00/01/02 remain unmodified. Roll back with a normal revert of the
selected task commits, then rerun the corresponding predecessor checks. Trigger rollback
on a rejected bundle scan, unexpected workerd diagnostic, lost reporting capture,
privacy/credential regression, dependency audit issue, or documentation overclaim.
