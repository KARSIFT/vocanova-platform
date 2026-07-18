# VOC-006 Acceptance Criteria

## VOC-006-AC-01 — Genuine canonical App Router application

`apps/web` is a genuine Next.js App Router application and no alternate web root is
created.

Traceability: `VOC-006-R01`; `VOC-006-T02`; `VOC-006-TEST-02`; `VOC-006-EV-03`.

## VOC-006-AC-02 — Minimal rendering foundation

A minimal root layout, global styling entry point, and intentionally non-product root
page render successfully without speculative product structure.

Traceability: `VOC-006-R02`, `VOC-006-R03`; `VOC-006-T03`; `VOC-006-TEST-03`;
`VOC-006-EV-04`.

## VOC-006-AC-03 — Real production build

The web application builds successfully through the repository's approved command
model from a clean installed checkout.

Traceability: `VOC-006-R07`, `VOC-006-R08`; `VOC-006-T04`; `VOC-006-TEST-04`;
`VOC-006-EV-05`.

## VOC-006-AC-04 — Bounded development-server proof

The real Next.js development server starts, becomes ready, serves the minimal page,
and is deliberately terminated by a documented bounded smoke procedure.

Traceability: `VOC-006-R09`; `VOC-006-T05`; `VOC-006-TEST-05`; `VOC-006-EV-06`.

## VOC-006-AC-05 — Next.js-aware type validation

Type checking performs real framework-aware TypeScript validation, propagates
failures, and is reachable through the approved web/root command model.

Traceability: `VOC-006-R06`, `VOC-006-R07`; `VOC-006-T06`;
`VOC-006-TEST-06`; `VOC-006-EV-07`.

## VOC-006-AC-06 — Real lint validation

Linting performs a real supported validation, propagates failures, and contains no
passing placeholder or obsolete framework command.

Traceability: `VOC-006-R06`, `VOC-006-R07`; `VOC-006-T06`;
`VOC-006-TEST-07`; `VOC-006-EV-07`.

## VOC-006-AC-07 — Reproducible minimal dependencies

Only necessary supported stable dependencies are exactly pinned and justified;
`pnpm install --frozen-lockfile` succeeds without lockfile mutation; unrelated
dependencies remain unchanged.

Traceability: `VOC-006-R04`, `VOC-006-R05`, `VOC-006-R08`; `VOC-006-T07`;
`VOC-006-TEST-08`; `VOC-006-EV-08`.

## VOC-006-AC-08 — Existing validation preserved

Existing root, web, API, workspace, and governance validation remains green, and any
necessary integration change outside `apps/web` is narrow and justified.

Traceability: `VOC-006-R10`; `VOC-006-T08`; `VOC-006-TEST-09`;
`VOC-006-EV-09`.

## VOC-006-AC-09 — No product, backend, or later-F2 scope

The diff contains no product/auth behavior, real API integration, backend expansion,
frontend test harness, speculative future-stack setup, F2-I04, or later F2 work.

Traceability: `VOC-006-R11`, `VOC-006-R12`; `VOC-006-T09`;
`VOC-006-TEST-10`; `VOC-006-EV-10`.

## VOC-006-AC-10 — No direct data-store access

The frontend contains no PostgreSQL or other data-store client, credential,
connection, query, schema, or migration behavior.

Traceability: `VOC-006-R11`; `VOC-006-T09`; `VOC-006-TEST-11`;
`VOC-006-EV-10`.

## VOC-006-AC-11 — No deployment or autonomy activation

No deployment, preview/staging/production, automatic merge, RL1/RL2, autonomous
release, secret, or production capability is added or represented as active.

Traceability: `VOC-006-R13`; `VOC-006-T09`; `VOC-006-TEST-12`;
`VOC-006-EV-10`.

## VOC-006-AC-12 — Governed exact-candidate handoff

The later draft implementation PR records exact base/head, changed files, version
rationale, validation, rollback, classifier output, hosted status, and exact-SHA
independent review, then stops without merge, deployment, self-approval, or issue
closure.

Traceability: `VOC-006-R14`; `VOC-006-T10`; `VOC-006-TEST-13`;
`VOC-006-EV-11`.
