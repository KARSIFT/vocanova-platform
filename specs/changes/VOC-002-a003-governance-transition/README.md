# VOC-002 — A-003 Governance Transition

## Identity and lifecycle

- Status: `implementing`
- Risk: `R4`, with an `R3` protected governance and authority effect
- Target: `develop`
- Frozen A-003 SHA-256: `f2b454653a33e6cb76a0eab37c01d48b0174227450c9ea255474f6aac59b4f83`
- Frozen source identification: founder-provided
  `A-003-governed-autonomous-engineering-authority.md` from
  `~/project/vocanova-source/`, checksum-bound above
- Current authority: DOC-15, DOC-16, A-001, and A-002
- Effective activation: `inactive`

Founder direction authorizes preparation. It is distinct from formal exact-revision
approval, repository adoption, and effective activation. The pre-A-003 authority
model governs this transition and A-003 does not authorize its own adoption.

## Objective and authority

Adopt the frozen A-003 amendment, reconcile repository policy with its conditional
future authority model, preserve historical technical-steward evidence, establish
deterministic lifecycle validation, and prepare correct post-merge activation without
claiming that activation has happened.

The one-time transition requires deterministic validation, independent Claude review
of the exact final head, R4 founder approval, and R3 technical-steward approval. One
record from `@m-e-h-r-d-a-a-d` may evidence the two human capacities only when it names
both and binds both to the exact reviewed revision.

## Package map

| File | Purpose |
|---|---|
| `change.yaml` | Lifecycle, authority, source, approvals, activation, and rollback state |
| `specification.md` | Stable requirements and boundaries |
| `acceptance-criteria.md` | Observable completion criteria |
| `impact-analysis.md` | Authority, repository, risk, history, and operational impacts |
| `implementation-plan.md` | Reconciliation and lifecycle sequence |
| `tasks.md` | Bounded implementation tasks |
| `test-plan.md` | Positive and fail-closed validation cases |
| `release-plan.md` | Adoption, activation, synchronization, and rollback |

## Scope and exclusions

This package adds A-003 and transition state, reconciles directly affected governance
and contribution records, and extends deterministic validation. It does not adopt or
implement DOC-17 or DOC-18, implement the Control Plane, add product behavior, enable
automatic merge, enable deployment, or activate autonomous production release.

## Lifecycle boundary

The adoption PR cannot contain an adopted `develop` SHA or successful post-merge
validation evidence. After merge, those facts are recorded against the adopted state.
Only then may activation evidence be recorded. A later small PR synchronizes canonical
lifecycle fields without reopening frozen substantive policy.
