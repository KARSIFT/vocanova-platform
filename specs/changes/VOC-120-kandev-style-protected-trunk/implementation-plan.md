# VOC-120 — Implementation Plan

## Preconditions

1. Exact plan review covers governance authority, GitHub Actions/rulesets, security,
   Cloudflare environment policy, EHR, rollback, and lane classification.
2. The founder-repository-owner records the adoption decision under pre-change
   DOC-15/DOC-16; `implementation_authorized` becomes true only afterward.
3. All five implementation candidates remain subject to frozen pre-change authority
   and different-actor exact review. The future model cannot authorize its transition.
4. No promotion, release/ref action, settings cutover, or EHR-affected correction is
   executable until PR #215 and issue #231 have permanent qualified-human outcomes.
5. No setting or ref mutation occurs without its explicit hold and exact readback.

The five implementation heads are fixed as
`impl/voc-120-preparation`, `impl/voc-120-ehr-unblock`,
`docs/voc-120-additive-settings`, `impl/voc-120-final-cleanup`, and
`transition/voc-120-final-truth`. The transition gate fails closed for a changed or
unexpected VOC-120 branch identity.

## PR1 — Dual-compatible preparation

Branch from then-current `origin/develop`. Keep all current authority, EHR subjects,
release machinery, templates, and required checks operational.

- Stage the future concise policy, engineering-oriented `AGENTS.md`, contributor
  templates, EHR runbook, and machine lane/path policy as non-active inputs.
- Add path-aware aggregate gates that always report and run more work for an unknown
  base or classifier error.
- Add one permanent compact `Policy / required` workflow. PR1/PR2 bootstrap mode binds
  the exact tracked verifier blob/digest while all legacy gates remain required. After
  action A, PR3-PR5 mode invokes that verifier from the protected immutable ref.
  Ordinary future branches use the compact policy aggregate without prose replay.
- Add `.github/policy-state.json`. The only valid state machine is absent to
  `transition-preparation` on exact PR1; preparation through exact PR2/PR3; preparation
  to `transition-locked` on exact PR4; locked to `active` on exact PR5; then active
  future lanes. Any other actor, branch, value, or transition fails closed.
- Add the executable transition verifier and mutation tests. It binds candidates to
  the accepted control inventory, current authority, active EHR scope, held actions,
  exact transition branch names, and required evidence.
- Preserve all legacy checks needed by current review and release.

Run current governance/risk checks, workflow security/action pinning, lane/path/
aggregate/merge-group matrices, affected product/security suites, transition-verifier
mutations, rollback inventory, and independent governance/Actions/security review.
PR1 may merge to `develop`; it may not be promoted while the release EHR stop remains.

## Qualified-human EHR boundary

Before PR2 or any promotion:

1. Record truthful reviewer identity, role, and relevant qualification.
2. Confirm or reject the selected PR #215 outcome: accept the independent FAIL and
   abandon the draft unmerged. After confirmation and `HOLD-05`, close it unmerged with
   permanent evidence and preserve its history.
3. Confirm or reject the selected issue #231 outcome: direct surface tests do not prove
   aggregate dispatch, so the low-cardinality aggregate proof is required in PR2.
4. Record whether each EHR is cleared. A directional founder preference without the
   required qualification record does not satisfy this boundary. Any different
   technical outcome stops VOC-120 for a revised, independently reviewed plan before
   adoption; the verdict itself cannot expand PR2 scope.

## PR2 — EHR disposition and transition unblock

Branch from current `origin/develop` only after both selected outcomes are confirmed.

- Change only `scripts/foundation/voc105-f3-evidence-policy.test.mjs`.
- For every `DESIGNATED_F3_SURFACES` member, apply the accepted prohibited later-
  milestone semantic mutation through aggregate `inspectF3Evidence()` and require its
  diagnostic. Preserve every existing test and direct surface-local matrix.
- Prove focused counts and the complete foundation suite remain green and within the
  committed 20-minute cap.
- Keep PR #215 closed and unmerged. Add no replacement release implementation; after
  abandonment, the unchanged pre-change promotion/synchronization procedure uses the
  adopted VOC-120 package. If execution shows that procedure is insufficient, stop for
  a separately adopted revision rather than improvising.
- Do not remove current governance, release/sync, or transition controls.

PR2 receives current deterministic checks and fresh exact independent review. It may
merge to `develop`; no promotion or ref/settings action starts until both EHR records
are permanently cleared and the exact aggregate correction is green.

## Additive settings and protected-ref action A

With explicit `VOC-120-HOLD-01` and `VOC-120-HOLD-04` authorization:

1. Capture repository, branch, ruleset, merge-method, required-check, security, tag,
   environment reviewer, admin-bypass, deployment-policy mode, custom-branch-policy,
   and ref state without reading secret values.
2. Freeze rollback tag grammar `refs/tags/voc-120-rollback-<40hex>` and verifier tag
   grammar `refs/tags/voc-120-verifier-<40hex>`. Create each at its recorded exact SHA
   only after authorization, then install no-bypass rules over both namespaces that
   prohibit update, deletion, and any non-fast-forward replacement. Read rules and
   target objects back before reliance; creation, mutation, or deletion before
   authorization fails.
