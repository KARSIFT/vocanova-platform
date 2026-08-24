# VOC-084 — Implementation Plan

## Preconditions

Do not implement until the exact plan candidate receives a different-role PASS and the
adoption PR records its approved SHA, evidence, `status: adopted`, and
`implementation.authorized: true`. Plan adoption grants repository-only implementation
authority and no live or settings authority.

Those preconditions were satisfied when PR #120 merged as
`d2cb2190d83dae863b0f2126f8853ddffd5ed678`. T00-T03 then merged through PRs
#121-#124, so the remaining T04 work starts from exact integrated base
`a578d287f9ce263e8bb3d8aa16dd8ef216e3d38c`.

## Reconciliation method

1. Start T00 from the adopted merge on `develop` in an isolated worktree.
2. Read each final package/task record and its linked GitHub evidence. Record one
   immutable inventory row per task and explicit historical FAIL rows.
3. Review T00 independently before any status cleanup relies on it.
4. Build T01 and T02 as siblings stacked on T00 so the two package pairs remain small
   and independently reviewable; serialize merge order if both change shared inventory.
5. Build T03 on the integrated reconciliation, using a narrow parser for designated
   fields and isolated negative fixtures.
6. Build T04 only after T00-T03 merge; record the full evidence range, rollback, review,
   hosted outcomes, and post-merge issue actions outside the candidate commit.

Steps 1-5 are now complete on `develop`. Step 6 remains the only active task and may
prepare issue-closure wording only for use after merge and passing post-merge checks.

## File reconciliation rules

- Existing compatible history is preserved.
- Pre-integration candidate language becomes explicitly historical or is replaced in
  active result/status fields.
- No historical review body, hosted result, accepted decision, or task implementation
  is rewritten.
- `change.yaml`, `tasks.md`, acceptance criteria, README, and evidence wording for a
  package change together when they describe the same active lifecycle fact.
- New evidence URLs and SHAs are exact, never abbreviated in machine-readable data.
- The validator targets only VOC-080 through VOC-083 initially; expansion requires a
  later reviewed package.

## Proportional validation

At minimum, as applicable per task:

```bash
bash scripts/governance/validate-governance.sh
bash scripts/governance/classify-change-risk.sh --base <base> --head HEAD
python3 -m unittest discover -s tooling/governance/tests -p 'test_*.py'
pnpm run ci:foundation
pnpm validate
pnpm audit --audit-level high
git diff --check <base> HEAD
```

T00-T02 may use narrower governance/foundation/format checks when they do not alter
runtime or the validator. T03 and T04 run the full applicable set. Reviewers receive
completed exact evidence and must not duplicate long suites or start background
processes.

## Independent verification

Each task receives a different non-author exact-SHA review. The review checks evidence
URLs and SHA/PR/merge mappings, lifecycle semantics, historical failure preservation,
hold preservation, scope, validator failure contracts, and rollback. Any material
correction invalidates the prior verdict and hosted evidence.

## Hosted proof and merging

Publish small draft PRs targeting the preceding task branch or `develop` as appropriate.
Use only the four existing workflows and accurate path-filter applicability. Add the
normalized evidence block only after the exact PASS. A separate merge operator verifies
the tested tree and performs a normal merge into `develop`; source branches remain
until final cleanup.

## Rollback and issue outcomes

Rehearse real reverse-order repository reverts in a disposable worktree. Do not revert
or mutate GitHub issue history to simulate code rollback. Only after T04 merges and
post-merge checks pass may issue #85 and #118 close with exact links. Issue #119 and all
live holds remain open.
