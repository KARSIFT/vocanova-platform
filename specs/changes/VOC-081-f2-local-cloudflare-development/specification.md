# VOC-081 Specification

## 1. Problem statement (resolved by the merged repository/local implementation)

DOC-12 defines F2 as a contributor-verifiable application foundation. The pre-implementation
F2 audit found that T12 had
strong subsystem proof but no coherent contributor command:

- root `pnpm dev` launches only `next dev`;
- web fallback URLs use API port 8080 while API Wrangler defaults to 8787;
- no root command applies D1 migrations to explicit persistent local state;
- no command runs the real web and API Workers together with a connected service
  binding and two browser-accessible local URLs;
- port conflict behavior is implicit—Next silently selected 3001 during reproduction;
- Next 16 generates untracked nested `AGENTS.md`/`CLAUDE.md` unless disabled; and
- no bounded test proves startup, readiness, persistence, service binding, and cleanup
  as one contract.

VOC-081-T00 through T04 subsequently implemented and verified this repository/local
contract. The final result is F2 only: it does not claim F3, A1/product acceptance,
Windows-native support, staging, production, deployment, activation, release, or live
verification, and all inherited VOC-080 holds remain held.

## 2. Functional requirements

### VOC-081-R00 — Explicit local state and initialization

The repository shall define one ignored, repository-relative persistence root for
developer state and a separate OS-temporary root for tests. `dev:init` shall invoke the
locked Wrangler CLI against the API config, the `DB` binding, `--local`, the explicit
persistence root, and the committed forward migrations. It shall be safe to repeat and
shall never select staging/production or a remote database.

### VOC-081-R01 — Stable origins and port ownership

The canonical defaults are web `http://127.0.0.1:3000` and API
`http://127.0.0.1:8080`. Browser API, server fallback, CORS, auth base, OAuth callback,
and return allowlist values must agree. Occupied required ports fail with an actionable
message; no process silently changes ports.

### VOC-081-R02 — Fast edit loop

Root `pnpm dev` shall initialize local D1, start the API Worker locally on 8080, and
start Next hot reload on 3000. A provider-neutral Node supervisor shall own readiness,
stdout/stderr, signal forwarding, sibling termination, exit status, and bounded
shutdown. It shall add no long-lived daemon or third-party process-manager dependency.

Next's generated agent rules must be disabled with the locked Next 16.3.0 top-level
`agentRules: false` configuration field. Starting and stopping the loop from a clean
checkout must leave no tracked/untracked agent file at any repository depth and no
unexpected tracked-tree change. The authority policy must reject nested generated
`AGENTS.md`/`CLAUDE.md` markers rather than checking only the repository root.

### VOC-081-R03 — Production-like two-Worker loop

Root `pnpm dev:workers` shall:

1. build the OpenNext Worker with the canonical local public API origin;
2. initialize local D1;
3. start API Wrangler locally on 8080;
4. wait for `/healthz` and `/configz` to prove the migrated local D1/config;
5. start web Wrangler locally on 3000; and
6. prove that the web Worker uses the committed `API` service binding to the matching
   `vocanova-api-local` Wrangler session while the API remains directly reachable for
   browser and callback paths.

Two supervised Wrangler sessions are intentional: Cloudflare documents separate dev
commands for applications where both Workers need local URLs, and current Wrangler
supports service bindings across dev commands. The implementation shall use the
committed `services` block plus matching Worker names; it shall not invent an unverified
CLI service-binding flag. Every session must use only local simulations and explicit
configs/state.

### VOC-081-R04 — Bounded local-stack evidence

`pnpm test:local-stack` shall use disposable state and deterministic ports or
prevalidated allocated ports. It must prove:

- migrations from empty and repeated initialization;
- API health/config and D1 reachability;
- direct API and web static/SSR/middleware requests;
- web-to-API service-binding transport using an observable non-secret marker;
- local D1 persistence across one controlled restart;
- partial-startup failure, occupied-port failure, and child-exit propagation;
- SIGINT/SIGTERM cleanup with no surviving child; and
- clean-tree/no-generated-agent-file behavior.

The smoke may use technical fixtures only. It must not create an auth bypass, send an
email, contact OAuth/AI/Sentry, or claim A1/P1+ acceptance.

### VOC-081-R05 — Fail-closed local-only policy

A foundation policy shall reject remote flags/bindings, remote D1 operations, staging
or production selection, deploy commands, automatic provisioning, credentials, unsafe
shell backgrounding, unbounded waits, missing migration/init steps, mismatched origins,
and the reappearance of generated nested agent instructions.

### VOC-081-R06 — CI and documentation

The existing `ci.yml` may add a named `local stack` **job** and `ci:local-stack`
command—it must not add a workflow file. The `ci required` aggregate must require the
job. The workflow inventory must remain exactly four and ordinary PR execution must
remain credential-free. All root/app scripts,
environment examples, development/operations/product guidance, and F2 evidence must be
reconciled in the same task.

### VOC-081-R07 — F2 acceptance record

The final record shall bind the exact implementation SHA, commands, hosted runs,
independent review, rollback, and limitations. It may state that the repository/local
F2 gate passes only after the implementation is integrated. It must state that F3,
staging, authenticated-product acceptance, production, and all inherited VOC-080 holds
remain unresolved/held.

## 3. Non-functional requirements

- Linux-hosted CI and local Unix process semantics must be deterministic; platform
  limitations for other operating systems must be documented rather than fabricated.
- Readiness and shutdown waits must be bounded and expose concrete failure reasons.
- No token, email address, cookie, learner row, or provider payload may appear in logs.
- Scripts must use the locked workspace tools and avoid a new runtime dependency unless
  exact evidence proves it necessary.
- Local state and generated bundles remain ignored; migrations and source remain tracked.

## 4. External references

- Cloudflare multi-Worker local development:
  https://developers.cloudflare.com/workers/local-development/multi-workers/
- Cloudflare D1 local development:
  https://developers.cloudflare.com/d1/best-practices/local-development/
- Wrangler D1 migration flags:
  https://developers.cloudflare.com/d1/wrangler-commands/
- OpenNext local binding access: https://opennext.js.org/cloudflare/bindings

These references guide implementation but do not override the adopted package or grant
live authority. Locked local schemas and tool behavior are authoritative for tests.
