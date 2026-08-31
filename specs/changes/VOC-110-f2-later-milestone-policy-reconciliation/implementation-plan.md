# VOC-110 — Implementation Plan

## Preconditions and delivery shape

Do not implement until this exact package receives distinct specialist and independent
cross-model R3 reviews, accountable adoption, and normal non-author merge into
`develop`. Use one isolated branch/worktree, one minimum-sufficient task, and one
coherent implementation PR. Do not modify or discard the preserved VOC-105 worktree.

## Exact implementation path inventory

| Path                                                          | Classification               | Planned reconciliation                                                                                                                                                                                                                                         |
| ------------------------------------------------------------- | ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `scripts/foundation/voc081-f2-evidence-policy.mjs`            | present-needs-reconciliation | Separate immutable F2/history contracts from exact current-state profiles; accept only the exact current pre-F3 or adopted VOC-105 profile atomically; preserve false-claim/no-live/hold protections and all VOC-109 script behavior.                          |
| `scripts/foundation/voc081-f2-evidence-policy.test.mjs`       | present-needs-reconciliation | Preserve the existing 18-test behavior and add exact pre-F3/VOC-105 positives plus one-at-a-time immutable-F2, profile-key/value/pointer, every-surface hybrid, later-gate, hold, history/current, external-effect, parser, scope, and no-execution negatives. |
| `package.json`, docs, evidence, packages, workflows, app code | present-compatible-protected | Do not edit. VOC-105 owns all seven living-document updates, F3 evidence/validator/tests, and the exact `ci:f3-evidence` package declaration and chain segment after VOC-110 is independently implemented, reviewed, merged, and observed.                     |

The implementation diff is exactly the first two files. The plan PR adds only this
nine-artifact VOC-110 package.

## Ordered implementation

1. Record exact implementation base `309f1058baa041f7915fb334148d7d5b3d9b3c14`.
   Run the current validator and focused tests for PASS, then run the validator
   read-only against the preserved VOC-105 candidate and capture its expected nonempty
   issue #203 diagnostics before source edits.
2. Inventory the validator assertions into immutable F2/history, current
   later-milestone, and VOC-109 command-policy groups. Keep immutable constants and
   `inspectF2Scripts()` behavior unchanged unless a mechanical extraction is necessary
   and fully covered.
3. Define exact pre-VOC-105 and VOC-105 JSON current-state profiles with exact key
   sets, values, evidence pointer, and ordered hold arrays while treating JSON object-
   member order as non-semantic. Select one repository-wide profile; reject partial
   matches, hybrids, unknown keys, missing keys, and wrong values.
4. Define paired required/prohibited current markers for every existing designated F2
   surface using only the literal strings and exact ASCII-whitespace normalization in
   the specification. Preserve all F2 integration, history, local/no-live, limitation,
   and rollback markers. Permit only the listed evidence-bound VOC-105 F3 sentences.
   Do not load expected strings from the preserved worktree, another branch/PR, or a
   runtime diff.
5. Generate one-claim-at-a-time fixtures from the complete specified subject/copula/
   verb matrices. Preserve every current F3, A1/P1+, production/deployment, live,
   aggregate/individual hold, and F2-pending class/verb, including passed, accepted,
   completed, and verified cases, and add effective/resolved plus R1/R2/L1. Add every-
   surface hybrid tests in both directions, every current-key/value/pointer mutation,
   every external-effect true mutation, history/current conflation, malformed record,
   and missing-surface cases. Assert concrete diagnostics and no shell/network
   execution.
6. Retain and run all VOC-109 script tests: zero/one/two positives and every exact
   prefix, F2 execution, extension grammar/declaration/uniqueness/collision/placement,
   terminal, malformed-input, and shell-control negative.
7. Run focused, foundation, workspace, governance, risk, changed-path, whitespace, and
   rollback checks. Confirm exactly the two declared implementation paths differ.
8. Obtain exact-SHA foundation-policy/CI-integrity specialist review and separate
   independent cross-model R3 verification. Resolve every blocker with a new SHA and
   fresh checks/reviews; use a separate non-author merge actor.
9. After merge, the accountable VOC-110 owner observes the first refreshed real
   VOC-105 candidate through both focused validators, `ci:foundation`, and hosted
   checks. Apply the stop/remediation/revert disposition on any exact-profile,
   immutable-F2, negative-profile, or extension regression.

## Validation commands

- current-baseline `node scripts/foundation/voc081-f2-evidence-policy.mjs`, expected
  PASS before implementation
- issue #203 preserved-candidate reproduction, expected nonempty rejection before
  implementation and PASS after implementation
- `node --test scripts/foundation/voc081-f2-evidence-policy.test.mjs`
- `node scripts/foundation/voc081-f2-evidence-policy.mjs`
- `pnpm run ci:foundation`
- `pnpm validate`
- `bash scripts/governance/validate-governance.sh`
- `bash scripts/governance/classify-change-risk.sh`
- `git diff --check`
- exact changed-path audit against the adopted base
- disposable-worktree revert rehearsal and exact-tree comparison

No command may dispatch a workflow, run Wrangler, contact Cloudflare, inspect or
change settings/secrets, access production or learner data, deploy, migrate, mutate
traffic/DNS, spend, or launch.

## Deployment and rollback

There is no deployment. Before merge, closing the implementation PR has zero
repository or external effect. After merge, use a separately reviewed revert PR
restoring the two implementation files. If VOC-105 has merged, revert VOC-105 first
and VOC-110 second so every intermediate tree passes the active validator.
