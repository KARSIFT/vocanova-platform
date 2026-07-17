# VOC-005 Acceptance Criteria

## VOC-005-AC-01 — Canonical application placement

`apps/web` and `apps/api` are tracked application roots; neither `services/api`, a
root `backend/`, nor `apps/mobile` is created.

Traceability: `VOC-005-R01`; `VOC-005-T02`; `VOC-005-TEST-02`; `VOC-005-EV-03`.

## VOC-005-AC-02 — Shared workspace boundaries

All four approved `packages/*` roots exist; the existing `docs/` and `scripts/` roots
remain intact; `infra/` is structural and contains no deployment capability; and the
pnpm workspace includes only the root, web, and shared JavaScript/TypeScript
projects—not the Go backend.

Traceability: `VOC-005-R02`, `VOC-005-R04`; `VOC-005-T03`; `VOC-005-TEST-03`;
`VOC-005-EV-03`.

## VOC-005-AC-03 — Minimal Go backend foundation

`apps/api` contains the approved modular-monolith foundations and passes real format,
vet, build, and test checks without domain schema, real migrations, business APIs, or
product behavior.

Traceability: `VOC-005-R03`, `VOC-005-R10`; `VOC-005-T04`; `VOC-005-TEST-04`;
`VOC-005-EV-04`.

## VOC-005-AC-04 — Explicit reproducible toolchain

The exact package manager and supported Node.js and Go versions are declared in
checked-in conventional configuration; dependency installation succeeds from a clean
checkout using the frozen lockfile.

Traceability: `VOC-005-R05`, `VOC-005-R08`; `VOC-005-T05`; `VOC-005-TEST-05`;
`VOC-005-EV-05`.

## VOC-005-AC-05 — Honest root commands

Documented root development, validation, lint, type-check, test, build, formatting,
and audit commands resolve correctly, run real checks, propagate failures, and contain
no passing placeholder for unavailable capabilities.

Traceability: `VOC-005-R06`, `VOC-005-R07`, `VOC-005-R13`; `VOC-005-T06`;
`VOC-005-TEST-06`, `VOC-005-TEST-07`; `VOC-005-EV-06`.

## VOC-005-AC-06 — Minimal web validation

The web skeleton passes its initialized real build, lint, and type-check paths with no
product screen, feature, or unauthorized frontend-framework decision.

Traceability: `VOC-005-R09`; `VOC-005-T07`; `VOC-005-TEST-08`;
`VOC-005-EV-07`.

## VOC-005-AC-07 — Clean local workflow and documentation

Only necessary cross-platform ignore/editor/configuration files are added, and concise
documentation states prerequisites, frozen installation, root commands, web/API
commands, and troubleshooting for deterministic failures.

Traceability: `VOC-005-R11`; `VOC-005-T08`; `VOC-005-TEST-09`;
`VOC-005-EV-08`.

## VOC-005-AC-08 — Existing and new validation pass

All existing governance/foundation commands and all real F2 workspace commands pass
on the exact candidate, and negative checks prove representative failures are not
masked.

Traceability: `VOC-005-R07`, `VOC-005-R12`; `VOC-005-T09`;
`VOC-005-TEST-01`, `VOC-005-TEST-10`; `VOC-005-EV-09`.

## VOC-005-AC-09 — Scope and safety preserved

The diff contains no feature, auth, domain schema, real migration, production
infrastructure, deployment, autonomous-development activation, secret, production
data, unrelated governance redesign, or later F2 work.

Traceability: `VOC-005-R13`, `VOC-005-R14`; `VOC-005-T10`;
`VOC-005-TEST-11`; `VOC-005-EV-10`.

## VOC-005-AC-10 — Governed implementation handoff

The later implementation draft PR records exact base/head SHAs, actual classifier
output, effective semantic risk, deterministic and hosted checks, exact-SHA Claude
verdict, rollback impact, and remaining human gates without merge or deployment.

Traceability: `VOC-005-R15`; `VOC-005-T11`; `VOC-005-TEST-12`;
`VOC-005-EV-11`.
