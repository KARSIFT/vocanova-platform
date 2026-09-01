# VOC-118 — Tasks

## VOC-118-T00 — Measure and bound the stale-reconciliation test

- Requirements: `VOC-118-D00` through `VOC-118-D10`
- Acceptance criteria: `VOC-118-AC-00` through `VOC-118-AC-07`
- Tests: `VOC-118-TEST-00` through `VOC-118-TEST-07`
- Evidence: `VOC-118-EV-00` through `VOC-118-EV-07`
- Implementation path: exactly `apps/api-worker/test/data-conversion.test.ts`
- Delivery: one future implementation PR after adoption
- Risk: R3 semantic required-verifier effect
- Status: draft; implementation prohibited

After adoption, repeat the unmodified measurement gate, stop on semantic evidence,
otherwise add exactly one literal 10,000-ms timeout to the named test, preserve all
conversion/reconciliation/lock semantics and every other surface, run complete local
and hosted evidence, rehearse rollback, obtain fresh independent review, and use a
separate non-author merge actor.
