# VOC-032 — Release Plan

## Release and deployment authorization

No release or deployment is authorized by this draft. Merge into `develop`,
staging deployment, the founder's staging acceptance, and the DOC-12 R1
milestone gate are distinct and none is granted here. Production deployment
and autonomous production release remain disabled
(`docs/governance/a003-transition-state.yaml`:
`production_deployment: disabled`, `rl1_technical_activation: false`,
`rl2_technical_activation: false`) and this package does not touch that
gate — its own deploy automation (`T07`) targets the staging tier only. `T05`
cannot be considered complete until `VOC-032-DEP-01` (Cloudflare
certificate/DNS) resolves; `T07`'s SSH-deploy steps cannot execute until
`VOC-032-DEP-00` resolves; `T09`/`T10` cannot execute until those plus
`VOC-032-DEP-03` resolve. This draft is not adopted.

## Preconditions, monitoring, and outcome

Before any staging deploy: an adopted package with `VOC-032-D02`/`D03`/`D04`/
`D10` resolved, the founder-provisioned SSH credentials, Cloudflare
certificate, DNS records, and AI-provider credentials in place, the exact
base/revision, required PR checks passing, and exact-SHA independent review
per task. Monitor (once staging is live): `T00`'s `/healthz` result over
time; the CI/CD workflow's deploy success/failure rate; the AI-evaluation
gate's pass/fail trend; and, during `T09`'s rehearsal window specifically,
that no rehearsal action ever touches the live staging database directly
(only its disposable copy). Never include real learner data — staging holds
only disposable, non-production identities. The founder owns
`VOC-032-D02`/`D03`/`D04`/`D10` and the eventual staging-acceptance decision
itself; this package's evidence informs but does not substitute for that
decision.

## Rollback

Trigger on: a deploy that leaves `/healthz` unhealthy past the workflow's
timeout; a migration apply failure against the real staging database; an
nginx misconfiguration that exposes an internal service or misroutes traffic
between `staging.vocanova.site` and `api-staging.vocanova.site`; any
credential or secret value appearing in a committed file; or a rollback
rehearsal (`T09`) result that shows a down-file no longer matches its
forward migration. Application rollback: redeploy the previous known-good
image tag via `T07`'s workflow (or manually, over the same SSH access, if the
workflow itself is what is broken). Database rollback is never automatic per
`VOC-032-D08` — prefer a corrective forward migration; restore from a backup
only when data integrity is genuinely at risk, and never operate on the live
database when a disposable copy will do (as `T09`'s rehearsal procedure
itself demonstrates). The last-known-good revision is recorded at the future
release decision, not guessed here.

## Independent verification, human approvals, and closure

Claude Code must report the final SHA, evidence, limitations, findings, the
active A-003 authority, and the remaining R3/R4/adoption/activation gates —
including, explicitly, that `VOC-032-D02`/`D04`/`D10` were resolved at
adoption exactly as `change.yaml`'s `dependencies` record (D02: amend DOC-11
via T13; D04: fold F3 confirmed; D10: fold real email/OAuth via T14/T15,
not overridden or silently re-interpreted), whether any credential appears
committed anywhere in the diff, and whether `T09`/`T10`/`T14`/`T15`'s claims
are honestly scoped to what was actually live-executed. Routine R3 needs
strengthened controls and independent verification; the founder-provisioned
credentials (`VOC-032-DEP-00`/`DEP-01`/`DEP-03`/`DEP-07`) must exist before
`T05`/`T07`/`T09`/`T10`/`T14`/`T15` can be verified live rather than only
inspected. Closure requires all sixteen tasks' evidence,
`staging-evidence.md`'s `T09`/`T10`/`T14`/`T15` results, the `infra/README.md`
update, and the DOC-12 R1 gate evidence; neither a package
merge nor a staging deploy alone closes the milestone — R1's own gate
additionally requires the founder to complete staging acceptance and scope to
be frozen afterward, which this package's evidence supports but cannot itself
grant. This package's completion is also what finally unblocks live staging
evidence for every P1–P5 package's own still-open `staging-evidence.md`
documents (`VOC-032-DEP-05`) — closing VOC-032 does not by itself declare
those milestones' gates passed; each would still need its own staging
exercise run against the now-real environment and recorded in its own
evidence document.
