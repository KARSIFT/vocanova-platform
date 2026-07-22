# Test Plan

> **Approved reconciliation:** Test IDs remain stable. Current canonical verifier
> results are `PASS`, `PASS WITH NON-BLOCKING FINDINGS`, and `FAIL`; the one-time
> bootstrap is expired. Hosted enforcement tests remain Phase 4 closure evidence.
> Path and ownership expectations follow `VOC-001-AM-01` through `VOC-001-AM-05`.

## Strategy

Testing uses three layers:

1. **Synthetic validator unit tests** — temporary repositories prove positive and fail-closed behavior.
2. **Actual implementation-branch validation** — full tests, validator, workflow inspection, and complete diff audit.
3. **GitHub-hosted enforcement proof** — required checks, code owners, review conversations, failure blocking, and compliant success.

No test accesses production, staging, secrets, learner data, or application infrastructure. Invalid governance content must never merge into `develop`.


## Grounded baseline

The implementation branch must start from the latest `develop`. The inspection baseline was `0211d75f28a4986694555f584dd8b84a3228a2ad`; any later change triggers a fresh inventory and contradiction check before implementation proceeds.

## Environment

```text
Local operating environment: Ubuntu 24.04 or compatible WSL2
Python: 3.12
Third-party Python dependencies: None
Validator network access: None
Repository secrets: None
Production access: None
```

## Evidence format

Each executed test records:

- Test ID.
- Date.
- Commit SHA.
- Branch or pull request.
- Executor.
- Command or procedure.
- Expected result.
- Actual result.
- Pass or fail.
- Evidence location.
- Related acceptance criteria.
- Notes or deviations.

# Layer 1 — Synthetic validator tests

## VOC-001-TEST-01 — Valid foundation fixture passes

- **Level:** Unit
- **Acceptance criteria:** `VOC-001-AC-14`, `VOC-001-AC-16`, `VOC-001-AC-17`
- **Preconditions:** Complete synthetic repository fixture satisfying all rules.
- **Procedure:** Run the validator against the fixture.
- **Expected:** Exit `0`; no validation errors; fixture remains unchanged.
- **Evidence:** Unit-test output.
- **Owner:** Codex.

## VOC-001-TEST-02 — Missing required root file fails

- **Level:** Unit
- **Acceptance criteria:** `VOC-001-AC-06`, `VOC-001-AC-16`
- **Preconditions:** Valid fixture with `AGENTS.md` removed.
- **Procedure:** Run validator.
- **Expected:** Exit `1`; error names `AGENTS.md`; no files modified.
- **Evidence:** Unit-test output.
- **Owner:** Codex.

## VOC-001-TEST-03 — Incomplete package fails

- **Level:** Unit
- **Acceptance criteria:** `VOC-001-AC-12`, `VOC-001-AC-13`
- **Preconditions:** Valid fixture with one required package artifact removed.
- **Procedure:** Run validator.
- **Expected:** Exit `1`; missing artifact and package path reported.
- **Evidence:** Unit-test output.
- **Owner:** Codex.

## VOC-001-TEST-04 — Package identity mismatch fails

- **Level:** Unit
- **Acceptance criteria:** `VOC-001-AC-14`
- **Preconditions:** Directory ID or slug differs from `change.yaml`.
- **Procedure:** Run validator.
- **Expected:** Exit `1`; directory, ID, slug, and canonical-path mismatch identified.
- **Evidence:** Unit-test output.
- **Owner:** Codex.

## VOC-001-TEST-05 — Duplicate stable identifier fails

- **Level:** Unit
- **Acceptance criteria:** `VOC-001-AC-14`
- **Preconditions:** Duplicate an acceptance or task ID.
- **Procedure:** Run validator.
- **Expected:** Exit `1`; both conflicting locations reported.
- **Evidence:** Unit-test output.
- **Owner:** Codex.

## VOC-001-TEST-06 — Invalid lifecycle enum fails

- **Level:** Unit
- **Acceptance criteria:** `VOC-001-AC-14`
- **Preconditions:** Set `status: ready-for-codex`.
- **Procedure:** Run validator.
- **Expected:** Exit `1`; allowed lifecycle states reported.
- **Evidence:** Unit-test output.
- **Owner:** Codex.

## VOC-001-TEST-07 — False readiness with blockers fails

- **Level:** Unit
- **Acceptance criteria:** `VOC-001-AC-04`, `VOC-001-AC-14`
- **Preconditions:** Set `status: implementation-ready` with non-empty `blocking_reasons`.
- **Procedure:** Run validator.
- **Expected:** Exit `1`; readiness rejected.
- **Evidence:** Unit-test output.
- **Owner:** Codex.

## VOC-001-TEST-08 — Unknown impact blocks readiness

