---
id: ADR-0003
title: Cloudflare-native runtime, data, and delivery architecture
status: accepted
date: 2026-08-22
decision_owner: m-e-h-r-d-a-a-d
risk: R4
supersedes: VOC-032 active self-hosted runtime direction
related_changes: [VOC-080, PR-86]
---

# ADR-0003 — Cloudflare-native runtime, data, and delivery architecture

## Context

VocaNova currently has a Next.js 16 web application and a Go modular-monolith API
whose Ent repositories, migrations, and runtime SQL target PostgreSQL. Dockerfiles,
Compose, Nginx, and host-oriented operations were built for an owned server. VOC-078
removed repository deployment and server-monitoring workflows, so those assets are
source history and a local reference, not a current delivery mechanism.

The product owner does not want to buy or operate a server. The repository therefore
needs one managed-edge target that can host the web application, API, and relational
data while preserving the existing `/api/v1` behavior and learner-data protections.
Cloudflare's documented Next.js adapter supports App Router, Server Components, SSR,
middleware, and static assets on Workers. D1 is managed SQLite, not PostgreSQL, so the
current Go/Ent/libpq runtime and database schema cannot move mechanically.

## Implementation outcome (VOC-080-T11)

The T03-T10 exact-revision parity chain completed the web, API, domain, data-conversion,
and held-delivery evidence required by this decision. T11 therefore removed the former
Go/PostgreSQL/Docker/Nginx runtime from the active repository tree. Compact frozen API
contract and PostgreSQL-schema fixtures remain only as deterministic migration oracles.
This repository outcome did not inspect, mutate, or stop a live server and did not
provision or activate Cloudflare, DNS, secrets, or production data.

## Decision

VocaNova will migrate incrementally to this target:

```text
Browser
  -> Cloudflare Web Worker (Next.js 16 through @opennextjs/cloudflare)
      -> Cloudflare service binding
          -> Cloudflare API Worker (TypeScript module Worker + Hono)
              -> Cloudflare D1
              -> explicitly configured provider bindings/HTTP APIs
```

- `apps/web` keeps Next.js and its public behavior, but OpenNext/workerd replaces the
  standalone Docker runtime.
- A TypeScript Worker API preserves the committed `/api/v1` OpenAPI and observable
  domain behavior. Hono provides Web-standard routing; schema-driven validation and
  generated Cloudflare binding types keep the boundary explicit.
- D1 schemas are designed for SQLite semantics. UUIDs, timestamps, booleans, JSON,
  uniqueness, foreign keys, indexes, idempotency, ordering, numeric precision,
  atomic batches, and session consistency are specified and tested rather than
  translated blindly from PostgreSQL.
- Web-to-API traffic uses a service binding where practical. Secrets use Cloudflare
  secret bindings or Secrets Store; no credential is committed or exposed to pull
  requests.
- Local development and CI use workerd and local D1. Preview, staging, and production
  use distinct Worker names, D1 databases, bindings, routes, secrets, and evidence.
- Workers Static Assets is the default asset path. Queues, Workflows, Durable Objects,
  R2, Images, Workers AI, or another paid capability is added only for a measured,
  separately reviewed requirement.
- Structured logs, metrics, and traces exclude learner text, tokens, cookies, magic
  links, OAuth material, AI prompt/response content, and unnecessary personal data.
- Production readiness includes measured Worker size, startup, CPU, request volume,
  D1 reads/writes/storage/query counts, and an accepted cost envelope. "No owned
  server" does not mean guaranteed zero cost.

The Go/PostgreSQL application remains a behavioral reference until contract, domain,
authorization, data-integrity, migration, and workerd evidence is complete. New
product behavior is not introduced during the port. Server assets retire only in a
dedicated final task after parity; removing them from Git does not claim to inspect or
stop a live server.

Repository implementation, Cloudflare provisioning, staging activation, production
activation, DNS routing, spending, and production-data migration are separate events.
VOC-080 authorizes repository work only. Its named action-specific holds continue to
govern live staging resources, production traffic/migrations, and production learner
data.

