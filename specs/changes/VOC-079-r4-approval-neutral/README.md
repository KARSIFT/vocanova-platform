# VOC-079 — R4 Approval-Neutral Governance

Status: adopted. This package records the approved transition from a blanket
founder-approval gate for R4 to verification-driven controls that apply consistently
across R0–R4. The exact candidate received founder approval and independent review
under the governance effective before the transition. Implementation is authorized but
remains blocked until VOC-078 retires the external merge gate.

- Requirement source: GitHub issue #74
- Target branch: `develop`
- Risk: R4
- Production deployment: out of scope
- Transition rule: the exact package candidate received the one-time founder approval
  required for adoption. The eventual exact implementation revision remains governed by
  the approved release plan; neither approval can be reused after the transition lands.

The proposal does not make R4 low risk. R4 keeps its consequence-based classification,
impact analysis, decision record, contingency evidence, and stronger independent
verification. It removes only the approval and automatic-merge prohibition caused by
the class label itself.

The pre-merge implementation evidence and transition boundary are consolidated in
[`t03-verification-record.md`](t03-verification-record.md). That record does not claim
activation: exact-revision T03 review, the one-time pre-transition implementation
approval, stack merge, and post-merge verification remain separate recorded events.
