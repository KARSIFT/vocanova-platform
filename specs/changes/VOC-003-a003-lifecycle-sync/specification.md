# Specification

## Objective and requirement source

Record already-completed A-003 lifecycle facts from the authoritative PR #8 evidence
without creating a new lifecycle event or changing frozen substantive policy.

- **VOC-003-R01:** Synchronize the lifecycle state to `a003-active` and
  `effectively-active` using the exact approved and adopted SHAs and evidence.
- **VOC-003-R02:** Update only A-003 frontmatter metadata; preserve the substantive
  body byte-for-byte under its frozen checksum.
- **VOC-003-R03:** Reconcile current-state guidance so routine R3 has no standing
  steward or founder approval solely because it is R3, R4 founder authority remains,
  and EHR stays exceptional.
- **VOC-003-R04:** Preserve the original steward appointment and all historical
  dual-capacity and VOC-002 evidence while marking routine authority retired and the
  migration approval exhausted and non-reusable.
- **VOC-003-R05:** Keep automatic/autonomous merge, RL1/RL2 technical activation,
  production deployment, autonomous production release, DOC-17 adoption, and DOC-18
  adoption false, disabled, or unimplemented.
- **VOC-003-R06:** Extend deterministic validation and R4 classification to cover the
  canonical synchronized state and complete VOC-003 package.
- **VOC-003-R07:** Do not modify workflows unless required; do not implement the
  VocaNova Control Plane.

## Data, migrations, analytics, and accessibility

No application data, schema, migration, analytics, UI, or accessibility behavior is
changed. This package changes governance metadata, documentation, and validation only.
