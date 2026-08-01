# VOC-037 — Test Plan

Each test below is proposed for the corresponding future task's own implementation
PR; none is executable against this drafting package's own diff (documentation
only). No test in this plan uses a real secret or real production data.

## VOC-037-TEST-00 — Hosting decision record exists and is founder-approved

- Covers: `VOC-037-AC-00`
- Preconditions: `VOC-037-T00`'s decision-record document exists.
- Procedure: Inspect the document for a stated chosen target, a stated rationale,
  a stated scope of consequent changes, and an explicit founder-approval record
  (e.g. a dated sign-off comment or field).
- Expected result: All four elements present; document does not leave the
  decision itself as `TBD`.
- Evidence: `VOC-037-EV-00`

## VOC-037-TEST-01 — Production secrets are unreachable from lower environments

- Covers: `VOC-037-AC-01`
- Preconditions: `VOC-037-T01`'s chosen mechanism is implemented in at least a
  disposable/staging-equivalent rehearsal of the production shape.
- Procedure: Attempt to read a production secret's value from a preview
  deployment's environment, a staging deployment's environment, and a CI job's
  environment; separately, confirm the production secret is retrievable only
  through the T01-designed mechanism's intended access path.
- Expected result: All three unauthorized-reachability attempts fail (no
  production secret value observed); the intended access path succeeds.
- Evidence: `VOC-037-EV-01`

## VOC-037-TEST-02 — Privacy policy/terms accuracy and founder review

- Covers: `VOC-037-AC-02`
- Preconditions: `VOC-037-T02`'s draft documents exist.
- Procedure: Cross-check every data category the drafted privacy policy claims to
  collect/process against this repository's actual implemented data model (user
  accounts, saved words, review schedule state, sentence submissions, AI feedback
  records, OAuth profile fields, operational logs) for both false claims (data not
  actually collected) and omissions (data collected but not disclosed); confirm an
  explicit founder review record exists before either document is marked
  publishable.
- Expected result: No false claim, no omission, founder review record present.
- Evidence: `VOC-037-EV-02`

## VOC-037-TEST-06 — Production target provisioning and isolation

- Covers: `VOC-037-AC-06`
- Preconditions: `VOC-037-D00` and `VOC-037-D01` accepted; production host access
  available; production GitHub environment and secrets provisioned.
- Procedure:
  - Confirm `.github/workflows/deploy-production.yml` exists and declares
    `environment: production`.
  - Confirm `infra/docker-compose.production.yml` uses project
    `vocanova-production`, references only production secret paths, and defines
    explicit per-service resource limits.
  - Run one production workflow deploy to materialize
    `/opt/vocanova/production/` and verify it remains separate from
    `/opt/vocanova/infra/`.
  - Execute `infra/scripts/rehearse-production-secrets-boundary.sh` on the host
    and verify all checks pass (INS-9 through INS-11).
- Expected result: production deploy automation and runtime tree are isolated from
  staging, and negative-access rehearsal confirms staging cannot read production
  secrets.
- Evidence: `VOC-037-EV-06` plus `VOC-037-EV-01` rehearsal output

## VOC-037-TEST-03 — Kill switches and rollback against the production target

- Covers: `VOC-037-AC-03`
- Preconditions: A production target exists per `T00`'s decision; each of the four
  kill-switch environment variables is configurable on it.
- Procedure: Toggle each of `AI_FEATURES_ENABLED`, `EMAIL_MAGIC_LINK_ENABLED`,
  `GOOGLE_OAUTH_ENABLED`, `NEW_USER_SIGNUP_ENABLED` off in turn and confirm the
  corresponding feature is observably disabled without affecting unrelated
  features; separately, deploy a disposable prior artifact by digest and confirm
  successful rollback with no unintended data loss.
- Expected result: Each switch's toggle produces exactly its documented effect;
  rollback completes and the health check passes afterward.
- Evidence: `VOC-037-EV-03`

## VOC-037-TEST-04 — Monitoring/alerting fires for production

- Covers: `VOC-037-AC-04`
- Preconditions: Sentry and Better Stack/UptimeRobot are configured for the
  production target.
- Procedure: Trigger a deliberate, disposable test error in the production
  environment and confirm it appears in Sentry; trigger a deliberate,
  disposable uptime-check failure and confirm an alert reaches the founder.
- Expected result: Both events observed within a reasonable bounded time.
- Evidence: `VOC-037-EV-04`

## VOC-037-TEST-05 — R2 release PR and go/no-go record

- Covers: `VOC-037-AC-05`
- Preconditions: `T00`–`T04` have merged; the R2 release PR is open.
- Procedure: Inspect the PR's CI check results, the required review's returned
  verdict, and the linked issue/PR comment recording the founder's go/no-go
  decision.
- Expected result: All applicable checks pass (or an explicitly accepted
  follow-up is recorded per check), review returns `approve` or an explicitly
  accepted follow-up, and a founder-authored go/no-go statement exists.
- Evidence: `VOC-037-EV-05`
