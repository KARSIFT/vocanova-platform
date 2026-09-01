# VOC-119 — Specification

## Problem and exact evidence

Issue #228 records a hosted near-cap regression in the required foundation suite.
On PR #215 head `476ac55bb5ade513916fa3aacadd8c1a2742430b`, GitHub Actions run
`33527039103`, foundation job `99920414097`, the job passed 253 of 253 tests but
consumed `18m51s` of the exact 20-minute job cap. Validation alone took
`1,050,570 ms` (`17m30.6s`), leaving only about 69 seconds of total job headroom.

The issue already narrows the likely hotspot away from the newly added VOC-115
release-attempt policy suite, which completes locally in about 139 ms. Its hosted
slow tail instead clusters in five VOC-105 mutation-heavy tests:

| Named test | Hosted duration |
| ---------- | ---------------:|
| `later authority claim grammar fails across every surface` | `508,154 ms` |
| `canonical guarded runbook regions pass and every guard drift or command fails` | `171,580 ms` |
| `history checks reject only superseded F3 current claims` | `158,991 ms` |
| `protected credential and F3 occurrences fail closed on every surface` | `68,459 ms` |
| `protected safe subjects bind generated positive continuation grammar` | `35,178 ms` |

Read-only planning measurements on exact `origin/develop`
`e1379508621ee228ae06c88ebcad3b1b018ef4cc` confirm the dominant local cost is
repeated full-validator work, not temp-fixture churn:

| Measurement | Runs | Average |
| ----------- | ---: | ------: |
| Representative mutation helper end-to-end | 20 | `56.882 ms` |
| `inspectF3Evidence()` inside that path | 20 | `55.215 ms` |
| Fixture create + snapshot + mutate + changed-path bookkeeping | 20 | `1.668 ms` |
| Direct `inspectF3Surface()` on equivalent mutated source | 200 | `6.071 ms` |

The largest issue-named matrix, `later authority claim grammar fails across every
surface`, contains 6,462 mutation assertions. From the measured local averages, that
implies about `321.9 s` of repeated validator time through the full aggregate path and
about `39.2 s` through the already exported surface-local path. That comparison is an
inference from measured averages and loop cardinality; it is not yet a measured
post-implementation result.

## Requirements

1. Treat issue #228, its hosted run/job/head evidence, and all planning measurements
   as defect intake and diagnosis only. They grant no implementation or live-system
   authority.
2. Keep the future correction in one implementation PR and one task. The sole
   implementation path is `scripts/foundation/voc105-f3-evidence-policy.test.mjs`.
   If a second path appears necessary, stop and return to governed planning.
3. Preserve the production policy module,
   `scripts/foundation/voc105-f3-evidence-policy.mjs`, byte-for-byte. The change must
   optimize test structure around existing exported policy functions rather than alter
   validator semantics.
4. Use an immutable canonical-source baseline and direct surface-local validation only
   for mutation cases whose semantics depend on one designated surface at a time.
   Keep full `inspectF3Evidence()` coverage wherever the assertion actually depends on
   aggregate designated-surface existence, record JSON structure, package script
   wiring, or cross-file invariants.
5. Preserve every mutation member, safe clause, prohibited clause, diagnostic regex,
   assertion count, designated surface, and wildcard discovery behavior in the named
   slow tests and the rest of the file. No skip, retry, sharding, timeout increase,
   coverage reduction, or assertion weakening is allowed.
6. Preserve VOC-116's exact 20-minute foundation cap and the exact
   `pnpm run ci:foundation` command shape. The correction must recover headroom by
   removing repeated immutable work only, not by altering workflows or time budgets.
7. Capture exact before/after durations for the five issue-named tests, the complete
   VOC-105 file, the complete foundation suite, and the hosted final-SHA job headroom.
   A remaining near-cap hosted result, skipped test, timeout increase, or semantic
   regression blocks merge and issue closure.
8. Require exact path/preservation audits, applicable governance/risk/format/diff
   checks, focused VOC-105 tests, the full `ci:foundation` command, hosted required
   checks, and exact-SHA independent cross-model R3 review by a different non-author
   actor. Any material edit invalidates prior review.
9. Keep the work repository-only, credential-free, settings-free, dispatch-free,
   deployment-free, and production-data-free.

## Scope and non-goals

This package plans a coverage-preserving performance correction inside one foundation
test file. It does not authorize changes to:

- the VOC-105 policy module or its protected grammar;
- package scripts, wildcard discovery, or any other foundation test file;
- CI workflow jobs, permissions, aggregates, or the exact 20-minute cap from VOC-116;
- Node test-runner flags, timeouts, retries, sharding, or parallelization policy;
- Cloudflare, production, learner data, GitHub settings, deployment, release, or
  launch behavior.

## Risk and compatibility

The changed path is a test file with an automated R1 floor, but it is a required
foundation verifier for protected governance and delivery wording boundaries. A false
pass or silent coverage reduction would weaken repository controls, so the effective
risk is R3.

The compatibility assumption is narrow: the current exported surface-local policy
functions are sufficient for the designated-surface mutation cases that dominate the
slow tests. If exact implementation disproves that assumption, implementation must
stop instead of broadening scope.
