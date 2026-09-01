# VOC-120 — Test Plan

## VOC-120-TEST-01 — Normative-source and stale-reference validation

- Covers: `VOC-120-AC-01`, `VOC-120-AC-02`, `VOC-120-AC-07`, `VOC-120-AC-08`
- Procedure:
  1. Enumerate all tracked references to removed governance IDs, package paths,
     `develop`, reverse sync, automatic merge, reviewer evidence JSON, and old roles.
  2. Require each remaining occurrence to be current, explicitly historical, or a
     test fixture whose purpose is documented.
  3. Validate links, indexes, templates, and contributor/agent instructions.
- Expected: one active authority and no contradictory executable path.

## VOC-120-TEST-02 — Review and permission boundary tests

- Covers: `VOC-120-AC-03`, `VOC-120-AC-05`
- Procedure:
  1. Inspect workflow permissions and action pinning.
  2. Test same-repository and untrusted-fork event paths without secrets.
  3. Prove review jobs cannot edit/push/merge/change settings/deploy.
  4. Prove pushed revisions dismiss stale review and unresolved threads block.
  5. Prove docs-only Standard, Standard behavior, Protected, unknown-effect, and
     missing-reviewer cases enforce their distinct approval/review floors.
  6. Mutate the full `.github/policy-state.json` machine: bootstrap to preparation only
     on PR1; fixed PR2/PR3 preparation; PR4-only preparation to locked; PR5-only locked
     to active; invalid state/edge/branch/actor rejection; and ordinary classification
     only after active reaches the default branch.
- Expected: attributable least-privilege review and no PR-body identity dependency.

## VOC-120-TEST-03 — Path-aware aggregate gate matrix

- Covers: `VOC-120-AC-04`, `VOC-120-AC-10`
- Procedure:
  1. Test docs-only, web-only, API-only, package-contract, migration, workflow,
     governance, security, multi-area, deletion/rename, missing-base, and merge-group
     changes.
  2. Assert applicable expensive jobs run and irrelevant jobs skip.
  3. Assert every stable aggregate gate reports and propagates failure/cancellation.
  4. Assert classifier errors or unusable bases select the broader suite.
- Expected: no false-success skip and no required-check pending deadlock.

## VOC-120-TEST-04 — Live ruleset and transition readback

- Covers: `VOC-120-AC-06`, `VOC-120-AC-09`
- Procedure:
  1. Capture before/after GitHub repository, ruleset, branch, security, tag,
     required-check, environment reviewer, admin-bypass, deployment-policy-mode, and
     custom-branch state around each authorized mutation.
  2. Prove transition/rollback refs are created only after authorization and exact
     name/SHA freeze, then protected from update, deletion, and non-fast-forward
     mutation without bypass before reliance.
  3. Exercise each required gate on a non-destructive PR/merge-group path.
  4. Prove action A permits the required old-model merge commits and does not enable
     squash-only linear history, merge queue, future-only gates, or future review
     floors before the final synchronization.
  5. Prove `cloudflare-staging` safely admits `main`, preserves reviewer/admin state,
     reads no secret value, and can restore the captured `develop` policy.
  6. Verify a credential-free main dispatch reaches the expected gate before sole-main
     policy or develop retirement.
  7. Prove action B occurs only after final merge-commit synchronization and activates
     squash/linear history, queue, future gates/reviews, and sole-main staging.
  8. Compare PR3 and PR5 settings truth with their exact live readbacks.
- Expected: protected main and immutable version tags match policy with no hidden
  bypass or missing gate.

## VOC-120-TEST-05 — Product/security regression validation

- Covers: `VOC-120-AC-03`, `VOC-120-AC-08`, `VOC-120-AC-10`
- Procedure:
  1. Run `pnpm validate` or the documented narrower exact suites per affected path.
  2. Run auth/data/migration/API/AI safety/accessibility/dependency/delivery tests
     retained by the transition.
  3. Run workflow security lint, secret scan, and `git diff --check`.
  4. For PR2, mutate every `DESIGNATED_F3_SURFACES` member through aggregate
     `inspectF3Evidence()`, preserve all existing direct/local cases, and run the
     complete foundation suite within the committed cap.
- Expected: no product behavior change and no protected-control regression.

## VOC-120-TEST-06 — Legacy removal and rollback rehearsal

- Covers: `VOC-120-AC-07`, `VOC-120-AC-09`
- Procedure:
  1. Verify every removed active artifact is reachable from the recorded rollback ref.
  2. Verify no current script, workflow, doc, template, ruleset, or package script
     depends on a removed path or check name after both EHR outcomes are applied.
  3. Reconstruct the last-known-good branch/settings plan without executing
     destructive or live production actions.
  4. Prove PR1/PR2 keep every legacy gate and bind the exact tracked verifier digest.
     After action A, execute its protected ref through permanent `Policy / required`
     for PR3-PR5. Prove PR4 can remove the tracked full verifier only after ref-pinned
     acceptance and PR5 still invokes that protected ref.
  5. Prove final main ancestry and branch/PR inventory.
- Expected: clean final tree with deterministic repository/settings rollback.
