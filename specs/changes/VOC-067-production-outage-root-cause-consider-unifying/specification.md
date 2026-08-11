# VOC-067 — Unify Staging/Production nginx Into One Shared-but-Isolated Edge: Specification

## Objective and requirement source

Eliminate the production outage class reported in
[GitHub issue #485](https://github.com/KARSIFT/vocanova-platform-sandbox/issues/485):
Cloudflare-edge `502` for `production.vocanova.site` /
`api-production.vocanova.site` caused by a broken Cloudflare `:443 → origin
:8443` remap, while the origin stack on `:8443` remained healthy.

Preferred direction (issue text; design decision at adoption, not an
implementation mandate): replace the two independent nginx containers and the
Cloudflare port-remap workaround with **one shared nginx** listening on host
`80`/`443`, routing by `server_name` / SNI to each tier's upstream containers
on their existing Docker networks, while preserving the isolation
`VOC-037-D00`/`D01` deliberately established for config, certs, secrets,
directory trees, compose projects, and deploy-user write scopes.

Also fix the permanently broken nginx Docker `HEALTHCHECK` in both compose
files, regardless of which edge design is adopted.

## Confirmed findings (re-checked during drafting)

- `infra/docker-compose.production.yml` nginx publishes `"8081:80"` /
  `"8443:443"`; staging `infra/docker-compose.yml` nginx publishes `"80:80"` /
  `"443:443"` — two containers cannot share those host ports.
- `infra/README.md` ("Port mapping and Cloudflare origin routing") already
  documents that production hostnames require a Cloudflare origin-port
  override to `:8443`, and that without it production health checks fail even
  when the stack is healthy — matching the live outage shape.
- Production web currently hardcodes
  `API_BASE_URL: https://api-production.vocanova.site:8443`
  (`infra/docker-compose.production.yml`); `deploy-production.yml` was taught
  to emit `:8443`-qualified `BASE_URL` / OAuth redirect values by VOC-041 /
  VOC-042. Those workarounds become incorrect once production terminates TLS
  on ordinary `:443`.
- Both nginx HEALTHCHECKs use
  `wget --quiet --tries=1 -O /dev/null http://127.0.0.1/ || exit 1`.
  Staging `infra/nginx/conf.d/05-default.conf` (and production's twin) declare
  `listen 80 default_server` / `listen 443 ssl default_server` with
  `return 444` for unmatched Host — so a Host-less probe permanently fails
  (`VOC-067-DEP-04`).
- `VOC-037-D00` accepted Option A-modified: same physical host, logical
  isolation including separate ports and separate compose projects;
  `VOC-037-D01` load-bearing isolation is separate directory tree, deploy
  user, and compose project. Sharing an nginx *process* revises the
  separate-ports / separate-nginx clause and needs explicit human acceptance
  (`VOC-067-DEP-02`).

## Scope and non-goals

In scope:

1. **Decision record (T00):** choose shared nginx vs dual-nginx + Cloudflare
   harden; record lifecycle ownership, isolation supersession vs
   `VOC-037-D00`/`D01`, mount layout, reload policy, and Cloudflare cutover
   order.
2. **HEALTHCHECK fix (T01):** make both nginx HEALTHCHECKs report healthy when
   the process is accepting connections, without weakening the unmatched-Host
   reject behavior for real traffic.
3. **Shared-edge repository shape (T02, only if DEP-00 = shared):** compose /
   nginx layout so one process binds `80`/`443`, joins both
   `vocanova-net` and `vocanova-production-net`, and loads each tier's vhost
   fragments and certs from their own trees.
4. **Deploy isolation (T03, only if DEP-00 = shared):** update
   `deploy-staging.yml` / `deploy-production.yml` so each pipeline may change
   only its own vhost fragment and certs, then safely `nginx -t` + reload the
   shared process; neither gains write access to the other tier's nginx
   config or certs; routine deploys do not recreate the shared container.
5. **Port-normalization (T04, only if DEP-00 = shared):** remove production
   `:8443` qualifications that exist solely because of the dual-nginx port
   split (compose `API_BASE_URL`, deploy-time `BASE_URL` / OAuth allow-list /
   redirects, health-check URLs, and docs that assert the remap is required).
6. **Live cutover verification (T05, only if DEP-00 = shared):** remove the
   Cloudflare origin-port override; prove both tiers serve correctly on
   edge `:443 → origin :443`; record rollback evidence.

Non-goals / explicitly excluded:

- Not sharing Postgres, API, or web containers across tiers.
- Not sharing secrets files, env trees, or deploy SSH identities.
- Not granting staging deploy write into `/opt/vocanova/production` or
  production deploy write into `/opt/vocanova/infra` (beyond whatever narrow,
  audited ability is required to signal reload of a shared process — and even
  that must not include writing the other tier's conf/certs).
- Not a general Cloudflare redesign (WAF, CDN caching, DNS zone structure)
  beyond removing the production origin-port remap that caused this outage.
- Not fixing unrelated application bugs found during the outage investigation.
- Not a snapshot-then-recheck-drift promotion task; this package introduces
  new infra/workflow content, then cutover evidence.

## Risk and protected areas

Builder assessment: expected paths include `infra/*` and
`.github/workflows/deploy-*.yml`, which the path classifier floors at **R3**
(production infrastructure; deployment/rollback). This package **proposes
R4** for the change as a whole because adopting shared nginx revises an
accepted R4 production-hosting decision (`VOC-037-D00`) and couples both
tiers' public edge into one process fault domain during reload/cutover.

This is a **draft proposal for the reviewing human at adoption time, not a
determination**. The actual floor must be confirmed by running
`scripts/governance/classify-change-risk.sh` against each task's real file
list. Under active A-003, routine R3 no longer requires standing
technical-steward approval merely for being R3; R4 founder authority remains
required if the shared-nginx (or any other R4) path is chosen. EHR is not
triggered by this drafting pass.

Protected areas: production infrastructure (`infra/`), deployment workflows
(`.github/workflows/`), secrets-boundary behavior (must not regress
`VOC-037-D01` / `rehearse-production-secrets-boundary.sh`), and Cloudflare
origin routing (ops, T05).

## Decisions, contradictions, security, and privacy

No `VOC-067-D##` decision is formally numbered as accepted here — this
package is not yet adopted. Proposed decision content for T00 (defaults the
reviewing human may accept, amend, or reject):

### Proposed design defaults (shared-nginx path)

If `VOC-067-DEP-00` resolves to shared nginx:

1. **Process:** one `nginx:1.27-alpine` (or current pinned) container binds
   host `80`/`443`, attached to both `vocanova-net` and
   `vocanova-production-net`.
2. **Config isolation:** staging vhost fragments remain under
   `/opt/vocanova/infra/nginx/` (repo: `infra/nginx/`); production under
   `/opt/vocanova/production/nginx/` (repo: `infra/nginx-production/`). The
   shared main config `include`s both trees at distinct in-container paths
   (e.g. `/etc/nginx/conf.d/staging/*.conf` and
   `/etc/nginx/conf.d/production/*.conf`). Only one `default_server` catch-all
   may exist across the combined set.
3. **Cert isolation:** each tier's `ssl_certificate` / key paths mount from
   that tier's secrets tree only (`infra/secrets/nginx/` vs
   `production/secrets/nginx/`). No cross-tier cert mount.
4. **Lifecycle (`VOC-067-DEP-01` default):** introduce a dedicated shared-edge
   compose file (exact name chosen in T00/T02, e.g.
   `infra/docker-compose.shared-edge.yml`) whose *recreate* is rare and
   documented — not part of ordinary app deploys. Ordinary
   `deploy-staging.yml` / `deploy-production.yml` runs: (a) write only that
   tier's conf/certs, (b) `nginx -t`, (c) `nginx -s reload` on success. Failed
   `nginx -t` fails that deploy and leaves the previous generation running
   (both tiers keep serving). Neither pipeline may `compose down` / recreate
   the shared edge as part of a normal deploy.
5. **Cloudflare (`VOC-067-DEP-03`):** after shared edge is live and verified
   on origin `:443`, remove the production hostname origin-port override so
   edge `:443` maps to origin `:443`. Staging already uses that shape.

### Contradiction with VOC-037 (explicit, not silently resolved)

`VOC-037-D00`/`D01` require separate ports and separate compose isolation for
the production stack. A shared nginx process on `80`/`443` deliberately
shares the public listen ports and (unless the shared-edge compose is kept
as a third project) changes how "separate compose project" applies to the
edge. Adoption of the shared-nginx path **is** the authority gate for that
supersession (`VOC-067-DEP-02`). Secrets, DB, upstream services, directory
trees, and deploy-user write scopes stay isolated.

### Open questions for the reviewing human

1. **`VOC-067-DEP-00` — Shared nginx vs dual-nginx + Cloudflare harden.**
   Prefer shared nginx (removes the remap class that caused the outage) or
   keep dual nginx and treat Cloudflare remap as a hardened, monitored
   control?
2. **`VOC-067-DEP-01` — Lifecycle defaults above.** Accept, amend (e.g. staging
   owns the container inside `docker-compose.yml` instead of a third compose
   file), or reject?
3. **`VOC-067-DEP-02` — Founder acceptance of the VOC-037-D00/D01 edge
   supersession.** Required if DEP-00 = shared.
4. **`VOC-067-DEP-03` — Who executes the Cloudflare change, and in what
   order relative to T02–T04 landing?** Proposed default: repository shared
   edge live and health-checked on origin `:443` first; then remove remap;
   then T04 port-normalization deploy; with an explicit rollback that
   restores the remap if edge checks fail.
5. **HEALTHCHECK probe shape (T01).** Proposed default: probe a dedicated
   internal path or `nginx -t` + a Host-qualified request to a known local
   server_name, without opening unmatched-Host traffic to the world. Exact
   probe left to the implementer within "must become healthy when nginx is
   serving; must not weaken `return 444` for unknown Host."

No new application personal-data handling is introduced. TLS private keys
remain founder-provisioned secrets on the host; this package must not commit
cert/key material.

## Data, migrations, analytics, and accessibility

- **Data / migrations:** None. No schema or seed change.
- **Analytics:** None.
- **Accessibility:** None. No UI change.
