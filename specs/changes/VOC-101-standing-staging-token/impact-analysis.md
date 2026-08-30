# VOC-101 — Impact Analysis

## Security

A standing token persists until an explicit revocation event. Compensating controls
are the exact one-account resource scope, two permissions, environment-only secret,
approval-history-first access, synthetic-only staging, and mandatory immediate
revocation triggers. This package deliberately accepts credential persistence under
operator control; accountable adoption must accept that tradeoff.

After a mandatory trigger, revocation happens before replacement and staging remains
disabled unless and until the replacement passes every protected check.

## Operations

Ordinary staging dispatch is unchanged. Credential replacement remains independent
of deployment and repository work. The operator can revoke at any time. No automatic
Cloudflare or GitHub mutation is introduced.

## Privacy and data

No token value or learner data enters repository evidence. Staging remains synthetic
only. Production data and production delivery remain prohibited.

## Cost

No paid feature, billing permission, or spending authority is added. The Free/$0
ceiling remains unchanged.

## Governance and reviewability

One small coherent implementation PR reconciles all living claims and deterministic
guards together. Historical packages remain immutable. This is a one-time policy
replacement, not a dispatch workflow.

## Rollback

Repository rollback is a separately reviewed revert restoring the previous living
policy and tests. No external rollback is needed because implementation performs no
settings or Cloudflare action.
