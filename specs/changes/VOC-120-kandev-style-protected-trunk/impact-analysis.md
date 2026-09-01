# VOC-120 — Impact Analysis

## Summary

This is a high-consequence governance simplification, not a product feature. It
removes a large custom control plane and replaces it with a smaller policy surface,
native GitHub enforcement, path-aware tests, and explicit action boundaries.

## Benefits

- Routine changes move from two PRs plus bookkeeping to one focused PR.
- Review signal improves because irrelevant template and package content disappears.
- Native rules prevent direct/force pushes rather than documenting their prohibition.
- Path-aware checks reduce CI cost while stable aggregate gates remain ruleset-safe.
- Historical records remain available without executing on every product change.
- Parallel agents integrate through a tested merge result rather than manual rebases
  and post-release history synchronization.
- The remaining security and specialist review effort focuses on real product risk.

## Security and privacy

Positive effects include enabling native secret scanning/push protection and reducing
write permissions in review workflows. The primary transition risk is deleting a
deterministic control that protects auth, data, migration, AI safety, delivery, or
external authority. Implementation must classify each removed validator as:

1. historical/prose integrity only;
2. replaced by native GitHub enforcement;
3. retained as an affected-path application/security check; or
4. intentionally retired with explicit justification and regression evidence.

No secret value or personal/learner data is read or changed.

## Authority

The future process expands routine agent latitude by removing mandatory plan/adoption
ceremony. That is why the package is R4 and must be adopted under pre-change rules.
The change does not expand authority for GitHub settings, secrets, deployments,
production, learner data, DNS, spending, contracts, irreversible actions, or launch.

## Data and migrations

No application database or migration changes are allowed. D1 migration and recovery
tests remain required when their paths change. Git history is the archive for removed
governance content; an exact rollback ref and optional digest index provide discovery.

## CI and operational impact

The workflow count and required gate names change. A misconfigured path detector can
skip relevant work, while a missing gate can stall the merge queue. Internal change
selection therefore fails toward running more work, and aggregate-gate contract tests
must cover relevant, irrelevant, multi-area, missing-base, and merge-group cases.

## Documentation impact

Large. Every current document that claims governance, branch, merge, release,
deployment, review, EHR, or settings behavior must be reconciled or removed in the
same transition. The final goal is deletion and consolidation, not another amendment
layer.

## Accessibility and analytics

No product UI, accessibility behavior, or analytics schema changes are planned.
Accessibility checks remain path-applicable for UI changes.

## Risks

- `VOC-120-R01`: Self-authorizing governance replacement. Mitigation: pre-change
  adoption and exact independent review.
- `VOC-120-R02`: Unprotected gap during settings/workflow cutover. Mitigation:
  dual-compatible PR1, merge-compatible action A, immediate PR3 truth, ref-pinned
  PR4 verification, final action B, and immediate PR5 truth.
- `VOC-120-R03`: Path filtering silently misses relevant tests. Mitigation:
  always-reporting aggregate gates, fail-to-run-more behavior, contract tests.
- `VOC-120-R04`: Valuable historical validator removed with a product control.
  Mitigation: per-validator classification and focused regression mapping.
- `VOC-120-R05`: Merge queue stalls on absent check names. Mitigation: activate only
  after observed PR checks and synthetic/real queue verification.
- `VOC-120-R06`: Existing EHR is bypassed by topology change. Mitigation: preserve
  explicit scope and require reasoned human outcome before affected closure/merge.
- `VOC-120-R07`: Broad deletion makes rollback hard. Mitigation: immutable rollback
  and verifier refs, three exact settings snapshots, six bounded PRs, and observation.
- `VOC-120-R08`: Copying Kandev overfits a larger project. Mitigation: cap the initial
  VocaNova gate/document surface and require every retained control to name its risk.
- `VOC-120-R09`: Staging becomes unusable when code moves to main but the environment
  still admits only develop. Mitigation: held dual/bounded branch-policy migration,
  credential-free main-gate proof, immediate truth PR, and snapshot restoration.
- `VOC-120-R10`: New rules authorize removal of old rules. Mitigation: every VOC-120
  candidate remains bound to pre-change authority; PR1/PR2 use legacy gates plus the
  tracked digest, then permanent `Policy / required` invokes the protected ref for
  PR3-PR5 exact acceptance.
- `VOC-120-R11`: EHR subjects disappear before human resolution. Mitigation: PR3
  and every promotion remain blocked until pre-adoption qualified confirmation, held
  PR #215 closure, and the exact PR2 correction are permanent and green.
- `VOC-120-R12`: Future squash/queue rules make the old merge-commit loop impossible.
  Mitigation: action A explicitly remains merge-compatible; action B occurs only after
  the final old-model promotion/synchronization.
- `VOC-120-R13`: Ordinary work starts between action B and final truth acceptance.
  Mitigation: the read-back repository lock makes only exact PR5 eligible; PR5 alone
  changes committed state to active, and the queue is enabled only afterward.

## Dependencies

- `VOC-120-DEP-01`: issue #232 remains the canonical requirement source.
- `VOC-120-DEP-02`: PR1 may merge to develop, but issue #191 blocks promotion until
  both qualified-human EHR outcomes and required corrections complete.
- `VOC-120-DEP-03`: founder authorization is required for settings and branch actions.
- `VOC-120-DEP-04`: live GitHub plan/support for rulesets, merge queue, security
  scanning, and bot/app review must be verified before activation.
- `VOC-120-DEP-05`: PR #215 and issue #231 EHR records remain independently scoped.
- `VOC-120-DEP-06`: the current `cloudflare-staging` sole `develop` branch policy is
  migrated with preserved reviewers/admin state and no secret-value read.
- `VOC-120-DEP-07`: a native non-author Review mechanism must exist before Protected
  lane activation; absence blocks rather than lowering the requirement.

## Evidence

- `VOC-120-EV-01`: exact plan review and adoption record.
- `VOC-120-EV-02`: before/after file, policy, workflow, and control mapping.
- `VOC-120-EV-03`: exact PR1 checks and independent specialist review.
- `VOC-120-EV-04`: permanent qualified-human confirmation, held unmerged closure of PR
  #215, and exact one-file PR2 aggregate-test checks/review for issue #231.
- `VOC-120-EV-05`: action-A settings/ref/environment readback and exact doc-only PR3
  checks/review.
- `VOC-120-EV-06`: exact PR4 old-verifier, application, specialist, promotion,
  synchronization, ancestry, and rollback evidence.
- `VOC-120-EV-07`: action-B ruleset/lock/review/environment/branch readback and exact
  PR5 old-verifier/future-gate/native-review evidence, with queue still disabled.
- `VOC-120-EV-08`: action-C lock-clear/merge-queue readback and exact PR6 future-policy
  pull-request plus merge-group evidence.
