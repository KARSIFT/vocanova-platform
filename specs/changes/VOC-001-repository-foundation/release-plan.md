# Release Plan

> **Approved reconciliation:** This is repository-only work with no deployment or
> production impact. Manual squash merge requires exact-head `PASS`, explicit R4
> founder approval, and explicit R3 qualified-human-technical-steward approval. The
> DOC-16/A-002 bootstrap exception is expired. Hosted activation and enforcement
> proofs remain Phase 4 closure work under `VOC-001-AM-01` through
> `VOC-001-AM-05`; merge is not F1 or package closure.

## Current implementation readiness

Repository grounding and implementation authorization are complete. Exact-head
validation, Claude verification, founder approval, and qualified-human-steward
approval remain pre-merge gates. Hosted controls remain post-merge closure work.

## Release classification

```yaml
release:
  required: false
  mode: repository-only
  target_branch: develop
  production_impact: none
  feature_flag: false
  migration_required: false
  rollback_required: true
```

`VOC-001` does not release application functionality. Its controlled activation is limited to repository governance on `develop`.

There is no:

- staging deployment;
- production deployment;
- merge to `main`;
- application version;
- release tag;
- feature flag;
- database migration;
- document migration;
- Cloudflare change.

## Preconditions for repository integration

Before merge:

1. The complete consolidated package is founder-approved.
2. The package remains `implementing` until exact-head evidence is complete.
3. Repository-file blockers are resolved; hosted closure requirements remain open.
4. All material contradictions are resolved.
5. Local and CI validation passes.
6. The complete diff is within scope.
7. Claude returns `PASS` with no unresolved blocking, critical, or high finding.
8. The founder explicitly approves the exact head in the R4 capacity.
9. The qualified human technical steward explicitly approves the same head in the
   R3 capacity.
10. Rollback evidence is complete.

## Stage 1 — Pre-merge readiness

Required tests:

- `VOC-001-TEST-01` through `VOC-001-TEST-20`, as applicable.

Required evidence:

- repository inventory;
- contradiction resolution;
- local validation;
- file reconciliation;
- Claude review;
- founder PR approval;
- rollback readiness.

A failing test or missing required evidence blocks merge.

## Stage 2 — Manual squash merge into develop

The founder authorizes a squash merge of the implementation pull request into `develop`.

The squash commit title or body must identify:

```text
VOC-001 — Repository Foundation
```

The initial DOC-16/A-002 bootstrap exception expired when PR #3 merged and cannot be
reused. The founder alone may manually squash-merge the exact revision after every
current gate passes; Codex must not merge or enable auto-merge.

No merge to `main` and no deployment occurs.

## Stage 3 — Verify the merged workflow

Immediately after merge:

1. Confirm the push-triggered workflow ran on the merged `develop` commit.
2. Confirm the stable check `Repository Governance / validate` succeeded.
3. Inspect logs for the expected unit-test and validator commands.
4. Confirm the workflow used no secret or write permission.
5. Record `VOC-001-EV-07`.

If the merged workflow fails:

- do not make it a required check;
- classify the failure;
- correct through a pull request or revert;
- preserve audit evidence;
- rerun on the corrected merged commit.

## Stage 4 — Activate hosted governance

Founder-controlled actions:

1. Verify direct CODEOWNERS routing to `@m-e-h-r-d-a-a-d`.
2. Establish a separate steward team only through a later approved governance change.
3. Configure distinct Codex and Claude identities and exclude automation from human
   approval authority.
4. Enable pull-request requirements for applicable branches.
5. Require at least one approving review.
6. Require code-owner review.
7. Dismiss stale approvals after material changes.
8. Require conversation resolution.
9. Require `Repository Governance / validate`.
10. Block force pushes.
11. Block branch deletion.
12. Prevent ordinary actors and agents from bypassing protections.
13. Record settings evidence.

The exact GitHub mechanism may be a repository ruleset or an equivalent supported protection. Deviations require documentation and founder approval.

## Stage 5 — Enforcement proof

Execute `VOC-001-TEST-22` through `VOC-001-TEST-25`.

### Negative proof

Use a temporary branch to introduce one harmless invalid foundation state. Open a pull request targeting `develop` and prove:

- governance validation fails;
- the failed check blocks merge;
- protected files request governance-owner review;
- unresolved conversations block merge.

Close the invalid pull request without merging and delete its branch.

### Positive proof

Use a compliant non-production pull request and prove the controls can all be satisfied. This prevents unnoticed repository lockout.

Record `VOC-001-EV-10` and `VOC-001-EV-11`.

