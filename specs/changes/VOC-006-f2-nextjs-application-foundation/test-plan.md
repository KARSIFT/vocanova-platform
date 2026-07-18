# VOC-006 Test Plan

Tests use no secret, production configuration, learner data, external database, or
deployment environment. The implementation PR records exact committed commands.

## VOC-006-TEST-01 — Existing governance baseline

Run governance unit tests, repository foundation validation, the governance wrapper,
shell syntax checks, and `git diff --check`.

Expected: all pass without changing or weakening controls.

## VOC-006-TEST-02 — Canonical App Router structure

Inspect tracked files, manifests, and Next.js configuration under `apps/web`.

Expected: a genuine App Router application exists only at `apps/web`; no alternate
root or product route structure exists.

## VOC-006-TEST-03 — Minimal rendering inspection

Inspect and render the root layout, root page, and global styling entry.

Expected: the technical placeholder renders with the minimal styling foundation and
contains no product feature or fake product UI.

## VOC-006-TEST-04 — Real production build

Run `pnpm --filter @vocanova/web build` and the applicable root build/validation path.

Expected: Next.js performs a real successful production build; failures return
nonzero and are not masked.

## VOC-006-TEST-05 — Bounded development-server smoke test

Start the committed web development command on an available local test port, wait
with a finite readiness bound, request `/`, record the response, and deliberately
terminate and reap the process.

Expected: the server becomes ready and serves the technical page; evidence identifies
intentional termination rather than claiming natural completion.

## VOC-006-TEST-06 — Next.js-aware type check

Run `pnpm --filter @vocanova/web typecheck`; in a disposable copy introduce a
representative type error and repeat.

Expected: valid source passes and the representative error returns nonzero.

## VOC-006-TEST-07 — Real lint and failure propagation

Run `pnpm --filter @vocanova/web lint`; inspect its implementation; in a disposable
copy introduce a representative lint violation and repeat.

Expected: the supported real lint path passes valid source and returns nonzero for
the violation; no placeholder or obsolete command is used.

## VOC-006-TEST-08 — Frozen installation and dependency review

From a clean checkout run `pnpm install --frozen-lockfile`, inspect manifests and the
lockfile, run the approved dependency audit, and compare dependency changes to the
recorded authoritative version rationale.

Expected: installation succeeds without mutation; only necessary supported stable
exact dependencies change; no unrelated upgrade or unapproved release channel exists.

## VOC-006-TEST-09 — Root and workspace regression matrix

Run `pnpm validate` plus every existing root/web/API/workspace/governance command
affected by integration changes.

Expected: existing validation remains green and child failures remain visible.

## VOC-006-TEST-10 — Product and later-scope exclusion

Inspect exact changed files and full diff for product routes/screens/flows, auth, API
integration, backend work, future-stack/test libraries, F2-I04, and later F2 work.

Expected: none is present.

## VOC-006-TEST-11 — Direct data-access exclusion

Inspect dependencies, source, configuration, environment references, and generated
artifacts for database clients, credentials, schemas, migrations, connections, and
queries.

Expected: the frontend performs no direct PostgreSQL or other data-store access.

## VOC-006-TEST-12 — Deployment, autonomy, and secret exclusion

Inspect scripts, dependencies, configuration, ignored/untracked files, and diff for
Cloudflare/OpenNext, preview/staging/production, auto-merge, RL1/RL2, autonomous
release, credentials, or production data.

Expected: none is introduced or represented as active.

## VOC-006-TEST-13 — Exact risk and independent review

Run the classifier against exact base/head and the complete PR risk declaration;
inspect hosted checks; obtain independent Claude Code review of the exact candidate
and evidence.

Expected: the declaration is not below the path floor, applicable checks pass, and
the exact-SHA verdict is `PASS` or `PASS WITH NON-BLOCKING FINDINGS` with no blocking
finding.

## Required command minimum

The implementation must include at least:

```bash
pnpm install --frozen-lockfile
pnpm validate
pnpm --filter @vocanova/web build
pnpm --filter @vocanova/web typecheck
pnpm --filter @vocanova/web lint
```

Vitest, React Testing Library, and Playwright are intentionally not required here.

## Pass and failure rules

Any failed applicable test, unresolved Critical/High finding, unwaived Medium finding,
scope expansion, unstable/unjustified dependency, lockfile drift, masked failure,
direct data access, deployment capability, or missing authority blocks merge. A
material correction invalidates prior exact-SHA review.
