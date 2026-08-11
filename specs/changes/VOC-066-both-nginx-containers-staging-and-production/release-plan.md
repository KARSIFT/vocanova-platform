# VOC-066 — Release Plan

## Release and deployment authorization

Not authorized by this package. A merged package does not itself authorize
production deployment. Under this repository's 2026-08-08 auto-release /
auto-deploy posture (AGENTS.md), promotion and production deploy may follow
automatically once the package's task roster closes through the normal pipeline —
that is a repository-level delegation, not an extra authority granted by this
draft. Until adoption and task completion, no deploy is authorized by these
files alone.

## Preconditions, monitoring, and outcome

Preconditions:

- `VOC-066-T00` and `VOC-066-T01` implemented and independently verified on the
  exact revision to be released.
- `VOC-066-AC-00`/`01`/`02` satisfied with evidence.
- `VOC-066-DEP-01` approach choice recorded at adoption.
- `VOC-066-DEP-02` recreate timing decided (wait for normal deploy vs interim
  manual nginx recreate on staging/production).

Monitoring after recreate:

- Docker health status for `vocanova-nginx` and `vocanova-production-nginx`
  (should become and remain `healthy` when nginx is up).
- Real hostname availability (`staging.vocanova.site` /
  production web host) still 200.
- Spot-check that unrecognized-Host `/` still closes with `444`.
- Existing Sentry / deploy-smoke signals unchanged by this package's intent.

Outcome owner: named explicitly in the implementation PR at deploy/recreate
time, not left implicit here.

## Rollback

Trigger: healthcheck still fails after recreate; catch-all weakened beyond the
approved health exception; or real hostname traffic regresses after the conf
change.

Mechanism: revert the compose (and conf) commits and recreate nginx from the
last known-good artifact, or redeploy the prior revision via existing deploy
workflows. No database migration; rollback is config-only.

Accountable owner: named in the implementation PR.

Validation after rollback: HEALTHCHECK strings and catch-all conf match the
pre-VOC-066 state (knowingly unhealthy-by-construction if fully reverted — that
is the prior known state issue #484 documents). Prefer rolling forward with a
fix if only a narrow probe mistake occurred.

Last-known-good reference: the `develop` (then `main`) commit immediately
preceding this package's implementation merge; record the exact SHA in
`VOC-066-EV-00`/`EV-02` at implementation time.

## Independent verification, human approvals, and closure

Independent verifier result: not yet produced — pending implementation.

R3 approvals: under active A-003, routine R3 does not require standing
technical-steward or founder approval solely because it is R3; strengthened
applicable controls and independent verification remain required (CLAUDE.md).
R4 founder authority and EHR are not implicated by this draft's stated scope;
the independent verifier must still escalate if the implemented diff introduces
a protected or R4 consequence path rules miss.

Closure evidence: not yet produced. Repository merge, release, activation
(container recreate), and closure are distinct. Closure requires
`VOC-066-AC-03` live evidence on staging and production, and recorded
resolution of `VOC-066-DEP-01`/`DEP-02`. Do not treat "merged to develop" as
"nginx now reports healthy in production."
