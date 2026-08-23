# VOC-082 Acceptance Criteria

## VOC-082-AC-00 — Active governance defines role, actor, identity, and provenance

- Requirements: R00, R01
- Tasks: T00
- Tests: TEST-00, TEST-01
- Evidence: EV-00, EV-01
- Result: pending

DOC-15, DOC-16, AGENTS.md, and the approval matrix use one compatible definition: a
role is a responsibility, an actor is the attributable human or separately instantiated
AI participant, and runtime/model/provider provenance does not grant authority.

## VOC-082-AC-01 — AI-only role separation has a valid worked example

- Requirements: R01, R02
- Tasks: T00
- Tests: TEST-01
- Evidence: EV-01
- Result: pending

At least one active canonical example shows separately instantiated AI planner,
builder, exact-SHA reviewer, and non-author merge-audit actors. It explicitly rejects
one actor merely relabeling itself and does not require a human solely for review or
merge.

## VOC-082-AC-02 — Model/provider choice is not authority

- Requirements: R03
- Tasks: T00
- Tests: TEST-01, TEST-02
- Evidence: EV-01, EV-02
- Result: pending

All active guidance says different model/provider selection may harden independence
but does not create authority. Any narrower explicit cross-model evidence rule remains
intact and is described as an evidence control, not a vendor assignment. The active
post-merge activation checklist requests distinct least-privilege implementer and
independent-verifier actors without requiring Codex or Claude Code identities.

## VOC-082-AC-03 — Self-review and material-correction rules remain fail-closed

- Requirements: R01, R04
- Tasks: T00, T01
- Tests: TEST-01, TEST-03
- Evidence: EV-01, EV-03
- Result: pending

The plan author cannot review/adopt its own plan; the implementation builder cannot
review, approve, or merge its own exact revision; and a reviewer that materially edits
the revision becomes a builder whose new SHA needs fresh checks and a different
reviewer.

## VOC-082-AC-04 — Exact evidence and external-effect authority stay separate

- Requirements: R04, R05
- Tasks: T00
- Tests: TEST-02
- Evidence: EV-02
- Result: pending

Contributor, activation-checklist, and evidence templates record actor/role, exact SHA,
verdict, resolved findings, authorship independence, and optional runtime provenance.
They state that technical review and merge eligibility cannot substitute for an action-
specific hold.

## VOC-082-AC-05 — Evaluator behavior and workflow inventory do not change

- Requirements: R05, R06
- Tasks: T01
- Tests: TEST-03, TEST-04
- Evidence: EV-03, EV-04
- Result: pending

The eligible/blocked fixtures demonstrate AI reviewer identities while producing the
same decisions and reason codes. The evaluator, adapter, schema, `governance.yml`,
permissions, and exact four-workflow inventory are byte-for-byte unchanged from the
adopted base.

## VOC-082-AC-06 — Deterministic policy rejects the original ambiguity

- Requirements: R07
- Tasks: T01
- Tests: TEST-03
- Evidence: EV-03
- Result: pending

Canonical state passes. Synthetic variants that require a human solely because a role
is independent, derive authority from vendor/model identity, accept same-actor
relabeling, remove exact-SHA evidence, permit builder self-merge, or let reviewer
evidence satisfy an external-effect hold fail with concrete reasons.

## VOC-082-AC-07 — Final proof is exact, independent, reversible, and repository-only

- Requirements: all
- Tasks: T01
- Tests: TEST-04, TEST-05
- Evidence: EV-04, EV-05
- Result: pending

The final revision has complete R4 decision/impact/contingency/specialist/deterministic
evidence, a different-actor cross-model exact-SHA verdict, no blocking findings, hosted
proof, and reverse-order rollback. No PR is self-merged and no settings, deployment,
Cloudflare, secret, production-data, billing, DNS, or live-system action occurs.
