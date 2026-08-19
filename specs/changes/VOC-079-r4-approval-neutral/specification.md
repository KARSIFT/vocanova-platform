# VOC-079 — Specification

## Objective

Remove the standing founder-approval and automatic-merge prohibition caused solely
by an R4 classification. Keep R4 as the highest consequence class, with stronger
evidence and review, while applying the same separation-of-duties and gate-driven
merge model across R0–R4.

## Decisions

### VOC-079-D00 — Risk class determines controls, not personal approval

R0–R4 continues to express consequence, reversibility, blast radius, data sensitivity,
and authority impact. Higher classes require proportionately stronger deterministic
checks, specialist review, impact analysis, decision records, and rollback or
contingency evidence. No class, including R4, requires founder approval merely because
of its label.

### VOC-079-D01 — Independent verification is universal

Every meaningful plan and implementation is produced and independently reviewed by
different roles. A human or AI agent may occupy either role. The builder cannot verify,
approve, or merge its own revision. A verdict is valid only when it is bound to the
exact revision and all blocking findings are resolved.

### VOC-079-D02 — R4 may use the normal automatic-merge path

`automatic_merge_allowed` is a package-local policy across R0–R4. R4 packages default
to `true` under the post-transition drafting rule unless a specific, package-local
reason requires an accountable hold. An eligible R4 revision may merge automatically
when deterministic checks, risk-specific evidence, exact-revision independent review,
and every explicit external-effect gate pass. Unknown or unparseable risk remains a
fail-closed error, not an alias for mandatory founder approval.

### VOC-079-D03 — Explicit authority remains explicit

This change does not let repository automation sign contracts, spend money, disclose
secrets or personal data, access production, make an irreversible external mutation,
or perform a public/major launch without the separately defined authority and technical
controls for that action. Such a gate must name the exact action, accountable role,
evidence, and expiry or completion condition. It must not be written as a disguised
blanket hold on all R4 work.

Exceptional Human Review remains a stop condition only when its documented exceptional
trigger actually occurs. It is not a routine R4 approval layer.

### VOC-079-D04 — The transition cannot authorize itself

This package is classified, reviewed, adopted, and merged under the R4 rule effective
before it. Its exact transition revision therefore requires one final founder approval
in GitHub. That approval is exhausted by this transition and supplies no approval for
later work. After activation, R4 follows `VOC-079-D00` through `VOC-079-D03`.

### VOC-079-D05 — GitHub records evidence; roles are technology-neutral

GitHub is the canonical record of requirements, revisions, checks, verdicts, decisions,
and merges. Governance names roles such as planner, implementer, reviewer, and
orchestrator by responsibility rather than binding them to a vendor or permanent bot.
Deterministic GitHub Actions may validate the evidence contract; an external
orchestrator may coordinate humans or agents under the same contract.

### VOC-079-D06 — Eligibility is a local, read-only policy decision

After VOC-078 retires the external state machine, this repository owns a small,
provider-neutral merge-eligibility evaluator. It consumes normalized evidence (risk,
package permission, deterministic-check results, exact-revision independent verdict,
required R4 artifacts, explicit action holds, and EHR state) and emits a deterministic
`eligible` or `blocked` result with reasons. It has no repository write credential and
does not merge, approve, comment, dispatch an agent, or mutate GitHub. A separately
authorized human or orchestrator may use the result to execute a merge.

The implementation records this authority transition in DOC-16's amendment history and
in a dedicated decision record so later readers can distinguish the old and new models.

## Scope

In scope:

- Reconcile every active policy statement that makes R4 founder-controlled by class.
- Reconcile `automatic_merge_allowed` guidance and templates for R0–R4.
- Remove any active in-repository or called merge policy that hard-blocks R4 solely by
  class, after the external `karsift-ai-infra` dependency is retired.
- Add the repository-owned, read-only eligibility evaluator and its normalized evidence
  contract; do not add write-capable merge automation.
- Add positive and negative policy tests for eligible and ineligible R4 revisions.
- Preserve stronger R4 classification, evidence, contingency, and review requirements.
- Preserve exact-revision role separation and genuinely triggered EHR.
- Clearly distinguish historical approval records from active rules.

Non-goals:

- No application, API, database, pricing, legal, privacy-policy, or product change.
- No deployment, server, cloud, DNS, secret, environment, or repository-settings mutation.
- No implementation of the future hierarchical orchestrator.
- No GitHub write token or merge executor; this package grants policy eligibility and
  proves it deterministically, while merge execution remains a separate mechanism.
- No weakening of deterministic CI, security scanning, protected-path risk floors,
  independent review, rollback evidence, or fail-closed parsing.
- No rewriting of historical evidence or claims about which authority governed old work.

## Risk and protected areas

The change is R4 because it changes governance and autonomous-system authority, and it
touches R4-protected governance paths. Independent governance/security verification is
required on the exact final revision. The pre-transition founder gate applies once to
this transition.

## Security, privacy, data, analytics, and accessibility

No production credentials, personal data, migrations, analytics, or user-interface
behavior are in scope. The primary security risk is excessive autonomous authority;
the controls are exact-revision independent review, fail-closed evidence validation,
no self-approval, explicit external-effect gates, and reversible repository-only rollout.
Accessibility is not applicable because no user interface changes.
