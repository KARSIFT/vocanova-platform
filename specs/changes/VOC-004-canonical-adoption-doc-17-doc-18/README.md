# VOC-004 — Canonical Adoption of DOC-17 and DOC-18

## Identity and lifecycle

- Change ID: `VOC-004`
- Status: `completed`
- Risk: `R4`
- Requirement source: GitHub issue #10, founder planning approval
- Base branch: `develop`
- Exact base revision: `873038735aea30b754a8c57b3522e1ff41f6d89c`
- Canonical path: `specs/changes/VOC-004-canonical-adoption-doc-17-doc-18`

## Objective

Adopt DOC-17 and DOC-18 atomically as the canonical architecture-and-roadmap baseline.
DOC-17 defines the autonomous-development architecture and DOC-18 defines its phased
future roadmap. Canonical adoption records the already founder-approved documents; it
does not implement or activate the architecture.

## Frozen-source integrity

- DOC-17 source:
  `/home/mehrdad/project/vocanova-source/DOC-17-vocanova-autonomous-development-architecture-v1.md`
- DOC-17 source SHA-256:
  `8c9fd7b714e84d39f4b5e9d5c8a4cf8f00a3231b269e2d6dadf6e0ff7707693a`
- DOC-17 destination:
  `docs/architecture/17-autonomous-development-architecture.md`
- DOC-18 source:
  `/home/mehrdad/project/vocanova-source/DOC-18-vocanova-autonomous-development-implementation-roadmap.md`
- DOC-18 source SHA-256:
  `717c33649f49cedca64cc4744d8121f4b6f5a371c9760076bfa8134c050a8664`
- DOC-18 destination:
  `docs/planning/18-autonomous-development-implementation-roadmap.md`

Only lifecycle and source-integrity frontmatter is integrated. The frozen substantive
bodies remain byte-for-byte unchanged and are protected by deterministic body hashes.

## Boundaries

The adopted baseline keeps both repository-adoption flags true while Control Plane
implementation, RL1, RL2, automatic merge, autonomous merge, production deployment,
and autonomous production release remain false, inactive, or disabled. The automation
system exists to support building VocaNova; it must not become a reason to postpone the
VocaNova MVP.

## Verification, approvals, release, and closure

PR #11 merged the exact candidate
`89013e6a8fab4cee45935e700d9eb3e49d3d39ed` into `develop` as canonical commit
`2b5ecb19b532a9b23250e1255ff1e7fb9a78ef77`. Claude Code independently verified the
candidate with `PASS WITH NON-BLOCKING FINDINGS`, and the founder granted exact-SHA R4
approval; both evidence records are linked from `change.yaml`. EHR was not triggered,
no standing technical-steward approval was required under active A-003, and the
exhausted VOC-002 migration approval was not reused. This completed adoption grants no
auto-merge, deployment, release, or technical-activation authorization.