- **Level:** Unit
- **Acceptance criteria:** `VOC-001-AC-04`
- **Preconditions:** At least one material impact is `Unknown — resolution required` and status is `implementation-ready`.
- **Procedure:** Run validator.
- **Expected:** Exit `1`; unresolved impact identified.
- **Evidence:** Unit-test output.
- **Owner:** Codex.

## VOC-001-TEST-09 — Unsupported YAML fails closed

- **Level:** Unit
- **Acceptance criteria:** `VOC-001-AC-14`, `VOC-001-AC-16`
- **Preconditions:** Add an anchor, alias, merge key, tab indentation, flow collection, multiline scalar, or other prohibited syntax.
- **Procedure:** Run validator.
- **Expected:** Exit `1`; unsupported syntax identified; no silent reinterpretation.
- **Evidence:** Unit-test output.
- **Owner:** Codex.

## VOC-001-TEST-10 — Duplicate YAML key fails

- **Level:** Unit
- **Acceptance criteria:** `VOC-001-AC-14`
- **Preconditions:** Duplicate the `status` key.
- **Procedure:** Run validator.
- **Expected:** Exit `1`; duplicate key and location reported.
- **Evidence:** Unit-test output.
- **Owner:** Codex.

## VOC-001-TEST-11 — Missing exact ChatGPT rule fails

- **Level:** Unit
- **Acceptance criteria:** `VOC-001-AC-07`
- **Preconditions:** Remove or materially weaken the approved ChatGPT rule.
- **Procedure:** Run validator.
- **Expected:** Exit `1`; missing mandatory rule reported.
- **Evidence:** Unit-test output.
- **Owner:** Codex.

## VOC-001-TEST-12 — Protected-path mismatch fails

- **Level:** Unit
- **Acceptance criteria:** `VOC-001-AC-22`
- **Preconditions:** Remove one approved protected path from `CODEOWNERS` or the protected-path manifest.
- **Procedure:** Run validator.
- **Expected:** Exit `1`; inconsistent path reported.
- **Evidence:** Unit-test output.
- **Owner:** Codex.

## VOC-001-TEST-13 — CODEOWNERS self-protection is required

- **Level:** Unit
- **Acceptance criteria:** `VOC-001-AC-22`
- **Preconditions:** Remove ownership for `/.github/`.
- **Procedure:** Run validator.
- **Expected:** Exit `1`; loss of self-protection reported.
- **Evidence:** Unit-test output.
- **Owner:** Codex.

## VOC-001-TEST-14 — Excessive workflow permissions fail

- **Level:** Unit
- **Acceptance criteria:** `VOC-001-AC-19`, `VOC-001-AC-20`
- **Preconditions:** Add `contents: write` or another write permission.
- **Procedure:** Run validator.
- **Expected:** Exit `1`; excessive permission reported.
- **Evidence:** Unit-test output.
- **Owner:** Codex.

## VOC-001-TEST-15 — Unsafe workflow event fails

- **Level:** Unit
- **Acceptance criteria:** `VOC-001-AC-19`
- **Preconditions:** Add `pull_request_target`.
- **Procedure:** Run validator.
- **Expected:** Exit `1`; prohibited event reported.
- **Evidence:** Unit-test output.
- **Owner:** Codex.

## VOC-001-TEST-16 — Floating action reference fails

- **Level:** Unit
- **Acceptance criteria:** `VOC-001-AC-19`
- **Preconditions:** Use a floating action reference such as `actions/checkout@v4`.
- **Procedure:** Run validator.
- **Expected:** Exit `1`; full reviewed commit SHA required.
- **Evidence:** Unit-test output.
- **Owner:** Codex.

# Layer 2 — Actual implementation-branch tests

## VOC-001-TEST-17 — Repository foundation validation passes

- **Level:** Local and CI
- **Acceptance criteria:** `VOC-001-AC-18`
- **Preconditions:** Implementation branch contains intended complete change.
- **Procedure:** Run:

```bash
python3 -m unittest discover \
  -s tooling/governance/tests \
  -p 'test_*.py' \
  -v

python3 tooling/governance/validate_repository_foundation.py \
  --repository-root .

git diff --check
```

- **Expected:** Unit tests pass; validator exits `0`; no whitespace error.
- **Evidence:** `VOC-001-EV-03` and workflow logs.
- **Owner:** Codex.

## VOC-001-TEST-18 — Diff scope inspection passes

- **Level:** Manual inspection with command evidence
- **Acceptance criteria:** `VOC-001-AC-02`, `VOC-001-AC-20`, `VOC-001-AC-28`
- **Preconditions:** Branch is rebased or based on the verified `develop` baseline.
- **Procedure:** Run:

