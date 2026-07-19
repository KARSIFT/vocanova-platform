# VOC-007 Test Plan

Tests use no secret, production configuration, learner data, external database, or
deployment environment. The package and implementation PRs record exact commands.

## VOC-007-TEST-01 — Package and authority baseline

Verify all nine package files, the specs index entry, issue #25 approval evidence,
live base, package lifecycle, governance checks, risk declaration, and diff syntax.

Expected: the package is complete, R4, pending adoption, and grants no implementation
authority before canonical merge.

## VOC-007-TEST-02 — Stable ID and path validation

Parse frontmatter, manifest, graph, and indexes; enumerate IDs and canonical paths.

Expected: DOC-00 through DOC-14 and DOC-19 are accounted for exactly once, DOC-15
through DOC-18 remain existing canonical files, and no ID/path collision exists.

## VOC-007-TEST-03 — Section-level source coverage

Compare every source heading and load-bearing block to the destination coverage map,
including combined-source splits.

Expected: each source section is migrated, preserved as evidence, or explicitly
disposed with rationale; no silent loss or duplicate conflicting authority exists.

## VOC-007-TEST-04 — Changelog preservation

Inspect the migration evidence artifact for all six conflict records, source mapping,
removed scaffolding, and the live-governance erratum.

Expected: historical reasoning is intact and clearly non-authoritative.

## VOC-007-TEST-05 — Governance reconciliation accuracy

Compare DOC-19, DOC-14 disposition, and affected migrated claims with DOC-16, A-002,
A-003, risk classification, approval matrix, and live transition YAML.

Expected: source 12 is not authority; R0–R4, RL1–RL3, EHR, precedence, exhausted
migration evidence, and permission/activation separation are accurate.

## VOC-007-TEST-06 — Protected-file exclusion

Compare exact changed paths with the protected denylist.

Expected: no existing file under `docs/governance/`, DOC-15, DOC-16, DOC-17, DOC-18,
or any amendment changes.

## VOC-007-TEST-07 — Stale authority search

Search imported content for founder approval, `develop`/`main`, merge authority,
technical steward, automatic/autonomous merge, production publication/deployment,
DOC-15/A-001, and activation statements; inspect every match semantically.

Expected: current claims defer to live governance; contradictory source statements
are labeled historical or removed from living current-state claims with evidence.

## VOC-007-TEST-08 — Product decision reconciliation

Trace AI labels, review scale/reset, Confidence Points, sentence history, repository
name, and governance conflict across changelog, living documents, and manifest.

Expected: the refined outcomes remain complete and consistently marked proposed.

## VOC-007-TEST-09 — Manifest, graph, and index consistency

Parse YAML with an installed standard parser when available and compare every node,
source, path, status, owner, and relationship with files and indexes.

Expected: values agree; references exist; the graph is identified as derived data.

## VOC-007-TEST-10 — Lifecycle truth

Search frontmatter, indexes, manifest, and prose for `approved`, approval dates, and
authority claims concerning newly migrated documents.

Expected: new living documents are proposed and no unverified date or adoption claim
exists.

## VOC-007-TEST-11 — Installed deterministic validation

Run governance unit/foundation checks, governance wrapper, path classifier against
exact base/head and a complete PR risk declaration, `git diff --check`, and every
committed document/link/metadata validator available at implementation time.

Expected: all applicable installed checks pass without weakening controls; unavailable
checks are reported as unavailable, never passed.

## VOC-007-TEST-12 — Exact-SHA independent review

Obtain Claude Code review of exact authority, source snapshot, changed files/full
diff, completeness, semantics, security/privacy, risk, validation, and exclusions.

Expected: verdict is `PASS` or `PASS WITH NON-BLOCKING FINDINGS` with no blocking
finding; material changes require fresh review.

## VOC-007-TEST-13 — R4 approval and PR evidence

Inspect the exact final PR revision, independent verdict, founder approval, hosted
checks, evidence table, and rollback statement.

Expected: approval is attributable and revision-bound; Codex did not self-approve or
merge; automatic merge remains unused.

## VOC-007-TEST-14 — Runtime, production, and secret exclusion

Inspect changed paths/full diff for code, dependencies, schema, workflow, infra,
credentials, personal data, deployment, automatic merge, autonomy, or production.

Expected: none is introduced or represented as active.

## VOC-007-TEST-15 — Rollback inspection

Review the proposed rollback against the exact diff.

Expected: reverting the documentation merge fully removes the change; no external,
data, schema, deployment, credential, or production recovery action is needed.

## Required command minimum

```bash
python3 -m unittest discover -s tooling/governance/tests -p 'test_*.py' -v
python3 tooling/governance/validate_repository_foundation.py --repository-root .
bash -n scripts/governance/validate-governance.sh
bash -n scripts/governance/classify-change-risk.sh
bash scripts/governance/validate-governance.sh
bash scripts/governance/classify-change-risk.sh
git diff --check
```

Use committed package/application commands discovered from live `package.json` only
when relevant. Do not invent a documentation check or report it as passing.

## Pass and failure rules

Any source mismatch, silent loss, false approval, stale authority claim, protected
file edit, broken reference, failed applicable check, R4 under-classification,
unresolved Critical/High finding, unwaived Medium finding, missing exact-revision
founder approval, runtime effect, or scope expansion blocks merge.
