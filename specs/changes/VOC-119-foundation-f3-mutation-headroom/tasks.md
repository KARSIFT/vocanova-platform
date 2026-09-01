# VOC-119 — Tasks

## VOC-119-T01 — Recover VOC-105 mutation-test headroom without reducing coverage

- Branch: `impl/voc-119-foundation-f3-mutation-headroom`
- Base: exact adopted candidate SHA from this package
- Output: one implementation PR that changes only
  `scripts/foundation/voc105-f3-evidence-policy.test.mjs`

### Required work

1. Capture the exact parent measurements required by the implementation plan.
2. Refactor only the test-local mutation helper structure to reuse immutable canonical
   sources and direct surface-local validation where semantically equivalent.
3. Preserve every mutation member, diagnostic regex, positive safe case, wildcard
   discovery contract, and complete test count.
4. Rerun the five named tests, the complete VOC-105 file, and the complete foundation
   suite; record exact before/after durations and hosted final-SHA headroom.
5. Run the applicable governance/risk/diff checks and attach hosted required-check
   evidence.
6. Obtain exact-SHA independent cross-model R3 review from a different non-author
   actor before merge.

### Hard stops

- Need for any second implementation path.
- Need for any timeout increase or new timeout.
- Need for any workflow, aggregate, or package-script change.
- Any mutation-count reduction, skipped test, weakened diagnostic, or semantic
  failure.
- Any unrelated repository failure that prevents truthful validation.

### Deliverable evidence

- Exact path audit proving one-file scope.
- Before/after timing table for the five named tests.
- Complete VOC-105 file and complete foundation suite counts/durations.
- Hosted final-SHA validation duration, job duration, and remaining headroom.
- Exact-SHA independent review evidence and rollback plan.