```bash
git diff --name-status origin/develop...HEAD
git diff --stat origin/develop...HEAD
git diff origin/develop...HEAD
```

- **Expected:** Only approved foundation changes; no application, document migration, later automation, deployment, secret, or data work; compatible existing content preserved.
- **Evidence:** `VOC-001-EV-04`, pull-request diff.
- **Owner:** Codex and Claude.

## VOC-001-TEST-19 — Workflow inspection passes

- **Level:** Automated and manual inspection
- **Acceptance criteria:** `VOC-001-AC-19`, `VOC-001-AC-20`
- **Preconditions:** Final workflow file exists.
- **Procedure:** Validator checks plus manual review of the entire workflow and verified action SHAs.
- **Expected:** Only `contents: read`; no secrets, writes, privileged event, merge, deployment, Codex, or Claude; correct triggers and timeout.
- **Evidence:** Validator output, Claude review, official SHA verification record.
- **Owner:** Codex and Claude.

## VOC-001-TEST-20 — Independent review passes

- **Level:** Semantic independent review
- **Acceptance criteria:** `VOC-001-AC-26`
- **Preconditions:** Complete package, diff, tests, and evidence available.
- **Procedure:** Claude reviews scope, criteria, correctness, architecture, security, validator, negative tests, ownership, reconciliation, and rollback.
- **Expected:** `PASS`; no unresolved blocking, critical, or high finding.
- **Evidence:** `VOC-001-EV-05`.
- **Owner:** Claude.

# Layer 3 — GitHub-hosted enforcement tests

## VOC-001-TEST-21 — Merged workflow succeeds on develop

- **Level:** GitHub-hosted automated
- **Acceptance criteria:** `VOC-001-AC-19`, `VOC-001-AC-28`
- **Preconditions:** Bootstrap merge completed.
- **Procedure:** Inspect the push workflow run on the merged `develop` commit.
- **Expected:** `Repository Governance / validate` succeeds on the merged commit.
- **Evidence:** `VOC-001-EV-07`.
- **Owner:** Founder with Codex evidence support.

## VOC-001-TEST-22 — Invalid governance change is blocked

- **Level:** Controlled negative pull-request test
- **Acceptance criteria:** `VOC-001-AC-25`
- **Preconditions:** Hosted controls activated; safe temporary proof branch.
- **Procedure:** Introduce one harmless invalid foundation state, open a PR to `develop`, observe check failure and merge blocking, close without merge, delete branch.
- **Expected:** Required check fails; merge is blocked; `develop` remains valid.
- **Evidence:** `VOC-001-EV-10`.
- **Owner:** Founder with Codex support.

## VOC-001-TEST-23 — Protected file requests governance review

- **Level:** GitHub-hosted inspection
- **Acceptance criteria:** `VOC-001-AC-23`, `VOC-001-AC-25`
- **Preconditions:** Eligible direct steward and code-owner review enabled.
- **Procedure:** Open a proof PR changing a protected path.
- **Expected:** `@m-e-h-r-d-a-a-d` is recognized and its approval is required.
- **Evidence:** `VOC-001-EV-08`, `VOC-001-EV-11`.
- **Owner:** Founder.

## VOC-001-TEST-24 — Unresolved conversation blocks merge

- **Level:** GitHub-hosted inspection
- **Acceptance criteria:** `VOC-001-AC-24`, `VOC-001-AC-25`
- **Preconditions:** Conversation-resolution requirement enabled.
- **Procedure:** Create an unresolved review conversation on the proof PR, observe blocking, resolve it.
- **Expected:** Merge is blocked while unresolved and that blocker clears after resolution.
- **Evidence:** `VOC-001-EV-09`, `VOC-001-EV-11`.
- **Owner:** Founder.

## VOC-001-TEST-25 — Compliant proof pull request can pass

- **Level:** GitHub-hosted positive test
- **Acceptance criteria:** `VOC-001-AC-24`, `VOC-001-AC-25`
- **Preconditions:** Hosted controls active.
- **Procedure:** Use a compliant non-production proof PR and satisfy required validation, reviews, code ownership when applicable, and conversation resolution.
- **Expected:** All approved controls can be satisfied; no governance deadlock.
- **Evidence:** `VOC-001-EV-09`, `VOC-001-EV-11`.
- **Owner:** Founder with Codex support.

# Pass and failure rules

- Any failed Layer 1 or Layer 2 test blocks merge.
- Any material implementation correction after Claude review requires affected tests, full required validation, and fresh Claude review.
- A failed Layer 3 test keeps `VOC-001` open or returns it to `blocked`.
- Screenshots alone are insufficient when textual logs or settings evidence are available.
- Sensitive values must be redacted; secrets must never be revealed merely to prove their existence.
