# VOC-111 — Test Plan

## VOC-111-TEST-00 — Governance, exact reproduction, and scope

- Covers: `VOC-111-AC-00`
- Procedure: validate the nine-artifact draft, semantic R3 decision, explicit
  `automatic_merge_allowed: true`, one-task/one-PR shape, exact single-file future
  implementation inventory, dependency boundaries, and external exclusions. At exact
  base `c94444bc74d3ed1b5ca0aca65141d0532f70fa11`, record current validator/focused PASS.
  Prove the preserved worktree base, then run the exact canonical manifest command
  below immediately before and after the reproduction commands. Both executions must
  traverse the fixed lexicographically sorted 12 paths and yield
  `7205f4856b2839f7302ab9a9fd9fbac57ee69942723f283241ac2970bb147e43`. Apply the
  preserved candidate read-only and record both runtime validators PASS, focused 24/27,
  and `ci:foundation` 179/182 with failures only at current-surface profile selection,
  fixed-value duplicate injection, and repository-derived pre hybrid construction.
- Expected: issue #206 reproduces exactly and grants no authority; before/after base,
  ordered inventory and current digest are identical; `8efd149c...` is recorded only
  as superseded pre-format history; the package remains draft and implementation-
  unauthorized.
- Evidence: `VOC-111-EV-00`

## VOC-111-TEST-01 — Exact profile-selection matrix

- Covers: `VOC-111-AC-01`
- Procedure:
  - pass each exact plan-owned milestone object and the same objects with members
    reordered; expect `pre-voc105` and `voc105` respectively;
  - for every key in each profile, independently omit it, rename it, alter its scalar
    value, change its type, and add one unknown key;
  - independently reorder each holds array and change one hold/value;
  - test null, array, primitive, and missing `milestone_state` inputs; and
  - validate every current repository surface with the label selected from its full
    exact record, then remove every required marker for that selected profile one at a
    time and require the matching profile-specific diagnostic.
- Expected: only two complete exact objects select a profile; object order is
  non-semantic, array order remains semantic, malformed/partial values throw during
  fixture setup, and the current repository passes before its one-marker mutations.
- Evidence: `VOC-111-EV-01`

## VOC-111-TEST-02 — Profile-independent raw duplicate matrix

- Covers: `VOC-111-AC-02`
- Procedure:
  - assemble exact pre and VOC-105 record sources from plan-owned objects;
  - for each source, select its profile and inject a second `f3_staging` member by
    locating the unique key plus its exact parsed/serialized current value;
  - for the VOC-105 source, separately inject a second `f3_current_evidence` member;
  - before aggregate validation, assert one matching raw key before, two after, a
    changed source, and otherwise unchanged source prefix/suffix; and
  - use one duplicate per fixture and assert the existing exact duplicated-key
    diagnostic.
- Expected: all three fixtures fail before parsed-record validation with
  `duplicate raw JSON key is prohibited: <key>`; no fixture searches for a fixed
  `unresolved-held` pair or assumes a pointer in the pre profile.
- Evidence: `VOC-111-EV-02`

## VOC-111-TEST-03 — Plan-owned sources and both-direction transitions

- Covers: `VOC-111-AC-03`
- Procedure:
  - construct all five pre sources by LF-joining only the literal arrays in
    `specification.md`, suppressing only the explicitly overlapping standalone product-
    plan marker; for the F2 document append only the exact support array;
  - construct future sources using only the unchanged VOC-110 plan-owned future
    markers, the plan-owned support array, and the four explicitly listed future F2
    compatibility markers, never `repositoryRoot` text;
  - prove every source passes `inspectF2Surface` under its explicit profile and both F2
    document sources pass `inspectF2Document` against their exact records;
  - remove each pre and future required marker one at a time and require its exact
    path/profile marker diagnostic;
  - prove complete synthetic pre and VOC-105 repositories pass, including reordered
    profile-object positives; and
  - for every human surface, snapshot all fixture surfaces, replace exactly that path
    pre-into-future and future-into-pre in separate fixtures, assert other snapshots
    unchanged, and require an error beginning with the replaced path.
- Expected: ten one-surface repository hybrids fail for their intended path; complete
  sources/repositories pass first; no expected text is read from mutable repository or
  dirty worktree state.
- Evidence: `VOC-111-EV-03`

## VOC-111-TEST-04 — Complete VOC-110 and VOC-109 regression inventory

- Covers: `VOC-111-AC-04`
- Procedure: compare test names and assertion groups to exact base
  `66928cb432ace3440990514526cc3afc6262d3de`, then run every retained test:
  - immutable record/package/stack/current-acceptance/workflow/local/task/command/
    rollback/history/external-effect facts;
  - exact pre/future profile keys, values, types, ordered holds, evidence pointer,
    object reordering, marker occurrence/normalization/history location, malformed JSON,
    missing surfaces, and raw duplicates;
  - every VOC-110 F3, acceptance, production/deployment, live, hold, F2-pending, and
    generic product/production/data/launch subject/copula/verb/case fixture, one claim
    per human surface, with only exact evidence-bound F3 markers masked;
  - zero/one/two foundation extension positives including exact VOC-105; all eight-
    prefix omission/duplication/swap, F2 direct/alias/bypass, extension grammar/
    declaration/order/uniqueness/collision/entry-point, terminal, malformed-input,
    shell-control, empty-segment, and sentinel negatives; and
  - no-execution assertions.
