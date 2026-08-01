# VOC-037 — Release Plan

## Release and deployment authorization

Not authorized. This drafting package's own diff (documentation only) requires no
deployment. None of the future tasks it proposes (`T00`–`T05`) is
implementation-authorized by this package; each requires its own
implementation-authorization decision after this package is adopted, consistent
with `AGENTS.md`'s statement that "a merged package does not itself authorize
production deployment."

## Preconditions, monitoring, and outcome

Once adopted and each task implemented, `T05`'s release PR is the point at which
`docs/operations/11-devops-and-ci-cd.md` §2's release-artifact and deployment-
ordering rules apply (build once → test in staging → promote to production).
`T04`'s monitoring (Sentry, Better Stack/UptimeRobot) is a precondition for `T05`,
not a parallel independent release. The outcome owner for `T05`'s go/no-go
decision is the founder, per DOC-12 §5's explicit requirement that "founder
records go/no-go" — no other role may substitute for that record.

## Rollback

Trigger: any SEV1/SEV2 incident per `docs/operations/11-devops-and-ci-cd.md` §4, or
any of the launch-blocking triggers DOC-12 §5's L1 section lists (cross-user
exposure, auth failure, unsafe AI feedback, injection exposing protected info,
migration-caused inconsistency, unreliable mission/progress state, unacceptable
error-rate/latency, material quality-regression reports, incorrect provider
privacy config, AI cost overrun, insufficient monitoring) if discovered during
this package's own `T03`/`T04` rehearsal against the production target.
Mechanism: redeploy the previous known-good artifact by digest (DOC-11 §3);
database rollback is never automatic and prefers a corrective forward migration.
Accountable owner: founder, per DOC-11 §4's "Founder owns incident decision-making
during MVP." Last-known-good reference: the most recent artifact digest that
passed `T05`'s release-PR checks, once one exists — none exists yet.

## Independent verification, human approvals, and closure

Not yet performed. Claude Code will independently verify each task's exact final
PR revision per `CLAUDE.md` once implementation begins. `T02` and `T05` require
explicit founder approval as `R4` decisions (legal/privacy position and go/no-go,
respectively); routine R3 tasks (`T00`, `T01`, `T03`, `T04`) do not require standing
technical-steward or founder approval solely for being R3, per active A-003 — but
remain subject to strengthened applicable controls and independent verification.
This package is not closed; closure requires the founder's own adoption decision
first, which this package does not and cannot make for itself.
