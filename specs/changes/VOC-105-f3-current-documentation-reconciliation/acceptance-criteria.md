# VOC-105 — Acceptance Criteria

## VOC-105-AC-00 — Evidence-bound F3 state

- Requirements: `VOC-105-D00`, `D02`
- Task: `VOC-105-T00`
- Tests: `VOC-105-TEST-00`, `TEST-01`
- Evidence: `VOC-105-EV-00`, `EV-01`
- Result: pending exact implementation evidence

The current record binds F2, Phase 1 resource/observability/rollback, Phase 2
closure, standard settings truth, and the exact successful delivery run. It states
F3 `complete-effective` only if every DOC-12 gate item validates; otherwise it stays
partial/pending with a concrete missing-evidence reason. The exact run SHA/run ID and
successful migration, promotion, smoke, and expected rollback-skipped outcomes are
distinctly recorded.

## VOC-105-AC-01 — Active documents are truthful and bounded

- Requirements: `VOC-105-D01`, `D02`
- Task: `VOC-105-T00`
- Tests: `VOC-105-TEST-01`, `TEST-02`
- Evidence: `VOC-105-EV-01`, `EV-02`
- Result: pending exact implementation evidence

Every active surface no longer calls F3/staging unresolved when the validated evidence
record is complete-effective. A1/P1+, production, public launch, learner data, and
HOLD-01/HOLD-02 remain unresolved/held. Historical VOC-094–104 package text is not
rewritten, and no secret or protected immutable Worker ID is present.

## VOC-105-AC-02 — Machine validation fails closed

- Requirements: `VOC-105-D03`
- Task: `VOC-105-T00`
- Tests: `VOC-105-TEST-02`, `TEST-03`
- Evidence: `VOC-105-EV-02`, `EV-03`
- Result: pending exact implementation evidence

The new validator is network-free, runs exactly once from `ci:foundation`, validates
the schema/evidence chain and active surfaces, and rejects missing/wrong/failed/stale
evidence, prohibited disclosure, later-milestone claims, and hold release.

## VOC-105-AC-03 — Repository-only scope and rollback

- Requirements: `VOC-105-D04`
- Task: `VOC-105-T00`
- Tests: `VOC-105-TEST-04`
- Evidence: `VOC-105-EV-04`
- Result: pending exact implementation evidence

Only the declared documentation, evidence, validator/test, and foundation-command
paths change. A reviewed repository revert restores the prior active wording and
validator chain; it does not delete resources, reverse D1, revoke secrets, dispatch,
or alter any live system. VOC-105 does not claim to satisfy or close issue #189,
because that issue's separate A1 planning outcome remains outstanding.

## VOC-105-AC-04 — Exact revision is independently verified

- Requirements: `VOC-105-D05`
- Task: `VOC-105-T00`
- Tests: `VOC-105-TEST-05`
- Evidence: `VOC-105-EV-05`
- Result: pending exact implementation evidence

The exact candidate receives fresh canonical-documentation/milestone-evidence
specialist PASS and independent R4 PASS verdicts from different non-authors, all
blocking findings are resolved with fresh checks, and a separate non-author merges.

## VOC-105-AC-05 — A1 remains separate

- Requirements: `VOC-105-D01`, `D04`
- Task: `VOC-105-T00`
- Tests: `VOC-105-TEST-01`, `TEST-04`
- Evidence: `VOC-105-EV-01`, `EV-04`
- Result: pending exact implementation evidence

No A1 implementation or acceptance is included. A later package must independently
specify and review authentication/user-foundation scope after F3 is effective.
