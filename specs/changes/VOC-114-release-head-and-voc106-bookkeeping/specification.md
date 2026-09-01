# VOC-114 — Release-head and VOC-106 bookkeeping correction: Specification

## Objective and requirement source

Issue #213 reports that adopted VOC-106 cannot safely execute its stated
`develop`-headed release PR while the recorded hosted setting automatically deletes a
merged PR's source branch. `VOC-114-D00` through `D10` correct that contradiction
without changing the setting or broadening release authority.

## Exact corrected release topology

After adoption, the implementation makes current policy require:

```text
frozen origin/develop SHA
        │ exact short-lived ref (same SHA and tree)
        ▼
release/voc-106-<short-sha> ── reviewed merge-commit PR ──► main
        GitHub may auto-delete this short-lived head after merge

current develop ── short-lived sync head containing current main ──► develop
```

The release head is a ref-only exact copy, not an authored release commit. Current
`develop` and `main`, the short-lived head, their trees, merge base, compare, PR
metadata, checks, and reviews form one invalidation domain. Drift requires refresh
with `--force-with-lease` on only the disposable head and complete new evidence.

## Scope and contradictions

One implementation PR changes the six living governance/contribution guides and all
nine adopted VOC-106 artifacts. It corrects stale adoption/task fields without
altering the already-recorded approved SHA, reviewers, approvals, authority source,
or two-PR protected-history delivery shape. Archived text and earlier immutable
packages remain historical evidence.

No repository setting is read or changed. No branch is deleted manually. No release,
sync, dispatch, deployment, or live-system action belongs to the correction PR.

## Risk, security, privacy, and authority

R4 is the highest applicable class because wrong release-head guidance can delete a
permanent canonical ref and the implementation edits DOC-15, DOC-16, AGENTS, and an
adopted release package. Exact specialist and independent R4 reviews are mandatory.
Risk does not supply approval or merge authority; a separate non-author merges only
after exact adoption and evidence. No credentials, personal data, production data,
Cloudflare, DNS, migration, spending, or launch surface is accessed.

## Data, analytics, accessibility, and migrations

Not applicable. The change is repository policy and bookkeeping only and has no
application behavior, user interface, analytics, database, or live migration effect.
