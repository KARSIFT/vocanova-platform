# VOC-095 — Impact analysis

## Scope

This is a high-consequence canonical-record correction. It changes no product code,
workflow, repository setting, secret, Cloudflare resource, DNS record, deployment,
database, traffic, production data, or billing state. Its risk is that inaccurate
bookkeeping could either block required work or falsely imply authority for live
staging actions, so the implementation must be exact and fail closed.

## Risks and mitigations

| Risk                                                    | Mitigation                                                                                                                               |
| ------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| A stale AM-01 status remains after the correction       | Bind every exact candidate, review, eligibility, merge, post-merge, and lifecycle fact; validate the resulting VOC-094 fields and prose. |
| Historical evidence is rewritten or lost                | Preserve original candidates, PASS/FAIL records, approvals, and adoption unchanged; add only the effective bookkeeping facts.            |
| Repository effectiveness is mistaken for live authority | Keep all external effects prohibited; require fresh corrected-SHA ACT-02 review and action authority.                                    |
| ACT-01 sequencing is omitted or misrepresented          | Record the incident and exact D1 UUID as historical non-secret evidence; prohibit D1 mutation/use under VOC-095.                         |
| A broad document cleanup expands scope                  | Audit direct living claims, enumerate the eight VOC-094 documents, and record justified exclusions for unrelated files.                  |
| Revert is mistaken for external rollback                | Define rollback as a repository-only revert; external systems remain untouched and independently governed.                               |

## Protected boundaries

The implementation PR must preserve VOC-080-HOLD-00/01/02, VOC-085-HOLD-00, the
incremental VocaNova staging cost ceiling of zero, the unrelated Basic Load Balancing
subscription, protected Workers, production names/data, public-launch prohibition,
and all worktrees/recovery refs. It must not edit overlays or run action commands.

## Evidence and dependencies

- Issue #161 is the bug report and authoritative correction requirement.
- PR #160 lifecycle comment `5418849810` binds the completed merge and post-merge
  evidence.
- The final independent R4 comment is `5418760783`; final Cloudflare and
  security/settings comments are `5418703931` and `5418764879`.
- ACT-01 D1 evidence is issue comment `5424676862`; it is preserved but not a
  dependency that permits ACT-02.
