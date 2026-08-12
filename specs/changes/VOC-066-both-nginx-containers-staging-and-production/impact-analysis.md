# VOC-066 — Impact Analysis

## Security and privacy

Intent: restore a truthful liveness signal without opening a general hole in the
unrecognized-Host `444` catch-all (VOC-032-D03).

- **Approach A:** adds a minimal exact-match health location on the default
  server. Attackers who already hit the IP with a wrong Host can learn "nginx is
  up" on that path only. Must not proxy to application upstreams, must not return
  secrets or personal data, and must leave all other paths on the default server
  as `444`.
- **Approach B:** no catch-all surface change; probe becomes Host-qualified (and
  possibly uses `--no-check-certificate` against 127.0.0.1:443). Certificate-check
  disable is local-loopback-only and must not leak into external client guidance.

No new secrets, credentials, session cookies, or personal-data fields are
introduced. No auth/authorization decision logic changes.

## Data and migrations

None. No schema, seed, or production data change.

## Analytics and accessibility

None. No analytics events and no user-facing UI/accessibility surface.

## Risks, dependencies, and evidence

- `VOC-066-R00`: Choosing Approach B without handling the port-80 → 301 HTTPS
  redirect can leave HEALTHCHECK still failing (wget follows redirect to the
  public hostname and fails DNS/TLS inside the container). Mitigated by
  recommending Approach A and requiring explicit redirect/TLS constraints if B is
  adopted (`VOC-066-DEP-01`).
- `VOC-066-R01`: Editing compose/conf alone does not update already-running
  containers' HEALTHCHECK or mounted conf until recreate. Health stays falsely
  unhealthy until `VOC-066-DEP-02` is resolved and executed.
- `VOC-066-R02`: Over-broad catch-all exception (e.g. `location /` returning 200)
  would weaken scanner hardening. Acceptance criterion `VOC-066-AC-01` and
  `VOC-066-TEST-02` block that.
- `VOC-066-R03`: Companion nginx-unification work (`VOC-066-DEP-03`) could
  later reshuffle conf layout; this package must still leave both current trees
  consistent so neither tier is left with the broken probe.
- `VOC-066-DEP-00`–`DEP-03`: see `change.yaml`.
- `VOC-066-EV-00`, `VOC-066-EV-01`, `VOC-066-EV-02`: produced by T00/T01/T02
  respectively; none exist yet.
