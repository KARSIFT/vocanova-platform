# VOC-085 — Acceptance Criteria

## VOC-085-AC-00 — Current settings truth is recorded separately from history

- Requirements: `VOC-085-D00`, `VOC-085-D01`, `VOC-085-D07`
- Tasks: `VOC-085-T00`
- Tests: `VOC-085-TEST-00`
- Evidence: `VOC-085-EV-00`
- Result: complete-exact-SHA-429aee4c5b833c3f0ae2e870f11077fbd1e06cad-merged-through-PR-127

A machine-readable `docs/governance/repository-settings-current.yaml` record contains
the exact read-only public-repository,
merge, Actions, ruleset, branch-protection, dependency/vulnerability-alert, Dependabot
security-update, and secret-scanning observations listed in the specification, with
`observed_at`, `as_of`, source, and explicit freshness/staleness semantics. The record
is labelled current as observed at 2026-08-24, not live-current. The network-free guard
proves internal consistency only and cannot prove live freshness. VOC-080's private
snapshot remains unchanged and explicitly historical. No secret, token, environment
value, or live-system claim is present. A distinct R4 settings specialist must verify
the source/API schema and availability-versus-enabled interpretation on the exact
final revision, including the dependency-alert versus Dependabot-security-update
distinction.

## VOC-085-AC-01 — Living guidance describes the public posture current as observed

- Requirements: `VOC-085-D02`, `VOC-085-D03`
- Tasks: `VOC-085-T01`
- Tests: `VOC-085-TEST-01`
- Evidence: `VOC-085-EV-01`
- Result: complete-exact-SHA-efeb1d0b7f7e61138a2b705719a3d8e2389be342-merged-through-PR-128

README, `.github/README.md`, repository-settings guidance, Cloudflare delivery guidance,
and DOC-16 no longer describe private-plan limitations as the current repository state.
They link facts current as observed at 2026-08-24 to the point-in-time record and label
the VOC-080 snapshot as historical. They distinguish enabled Actions hardening from
enabled dependency/vulnerability alerts, absent/disabled controls, and prospective
settings targets.

## VOC-085-AC-02 — Desired mature protections remain future and held

- Requirements: `VOC-085-D04`, `VOC-085-D05`, `VOC-085-D06`, `VOC-085-D07`
- Tasks: `VOC-085-T01`
- Tests: `VOC-085-TEST-01`, `VOC-085-TEST-02`
- Evidence: `VOC-085-EV-02`
- Result: complete-exact-SHA-efeb1d0b7f7e61138a2b705719a3d8e2389be342-merged-through-PR-128

Rulesets, protected branches, Dependabot security updates, secret scanning/push
protection, environment protections, and delivery activation are described as
prospective and held by VOC-085-HOLD-00 (or the distinct VOC-080 Cloudflare holds)
only. No document claims they were enabled by this package or that public visibility
itself proves them. No document treats the currently enabled dependency/vulnerability
alert state as merely prospective. The formal hold does not block repository-only
package merge.

## VOC-085-AC-03 — Truthfulness guard fails closed

- Requirements: `VOC-085-D03`, `VOC-085-D04`, `VOC-085-D07`
- Tasks: `VOC-085-T02`
- Tests: `VOC-085-TEST-03`, `VOC-085-TEST-04`
- Evidence: `VOC-085-EV-03`
- Result: complete-exact-SHA-47293d416a7a85ecbbbee0c8f0b03608ae4d17c2-merged-through-PR-129

The network-free validator passes the reconciled repository and rejects scoped negative
fixtures for stale private-current claims, historical/current conflation, held-control
promotion, missing point-in-time/freshness fields, and settings-mutation claims. Its
PASS proves internal consistency only, not live freshness. It does not reject
explicitly marked historical or prospective text. Specialist and general exact-SHA
reviews are both required.

## VOC-085-AC-04 — Scope, evidence, rollback, and hosted proof are complete

- Requirements: all, including `VOC-085-D06`, `VOC-085-D07`
- Tasks: `VOC-085-T03`
- Tests: `VOC-085-TEST-05`, `VOC-085-TEST-06`
- Evidence: `VOC-085-EV-04`
- Result: candidate-local-validation-and-reverse-order-rollback-prepared-pending-fresh-exact-review-hosted-proof-merge-and-post-merge-checks

The final implementation must receive exact-SHA independent PASS, applicable hosted checks,
and a repository-only reverse rollback rehearsal. No setting, environment, live system,
secret, production data, deployment, `main` promotion, branch-protection/ruleset
mutation, or branch deletion occurs. Normal isolated branches and governed pull
request merges remain allowed. Issue
#119 remains open until the final merge and passing post-merge checks. The prepared
repository-only closure wording is in `t03-evidence.yaml`; it may be used only after
that gate with exact current-as-observed-at-2026-08-24 state and documentation evidence.
VOC-085-HOLD-00 remains held for future settings activation.
