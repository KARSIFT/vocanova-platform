# VOC-118 — Bound the stale-reconciliation integration test timeout

Issue [#223](https://github.com/KARSIFT/vocanova-platform/issues/223) records an
intermittent hosted timeout in the unchanged API-worker data-conversion suite. On PR
#215 head `ad9edd7c9caa912d36d3885acd62d90e80bd2a84`, CI run `33513868763`, worker job
`99876022617` passed 82 of 83 tests, while
`reruns a completed reconciliation instead of returning a stale pass` reached
Vitest's exact default 5,000-ms per-test timeout.

The same test passed locally in 1.01 s focused (2.96-s command) and 552 ms in the
complete file (20/20; 5.74-s file tests). Fresh planning measurements on exact
`develop` repeated the unmodified file and complete worker suite three times each:
the file passed 20/20 with the named test at 558, 747, and 842 ms; the worker suite
passed 99/99 with it at 749, 839, and 813 ms. This supports hosted contention as a
measured hypothesis, not a conversion-correctness failure.

This draft R3 package authorizes no implementation. After review and adoption, one
future implementation PR may change only
`apps/api-worker/test/data-conversion.test.ts`. It must repeat baseline measurements,
then—only if behavior remains correct and contention remains the supported cause—add
one literal 10,000-ms timeout to the single integration-heavy test. It may not change
Vitest globals, retry, serialize differently, weaken assertions, or alter conversion,
import, reconciliation, checkpoint, D1, or production behavior.

Allocator verification found VOC-116 on `develop`, VOC-117 reserved by open plan PR
#222, and no existing VOC-118 package, issue title, local/remote branch, or ref. VOC-118
is therefore the next available package ID.

## Artifacts

- [Specification](specification.md)
- [Acceptance criteria](acceptance-criteria.md)
- [Impact analysis](impact-analysis.md)
- [Implementation plan](implementation-plan.md)
- [Tasks](tasks.md)
- [Test plan](test-plan.md)
- [Release plan](release-plan.md)
