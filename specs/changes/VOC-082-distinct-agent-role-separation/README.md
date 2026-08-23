# VOC-082 — Provider-neutral distinct-agent role separation

Status: draft and unadopted. This package is not implementation authority.

Issue [#109](https://github.com/KARSIFT/vocanova-platform/issues/109) records a
coordination failure: a builder interpreted the prohibition on self-review and
self-merge as a requirement for a human participant. Current governance is already
provider-neutral, but it does not make the operational distinction between a role,
an actor, and an optional model/provider choice explicit enough.

## Planned result

- Canonical governance defines independence using distinct actors and authorship,
  not a human-versus-AI or vendor hierarchy.
- Separately instantiated AI agents may occupy planner, builder, reviewer, evidence-
  audit, and merge-actor roles when their assignments, identities, exact revisions,
  and outputs are independently recorded.
- Relabeling one actor or session is not separation. A reviewer that materially
  changes the revision becomes a builder for that new revision.
- A different model or provider may be selected as defense in depth, and an
  applicable package may expressly require cross-model evidence, but model/provider
  identity never creates repository authority.
- Reviewer evidence remains distinct from action-specific authority for contracts,
  spending, secrets or personal-data disclosure, production access, irreversible
  external mutations, and initial public or predefined major launches.
- The active post-merge activation checklist requests distinct least-privilege
  implementer and verifier actors without hard-coding Codex or Claude Code as the
  required identities; any scoped cross-model control remains evidence hardening.
- The merge-eligibility evaluator remains read-only and semantically unchanged; the
  clarification does not create an executor or hosted identity guarantee.

The first independent review of exact SHA
`5db667afb47987d9343f78975e3d5cacb03dd3dc` failed because the active post-merge
activation checklist was missing from the planned inventory. That FAIL remains
historical evidence. This amended draft is pending fresh exact-SHA review.

## Authority boundary

This R4 package changes protected governance text and therefore uses the pre-VOC-082
rules, complete R4 evidence, independent cross-model review, deterministic validation,
and exact-candidate adoption evidence. Its R4 floor creates no founder or standing-
steward approval by itself. It authorizes no implementation before adoption and no
GitHub setting, merge executor, deployment, Cloudflare, secret, production-data,
spending, DNS, or launch action at any time.
