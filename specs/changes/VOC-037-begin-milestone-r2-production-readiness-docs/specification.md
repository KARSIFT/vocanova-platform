# VOC-037 — Begin Milestone R2 (Production Readiness): Specification

## Objective and requirement source

Per `docs/product/12-mvp-implementation-plan.md` (DOC-12) section 5, R2's objective
is "production infrastructure, security/privacy/legal readiness, release
operations, go/no-go," and its gate is: "production resources ready, credentials
protected, launch controls work, legal/privacy prerequisites complete, release PR
passes all checks, Claude returns `approve` or an explicitly accepted follow-up,
founder records go/no-go." DOC-12 section 6 states "R2 depends on successful R1."

R1 closed on 2026-08-01 (`specs/changes/VOC-032-begin-milestone-r1-staging-readiness-docs-product/staging-evidence.md`,
"Current status" section: "R1 is CLOSED (2026-08-01). The founder has explicitly
completed staging acceptance per DOC-12 §5... reviewing and knowingly accepting all
four open gaps... as a deliberate launch decision, not because they don't exist.").
The four gaps — the DOC-09 §23 AI-evaluation-threshold miss (`EV-22`), the T14/T15
live email/Google-OAuth evidence blocked on `VOC-032-DEP-07` credentials, and the
T11/T13 documentation rewrites — remain their own open, tracked follow-ups. Per the
founder's explicit free-text instruction for this package, they are **not** folded
into R2 scope here, except where a specific R2 task naturally depends on one of
them (see "Dependencies" below for the one such case this package identified).

This package's requirement source is the founder's free-text request (recorded
verbatim in this package's drafting run, 2026-08-01) plus DOC-12 §5 itself. No
GitHub issue exists yet.

## Scope and non-goals

**In scope** (each becomes one or more tasks in `tasks.md`):

1. Production hosting/deploy-target decision. The project currently runs staging
   on a single founder-owned server (`docs/operations/11-devops-and-ci-cd.md`
   §1's amended v1.1 baseline: self-hosted Docker Compose + nginx, four services
   —`postgres`+`api`+`web`+`nginx`— on the founder's own 2 vCPU/4 GB server,
   Cloudflare for DNS/TLS/WAF/CDN only). This package's T00 task is to decide and
   record, as a founder decision, whether production reuses this same
   single-server shape (a second, separate production host/instance of the same
   Docker Compose stack) or changes it, and to scope exactly what changes if
   anything. This drafting pass does **not** make that decision — see "Open
   questions" below.
2. Production credential/secrets management, distinct from staging's. DOC-11 §1
   already states "Separate Google OAuth clients, AI-provider keys, and Sentry
   environments per environment tier; no production secrets ever reachable from
   preview/staging/CI (unchanged from v1.0)" as a target, but no package has yet
   implemented *how* production secrets are stored, rotated, or restricted (the
   staging tier's own secret handling — GitHub Actions secrets plus SSH-delivered
   `.env` files on the founder's server, per VOC-032's T01/T07 — is not
   automatically production-appropriate; this package's T01 task decides whether
   it is reused as-is or hardened, e.g. a dedicated secrets manager, tighter
   file permissions, or access logging).
3. Legal/privacy prerequisites. DOC-11 §5's "Launch-ready" checklist explicitly
   requires "privacy policy and terms published." A repository-wide search
   (`grep -ril "privacy\|terms of service\|data.handling\|hosting\|deploy" docs/`,
   run at this package's drafting time against `base_sha`) found no privacy
   policy, terms-of-service, or standalone data-handling-disclosure document
   anywhere under `docs/` — only scattered mentions of the *requirement* to have
   one (`docs/operations/11-devops-and-ci-cd.md` line 149,
   `docs/product/12-mvp-implementation-plan.md` §5). This package's T02 task is to
   draft (not found) both documents and record the founder's review of them as an
   R4 decision (see "Risk and protected areas" below) — an actual privacy policy
   and terms of service are a "new or changed... legal position" and "privacy
   policy" under `docs/governance/change-risk-classification.md`'s R4 row.
4. Launch kill-switches/rollback controls. `docs/operations/11-devops-and-ci-cd.md`
   §3 already names the four required kill switches (`AI_FEATURES_ENABLED`,
   `EMAIL_MAGIC_LINK_ENABLED`, `GOOGLE_OAUTH_ENABLED`, `NEW_USER_SIGNUP_ENABLED`)
   and states the rollback model (roll-forward first, redeploy previous artifact by
   digest, never automatic migration reversal). These switches were implemented
   for staging under VOC-032 (`EV-00`..`EV-04`). This package's T03 task is to
   verify each kill switch and the rollback/redeploy path actually work against
   whatever host T00 decides production runs on — not to re-implement them from
   scratch if T00 decides production reuses the existing mechanism unchanged.
5. Monitoring/alerting readiness. DOC-11 §1 names Sentry (error monitoring) and
   Better Stack/UptimeRobot (uptime monitoring) as the target tools; §5's
   "Production-ready" checklist requires both "active." Neither has yet been
   confirmed configured and alerting to the founder for any environment in this
   repository's existing packages (VOC-032's evidence table does not list a
   Sentry or uptime-monitoring evidence item). This package's T04 task is to
   configure and verify both for production, once T00's host decision is made.
6. The release PR and go/no-go recording itself. This package's T05 task is the
   final R2 gate task: open the actual R2 release PR, ensure all checks pass, and
   record the founder's explicit go/no-go decision, mirroring DOC-12 §5's exact
   gate language and the R1-closure pattern already used on issue #256.

**Explicitly excluded from this package's scope** (per the founder's request):

- The four tracked R1 follow-ups (DOC-09 §23 thresholds, T14/T15 live email/OAuth
  evidence, T11/T13 documentation rewrites) are not new R2 scope. The one
  exception this package identifies: T01 (production secrets) references
  `VOC-032-DEP-07` informationally, because the production secret-storage
  *mechanism* T01 decides will also apply to however those R1-follow-up
  credentials eventually get provisioned for production — but T01 does not
  re-open, duplicate, or resolve that follow-up itself.
- Any actual production deployment, DNS cutover, or vendor procurement. Per
  `docs/operations/11-devops-and-ci-cd.md` line 89's own statement, an
  infrastructure-target table "is an implementation target, not authority to
  procure vendors, incur spend, create infrastructure, deploy, or release" — this
  package proposes tasks that will themselves require separate implementation
  authorization once adopted, exactly like every prior milestone package in this
  repository.
- L1 (Controlled Launch) itself. DOC-12 §6: "L1 depends on recorded production
  authorization" — this package's T05 go/no-go task produces that authorization
  record but does not begin L1's own rollout sequence.

## Risk and protected areas

This package itself (docs only, in its own `specs/changes/VOC-037-.../` directory)
is `R0` under `docs/governance/change-risk-classification.md`'s own classification
test 5 ("demonstrably non-behavioral and non-policy documentation"). The risk
proposal recorded in `change.yaml` (`R3`, with `T00`/`T02` flagged as plausibly
`R4`) applies to the **future tasks this package proposes**, once each is
separately implemented — not to this drafting package's own diff.

- `T00` (hosting/deploy-target decision) and `T03` (kill-switch/rollback
  verification) touch "production infrastructure" and "rollback" directly —
  `change-risk-classification.md`'s R3 row lists both by name.
- `T01` (production secrets) touches "secrets" — also named in the R3 row.
- `T02` (legal/privacy prerequisites) plausibly reaches **R4**: publishing a
  privacy policy and terms of service is "a new or changed... legal position" and
  "privacy policy," both named explicitly in the R4 row, and DOC-12 §5's own gate
  language ("legal/privacy prerequisites complete") ties it to the same founder
  go/no-go decision R4 requires.
- `T05` (release PR and go/no-go) is, by DOC-12 §5's own text, the exact founder
  go/no-go decision R4's "initial public launch, or major launch" language
  anticipates — this package proposes `T05` itself as R4, not merely R3.
- No task in this package is proposed lower than R2; none is a documentation-only,
  non-behavioral change once implemented.

Protected areas potentially affected, none of which this package itself touches:
`apps/api/app/api` (production config/kill switches), `infra/` (deploy
infrastructure), `.github/workflows/deploy-*.yml` (deploy automation), and any new
`docs/legal/` directory this package's `T02` would create.

## Decisions, contradictions, security, and privacy

No `VOC-037-D##` decision is defined by this drafting pass — per this planner
role's own scope limits, decisions require founder approval at adoption, and this
package does not adopt itself. The following are recorded as **open questions**
for the founder to resolve at adoption, per this prompt's own instruction to flag
rather than guess:

- **Open question 1 (hosting):** Should production be a second instance of the
  existing single founder-owned-server Docker Compose shape (matching staging's
  v1.1 baseline exactly, just on a separate host/domain), or should production use
  a different target (e.g. a managed platform, a higher-spec dedicated host, or a
  multi-instance shape for availability)? DOC-11 §1's existing v1.1 baseline is
  explicitly scoped to staging only ("the staging tier that already exists"); it
  does not commit production to the same shape. This package's `T00` proposes
  drafting the decision record and options analysis, not making the choice.
- **Open question 2 (secrets):** Should production secrets reuse the existing
  staging mechanism (GitHub Actions secrets + SSH-delivered `.env` on the host) or
  adopt a dedicated secrets manager (e.g. a vault product, cloud KMS, or
  Docker/systemd secrets with tighter host permissions)? This package's `T01`
  proposes evaluating options; it does not select one.
- **Open question 3 (legal/privacy):** Does the founder intend to draft the
  privacy policy and terms of service directly, or have Codex/planner draft a
  first version for founder review and revision? Either path requires an explicit
  founder review before "complete" per DOC-12 §5. This package's `T02` proposes
  drafting a first version for review, consistent with how this repository's
  other founder-facing documents (e.g. `docs/templates/founder-decision-card.md`)
  are typically prepared, but the founder may prefer to draft it independently.
- **Open question 4 (production data sensitivity):** DOC-12 does not itself state
  whether production will initially handle real (non-test) personal data
  differently from staging beyond the existing "no production secrets/data
  reachable from non-production tiers" rule (DOC-11 §1). `impact-analysis.md`
  flags this for founder confirmation rather than assuming a specific data-
  retention or data-processing-agreement posture the request did not state.

No contradiction between DOC-12 and any other canonical document was found for
this package's scope.

## Data, migrations, analytics, and accessibility

None. This package's own diff is documentation only, in its own directory; no
schema, migration, analytics event, or UI surface is touched. Each future task
this package proposes will need to state its own data/migration/analytics/
accessibility effects in its own implementation, per this repository's existing
Definition of Ready (DOC-12 §7).
