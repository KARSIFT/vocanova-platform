# VOC-002 — Acceptance Criteria

## VOC-002-AC-01 — Frozen source integrity

The canonical A-003 file matches frozen SHA-256
`f2b454653a33e6cb76a0eab37c01d48b0174227450c9ea255474f6aac59b4f83`.

## VOC-002-AC-02 — Truthful pre-merge lifecycle

A-003 and the transition record remain proposed/pending/inactive with no adopted SHA
or post-merge activation evidence.

## VOC-002-AC-03 — Exact-revision transition gates

The package and PR require validation, exact-SHA Claude verification, R4 founder
approval, and one-time R3 technical-steward approval under pre-A-003 governance.

## VOC-002-AC-04 — Conditional future authority

Reconciled policy states that only after valid activation routine R3 no longer needs
standing steward approval or founder approval merely because it is R3.

## VOC-002-AC-05 — Founder and EHR boundaries

R4 remains founder-controlled and EHR remains exceptional rather than routine.

## VOC-002-AC-06 — Historical evidence

The steward appointment and exact historical facts remain present and are marked
current until activation, then historical/retired only after valid activation.

## VOC-002-AC-07 — One-time migration

The transition approval is non-reusable and can be marked exhausted only with valid
activation evidence.

## VOC-002-AC-08 — Activation evidence separation

Validators require distinct approved-head and adopted-`develop` SHAs plus successful
post-merge validation before active status is accepted.

## VOC-002-AC-09 — Operational truth

RL1/RL2 technical activation, automatic merge, autonomous production release,
DOC-17 adoption, and DOC-18 adoption remain false or disabled.

## VOC-002-AC-10 — Deterministic validation

Positive repository validation passes and negative lifecycle/authority mutations fail
closed with specific diagnostics.

## VOC-002-AC-11 — Risk floor

The classifier reports R4 for this transition and rejects a lower declaration.

## VOC-002-AC-12 — Bounded scope

No workflow orchestration, deployment, Control Plane, application, DOC-17, or DOC-18
implementation is introduced.

## Evidence

Evidence is the exact final diff, required command output, exact-SHA Claude verdict,
human approval record, PR head SHA, and—after merge only—adopted-state evidence.
