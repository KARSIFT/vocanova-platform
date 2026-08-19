# VOC-078 — Tasks

## VOC-078-T00 — Add the four deterministic target workflows

- Decisions: `VOC-078-D00`, `VOC-078-D04`
- Acceptance: `VOC-078-AC-00` through `VOC-078-AC-03`
- Tests: `VOC-078-TEST-00` through `VOC-078-TEST-03`
- Evidence: `VOC-078-EV-00` through `VOC-078-EV-03`
- Status: pending

Add the new workflows in parallel with the old set. Keep permissions read-only, pin actions, add
timeouts and path filters, and prove the jobs on a real PR before any old workflow is deleted.

## VOC-078-T01 — Retire karsift-ai-infra and the package state machine

- Decisions: `VOC-078-D00`, `VOC-078-D01`
- Acceptance: `VOC-078-AC-00`, `VOC-078-AC-02`, `VOC-078-AC-05`, `VOC-078-AC-06`
- Tests: `VOC-078-TEST-00`, `VOC-078-TEST-02`, `VOC-078-TEST-05`, `VOC-078-TEST-06`
- Evidence: `VOC-078-EV-00`, `VOC-078-EV-02`, `VOC-078-EV-05`, `VOC-078-EV-06`
- Status: pending

Delete external reusable-workflow callers and remove live documentation for automatic planning,
adoption, AI review/remediation, merge-gating, task auto-advance, and package release. Do not
recreate those jobs in-house.

## VOC-078-T02 — Remove the local orchestrator path

- Decisions: `VOC-078-D02`
- Acceptance: `VOC-078-AC-05`, `VOC-078-AC-06`
- Tests: `VOC-078-TEST-05`, `VOC-078-TEST-06`
- Evidence: `VOC-078-EV-05`, `VOC-078-EV-06`
- Status: pending

Remove orchestrator code/configuration and reconcile every active reference. Preserve concise
historical reasoning by superseding ADR-0001 rather than pretending the experiment never existed.

## VOC-078-T03 — Pause deployment, server health, and scheduled monitoring workflows

- Decisions: `VOC-078-D03`
- Acceptance: `VOC-078-AC-04`, `VOC-078-AC-06`, `VOC-078-AC-07`
- Tests: `VOC-078-TEST-04`, `VOC-078-TEST-06`, `VOC-078-TEST-07`
- Evidence: `VOC-078-EV-04`, `VOC-078-EV-06`, `VOC-078-EV-07`
- Status: pending

Delete only GitHub-side deploy/monitoring automation and reconcile operations/governance docs.
Do not change `infra/`, Dockerfiles, application health endpoints, secrets, Cloudflare, Sentry,
DNS, servers, environments, or repository settings.

## VOC-078-T04 — Remove superseded workflow duplicates

- Decisions: `VOC-078-D04`
- Acceptance: `VOC-078-AC-00` through `VOC-078-AC-03`
- Tests: `VOC-078-TEST-00` through `VOC-078-TEST-03`
- Evidence: `VOC-078-EV-00` through `VOC-078-EV-03`
- Status: pending

After replacement jobs pass, delete the old accessibility, Lighthouse, governance, repository
governance, and Dependabot risk-classification workflows. Confirm the exact final inventory.

## VOC-078-T05 — Final validation, rollback rehearsal, and exact-revision verification

- Decisions: all
- Acceptance: all
- Tests: all
- Evidence: `VOC-078-EV-00` through `VOC-078-EV-07`
- Status: pending

Run every required command, inspect real Actions runs, rehearse task-level reverts without
mutating protected branches, and obtain independent verification and founder approval on the
exact final revision. This task does not merge or deploy.
