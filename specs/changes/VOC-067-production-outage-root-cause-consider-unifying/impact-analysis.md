# VOC-067 — Impact Analysis

## Security and privacy

Shared nginx increases **process-level** coupling between tiers at the TLS
terminator: a crash or bad reload can affect both public hostnames. That is
the deliberate tradeoff for removing Cloudflare's non-standard origin-port
remap (the control that caused the 2026-08-11 outage).

Isolation that **must not** regress:

- Staging and production secrets trees remain separate; neither deploy user
  may read or write the other tier's secrets (`VOC-037-D01`,
  `rehearse-production-secrets-boundary.sh`).
- Vhost fragments and certs remain in per-tier directories with per-tier
  ownership.
- Upstream API/web/postgres containers remain on separate compose projects
  and networks except for the shared edge's dual-network attachment.
- No new secret values are committed to git. Cert/key material stays
  founder-provisioned on the host.

Reload authorization is sensitive: any mechanism that lets a deploy signal
`nginx -s reload` must not become a backdoor into the other tier's filesystem.
Prefer docker-exec reload against a known container name with no cross-tree
writes.

## Data and migrations

None. No database schema, seed, or user-data migration. Rollback does not
require data restore.

## Analytics and accessibility

None applicable — no product analytics or UI surface changes. Evidence-backed
non-applicability: this package changes edge routing and deploy workflows only.

## Risks, dependencies, and evidence

- `VOC-067-R00`: Shared-edge reload/cutover outage taking **both** tiers
  offline on the shared host. Mitigations: `nginx -t` before reload; no
  recreate on ordinary deploys; staged Cloudflare cutover with remap restore
  as rollback; monitoring already distinguishing environments where possible
  (VOC-037-T04).
- `VOC-067-R01`: Accidental cross-tier write access introduced while "just
  reloading" shared nginx. Mitigations: AC-03 tests; keep deploy bundle path
  rejection rules; re-run secrets-boundary rehearsal.
- `VOC-067-R02`: Leaving `:8443` qualifications in place after moving to
  `:443` (broken OAuth/CORS) or removing them too early (broken OAuth while
  still on `:8443`). Mitigations: T00 cutover order; T04 gated on origin
  `:443` being live; T05 verification of Google sign-in / CORS paths as
  applicable.
- `VOC-067-R03`: Dual `default_server` / overlapping `server_name` when both
  conf trees load into one process. Mitigations: T02 must resolve to a single
  catch-all; `nginx -t` in CI or deploy before reload.
- `VOC-067-R04`: Choosing dual-nginx + Cloudflare harden instead of shared
  nginx leaves the exact outage class available if the remap breaks again.
  Mitigations: if that path is chosen, T00 must require monitoring/alerting
  and a documented recovery owner (`VOC-067-AC-07`).
- `VOC-067-DEP-00`–`DEP-03`: See `change.yaml` / `specification.md` (unresolved
  at drafting except `DEP-04`, resolved).
- `VOC-067-DEP-04`: Resolved at drafting — HEALTHCHECK vs `return 444`
  default_server interaction confirmed in-repo.
- `VOC-067-EV-00`: T00 decision record with human acceptance of DEP-00–03.
- `VOC-067-EV-01`: Before/after HEALTHCHECK evidence for both nginx services.
- `VOC-067-EV-02`: Shared-edge compose/config diff + `nginx -t` + Host-routing
  proof on origin `:443`.
- `VOC-067-EV-03`: Deploy workflow diffs + proof each tier cannot write the
  other's nginx/secrets tree + failed-`nginx -t` leaves peer tier up.
- `VOC-067-EV-04`: Diff removing `:8443` workarounds + post-deploy URL checks.
- `VOC-067-EV-05`: Cloudflare remap removal evidence + external `:443` checks
  for both tiers + rollback notes.
