# VOC-066 — Both nginx Containers Report Unhealthy Permanently (Wrong HEALTHCHECK Vhost)

**Status: draft, not adopted.** Nothing in this package is implementation-authorized.
It is a draft response to
[issue #484](https://github.com/KARSIFT/vocanova-platform-sandbox/issues/484),
prepared for founder/steward review at adoption time.

## Identity and lifecycle

- Package ID: VOC-066
- Title: Both nginx Containers (Staging and Production) Report Unhealthy Permanently
  Because Docker HEALTHCHECK Targets the Wrong Vhost
- Canonical path: `specs/changes/VOC-066-both-nginx-containers-staging-and-production`
- Lifecycle state: `draft` (not adopted, not authorized for implementation)
- Proposed risk: `R3` (draft proposal only — see `change.yaml`'s
  `planned_implementation_risk_floor`, not a determination)
- Owner: unassigned (see `change.yaml`'s `owners` block)
- Approval evidence: none yet — `approval_status: not-approved`,
  `implementation_authorized: false`
- Target branch: `develop`
- Linked GitHub issue:
  [#484](https://github.com/KARSIFT/vocanova-platform-sandbox/issues/484)

## Why this exists

Issue #484 reports that on the shared host both nginx containers have been
reporting Docker `unhealthy` for their entire uptime while correctly serving real
traffic:

```
vocanova-nginx                 Up ... (unhealthy)   nginx:1.27-alpine
vocanova-production-nginx      Up ... (unhealthy)   nginx:1.27-alpine
```

`docker inspect` shows every probe failing with `wget: error getting response`.
Nginx access logs show the probes hitting the default catch-all vhost and
receiving `444`. Real traffic with the correct `Host:` header (and
`https://staging.vocanova.site/`) returns 200.

Root cause (confirmed in-repo at drafting time): both
`infra/docker-compose.yml` and `infra/docker-compose.production.yml` define:

```yaml
test: ["CMD-SHELL", "wget --quiet --tries=1 -O /dev/null http://127.0.0.1/ || exit 1"]
```

A bare request with no `Host:` header does not match
`10-staging-web.conf` / `10-production-web.conf` or the API vhosts. It falls
through to `infra/nginx/conf.d/05-default.conf` (and
`infra/nginx-production/conf.d/05-default.conf`), which intentionally `return 444`
for unrecognized Host — correct scanner hardening, but the healthcheck can never
pass by construction.

Impact today: Docker health is permanently useless for both nginx containers; a
real nginx failure is indistinguishable from this expected-false state; and any
future `depends_on: condition: service_healthy` on nginx would never succeed.

## What this package does

1. **Fix the nginx HEALTHCHECK path for both tiers in one change** (`VOC-066-T00`):
   make Docker's health probe succeed when nginx is up and correctly configured,
   without weakening the intentional 444 catch-all for unrecognized Host traffic
   on non-health paths. Apply the same approach to staging and production compose
   (and nginx default conf, if that approach is chosen).
2. **Add a deterministic regression check** (`VOC-066-T01`) so a future edit cannot
   silently restore a bare `http://127.0.0.1/` probe that fails against the
   catch-all.
3. **Verify live** (`VOC-066-T02`) that after recreate, both containers report
   healthy while real hostname traffic and the 444 catch-all policy still behave
   as intended.

## What this package deliberately does NOT do

- Not a unification of the two nginx containers (companion issue referenced by
  #484 — out of scope; see `VOC-066-DEP-03`).
- Not a change to real vhost routing, TLS termination, upstreams, Cloudflare
  settings, or application code.
- Not authorization to deploy or recreate production by itself — see
  `release-plan.md` and open question 2.
- Does not adopt itself. `change.yaml` leaves every adoption/authorization field
  at its unadopted default.

## Open questions for the reviewing human

See `specification.md`. The most important:

1. **`VOC-066-DEP-01` — Fix approach.** Recommended default: dedicated `/healthz`
   (or equivalent) on the default catch-all that returns 200, preserving 444 for
   everything else. Alternative: Host-qualified wget (must account for port-80 →
   301 HTTPS redirect on the real web vhosts).
2. **`VOC-066-DEP-02` — Recreate timing** for currently-running unhealthy
   containers after the repo change lands.

## Verification, approvals, release, and closure

See `test-plan.md`, `release-plan.md`, and `implementation-plan.md`. This package
carries no standing approval; adoption, implementation authorization, independent
verification, and any required human approval remain to be recorded against the
exact implemented revision, per AGENTS.md and CLAUDE.md.
