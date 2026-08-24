# VOC-092 — Repository Finalization: Specification

## Objective and requirement source

Finish the repository-level lifecycle requested in issue #151: make the complete
reviewed integrated tree canonical on `main`, remove verified merged residue, prevent
future merged-branch buildup, and leave truthful canonical evidence. Exact candidate
`dcf887731e426906b17569c428eb400ad56f3e86` received exact-revision general/R4 and
specialist PASS verdicts plus the adoption decision. Authorization becomes effective
only after this bookkeeping revision's exact review, genuine eligible binder, normal
PR #152 merge, and applicable post-merge checks.

## Baseline and problem

At drafting, `origin/develop` is
`3c3547bac9697185b52414adcb2b31cb16afd9ca`, `origin/main` is
`99ebf9e8998783e221b97bdceee369f18781b5be`, and the histories diverge by 22
main-only and 170 develop-only commits. The initial read-only audit found no open pull
requests or issues; issue #151 and this plan PR are the expected governed records now
open for this outcome. Before the plan branch existed, GitHub reported 54 remote
branches and `delete_branch_on_merge: false`; 52 branches were non-permanent and were
mapped by the planning audit to merged pull requests. The plan branch is an additional
active non-permanent ref and is not a cleanup target while its PR remains open.

Locally there are 56 branches and 55 worktrees. Most auxiliary worktrees are clean,
but `/tmp/vocanova-voc090-t00` has 19 staged tracked changes. The local-only
`backup/pre-voc091-refresh-8ce72e9` tip is not reachable from current `develop` or
`main`. Destructive cleanup must not erase either safety exception.

## Decisions and requirements

- `VOC-092-D00` — Use one approved package, one minimum-sufficient task, and one
  coherent settings/documentation implementation pull request. Use the additional
  release PR only because DOC-16 separately requires reviewed `develop`-to-`main`
  promotion; do not manufacture component tasks or PRs.
- `VOC-092-D01` — After adoption, mutate only the GitHub repository field
  `delete_branch_on_merge` from `false` to `true`. Record pre-state, exact payload,
  post-state read, rollback payload/owner, accountable exact-action authority and
  expiry under `VOC-085-HOLD-00`, and immediately reconcile every living document that
  describes the current observation or field.
- `VOC-092-D02` — Freeze the implementation base after the setting read-back and
  update the declared README, `.github` guide, DOC-16 cross-reference, repository
  settings guide/current YAML, Cloudflare-delivery cross-reference, and the existing
  VOC-085 truthfulness guard/tests with the truthful execution-time UTC observation,
  exact mutation evidence boundary, and retained staleness semantics. Do not preselect
  the observation date from the operator's timezone; bind it to the actual GitHub API
  pre/post-state evidence. Historical snapshots remain immutable; no workflow or
  eligibility/classifier behavior changes.
- `VOC-092-D03` — The implementation PR into `develop` must receive applicable local
  and hosted checks plus different-actor exact-SHA general/R4 and repository-operations
  specialist review. A non-author actor merges only after real eligibility evidence.
- `VOC-092-D04` — Freeze the exact `develop` head only after implementation merge and
  applicable post-merge checks. Open a separate release PR from `develop` to `main`,
  prove its file tree and intended head, obtain different-actor exact-SHA review, and
  merge with an identifiable merge commit. Any movement of `develop` invalidates the
  freeze and requires refreshed evidence.
- `VOC-092-D05` — Repository promotion changes Git history only. It must not dispatch,
  deploy, configure Cloudflare/DNS, use secrets or production data, migrate data,
  change traffic, spend money, or launch publicly.
- `VOC-092-D06` — Immediately before remote deletion, enumerate all remote refs and
  attach an exact branch-to-tip-to-merged-PR manifest to issue #151 or the promotion
  PR. Delete only refs other than `main`/`develop` that have no open PR and whose exact
  tip is recoverable from a merged PR or canonical reachable history. Abort an
  ambiguous target without reducing the rest of the safe coherent cleanup.
- `VOC-092-D07` — Immediately before each local removal, prove the worktree is clean
  and inactive, record its path/branch/HEAD and process/ownership check, and prove the
  branch has no unique unpreserved work. Use normal `git worktree remove` and
  non-force `git branch -d`. Never run recursive workspace deletion, ref force
  deletion, garbage collection, or reflog expiry. Preserve and report the dirty
  VOC-090 worktree and unique backup branch unless separately reviewed evidence and
  authority later change their classification.
- `VOC-092-D08` — Record recovery before deletion: recreate a remote or local branch
  with its exact recorded SHA; restore the setting with the inverse one-field API
  payload; revert repository content through a normal reviewed PR; revert promotion
  through a normal reviewed main PR. Never rewrite protected history.
- `VOC-092-D09` — Final read-back must prove `delete_branch_on_merge: true`, no open
  PRs, only intended remote refs, explicit local safety exceptions, `main`/`develop`
  tree equality, successful applicable checks, and no deployment/live action. Close
  issue #151 only after attaching that evidence.
- `VOC-092-D10` — Complete R4 decision, impact, contingency, deterministic,
  specialist, exact-revision independent-review, and action-specific authority
  evidence. R4 creates no standing personal approval. Trigger EHR only for an
  unresolved critical/high finding, irrecoverable destructive target, or materially
  conflicting critical evidence.
- `VOC-092-D11` — `automatic_merge_allowed: true` is explicitly examined read-only
  policy metadata. No workflow may be represented as automatically merging.

## Data, security, privacy, analytics, and accessibility

No application behavior, user data, schema, analytics, accessibility surface, secret,
or production system is accessed or changed. Branch names and commit SHAs are public
repository metadata and contain no added personal data.
