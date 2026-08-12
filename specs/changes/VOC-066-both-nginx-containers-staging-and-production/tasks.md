# VOC-066 — Tasks

None of the tasks below is implementation-authorized by this package. Adoption and
each task's own implementation authorization are separate. `VOC-066-T00` must wait
for `VOC-066-DEP-01` (approach choice) to be recorded at adoption. `T01` may follow
or land with `T00` if the regression check is written against the same revision.
`T02` depends on `T00` having landed and containers having been recreated.

## VOC-066-T00 — Fix nginx HEALTHCHECK for staging and production together

- Requirement source: issue #484; `VOC-066-D00`; `VOC-066-DEP-01`
- Acceptance criteria: `VOC-066-AC-00`, `VOC-066-AC-01`
- Tests: `VOC-066-TEST-00`, `VOC-066-TEST-01`, `VOC-066-TEST-02`
- Evidence: `VOC-066-EV-00`
- Status: pending — blocked on package adoption and `VOC-066-DEP-01`

Implement the approach recorded at adoption (`VOC-066-DEP-01`) against **both**
tiers in one PR:

- Always update `infra/docker-compose.yml` and
  `infra/docker-compose.production.yml` nginx `healthcheck.test` (and comments
  if stale).
- If Approach A: also update `infra/nginx/conf.d/05-default.conf` and
  `infra/nginx-production/conf.d/05-default.conf` with an exact-match health
  location returning 200, preserving `444` for all other unrecognized-Host
  paths.
- If Approach B: do not weaken catch-all conf; encode Host (and TLS/redirect)
  constraints from adoption in both compose HEALTHCHECKs.

Do not unify containers, touch real vhost proxy blocks, workflows, apps, or
secrets. Record which approach was implemented and why in the PR description and
`VOC-066-EV-00`.

## VOC-066-T01 — Deterministic regression check for the broken bare probe

- Requirement source: issue #484 impact section; `VOC-066-AC-02`
- Acceptance criteria: `VOC-066-AC-02`
- Tests: `VOC-066-TEST-03`
- Evidence: `VOC-066-EV-01`
- Status: pending — may ship in the same PR as `VOC-066-T00` or immediately after

Add a deterministic check that fails if either compose file's nginx HEALTHCHECK
regresses to a bare `http://127.0.0.1/` probe incompatible with the 444
catch-all, and passes on the post-fix content. Wire it into normal CI or a
documented narrower script (`pnpm`/`bash`) consistent with existing infra
selftests. Demonstrate fail-pre / pass-post in evidence (temporary revert in a
throwaway local check is acceptable).

## VOC-066-T02 — Live verify healthy status and preserved catch-all / real traffic

- Requirement source: issue #484 live evidence; `VOC-066-AC-03`; `VOC-066-DEP-02`
- Acceptance criteria: `VOC-066-AC-03`
- Tests: `VOC-066-TEST-04`
- Evidence: `VOC-066-EV-02`
- Status: pending — depends on `VOC-066-T00` merge and container recreate

No further source change expected. After staging (and then production, once the
revision is live there) recreates nginx with the fix:

1. Record `docker inspect <nginx-container> --format '{{json .State.Health}}'`
   showing status `healthy` (or equivalent `docker ps` healthy state) after the
   start_period/retries window.
2. Confirm real-hostname HTTPS still returns 200 for that tier's web vhost.
3. Confirm unrecognized-Host `GET /` still yields `444`/connection close.
4. Note whether recreate was via normal deploy or interim manual action
   (`VOC-066-DEP-02`).

Tasks preserve scope, separation of duties, and rollback safety. No task may be
dispatched before this package is adopted.
