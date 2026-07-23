# VOC-012 — PR #41 R3 Gate Remediation

## Summary

- Change ID: `VOC-012`
- Type: governance-process-remediation
- Status: `implementation-ready`
- Risk: `R3`
- Authority model: active A-003
- Requirement source: issue #39 founder direction comment `5052251828`
- Canonical path: `specs/changes/VOC-012-pr41-r3-gate-remediation`

PR #41 merged the VOC-011 package candidate without the required independent
exact-revision report being recorded canonically on the PR before merge. GitHub shows
zero comments and zero reviews. The external chat report cannot be posted or reused
retroactively, and PR #41 remains procedurally invalid.

## Outcome

This package establishes a forward-only remediation: validly adopt and separately
synchronize VOC-012, mechanically revert PR #41, freshly adopt VOC-011 with a new
exact-SHA report posted before merge, and finally synchronize the complete evidence
chain. Only after that sequence may the previously planned PR #40 remediation resume.

## Immutable failure record

- PR: `#41`
- Base: `8de351bd97818ea7488616ceaa0a4f3d853f415c`
- Candidate: `a2781a4317b4de07d7eccbb4908c41cc78ab67f2`
- Canonical merge: `f1596ba9f0adb896e93368ec9cf9f111934c57c1`
- Merged at: `2026-07-22T22:18:52Z`
- Candidate/merge tree: `0fa319fb6339fc59a4974079eb2c71772d5a3192`
- Candidate direct parent: the declared base
- Candidate and merge trees: byte-identical
- Hosted checks: `governance-policy` and `validate` passed
- GitHub comments: zero
- GitHub reviews: zero
- Canonical pre-merge independent-verification evidence: absent

Tree identity is content evidence only. It does not cure the missing procedural gate.

## Package adoption evidence

PR #42 validly adopted the package from base
`f1596ba9f0adb896e93368ec9cf9f111934c57c1` using exact candidate
`2e6a838f49bd6f02c0e43d33b1aee51e5ba9fec3`. Both `governance-policy` runs and
`validate` passed on that candidate. Claude Code independently verified the exact base
and candidate with `PASS WITH NON-BLOCKING FINDINGS`; the complete report was posted
as comment `5063970647` at `2026-07-23T22:01:47Z`.

The authorized human merge followed at `2026-07-23T23:02:33Z` and created canonical
`develop` commit `0212350114e6e68dce9c334c73713d5749166a0d`. The candidate and
merge trees are byte-identical at `e0164ca01aca59512d71afee3aae4889ec701897`;
that identity confirms merged content but is not a substitute for the preceding
verification report. No material revision intervened. Codex did not approve or merge.

The external chat report associated with PR #41 was not posted or reused. PR #41
remains permanently procedurally invalid.

## Required sequence

1. Independently verify and human-merge this package-only candidate — complete through
   PR #42.
2. Separately synchronize VOC-012 package-adoption evidence and authority — this
   candidate.
3. Mechanically revert exactly PR #41's ten paths while preserving VOC-012 and all
   unrelated later history.
4. Independently verify the exact revert candidate and stop for human merge.
5. From post-revert `develop`, freshly adopt the complete VOC-011 package and index.
6. Post a new exact-SHA independent report to that PR before human merge.
7. Separately synchronize VOC-012 remediation and fresh VOC-011 adoption evidence.
8. Only then resume the PR #40 remediation governed through VOC-011.

After this synchronization validly merges, package authority extends only to preparing
the separately gated PR #41 revert candidate. It does not validate PR #41
retroactively, authorize a revert merge, begin fresh VOC-011 adoption, authorize PR
#40 remediation, or close issue #39.

## Scope boundary

Package adoption changes exactly the nine files in this directory plus
`specs/README.md`. Planned remediation may later change only the index, VOC-011, and
VOC-012 package paths required by each separately gated stage.

No application, dependency, manifest, lockfile, workflow, governance authority,
DOC-15/16/17/18, amendment, infrastructure, deployment, secret, production, release,
activation, VOC-010, VOC-006, or F2-I04 change is authorized.

## Risk and gates

The path classifier floor is R3 because `specs/README.md` is protected. The semantic
effect is also R3 because the package restores an executable-specification gate. EHR
is not triggered. Routine R3 requires strengthened controls and exact-revision
independent verification, but no standing founder or technical-steward approval merely
for R3. Every merge remains an authorized human action; Codex cannot approve or merge.

Automatic/autonomous merge, RL1/RL2 activation, production deployment, and autonomous
production release remain false or disabled.
