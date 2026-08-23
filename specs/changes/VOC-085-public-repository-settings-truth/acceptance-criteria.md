# VOC-085 — Acceptance Criteria

## VOC-085-AC-00 — Current settings truth is recorded separately from history

- Requirements: `VOC-085-D00`, `VOC-085-D01`
- Tasks: `VOC-085-T00`
- Tests: `VOC-085-TEST-00`
- Evidence: `VOC-085-EV-00`

A machine-readable `docs/governance/repository-settings-current.yaml` record contains
the exact read-only public-repository,
merge, Actions, ruleset, branch-protection, Dependabot, and secret-scanning observations
listed in the specification, with observation date and source. VOC-080's private snapshot
remains unchanged and explicitly historical. No secret, token, environment value, or
live-system claim is present.

## VOC-085-AC-01 — Living guidance describes current public posture

- Requirements: `VOC-085-D02`, `VOC-085-D03`
- Tasks: `VOC-085-T01`
- Tests: `VOC-085-TEST-01`
- Evidence: `VOC-085-EV-01`

README, `.github/README.md`, repository-settings guidance, Cloudflare delivery guidance,
and DOC-16 no longer describe private-plan limitations as the current repository state.
They link current facts to the current-state record and label the VOC-080 snapshot as
historical. They distinguish enabled Actions hardening from absent/disabled controls.

## VOC-085-AC-02 — Desired mature protections remain future and held

- Requirements: `VOC-085-D04`, `VOC-085-D05`
- Tasks: `VOC-085-T01`
- Tests: `VOC-085-TEST-01`, `VOC-085-TEST-02`
- Evidence: `VOC-085-EV-02`

Rulesets, protected branches, security-feature enablement, environment protections,
and delivery activation are described as prospective/held targets only. No document
claims they were enabled by this package or that public visibility itself proves them.

## VOC-085-AC-03 — Truthfulness guard fails closed

- Requirements: `VOC-085-D03`, `VOC-085-D04`
- Tasks: `VOC-085-T02`
- Tests: `VOC-085-TEST-03`, `VOC-085-TEST-04`
- Evidence: `VOC-085-EV-03`

The network-free validator passes the reconciled repository and rejects scoped negative
fixtures for stale private-current claims, historical/current conflation, held-control
promotion, missing current-state fields, and settings-mutation claims. It does not
reject explicitly marked historical or prospective text.

## VOC-085-AC-04 — Scope, evidence, rollback, and hosted proof are complete

- Requirements: all
- Tasks: `VOC-085-T03`
- Tests: `VOC-085-TEST-05`, `VOC-085-TEST-06`
- Evidence: `VOC-085-EV-04`

The final implementation receives exact-SHA independent PASS, applicable hosted checks,
and a repository-only reverse rollback rehearsal. No setting, environment, live system,
secret, production data, deployment, `main` promotion, or branch deletion occurs. Issue
#119 remains open until the final merge and passing post-merge checks, after which it may
be closed with exact current-state and documentation evidence only.
