# VOC-032 — Impact Analysis

## Security and privacy

`VOC-032-R00`: this is the first package in this repository's history to
introduce named GitHub Actions secrets beyond the built-in `GITHUB_TOKEN`
(`STAGING_SSH_HOST`/`_USER`/`_PRIVATE_KEY`/`_KNOWN_HOSTS`, and later an
AI-provider credential for `T10`). A leaked or over-scoped SSH key would give
an attacker shell access to the real staging server. Mitigate by using a
dedicated, deploy-only SSH key (not a founder personal key), a restricted
deploy user on the server (not root, limited to the `docker compose`
directory and image pull/restart), and `known_hosts` pinning (not
`StrictHostKeyChecking=no`) so the workflow cannot be silently redirected to
an attacker-controlled host. This key's generation and the server-side
`authorized_keys` entry are founder actions this package cannot perform
(`VOC-032-DEP-00`).

`VOC-032-R01`: the nginx configuration (`T05`) is the first reverse proxy
this repository has ever needed, and a misconfigured `set_real_ip_from` would
let a request that bypasses Cloudflare spoof its source IP via
`CF-Connecting-IP`, defeating `apps/api/business/auth`'s existing
IP-based rate limiting. Mitigate by scoping `set_real_ip_from` to
Cloudflare's published ranges only, and by confirming (in `T05`'s own PR
evidence) that a direct, non-Cloudflare-routed request to the origin server's
IP cannot spoof its way past the real-IP restoration.

`VOC-032-R02`: `T00`'s real server wiring is the first time
`apps/api/business/auth`'s token/session/rate-limit primitives are exercised
against a real, internet-reachable deployment rather than only unit/
integration tests. Mitigate by not modifying any of `auth`'s existing
primitives in `T00` — only constructing and calling them, exactly as
`NewContractAPI()` already demonstrates for OpenAPI generation — and by
running `T09`'s live rehearsal with disposable, clearly-marked non-production
identities only.

`VOC-032-R03`: `T04`'s `docker-compose.yml` and `T05`'s nginx config are
composed on a single, real, internet-reachable host — a misconfigured port
publish (e.g. exposing `postgres`'s `5432` to the host network beyond the
internal Docker network) would expose the database directly to the internet.
Mitigate by explicitly testing (`VOC-032-TEST-11`) that only `nginx`
publishes a host port, and by never publishing `postgres`'s port beyond the
compose-internal network.

`VOC-032-R04`: `VOC-032-D10` records that no real email sender or real
Google OAuth provider exists in this repository. This is itself a security-
relevant gap, not only a product-completeness one: `docs/development.md` and
this package's own specification note that magic-link emails are currently
faked (never delivered), meaning a real staging deployment cannot yet prove
that a magic-link token reaches only the intended recipient's inbox — a
property the design assumes but that no test in this repository actually
exercises against a real mail transport. This draft does not close the gap
(see specification.md `VOC-032-D10`); it is recorded here so the security
consequence of leaving it open through staging acceptance is not missed.

## Data and migrations

`VOC-032-R05`: no new schema is introduced by this package, but `T09`'s
rollback rehearsal is the first time any `.down.sql.example` file in this
repository is actually executed, even against a disposable copy. A down-file
authored months ago (some date back to VOC-025) could have silently drifted
from its paired forward migration's current state. Mitigate by running the
full forward-then-reverse-then-forward-again sequence `T09` describes and
recording the exact outcome, not assuming a down-file that has never been
run still matches its forward migration.

`VOC-032-R06`: `T06`'s Atlas tooling is new to this repository; a
misconfigured `atlas.hcl` `dev` database URL could cause Atlas's own linting
to silently pass or fail incorrectly. Mitigate by testing the apply command
against a real disposable Postgres instance (`VOC-032-TEST-14`), not only a
dry-run/lint pass.

`VOC-032-R07`: `T00`'s production-wiring assembles every business module's
real repository/service for the first time in one running process; a
misconstructed dependency graph (e.g. wiring `gamification`'s repository
with a `nil` `*sql.DB` the way `cmd/openapi/main.go` deliberately does for
generation-only purposes) would panic or silently no-op at runtime instead
of at generation time. Mitigate by testing `T00`'s production wiring against
a real, seeded disposable Postgres instance end-to-end
(`VOC-032-TEST-01`), not merely confirming it compiles.

## Analytics and accessibility

Analytics: not applicable — this package changes no learner-facing behavior
and adds no new event. Accessibility: not applicable — no frontend UI
changes; `T03`'s `next.config.ts` addition affects only the production build
output shape (`output: 'standalone'`), not rendered markup, styling, or
interaction.

## Risks, dependencies, and evidence

- `VOC-032-R08`: `VOC-032-D02`'s unresolved DOC-11 contradiction means this
  package's staging shape could later need significant rework if the founder
  decides DOC-11's original Render/Cloudflare-Workers target should instead
  govern staging too. Mitigate by not treating this package's shape as
  permanent architecture — `T11`'s `infra/README.md` update records the
  contradiction explicitly rather than presenting this as a settled decision.
- `VOC-032-R09`: `VOC-032-D04`'s F3/R1 scope-folding is this draft's own
  choice, not a verbatim founder instruction; if the founder disagrees at
  adoption, some or all of `T00`–`T09` may need to be re-scoped as a
  separate F3 package with R1 following it, rather than folded together.
  Mitigate by surfacing this explicitly (done) rather than assuming
  agreement.
- `VOC-032-R10`: `VOC-032-D10`'s email/OAuth gap means R1's "founder completes
  staging acceptance" gate item may not be satisfiable in the way the founder
  actually intends (a genuinely production-like validation) until that gap
  closes, regardless of how complete `T00`–`T12` are. Mitigate by naming this
  explicitly in `T12`'s gate-readiness summary rather than letting a complete
  task checklist imply a complete gate.
- `VOC-032-DEP-00`..`DEP-06`: dependencies recorded in `change.yaml`.
- `VOC-032-EV-00`..`EV-25`: server-wiring, container, compose, nginx,
  migration-tooling, CI/CD, AI-evaluation, live-rehearsal, documentation, and
  exact-SHA review evidence referenced by the acceptance criteria.
