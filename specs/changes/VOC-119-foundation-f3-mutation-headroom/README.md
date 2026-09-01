# VOC-119 — Restore foundation F3 mutation-test headroom without reducing coverage

Issue [#228](https://github.com/KARSIFT/vocanova-platform/issues/228) records a
hosted foundation near-cap regression on PR #215 head
`476ac55bb5ade513916fa3aacadd8c1a2742430b`: run
`33527039103`, foundation job `99920414097`, 253/253 passing, validation duration
`1,050,570 ms` (17m30.6s), and only about 69 seconds of total job headroom under
VOC-116's exact 20-minute cap.

Read-only planning measurements on exact `origin/develop`
`e1379508621ee228ae06c88ebcad3b1b018ef4cc` disproved the leading "fixture copy or
process startup is the main cause" assumption. A representative one-file mutation
path averaged `56.882 ms`, of which `inspectF3Evidence()` itself consumed
`55.215 ms`; fixture creation, snapshot, mutation, and changed-path bookkeeping
together averaged only `1.668 ms`. The exported surface-local policy path,
`inspectF3Surface()`, averaged `6.071 ms` on the same class of mutated input.

The largest named hotspot, `later authority claim grammar fails across every
surface`, performs 6,462 mutation assertions. From the measured averages, that
implies about `356.8 s` of repeated `inspectF3Evidence()` time, about `367.6 s` for
the representative full mutation path, and about `39.2 s` through the already
exported surface-local path. Those figures are inferences from local averages and
loop cardinality, not claimed post-change results.

This draft R3 repository-only package authorizes no implementation yet. After exact
plan review and adoption, one future implementation PR may change only
`scripts/foundation/voc105-f3-evidence-policy.test.mjs`. It must preserve every
existing mutation member, positive safe clause, diagnostic expectation, wildcard test
discovery, foundation aggregate, and the exact 20-minute hosted timeout. It may not
skip, shard away, retry, weaken, reduce coverage, or raise any timeout.

Allocator evidence on 2026-09-01 found VOC-118 already merged on `develop` (plan PR
#224, implementation PR #227) and no existing `VOC-119` package, branch, or default-
branch content. `VOC-119` is therefore the next free package ID.

## Artifacts

- [Specification](specification.md)
- [Acceptance criteria](acceptance-criteria.md)
- [Impact analysis](impact-analysis.md)
- [Implementation plan](implementation-plan.md)
- [Tasks](tasks.md)
- [Test plan](test-plan.md)
- [Release plan](release-plan.md)
