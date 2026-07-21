# VOC-009 Test Plan

Tests use no secret, learner/production data, external database, vendor, paid service,
deployment, or production environment.

## VOC-009-TEST-01 — Package completeness

Verify nine files, specs index, stable IDs, issue evidence, proposed lifecycle, R4 risk,
pending approvals, and no implementation authority.

## VOC-009-TEST-02 — Incident identity

Fetch PR #32 and issue #29 live; verify base `0ce8fd8`, candidate `c2154042`, merge
`b591ee7`, tree equality, zero pre-merge reviews/comments, retrospective comment
`5028020844`, and founder direction `5031045639`.

## VOC-009-TEST-03 — Containment

Search package/index/PR claims and open issue state.

Expected: DOC-00–DOC-12 are explicitly non-authoritative pending remediation; no
application package may rely on them.

## VOC-009-TEST-04 — Revert path fidelity

Compare the revert candidate file list with the exact 22-path allowlist.

Expected: exact equality; no protected, application, workflow, package, or unrelated
path appears.

## VOC-009-TEST-05 — Revert tree fidelity

Compare every reverted path's blob/tree with `0ce8fd8`, parse frontmatter/YAML, and
verify indexes, graph, manifest, relations, links, and excluded document lifecycle.

Expected: byte-identical pre-PR-32 state and preserved Git/GitHub audit history.

## VOC-009-TEST-06 — Revert pre-merge gates

Inspect exact head checks, independent report, founder approval, PR state, and merge
timing.

Expected: all evidence exists and binds the unchanged exact revision before merge.

## VOC-009-TEST-07 — Fresh adoption equivalence

Compare fresh adoption with PR #32 candidate `c2154042` and its post-revert base.

Expected: equivalent reviewed reconciliation or a complete justified difference log.

## VOC-009-TEST-08 — Fresh semantic/lifecycle validation

Repeat VOC-008 cross-document semantics, C01–C11 disposition, links, sections,
frontmatter, indexes, graph, manifest, governance, and activation checks.

Expected: coherent atomic candidate with no unresolved material finding.

## VOC-009-TEST-09 — Fresh adoption pre-merge gates

Inspect exact checks, independent report, founder approval, PR state, and timing.

Expected: all evidence exists and binds the unchanged exact revision before merge.

## VOC-009-TEST-10 — Evidence non-reuse

Map each package/revert/adoption verification and founder approval to one exact SHA.

Expected: no retrospective review or prior approval is reused; PR #32 remains recorded
as procedurally invalid.

## VOC-009-TEST-11 — Protected and external-effect exclusion

Inspect every exact diff and transition state.

Expected: no protected governance, application, workflow, dependency, schema,
infrastructure, secret, data, deployment, production, release, or activation effect.

## VOC-009-TEST-12 — Installed deterministic checks

Run, at minimum:

```bash
python3 -B -m unittest discover -s tooling/governance/tests -p 'test_*.py' -v
python3 -B tooling/governance/validate_repository_foundation.py --repository-root .
bash -n scripts/governance/validate-governance.sh
bash -n scripts/governance/classify-change-risk.sh
bash scripts/governance/validate-governance.sh
bash scripts/governance/classify-change-risk.sh
git diff --check
```

Use current committed package/document commands when applicable. Report unavailable
checks as limitations, not passes.

## VOC-009-TEST-13 — Closure truth

Verify final sync and issue state.

Expected: issue #29 closes only after valid package, revert, fresh adoption, and sync
evidence are canonical.

## VOC-009-TEST-14 — Rollback inspection

Check reverse application/revert for each exact phase.

Expected: the immediately preceding consistent repository state is restorable without
external recovery or history rewriting.

## Blocking rules

Any evidence mismatch, false retroactive claim, downstream authority claim, incomplete
revert, content drift, protected/external effect, failed applicable check, unresolved
Critical/High or unwaived Medium finding, missing exact-revision verification, missing
exact-revision founder R4 approval, or merge while a gate is pending blocks progress.
