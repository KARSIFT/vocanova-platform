# VOC-002 — Specification

## Objective and requirement source

The authoritative substantive source is frozen A-003 with SHA-256
`f2b454653a33e6cb76a0eab37c01d48b0174227450c9ea255474f6aac59b4f83`.
Repository integration may add lifecycle and evidence records but must not redesign
that policy.

## Stable requirements

- **VOC-002-R01:** Preserve the frozen A-003 substantive Markdown at its canonical path.
- **VOC-002-R02:** Record founder direction, formal exact-revision approval, adoption,
  activation, and lifecycle synchronization as distinct states.
- **VOC-002-R03:** Apply DOC-15, DOC-16, A-001, and A-002 to this R4 transition with an
  R3 protected effect; require exact-SHA Claude, founder, and steward evidence.
- **VOC-002-R04:** Keep A-003 inactive throughout the adoption PR.
- **VOC-002-R05:** Preserve the technical-steward appointment and its historical facts.
- **VOC-002-R06:** Make the migration approval one-time and exhausted only after valid
  activation; never convert it into a future routine approval rule.
- **VOC-002-R07:** Express the post-activation model conditionally: routine R3 requires
  strengthened controls and independent verification, not standing steward or founder
  approval merely because it is R3.
- **VOC-002-R08:** Keep R4 founder authority unchanged.
- **VOC-002-R09:** Keep EHR exceptional and prohibit it from becoming a permanent
  replacement approval layer.
- **VOC-002-R10:** Distinguish the approved PR head SHA from the adopted `develop` SHA.
- **VOC-002-R11:** Require post-merge validation and evidence against the adopted SHA
  before effective activation.
- **VOC-002-R12:** Permit a later lifecycle-only synchronization without changing
  frozen substantive policy.
- **VOC-002-R13:** Fail closed on false activation, missing evidence, retired-history
  falsification, migration reuse, routine post-activation human approvals, false RL1
  or RL2 technical activation, automatic merge, or autonomous production release.
- **VOC-002-R14:** Keep DOC-17, DOC-18, the Control Plane, deployment, product work,
  and autonomous orchestration out of scope.
- **VOC-002-R15:** Preserve current workflows when they continue to invoke the updated
  validators correctly.
- **VOC-002-R16:** Classify VOC-002 as R4 regardless of changes to classifier policy in
  the same transition.

## Authority by stage

| Stage | Authority | Required evidence |
|---|---|---|
| Pre-merge transition | Pre-A-003 | validation, exact-SHA Claude, R4 founder, R3 steward |
| Repository adoption | Pre-A-003-approved revision merged | approved PR head SHA and distinct adopted `develop` SHA |
| Effective activation | Adopted state after passing validation | post-merge validation and activation evidence |
| Lifecycle synchronization | Active A-003 | already-completed facts; no routine founder/steward approval solely for R3 |

## Data, migrations, analytics, and accessibility

There is no application data, database migration, analytics, UI, accessibility,
Cloudflare, or production effect. The only migration is reversible governance-state
adoption in Git history.