## Consequences

- The web can move with a supported adapter, but `next build` alone is insufficient;
  OpenNext build, a complete generated-artifact manifest and runtime-reachable
  compatibility graph, Wrangler dry run, size/startup evidence, and representative
  fail-closed workerd requests are required.
- The API becomes a controlled TypeScript port rather than an unsupported Go/Wasm
  packaging exercise. Domain parity fixtures protect behavior during coexistence.
- PostgreSQL-to-D1 migration is a deterministic conversion and reconciliation
  program using synthetic data until production-data authority exists.
- Delivery eventually uses immutable Worker versions, ordered compatible D1
  migrations, staging smoke/parity evidence, explicit promotion, and recorded
  rollback. No deployment is enabled by this ADR alone.
- Existing Docker/PostgreSQL material remained transitional until the parity gate;
  T11 removed the executable material while Git history and historical packages retain
  the evidence.

## Alternatives considered

- **Keep the owned Docker/Nginx/PostgreSQL server:** rejected because it preserves the
  cost and operations model the owner explicitly ended.
- **Managed VM/container plus PostgreSQL:** rejected as the primary target because it
  remains server-shaped even if another vendor operates the host.
- **Cloudflare Containers:** rejected as the migration foundation because it carries
  the current server runtime forward instead of adopting Worker/D1 boundaries.
- **Go compiled to Wasm:** rejected because it does not make the existing `net/http`,
  Ent, `lib/pq`, PostgreSQL SQL, or JavaScript D1 binding compatible; Workers WASI is
  not the stable product foundation selected here.
- **Hyperdrive to external PostgreSQL:** rejected as the final architecture because it
  retains a separately operated relational server. It is not required for the staged
  D1 migration.
- **Rewrite the web away from Next.js:** rejected because OpenNext supports the current
  framework capabilities and a framework rewrite adds product risk without solving
  the data migration.

## Security, privacy, data, and operational impact

Authentication, sessions, cross-user isolation, CSRF/CORS, magic links, OAuth state,
learner-data migration, and AI telemetry are protected R4 surfaces. Prepared D1
statements, negative authorization fixtures, atomicity/consistency tests, log
redaction, secret isolation, bounded retries/cost, and exact-revision specialist
review fail closed. Destructive restore or production-data access always requires
separate authority and reconciliation.

## Migration and rollback

VOC-080 T03–T11 implements bounded slices: adapt web, build the API/D1 foundation,
port domains, rehearse synthetic conversion, add held deployment controls, then
retire the old runtime. Each slice is independently revertible. Code rollback
promotes a recorded prior Worker version; schemas use expand/migrate/contract and
forward correction by default. D1 Time Travel restore is a distinct destructive
production action, not an automatic code rollback.

## Affected documents and system areas

DOC-04 through DOC-12, DOC-15, DOC-16, contributor guidance, repository-settings
guidance, `apps/web`, the API workspaces, API client, D1 migrations, CI/CD, security,
quality, governance, and the later retirement of `infra/` and server assets.

## Verification and adoption

The adopted [VOC-080 package](../../specs/changes/VOC-080-cloudflare-native-ruflo/README.md)
defines AC-00 through AC-11, specialist evidence, action holds, staged tasks, and
rollback. Its exact candidate `6fb00a0b64e6f2d4adceb24a9caeffd9af98c779`
received independent PASS review with no blocking findings on PR #86; PR #86 merged
into `develop` as `399ccefa879545b43574c02fdc3babff223a1db0`.

Primary platform references:

- [Cloudflare Next.js on Workers](https://developers.cloudflare.com/workers/framework-guides/web-apps/nextjs/)
- [OpenNext Cloudflare adapter](https://opennext.js.org/cloudflare)
- [Cloudflare D1](https://developers.cloudflare.com/d1/)
- [D1 import limitations](https://developers.cloudflare.com/d1/best-practices/import-export-data/)
- [Workers best practices](https://developers.cloudflare.com/workers/best-practices/workers-best-practices/)
