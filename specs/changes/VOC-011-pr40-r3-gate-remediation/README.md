# VOC-011 — PR #40 R3 Gate Remediation

## Identity and lifecycle

- Change ID: `VOC-011`
- Status: `proposed`
- Risk: `R3`
- Requirement source: issue #39 founder direction comment `5047420157`
- Base: `develop` at `8de351bd97818ea7488616ceaa0a4f3d853f415c`
- Canonical path: `specs/changes/VOC-011-pr40-r3-gate-remediation`

PR #40 merged the VOC-010 package candidate without canonical GitHub evidence of the
required exact-revision independent verification. The candidate was independently
reviewed outside GitHub before merge, but GitHub is canonical and PR #40 contains zero
comments and zero reviews. That external report cannot be posted or reused
retroactively to validate the merge.

This package establishes a forward-only remediation: adopt and synchronize VOC-011,
revert PR #40 through a separately gated candidate, freshly adopt VOC-010 through a
new exact candidate whose independent report is recorded before merge, and finally
synchronize the valid lifecycle. No VOC-006 correction may begin until remediation is
complete.

## Immutable failure record

- PR #40 base: `a22affd5732a00ba41361c4dc84c8685272e5a6e`.
- PR #40 candidate: `e302d0911287c2a8b6c74d1296d5069f5e36a5c3`.
- PR #40 canonical merge: `8de351bd97818ea7488616ceaa0a4f3d853f415c` at
  `2026-07-22T14:23:47Z`.
- Candidate and merge tree: `0aca913b5ee2a0e49cac901bfbeb484da396b99a`.
- Hosted `governance-policy` and `validate` checks passed on the candidate.
- PR #40 GitHub comments: zero; GitHub reviews: zero.
- Required canonical exact-SHA independent-verification evidence before merge: absent.

The content result is not treated as invalid merely because the procedure failed, but
it remains non-authoritative because its required adoption gate was not satisfied.

## Required sequence

1. Independently verify and human-merge this VOC-011 package.
2. Separately synchronize its package-adoption lifecycle.
3. Mechanically revert only PR #40's ten paths while preserving VOC-011 and later
   valid history.
4. Independently verify and human-merge that exact revert candidate.
5. From then-current `develop`, freshly adopt the VOC-010 package in a separate PR.
6. Record the fresh candidate's independent report on GitHub before human merge.
7. Separately synchronize VOC-010 adoption and VOC-011 completion.
8. Only then may the later VOC-006 lifecycle correction begin.

## Risk and exclusions

All repository stages are R3: `specs/README.md` establishes the protected path floor,
and the semantic effect restores required verification and executable specification
authority. No stage makes a new R4 product, architecture, privacy, governance,
deployment, or production decision. EHR is not triggered by the known scope.

No application, dependency, lockfile, workflow, DOC-15/16/17/18, amendment,
infrastructure, deployment, secret, production, release, or activation-state path may
change. No retrospective validation, self-approval, auto-merge, issue closure, or
VOC-006 correction is authorized.
