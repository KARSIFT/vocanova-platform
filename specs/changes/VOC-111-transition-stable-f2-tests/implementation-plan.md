# VOC-111 — Implementation Plan

## Preconditions and delivery shape

Do not implement until this exact package is independently reviewed, adopted, and
merged to `develop`. Use one isolated short-lived implementation worktree, one task,
one implementation PR, and one rollback point. The implementation changes exactly one
test file and performs no live or external action.

## Exact path inventory

| Path                                                      | Classification               | Planned change                                                                                                                                                                                |
| --------------------------------------------------------- | ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `scripts/foundation/voc081-f2-evidence-policy.test.mjs`   | present-needs-reconciliation | Add exact record-driven profile selection, profile-independent duplicate injection, literal pre-profile sources, two complete synthetic profile positives, and stable both-direction hybrids. |
| `scripts/foundation/voc081-f2-evidence-policy.mjs`        | present-compatible-protected | Do not edit; its exact profile selection, surface contracts, raw duplicate detection, false-claim checks, aggregate validation, and command parser remain authoritative runtime behavior.     |
| `package.json`, docs, evidence, workflows, apps, packages | present-compatible-protected | Do not edit.                                                                                                                                                                                  |
| Preserved `/tmp/vocanova-voc105-impl` candidate           | read-only-inspection-only    | Reproduce and later observe only; never source expected fixture text and never modify from VOC-111.                                                                                           |
| `specs/changes/VOC-111-transition-stable-f2-tests/*`      | plan-only                    | Nine-artifact plan; not part of the later one-file implementation diff.                                                                                                                       |

## Ordered implementation

1. Record exact implementation base
   `c94444bc74d3ed1b5ca0aca65141d0532f70fa11`. Reproduce current baseline PASS and the
   preserved VOC-105 candidate's runtime PASS/PASS plus focused 24/27 three-failure
   result without modifying either tree.
2. Inventory every current focused test name and protected assertion group. Establish
   a before/after mapping proving no VOC-110 or VOC-109 positive/negative disappears,
   skips, becomes active-profile-only, or accepts an unrelated diagnostic.
3. Define the two exact plan-owned milestone objects and test-only exact recursive
   equality/profile selector. Select `repositoryRoot` profile once from the full
   record, pass it explicitly to living-surface inspection, and use its exact profile
   marker set for current-source mutation diagnostics.
4. Add the plan-specified duplicate raw-member helper. Assert unique match and actual
   injection. Exercise `f3_staging` for both complete synthetic profiles and
   `f3_current_evidence` for VOC-105, one key/fixture at a time.
5. Add all literal plan-owned pre-profile marker arrays and F2-document support array
   exactly as specified. Assemble sources only by LF joining committed literals.
   Preserve the existing plan-owned future constants. Prove each source family and
   both complete repositories pass before creating any hybrid.
6. For each of the five human surfaces, create a complete VOC-105 repository with only
   that path replaced by its pre source, then a complete pre repository with only that
   path replaced by its future source. Require a diagnostic beginning with the changed
   path and assert no other surface changed in fixture setup.
7. Run the complete focused suite, both runtime validators against the applicable
   fixture/candidate, `ci:foundation`, workspace validation, governance, risk, path,
   whitespace, hosted checks, and a disposable-worktree revert comparison. Confirm the
   implementation diff contains exactly the declared test file.
8. Obtain exact-SHA foundation-policy-test/CI-integrity specialist review and separate
   independent cross-model R3 verification. Resolve every blocker on a new SHA with
   fresh checks/reviews; a separate non-author performs any merge.
9. After merge, the accountable owner observes the first refreshed real VOC-105
   candidate through both runtime validators, the focused suite, `ci:foundation`, and
   hosted required checks. Apply the stop/remediation/revert disposition on recurrence,
   false acceptance, or protected regression.

## Validation commands

- `node scripts/foundation/voc081-f2-evidence-policy.mjs`
- preserved candidate: `node scripts/foundation/voc105-f3-evidence-policy.mjs`
- `node --test scripts/foundation/voc081-f2-evidence-policy.test.mjs`
- `pnpm run ci:foundation`
- `pnpm validate`
- `bash scripts/governance/validate-governance.sh`
- `bash scripts/governance/classify-change-risk.sh`
- `git diff --check`
- exact changed-path audit against the adopted implementation base
- disposable-worktree one-file revert and exact-tree comparison

The preserved candidate command is run only where its adopted validator exists. No
command may run Wrangler, dispatch a workflow, contact Cloudflare, inspect/change
settings or secrets, deploy, migrate, mutate traffic/DNS, access production/learner
data, spend, or launch.

## Rollback

Before merge, close the implementation PR. After merge and before VOC-105 lands,
revert the one test file through a separately reviewed PR. If VOC-105 has landed,
revert VOC-105 first when required to preserve a passing intermediate tree, then
revert VOC-111. Rollback is repository-only.
