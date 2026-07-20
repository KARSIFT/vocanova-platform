# VOC-008 Test Plan

Tests use no secret, production configuration, learner data, external database, paid
provider, or deployment environment. Package and adoption PRs record exact commands.

## VOC-008-TEST-01 — Package and authority baseline

Verify all nine package files, the specs index entry, issue #29 approval evidence,
live base, proposed lifecycle, R4 declaration, pending approvals, and diff syntax.

Expected: the package is complete and grants no adoption authority before merge.

## VOC-008-TEST-02 — Snapshot integrity

Recompute SHA-256 for all 13 documents and compare IDs/paths with the package table.

Expected: every baseline value matches or implementation fails closed.

## VOC-008-TEST-03 — Cross-document semantic matrix

Compare the exact candidate across product scope, screens, navigation, auth, review
scheduling, missions, points/streaks, AI contract/safety/privacy, deletion/retention,
repository layout, API/OpenAPI, infrastructure, testing, and roadmap dependencies.

Expected: one authoritative rule exists for each topic; differences are explicit
specialization rather than unresolved contradiction.

## VOC-008-TEST-04 — Contradiction-register closure

Inspect C01 through C11 and the review log against the exact diff.

Expected: every item has a documented disposition and no unapproved material choice.

## VOC-008-TEST-05 — Governance and activation accuracy

Search current claims for founder/steward approval, R0–R4, RL1–RL3, EHR,
`develop`/`main`, merge, deploy, release, Control Plane, and activation language;
compare with the canonical authority files and live transition state.

Expected: no competing model or false technical activation claim.

## VOC-008-TEST-06 — Protected-file exclusion

Compare exact changed paths with the issue denylist.

Expected: no `docs/governance/`, DOC-15, DOC-16, DOC-17, DOC-18, or amendment file
changes.

## VOC-008-TEST-07 — Atomic lifecycle truth

Parse frontmatter and search lifecycle notices, indexes, manifest, graph, and prose.

Expected: DOC-00 through DOC-12 are approved together with one verified approval
timestamp and VOC-008 adoption metadata; no partial/premature approval remains.

## VOC-008-TEST-08 — Excluded lifecycle truth

Inspect DOC-13, DOC-14, DOC-19 and every derived index/metadata representation.

Expected: DOC-13/DOC-19 remain proposed and DOC-14 remains not adopted.

## VOC-008-TEST-09 — Link, section, manifest, graph, and index consistency

Parse Markdown links and YAML; verify every local target, cited section, graph node,
manifest row, canonical path, status, owner, relation, and evidence link.

Expected: all references resolve and derived values agree with canonical files.

## VOC-008-TEST-10 — Installed deterministic validation

Run the governance unit/foundation checks, governance wrapper, shell syntax,
classifier against exact base/head and R4 declaration, `git diff --check`, and every
committed applicable document/package command discovered at implementation time.

Expected: all applicable installed checks pass; unavailable checks are disclosed.

## VOC-008-TEST-11 — Exact-revision independent review and R4 approval

Inspect exact authority, baseline/corrections, changed files/full diff, semantics,
security/privacy, risk, checks, hosted status, independent report, and founder approval.

Expected: no blocking finding; verifier and founder evidence bind the same exact
revision; Codex did not self-approve or merge.

## VOC-008-TEST-12 — Runtime and external-effect exclusion

Inspect changed paths/full diff for application code, dependencies, schemas,
workflows, infra, credentials, data, vendor/procurement action, deployment, merge
automation, technical activation, or production effect.

Expected: none is introduced, performed, or authorized.

## VOC-008-TEST-13 — Handoff and closure truth

Inspect package/adoption lifecycle and issue #29 after each merge.

Expected: package adoption alone leaves the issue open and documents proposed;
closure occurs only after adoption and evidence synchronization.

## VOC-008-TEST-14 — Rollback inspection

Review a revert of the exact adoption diff conceptually and through an isolated tree
when implemented.

Expected: all 13 documents and derived metadata return consistently to the prior
state; no schema, deployment, data, secret, vendor, or production recovery is needed.

## Required command minimum

```bash
python3 -B -m unittest discover -s tooling/governance/tests -p 'test_*.py' -v
python3 -B tooling/governance/validate_repository_foundation.py --repository-root .
bash -n scripts/governance/validate-governance.sh
bash -n scripts/governance/classify-change-risk.sh
bash scripts/governance/validate-governance.sh
bash scripts/governance/classify-change-risk.sh
git diff --check
```

Use current committed package scripts only when applicable. Do not report an
unavailable semantic/link validator as passing.

## Blocking rules

A snapshot mismatch, unresolved contradiction, broken local/section reference, false
approval, inconsistent derived metadata, stale authority claim, protected-file edit,
runtime/external effect, R4 under-classification, failed applicable check, unresolved
Critical/High finding, unwaived Medium finding, or missing exact-revision founder
approval blocks merge.
