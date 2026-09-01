# VOC-119 — Release Plan

## Release shape

This package is repository-only. Its future implementation release is one reviewed PR
into `develop` that changes exactly one test file. It does not dispatch, deploy,
publish, migrate a remote system, or affect Cloudflare, production, learner data,
DNS, traffic, spending, or launch state.

## Preconditions

- This plan package is independently reviewed and adopted.
- The implementation stays within the exact one-file scope.
- Before/after timing evidence, complete foundation validation, and hosted required
  checks are attached to the implementation PR.
- Exact-SHA independent cross-model R3 review is PASS with zero unresolved blockers.
- Merge is performed by a separate non-author actor.

## Merge-time evidence

The implementation PR must record:

- exact parent/head SHAs;
- exact one-file path inventory;
- before/after timings for the five named tests;
- complete VOC-105 file and complete foundation suite counts/durations;
- hosted final-SHA foundation validation duration, job duration, and remaining
  headroom under the exact 20-minute cap;
- unchanged workflow/package-script/timeout evidence.

## Rollback

Trigger rollback if any of the following occurs on the final SHA or exact merge SHA:

- semantic regression in any VOC-105 test;
- reduced count, skipped test, or weakened diagnostic;
- any timeout addition/increase or workflow/script drift;
- hosted foundation remains near-cap or regresses to cancellation.

Rollback is a complete reviewed revert of the implementation commit(s) affecting only
`scripts/foundation/voc105-f3-evidence-policy.test.mjs`, returning to the exact
implementation parent. No partial rollback is allowed.

## Post-merge monitoring

Monitor the exact merge SHA for:

- the five issue-named test durations when reproduced locally;
- complete VOC-105 file wall duration;
- complete foundation suite result and wall duration;
- hosted foundation validation duration, total job duration, and remaining headroom.

Do not claim issue #228 closed until the hosted final-SHA evidence shows concrete
headroom below the exact 20-minute cap and no semantic/count regression.
