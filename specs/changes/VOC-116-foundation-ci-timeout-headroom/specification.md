# VOC-116 — Specification

## Problem and measured baseline

The foundation job still has a 15-minute timeout although the current VOC-105/VOC-113
semantic corpus expanded its network-free suite to 204 tests. PR run `33499824172`,
job `99830331854`, passed in 873 seconds (14m33s), with validation consuming 842
seconds. The identical-tree post-merge push run `33502031765`, job `99837345020`, was
canceled after a 916-second lifecycle; validation ran for 880 seconds before
cancellation. `CI / ci required` then failed because `foundation=cancelled`, which is
correct aggregate behavior. Issue #218 also records a complete local 204/204 pass in
618,586 ms.

## Desired outcome

The complete unchanged foundation suite has an exact 20-minute hosted job budget.
Twenty minutes is a bounded safety cap: five minutes/33.3% above the old declared
budget, 327 seconds above the longest completed job, and 284 seconds above the canceled
job lifecycle. The value is validator-enforced so accidental reductions or unbounded
increases fail locally and in CI.

## Users affected

Contributors and reviewers receive reliable foundation evidence. Product users,
runtime behavior, data, and live systems are unaffected.

## In scope

- Change only `jobs.foundation.timeout-minutes` from integer `15` to integer `20`.
- Add an exact workflow-policy invariant and focused positive/negative fixtures.
- Preserve and explicitly test fail-closed required-job aggregation.
- Synchronize `.github/README.md`, DOC-11, and `docs/development.md`.
- Record deterministic, hosted, rollback, and monitoring evidence.

## Out of scope

Changing any command, test, dependency, package script, other job/timeout, trigger,
permission, concurrency rule, runner, cache, action, aggregate dependency, application,
runtime, API, database, infrastructure, settings, secret, environment, deployment,
release, production, data, DNS/traffic, spending, or launch behavior is prohibited.

## Functional and business requirements

The uniquely named `foundation` job must use `timeout-minutes: 20` exactly. It must
continue to execute the unchanged `pnpm run ci:foundation` entry point, including
workspace validation, formatting, package build, every evidence policy, and automatic
discovery of every `scripts/foundation/*.test.mjs` test. The current 204 tests are a
measured baseline, not permission to hard-code a test filter or tolerate future loss.

`ci required` must retain `if: always()`, all current needs, and the existing
`require-successful-jobs.sh` call. Only `success` for every required subsystem may
pass. `failure`, `cancelled`, `skipped`, missing, or unknown foundation results remain
blocking.

## Validator contract

`inspectTargetWorkflow("ci.yml", source)` must identify exactly one top-level
`foundation` job and exactly one scalar `timeout-minutes` inside it, parsed as the
unquoted base-10 integer `20`. The validator must reject 15, 19, 21, 30, strings,
expressions, decimals, missing/duplicate keys, duplicate foundation jobs, and a value
of 20 placed only on another job. Existing common-policy timeout-count checks remain.

## Security, privacy, accessibility, data, and API requirements

The change remains credential-free and read-only. It introduces no secret, permission,
network call, artifact, personal data, UI, accessibility surface, API, contract,
schema, or migration. Existing production and learner-data holds remain active.

## Performance expectations

The 20-minute value is an upper cancellation boundary, not an expected runtime or a
license for growth. Hosted success must complete below 20 minutes and report the full
suite. A job at/over the bound or renewed timeout cancellation is a failure signal,
not justification for automatic cap growth.

## Error and edge-case behavior

- An invalid timeout representation fails workflow policy with a foundation-specific diagnostic.
- A valid timeout on another job cannot compensate for a missing/wrong foundation value.
- A complete suite failure remains a failure; extra time cannot convert it to success.
- A cancellation or missing result remains blocked by the aggregate.
- Future measured growth that consumes the new headroom requires new defect intake and governance.

## Compatibility and assumptions

GitHub Actions supports integer job timeouts and the repository already uses 20-minute
caps on other jobs. The current workflow/test discovery and six-path impact inventory
are verified at base `b22a735...`; if implementation disproves either, it must stop and
return to planning. No open design question remains in this draft.

## Authority boundary

Issue #218 and this draft grant no implementation or external authority. Adoption may
authorize only the declared six-path repository correction. It cannot authorize
settings, secrets, dispatch, deployment, release, production, data, or live action.
