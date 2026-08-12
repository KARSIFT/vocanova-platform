# VOC-066 — Test Plan

## VOC-066-TEST-00 — Both compose files use the adopted health probe shape

- Covers: `VOC-066-AC-00`
- Preconditions: `VOC-066-T00` applied; `VOC-066-DEP-01` recorded.
- Procedure:
  1. Read nginx `healthcheck.test` in `infra/docker-compose.yml` and
     `infra/docker-compose.production.yml`.
  2. Confirm both match the adopted approach (Approach A: probe path is the
     dedicated health URL on 127.0.0.1; Approach B: includes the required Host
     header / TLS flags per adoption).
  3. Confirm neither retains the pre-fix bare
     `wget ... http://127.0.0.1/ || exit 1` string as the sole probe.
- Expected result: both files share the same approach; bare catch-all-failing
  probe is gone.
- Evidence: `VOC-066-EV-00`

## VOC-066-TEST-01 — Probe succeeds against a running nginx with the new config

- Covers: `VOC-066-AC-00`
- Preconditions: `VOC-066-T00` applied; local or staging nginx running the new
  conf/HEALTHCHECK.
- Procedure:
  1. Run the HEALTHCHECK command (or equivalent `docker exec ... wget ...`)
     inside the nginx container.
  2. Confirm exit code 0 and a successful response body/status for the health
     probe.
  3. Optionally force nginx down / misconfigure briefly in a disposable
     environment and confirm the probe fails (negative control) — recommended
     but not blocking if unsafe on a shared host; record if skipped.
- Expected result: probe passes when nginx is healthy under the new config.
- Evidence: `VOC-066-EV-00`

## VOC-066-TEST-02 — Catch-all still returns 444 for non-health unrecognized-Host traffic

- Covers: `VOC-066-AC-01`
- Preconditions: `VOC-066-T00` applied.
- Procedure:
  1. From inside the nginx container (or via published port with a wrong Host),
     request `GET /` with absent or nonsense Host on :80 (and :443 if practical).
  2. Confirm connection close / `444` behavior (wget "error getting response" is
     acceptable evidence of 444).
  3. If Approach A: confirm `/healthz` (or chosen path) returns 200 on the
     default server, and that a non-exact path such as `/healthz/` or `/` does
     not accidentally become a general open surface beyond what adoption
     allowed.
- Expected result: non-health unrecognized-Host traffic still rejected; health
  exception (if any) is narrow.
- Evidence: `VOC-066-EV-00`

## VOC-066-TEST-03 — Regression check fails pre-fix, passes post-fix, runs in CI

- Covers: `VOC-066-AC-02`
- Preconditions: `VOC-066-T01` implemented.
- Procedure:
  1. Run the new check against a temporary copy with the pre-fix bare probe
     restored; confirm failure.
  2. Run against the post-fix files; confirm pass.
  3. Confirm the check is invoked by normal CI or a documented validation
     command.
- Expected result: fail-pre / pass-post / CI-wired.
- Evidence: `VOC-066-EV-01`

## VOC-066-TEST-04 — Live staging (and production when live) healthy + traffic parity

- Covers: `VOC-066-AC-03`
- Preconditions: `VOC-066-T00` merged; nginx recreated on the target tier
  (`VOC-066-DEP-02`).
- Procedure:
  1. `docker ps` / `docker inspect` → Health status `healthy` for
     `vocanova-nginx` on staging; repeat for `vocanova-production-nginx` once
     production has the revision.
  2. Curl the real web hostname for that tier → 200.
  3. Unrecognized-Host `GET /` → 444/connection close.
- Expected result: health truthful; real traffic and catch-all policy unchanged.
- Evidence: `VOC-066-EV-02`

No migration, accessibility, or personal-data tests apply. Authorization coverage
for this package is the catch-all non-weakening check (`VOC-066-TEST-02`), not an
application authz matrix.