## Stage 6 — Closure

Before proposing:

```yaml
status: closed
```

confirm:

- all applicable acceptance criteria pass;
- all applicable evidence `VOC-001-EV-01` through `VOC-001-EV-13` exists;
- version-controlled policy matches GitHub-hosted settings;
- no application code was introduced;
- Documents `00–14` were not migrated or reconstructed;
- no Codex automation, Claude automation, auto-merge, staging, or production deployment was added;
- no blocker, material contradiction, critical risk, or required follow-up remains;
- the founder approves closure.

Closure does not authorize application development without another approved package.

# Rollback strategy

## Rollback objective

Restore the exact pre-`VOC-001` repository and enforcement state without deleting history, exposing secrets, weakening `main`, or leaving an impossible required check.

The repository-file rollback is: **Revert the VOC-001 squash commit from
`develop`.** The starting reference is
`0211d75f28a4986694555f584dd8b84a3228a2ad`. No deployment, schema, data,
credential, or production rollback exists.

## Required rollback record before merge

Record:

1. Pre-change `develop` commit SHA.
2. Current hosted settings evidence.
3. Current ownership configuration.
4. Files created or modified.
5. Hosted settings changed.
6. Reversal order.
7. Rollback authority and contact.
8. Verification commands.

## Normal rollback procedure

1. If necessary, the founder temporarily removes only the newly required check that prevents a rollback pull request.
2. Create a rollback branch from current `develop`.
3. Open a rollback pull request targeting `develop`.
4. Revert the `VOC-001` squash commit.
5. Run the previously valid repository checks.
6. Restore previous ruleset, code-owner, and ownership settings.
7. Verify a known-safe pull request can pass.
8. Record the rollback, root cause, and evidence.
9. Mark `VOC-001` `blocked` or `superseded`.
10. Create or amend an approved package before reattempting.

## Safe rollback order by failure type

### Defective validator or required check

1. Founder removes the defective required-check requirement only as needed.
2. Correct or revert version-controlled files through a pull request.
3. Confirm the restored workflow succeeds.
4. Restore required-check enforcement.

### Defective CODEOWNERS or direct steward

1. Confirm founder administrative recovery.
2. Correct or temporarily relax only the invalid owner requirement.
3. Revert or correct ownership files.
4. Verify eligible code-owner behavior.
5. Restore the approved requirement.

### Excess workflow permission or credential exposure

1. Disable the workflow immediately.
2. Revoke or rotate any exposed credential.
3. Inspect workflow runs and audit logs.
4. Revert workflow and policy files.
5. Obtain security review before restoring.

## Emergency recovery

Emergency direct administrative action is permitted only when the new governance configuration:

- prevents all pull requests;
- blocks an urgent security correction;
- grants unintended privilege;
- exposes secrets;
- creates an exploitable workflow path.

Only the founder may authorize this recovery. The change must be minimal, audited, temporary, and reconciled afterward through repository history and an incident record.

# Rollback triggers

Evaluate or initiate rollback when:

- workflow permissions exceed approved read-only access;
- invalid governance content can pass;
- a compliant pull request cannot pass;
- required protected paths are not owned;
- the direct steward cannot approve owned files;
- required-check activation causes lockout;
- compatible existing governance content was lost;
- Documents `00–14` were altered;
- application or deployment artifacts entered the change;
- a critical or high security issue is found;
- version-controlled policy and hosted settings materially disagree.

# Failure handling

## Failure before merge

- Do not merge.
- Return work to Codex.
- Fix only within approved scope.
- Rerun the full relevant test set.
- Obtain fresh Claude approval after material changes.

## Failure after merge but before hosted activation

- Do not activate a failing check.
- Correct or revert through a pull request.
- Preserve evidence.
- Verify the merged correction.

## Failure after hosted activation

- Founder uses the approved recovery path.
- Relax only the affected control.
- Revert or correct through a pull request when feasible.
- Restore protections.
- Record root cause and evidence.
- Keep the package open or return it to `blocked`.

# Release evidence

Minimum release and closure evidence:

- `VOC-001-EV-05` Claude review.
- `VOC-001-EV-06` founder pull-request approval.
- `VOC-001-EV-07` successful merged workflow.
- `VOC-001-EV-08` direct-steward verification.
- `VOC-001-EV-09` ruleset verification.
- `VOC-001-EV-10` negative validation proof.
- `VOC-001-EV-11` protected ownership and conversation proof.
- `VOC-001-EV-12` rollback readiness.
- `VOC-001-EV-13` scope and closure verification.