- Expected: every retained positive and negative remains present and unchanged in
  effect; no skip/todo/conditional escape; each negative observes its intended
  diagnostic rather than an unrelated profile error.
- Evidence: `VOC-111-EV-04`

## VOC-111-TEST-05 — Full validation, exact revision, and rollback

- Covers: `VOC-111-AC-05`
- Procedure: run the focused test and validator, preserved candidate's F3 validator,
  `ci:foundation`, `pnpm validate`, governance validation, risk classification,
  `git diff --check`, exact changed-path audit, and disposable-worktree revert/tree
  comparison. Bind hosted checks plus distinct specialist and independent cross-model
  R3 verdicts to the exact implementation SHA.
- Expected: all applicable checks pass; exactly the one authorized test file differs;
  the revert restores the base tree; reviewers report zero blockers; a separate
  non-author performs any merge. No live or external action occurs.
- Evidence: `VOC-111-EV-05`

## VOC-111-TEST-06 — Bounded first-real-candidate observation

- Covers: `VOC-111-AC-06`
- Procedure: after implementation merge, the accountable owner records the first
  refreshed real VOC-105 candidate's F2 and F3 runtime validators, VOC-081 focused
  suite, `ci:foundation`, and hosted required checks. Immediately before and after
  those commands, re-run TEST-00's exact base/path/manifest procedure and require the
  same current digest. Record current-profile selection, complete synthetic profiles,
  raw duplicates, both hybrid directions, the VOC-110 negative matrix, and VOC-109
  tail. If VOC-105 is formally abandoned or superseded first, record that governed
  disposition instead.
- Expected: all checks pass with zero recurrence of issue #206, no false/hybrid
  acceptance, and identical current manifest identity before/after observation. Any
  identity or test failure stops VOC-105 merge and VOC-111 closure and produces linked
  evidence for separate remediation or one-file revert.
- Evidence: `VOC-111-EV-06`

## Commands

- `node scripts/foundation/voc081-f2-evidence-policy.mjs`
- `node --test scripts/foundation/voc081-f2-evidence-policy.test.mjs`
- preserved candidate only: `node scripts/foundation/voc105-f3-evidence-policy.mjs`
- `pnpm run ci:foundation`
- `pnpm validate`
- `bash scripts/governance/validate-governance.sh`
- `bash scripts/governance/classify-change-risk.sh`
- `git diff --check`

## Exact canonical candidate-manifest command

After `git rev-parse HEAD` returns exact base
`c94444bc74d3ed1b5ca0aca65141d0532f70fa11`, TEST-00 and TEST-06 run exactly:

```bash
for f in docs/README.md docs/operations/README.md docs/operations/cloudflare-delivery.md docs/operations/voc-081-f2-evidence.json docs/operations/voc-081-f2-evidence.md docs/operations/voc-105-f3-evidence.json docs/operations/voc-105-f3-evidence.md docs/product/12-mvp-implementation-plan.md docs/product/README.md package.json scripts/foundation/voc105-f3-evidence-policy.mjs scripts/foundation/voc105-f3-evidence-policy.test.mjs; do
  test -f "$f" || exit 1
  printf '%s\0' "$f"
  git hash-object "$f" | tr -d '\n'
  printf '\0'
done | sha256sum
```

The command's inline inventory is the fixed lexicographically sorted 12-path list. For
each path it emits raw UTF-8 path bytes, NUL, Git blob OID with no LF, NUL, then hashes
the concatenation. The required first output field is
`7205f4856b2839f7302ab9a9fd9fbac57ee69942723f283241ac2970bb147e43`.

No test runs Wrangler, dispatches a workflow, queries Cloudflare/GitHub settings,
accesses secrets or production/learner data, deploys, migrates D1, changes traffic/DNS,
spends, or launches.

## Evidence definitions

- `VOC-111-EV-00`: exact base and fixed ordered path readback, exact manifest command/
  algorithm, identical current digest outputs immediately before and after issue
  reproduction, plan validation, review/adoption, and normal non-author plan merge
  evidence; `8efd149c...` appears only as superseded pre-format history.
- `VOC-111-EV-01`: complete exact profile-selector positives and one-mutation-at-a-
  time rejection plus current living-surface profile evidence.
- `VOC-111-EV-02`: pre/future raw-member injection construction assertions and three
  duplicated-key aggregate diagnostics.
- `VOC-111-EV-03`: plan-owned source positives, each marker removal, two complete
  repository positives, and ten path-specific hybrid negatives.
- `VOC-111-EV-04`: complete VOC-110 and VOC-109 test/assertion inventory and focused
  regression results with no skips or weakened diagnostics.
- `VOC-111-EV-05`: exact one-file diff, local/full/hosted checks, rollback proof,
  specialist and independent exact-SHA reviews, merge, and post-merge readback.
- `VOC-111-EV-06`: TEST-00 manifest outputs immediately before/after accountable-owner
  bounded real-candidate observation, linkage to EV-00, observed checks, and any
  triggered stop/remediation/revert or governed alternate disposition.
