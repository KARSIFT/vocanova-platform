# VOC-119 — Impact Analysis

## Summary

This package addresses a required foundation-suite headroom regression without
changing the underlying VOC-105 policy semantics, workflow contract, or hosted
timeout. The measured hotspot is repeated full-aggregate validation inside a single
mutation-heavy test file, so the safe coherent unit is one future implementation PR
against one test file.

## Surfaces

| Surface                                                 | Classification                  | Effect                                                                             |
| ------------------------------------------------------- | ------------------------------- | ---------------------------------------------------------------------------------- |
| `scripts/foundation/voc105-f3-evidence-policy.test.mjs` | Affected                        | Planned implementation path. Refactor test-local setup and assertion routing only. |
| `scripts/foundation/voc105-f3-evidence-policy.mjs`      | Preserved protected surface     | Production policy semantics stay byte-identical.                                   |
| `package.json`                                          | Preserved current-truth surface | Exact `ci:foundation` wiring and wildcard discovery remain unchanged.              |
| `.github/workflows/ci.yml`                              | Preserved protected surface     | Exact foundation job and VOC-116 20-minute cap remain unchanged.                   |
| `docs/development.md`                                   | Preserved living doc            | No command-contract change is permitted.                                           |
| Other `scripts/foundation/*.test.mjs`                   | Preserved verifier set          | No sharding or spillover into other files.                                         |

## Measured diagnosis

- Hosted issue evidence shows the current problem is not failure but near-cap elapsed
  time inside the foundation job.
- Local profiling on exact base `e1379508621ee228ae06c88ebcad3b1b018ef4cc` shows the
  dominant cost is `inspectF3Evidence()` itself, not temp-fixture support work.
- The exported `inspectF3Surface()` path is materially cheaper and already embodies
  production policy semantics for one designated surface at a time.
- The largest named matrix executes 6,462 mutation assertions, so even moderate per-
  assertion savings materially affect hosted headroom.

## Why one file is the largest safe coherent unit

The issue asks for a plan-only correction boundary with no coverage reduction, no
timeout increase, and no workflow change. The most defensible interpretation is:

1. Keep production validator behavior unchanged.
2. Rework only the test helper structure that repeatedly invokes the aggregate path.
3. Preserve every mutation case and diagnostic expectation.

Editing the policy module, package scripts, or workflow would broaden the risk from
test structure into protected semantics or CI control-plane behavior. The local
measurements do not justify that broader scope.

## Risk analysis

The automated path floor is R1 because the implementation target is a test file. The
effective risk is R3 because the file is part of the required foundation verifier for
protected delivery/governance wording boundaries. The main failure mode is a false
pass created by over-localizing checks that actually depend on aggregate state.

The package counters that risk by requiring:

- exact one-file scope;
- byte-for-byte preservation of the policy module and workflow/script surfaces;
- explicit retention of full `inspectF3Evidence()` for aggregate cases;
- before/after timing capture plus complete foundation validation;
- exact-SHA independent cross-model R3 review.

## Privilege and authority impact

There is no privilege expansion. The package does not alter permissions, triggers,
job timeouts, GitHub settings, secrets, workflows, Cloudflare access, deployment,
production data, learner data, DNS/traffic, spending, release, or launch authority.

## Rollback impact

If the implementation changes semantic behavior, reduces counts, or fails to restore
hosted headroom, rollback is a complete reviewed revert of the one changed file to
its exact implementation parent. No partial rollback or external action is needed.