3. Enable supported secret scanning, push protection, and Dependabot security updates
   plus immutable `v*` release-tag protection.
4. Protect `main` against deletion/force push and require conversation resolution,
   stale-review dismissal, observed legacy gates, and permanent `Policy / required`.
5. Keep merge commits and the old release/synchronization topology allowed. Do not yet
   enable squash-only linear history, merge queue, future-only checks, or future review
   floors.
6. Add `main` to `cloudflare-staging` while retaining `develop`, or use a bounded
   stopped swap if dual policy is unsupported. Preserve reviewers, admin bypass, and
   policy mode exactly; update no secret name or value.
7. Confirm current `main` remains intentionally fail-closed for staging because the
   prepared dual-compatible delivery code still exists only on `develop`. Do not claim
   a successful main dispatch until PR4 promotion. Restore the snapshot and stop on
   any unexpected behavior or readback mismatch.

## PR3 — Immediate additive-settings truth

Open immediately from `origin/develop`. It is separately reviewed, doc-only, and
governed by frozen pre-change authority. Record exact before/after JSON, allowed merge
methods, legacy and transition gate names, protected ref grammar/SHAs/rules, dual or
bounded staging policy, security state, rollback, and no-secret-read evidence.

## PR4 — Final cleanup under old authority

After PR3 merges, branch from current `origin/develop`. Use the immutable verifier ref
and permanent `Policy / required` transition mode against the exact candidate.

- Apply both EHR outcomes and remove only machinery their dispositions permit.
- Atomically install the reviewed concise policy, engineering `AGENTS.md`, and concise
  templates while retiring nine-file package creation, duplicated authority prose,
  PR-body identity/binder polling, non-product historical replay, and obsolete release
  scaffolding.
- Retain product auth, authorization, learner isolation, D1 migration/recovery, API,
  AI safety/cost, accessibility, dependency, staging isolation, rollback, and held
  external-action controls in affected-path or stable aggregate lanes.
- Retain permanent `Policy / required`; its transition mode executes the verifier from
  the protected immutable ref for PR4 and the exact final-truth PR5 branch.
- Change `.github/policy-state.json` from `transition-preparation` to
  `transition-locked`; exact transition checks must accept this edge before PR4 merge.
- Reconcile every active workflow, script, package command, settings document,
  CODEOWNERS rule, and contributor surface to one provisional truthful state.

After exact old-authority review, merge PR4 to `develop`. Then perform the one final
old-model `develop -> main` merge-commit promotion and main-to-develop merge-commit
synchronization. Record merge SHAs and prove `main` ancestry. Squash-only history and
the merge queue remain disabled through this synchronization.

## Final settings and branch action B

Only after the final synchronization, with explicit `HOLD-01`, `HOLD-02`, and any ref
authority required by `HOLD-04`:

1. Snapshot the complete phase-A state and prove PR4 passed the immutable transition
   verifier, current and future aggregate gates, and exact independent review.
2. Change `main` to squash-only linear protected history, future aggregate gates,
   conversation resolution, stale-review dismissal, the defined review floors, and
   merge queue. Retain permanent `Policy / required` with no administrator bypass.
3. Now that PR4 is on `main`, prove a credential-free main dispatch reaches the
   expected pre-secret/environment boundary without deployment. Only then move
   `cloudflare-staging` to sole `main`. Preserve reviewers/admin-bypass/mode and read
   no secret values.
4. Prove `main` contains intended `develop` ancestry, inventory or retarget open PRs,
   record the exact recreation command, then retire `develop` only with `HOLD-02`.
5. Keep verifier and rollback refs protected through PR5 acceptance. Restore phase A
   atomically if any rule, check, queue, branch, environment, or ref readback differs.
6. Keep committed policy state `transition-locked`. While the default branch has that
   state, `Policy / required` rejects every pull-request head except exact
   `transition/voc-120-final-truth`, regardless of future lane classification.

## PR5 — Immediate final branch/settings truth

Open the fixed short-lived branch `transition/voc-120-final-truth` from protected
`main`. Update only settings/branch truth and directly dependent links. The required
`Policy / required` workflow recognizes this exact transition branch and invokes the
immutable pre-change verifier; future aggregate gates and one non-author native review
also apply. Record settings JSON, final branch/PR/tag/ref/environment inventory,
rollback/recreation commands, and a future-effective activation decision conditional
on PR5 merge and exact old-authority acceptance. PR5 alone changes committed policy
state from `transition-locked` to `active`; mutation tests prove another branch cannot
change or bypass that state.

After PR5 merges, ordinary branches use the future lightweight policy. The permanent
policy gate remains; historical transition refs may be deleted only in a later
explicitly authorized action after their retention condition expires.

## Rollback

Before action A, revert PR1/PR2 under current review. After action A, restore its
snapshot and protected refs. After PR4, restore the phase-A merge-compatible rules,
recreate `develop` at the recorded SHA, and revert through the protected branch. Never
delete Git history, learner data, D1 state, Cloudflare resources, or secret values.
