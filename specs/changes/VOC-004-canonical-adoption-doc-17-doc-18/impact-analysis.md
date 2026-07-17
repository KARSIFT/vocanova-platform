# VOC-004 Impact Analysis

## VOC-004-IMP-01 — Canonical documentation

Two already founder-approved frozen documents become repository candidates under the
existing architecture and planning taxonomy, atomically establishing one baseline.

## VOC-004-IMP-02 — Governance and protected policy

Canonical adoption flags change from false to true. These are documentation lifecycle
facts, not capability activation. R4 policy coverage is extended to both canonical
documents and the VOC-004 package.

## VOC-004-IMP-03 — Validation

The repository validator gains explicit source/body integrity checks, package checks,
atomic adoption checks, inactive-autonomy checks, protected-path checks, and negative
regression tests. Existing A-003 historical controls remain intact.

## VOC-004-IMP-04 — Product and roadmap

DOC-18 is a future roadmap, not an immediate execution commitment. The automation
system exists to support building VocaNova and must not delay or replace the MVP.

## VOC-004-IMP-05 — Security and privacy

No runtime, secret, production-data, identity, authorization, or deployment access is
introduced. The principal risk is semantic: documentation adoption could be falsely
read as technical authority. Explicit metadata and validation mitigate that risk.

## VOC-004-IMP-06 — Operations, release, and rollback

No production operation or release occurs. Before merge, rollback is branch/PR closure.
After an authorized merge, rollback requires a new governed R4 change that reverts the
atomic document, index, state, policy, validator, test, and package integration; it
must not rewrite historical evidence.

## VOC-004-IMP-07 — Risk, authority, and evidence

Effective risk is R4 because lifecycle state, protected policy, governance scripts,
validator paths, CODEOWNERS, and repository-settings controls are modified. Required
future gates are deterministic validation, independent exact-SHA Claude verification,
and exact-SHA founder approval. EHR is not triggered; standing technical-steward
approval is not applicable; VOC-002 migration authority is exhausted and unused.

## Risks, dependencies, and evidence

- Risk: frozen-body drift. Control: deterministic body hashes and mutation tests.
- Risk: partial adoption. Control: required files and paired true flags.
- Risk: false activation. Control: explicit inactive metadata and negative tests.
- Dependency: GitHub issue #10 planning approval and exact frozen local sources.
- Evidence: source hashes, full diff, deterministic validation, future independent
  exact-SHA report, and future founder exact-SHA approval.
