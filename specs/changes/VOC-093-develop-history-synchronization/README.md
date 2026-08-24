# VOC-093 — Synchronize develop ancestry after main promotion

Status: adopted for repository bookkeeping. Exact candidate
`9081cd68f566393665507616251b8a0fe30aa1c1` received different-actor general/R4 PASS,
Git/GitHub history specialist PASS, and the accountable adoption decision on PR #156.
Implementation authorization is recorded but remains ineffective until this
bookkeeping revision receives exact-SHA review, the populated binder produces genuine
`eligible: true` with no reasons, PR #156 normally merges, and applicable post-merge
checks pass. Issue [#155](https://github.com/KARSIFT/vocanova-platform/issues/155)
remains open through the final implementation evidence.

Issue [#155](https://github.com/KARSIFT/vocanova-platform/issues/155) records the
current repository-history drift observed on 2026-08-24 UTC after VOC-092's verified
`develop` → `main` promotion:

- `origin/develop` = `0dd1c935354961f2d3ff9900efa128dd418fa61e`
- `origin/main` = `718ea9d9d5ff3476de9db9439414c2a6e07a6f4a`
- `git rev-list --left-right --count origin/develop...origin/main` = `0 23`
- both trees = `c0cb3f6ec029898d7d12321a8723a4457164173b`
- `develop` is an ancestor of `main`

There is no product-content loss. The problem is commit-history drift: `main` contains
the release merge commit and older main-only history that `develop` does not yet
record, so GitHub reports `develop` as behind `main` even though the trees are equal.

This package keeps the delivery unit coherent:

- one approved package;
- one minimum-sufficient task; and
- one implementation pull request into `develop`.

That implementation PR must use a short-lived synchronization branch, merge the then-
current `main` ancestry into it, update the living release/governance surfaces that
describe promotion/finalization, add the minimum deterministic guard/tests for that
boundary, and merge back to `develop` with a merge commit so ancestry is preserved.
Using `main` itself as a temporary PR head is prohibited.

Because the live repository setting `delete_branch_on_merge` is already `true`, a
normal merge of this plan PR and of the later short-lived implementation PR is
expected to let GitHub automatically delete only the merged short-lived source branch
head after merge. This package therefore records exact pre-merge branch/SHA evidence,
post-merge read-back, and recovery instructions for those short-lived heads. It does
not authorize any manual branch deletion, any permanent-branch deletion, or any
worktree removal.

This package deliberately excludes:

- any `main` mutation;
- any GitHub settings mutation;
- any manual branch deletion, any permanent-branch deletion, and any worktree
  deletion;
- any Cloudflare, DNS, deployment, environment, secret, production-data, migration,
  traffic, spending, or launch action; and
- any interference with the dirty VOC-090 worktree/branch or other existing recovery
  exceptions.

The living release/governance reconciliation set intentionally includes
`AGENTS.md`, `CONTRIBUTING.md`, `.github/README.md`,
`docs/governance/16-autonomous-development-operating-model.md`,
`docs/governance/repository-settings.md`,
`docs/operations/10-development-workflow.md`, and the current DOC-15 authority matrix
in `docs/operations/15-ai-native-product-and-engineering-operating-model.md`.
Drafting review also checked `README.md`, `docs/operations/11-devops-and-ci-cd.md`,
and `docs/governance/post-merge-activation-checklist.md`; they are excluded because
they do not define the current branch-finalization procedure. `README.md` is a
repository overview, DOC-11 describes environment/deployment architecture rather than
the release/finalization loop, and the post-merge activation checklist is a
prospective hosted-enforcement checklist rather than the current promotion/finalization
source of truth.

`automatic_merge_allowed: true` is explicitly examined package metadata only. No
workflow performs a merge, and this package does not change that.

## Plan review history

Candidate `01ec5ff96e0682cea74dc73ff045b2d47b0659a0` received a general/R4 FAIL at
https://github.com/KARSIFT/vocanova-platform/pull/156#issuecomment-5402759531 because
the PR body recorded a false exact SHA, the package contradicted the live
`delete_branch_on_merge=true` consequence, and the living release/finalization surface
set omitted AGENTS.md, CONTRIBUTING.md, and current DOC-15 section 17.2. That FAIL is
immutable history.

Candidate `9081cd68f566393665507616251b8a0fe30aa1c1` resolved those blockers and
received general PASS with zero blockers at
https://github.com/KARSIFT/vocanova-platform/pull/156#issuecomment-5402851142,
specialist PASS with zero blockers at
https://github.com/KARSIFT/vocanova-platform/pull/156#issuecomment-5402893398, and the
adoption decision at
https://github.com/KARSIFT/vocanova-platform/pull/156#issuecomment-5402901236. The
exact evidence URLs are recorded in `change.yaml`.
