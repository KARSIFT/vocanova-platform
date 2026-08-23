# VOC-083 — Tasks

## VOC-083-T00 — Evidence matrix and candidate decision

- Requirements: `VOC-083-R00`
- Acceptance: `VOC-083-AC-00`
- Tests: `VOC-083-TEST-00`
- Evidence: `VOC-083-EV-00`
- Status: blocked-until-plan-adoption

Reproduce the locked failure locally, inventory direct/transitive Sentry imports and
generated bundle locations, retrieve current primary-source compatibility evidence,
and compare configuration fix, package update, and Workers-native adapter. Document an
exact selected version/configuration and rejected alternatives only after reporting-
equivalence and safety evidence; otherwise stop and route a new decision.

## VOC-083-T01 — Preserve reporting with the selected Workers-safe repair

- Requirements: `VOC-083-R01`, `VOC-083-R02`
- Acceptance: `VOC-083-AC-01`, `VOC-083-AC-02`
- Tests: `VOC-083-TEST-01`, `VOC-083-TEST-02`
- Evidence: `VOC-083-EV-01`, `VOC-083-EV-02`
- Status: blocked-by-T00

Implement the selected smallest repair; regenerate and review any lockfile change;
preserve server/Worker/browser capture and privacy controls; and add deterministic,
non-network reporting-equivalence tests. Do not turn off Sentry or source-map controls.

## VOC-083-T02 — Generated-bundle and workerd-log fail-closed evidence

- Requirements: `VOC-083-R01`, `VOC-083-R03`, `VOC-083-R04`
- Acceptance: `VOC-083-AC-01`, `VOC-083-AC-03`, `VOC-083-AC-04`
- Tests: `VOC-083-TEST-01`, `VOC-083-TEST-03`, `VOC-083-TEST-04`
- Evidence: `VOC-083-EV-01`, `VOC-083-EV-03`, `VOC-083-EV-04`
- Status: blocked-by-T01

Add output-artifact invariants and fixture-backed log classification to both local
workerd smoke owners; make CI require them through existing commands/jobs. Preserve the
service-binding and disabled-DSN no-network contract.

## VOC-083-T03 — Documentation, exact-SHA review, and rollback evidence

- Requirements: all
- Acceptance: `VOC-083-AC-04`, `VOC-083-AC-05`
- Tests: `VOC-083-TEST-05`, `VOC-083-TEST-06`
- Evidence: `VOC-083-EV-05`, `VOC-083-EV-06`
- Status: blocked-by-T02

Reconcile affected active docs, run the proportionate final checks, independently
review the exact final revision with Cloudflare/Workers/Sentry specialization, and
rehearse repository-only rollback. Do not claim hosted proof, independent PASS before
it exists, or any live Sentry/Cloudflare outcome.
