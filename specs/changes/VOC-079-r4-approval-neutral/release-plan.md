# VOC-079 — Release Plan

## Authorization

This transition is governed by the R4 model in force before it. Adoption and the exact
final implementation revision need the current founder approval once, recorded in
GitHub after independent review. The transition may not auto-merge or cite its proposed
post-transition authority. That approval is exhausted when the transition lands.

After activation, R4 no longer requires founder approval or a merge hold solely by
class. Separately named action-specific authority and genuinely triggered EHR remain.

## Rollout and dependencies

1. Adopt the package under the pre-transition rule.
2. Complete VOC-078's retirement of the external `karsift-ai-infra` merge gate.
3. Reconcile canonical authority, enforcement, and package templates without an
   intermediate claim that the new model is already live.
4. Run positive/negative R4 fixtures and the repository-wide semantic inventory.
5. Obtain exact-revision independent governance/security verification.
6. Record the one-time exact-revision founder approval and merge to `develop`.

No promotion to `main`, deployment, hosting change, server check, or settings mutation
is part of this release.

## Monitoring and outcome

For the next representative R4 package, record whether planning, review, deterministic
checks, and merge eligibility operate without a risk-class founder gate. Treat any old
active wording or enforcement as drift and open a governed follow-up issue.

Closure requires `VOC-079-EV-00` through `VOC-079-EV-06`, dependency resolution,
the transition approval, and an accurate post-merge authority statement.

## Rollback

Rollback if R4 bypasses concrete evidence, role separation, EHR, or an explicit
external-effect gate, or if active policy layers disagree. Revert the transition to the
last pre-activation `develop` revision and rerun governance validation. No runtime or
data rollback is needed because production mutation is prohibited.
