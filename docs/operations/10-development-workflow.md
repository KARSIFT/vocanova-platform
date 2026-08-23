---
id: DOC-10
title: VocaNova Development Workflow
version: 1.2
document_type: engineering-workflow
status: approved
owner: founder
canonical_path: docs/operations/10-development-workflow.md
approved_at: 2026-07-21
last_reviewed_at: 2026-08-23
review_cycle: quarterly
supersedes: null
related_documents:
  - DOC-11
  - DOC-15
  - DOC-16
  - DOC-19
related_decisions:
  - ADR-0003
  - ADR-0004
adoption_change: VOC-008
source_files:
  - path: 10-development-workflow.md
    sha256: 7fdd38cb7f877051907cc68e0930ece507fe3466dab3e008795c2827eeb21aaf
---

# 10 — VocaNova Development Workflow

## Active VOC-080 delivery amendment

[ADR-0003](../decisions/ADR-0003-cloudflare-native-runtime-and-data.md) establishes
the Cloudflare Worker/D1 target, and
[ADR-0004](../decisions/ADR-0004-external-ruflo-orchestration.md) establishes optional
external Ruflo coordination. GitHub remains canonical. Ruflo may coordinate isolated
provider-neutral roles but cannot approve, merge, deploy, access secrets or production
data, or turn issues/comments into execution. The four Actions workflows remain
deterministic evidence only. Repository migration proceeds through VOC-080's stacked,
independently reviewed tasks; live Cloudflare and data actions remain separately held.
VOC-080-T11 completed the repository-only retirement after the exact T03-T10 parity
chain: the active tree now contains only the OpenNext/Hono/D1 runtime. That removal did
not inspect, mutate, or stop a live server.
The [external Ruflo runbook](ruflo-external-orchestration.md) is the operational source
for the exact installation, supply-chain overrides, worktree ownership, sanitized
memory, reviewer non-duplication, and synthetic rehearsal. Its upstream permission
manifest is advisory, not an enforcement or approval layer.

VOC-081 adds the contributor-verifiable local F2 contract without activating a live
environment. `pnpm dev` supervises the API Worker plus Next hot reload;
`pnpm dev:workers` supervises both Workers with their committed service binding; and
`pnpm test:local-stack` uses disposable D1 state to prove the complete boundary. The
canonical loopback endpoints are web `127.0.0.1:3000` and API `127.0.0.1:8080`.
Occupied ports fail rather than rebind. Linux/Unix process semantics are the supported
contract; native Windows is not claimed.

## 1. Principles

Approved product documents are the source of truth for product behavior; feature coding begins only
after requirements and an implementation plan are approved; humans or AI agents may fill planning,
implementation, and review roles, but implementation and independent review remain separate; GitHub
is the operational source of truth; GitHub Actions runs deterministic repository checks only;
contextual review runs outside Actions and is bound to an exact revision; AI agents never hold
unrestricted production secrets or merge their own work; database migrations are validated through
automated tests; product and release authority follows the live R0–R4 and RL1–RL3 governance model. See
[DOC-19](../archive/19-governance-reconciliation-notes.md) for historical orientation and the linked canonical sources.

## 2. Repository

One monorepo, `vocanova-platform` (private during MVP — see
[the migration notes](../archive/README-migration-notes.md#5-repository-name-conflict)). Recommended
structure:

```text
vocanova-platform/
├── apps/web/                      # Next.js
├── apps/api-worker/               # Hono Module Worker + local D1 target
│   ├── migrations/
│   ├── openapi/
│   └── src/{domain,http,repositories}/
├── packages/{api-client,design-tokens,eslint-config,typescript-config}/
├── docs/{product,research,design,engineering,operations,architecture,planning,governance}/
├── scripts/
├── .github/{workflows,ISSUE_TEMPLATE,ai}/
├── AGENTS.md
├── CLAUDE.md
├── REVIEW.md
```

The canonical document corpus is split by category and indexed in [docs/README.md](../README.md).
The TypeScript Worker API is the active API runtime at `apps/api-worker`. T04-T08 built
its typed runtime, contract, domains, and local D1 migrations; T09 proved deterministic
synthetic conversion; T10 added held delivery controls. T11 then removed the former
Go/PostgreSQL implementation after that complete parity evidence existed. The frozen
contract and PostgreSQL-schema snapshots retain only the deterministic migration
oracles, not an executable second runtime.

## 3. Branch strategy

The intended topology has two permanent branches: `develop` (default integration branch and future
staging source) and `main` (production source, accepting governed release changes plus emergency
hotfixes). No `release/*` branch is planned for MVP; a `develop → main` PR represents a release
candidate, subject to the live authority and release-class rules. Automatic staging deployment,
automatic merge, and production deployment are not technically active as of 2026-07-21; consult
[the A-003 transition state](../governance/a003-transition-state.yaml) rather than inferring
activation from this topology.

**Current operational note (2026-08-22):** VOC-078-T03 removed server deployment and
monitoring workflows. VOC-080 selected Cloudflare Workers and D1, and T10 now supplies
a held manual delivery state machine after parity. Its manifest blocks before
environment jobs/secrets, so `develop` and `main` remain integration and
production-history branches with no live effect until the applicable action hold and
separate activation change complete.

```text
feature/* ──PR──► develop ──release PR──► main
                    │                       │
          Held Cloudflare staging    Production-history source
```

Task branches: `<type>/<issue-number>-<short-description>` (`feature/`, `fix/`, `hotfix/`,
`refactor/`, `chore/`, `docs/`, `test/`, `security/`, `revert/`). Squash merge only into `develop`;
merge commit for `develop → main`. Rebase before final review; `git push --force-with-lease`, never
plain `--force`. These mechanics do not grant merge or release authority; that authority comes from
canonical governance.

## 4. Work hierarchy

```text
Milestone → Epic → GitHub Issue → Pull Request
```

Sources of truth: product vision → `docs/product/`; architecture → `docs/architecture/` + ADRs;
implementation work → GitHub Issues; status → GitHub Projects; release scope → Milestones;
production history → Releases/deployments.

Priorities P0 (critical: outage, data loss, active security incident) through P3 (post-MVP
polish); most planned work is P2. Sizes XS/S/M/L — Codex should never receive an `L` issue directly;
split it first.

## 5. Definition of Ready / Definition of Done

**Ready**: clear objective, stated value, linked requirement sources, testable acceptance criteria,
defined scope/exclusions, identified technical/security/privacy impact, defined testing
expectations, resolved dependencies, sized XS/S/M, no blocking product or architecture decision
remaining.

**Done**: acceptance criteria satisfied, scope respected, required tests pass (unit/integration/
contract/migration/e2e as applicable), security/authorization correct, migrations tested,
OpenAPI/generated types synchronized, documentation updated, no secrets exposed, required review
resolved, and merged through a PR. Staging/production deployment evidence is required only when an
active, separately authorized Cloudflare delivery task provides that capability. T10's
mocked/held mechanism exists, but live evidence remains unavailable until the applicable hold and
activation change complete.

## 6. Pull-request standards

One coherent outcome per PR; unrelated work becomes a separate issue. Preferred size 100–500
meaningful changed lines (under 200 for fixes; over 800 normally split). Conventional Commits
(`feat`, `fix`, `refactor`, `test`, `docs`, `chore`, `build`, `ci`, `perf`, `security`, `revert`); no
AI agent names in commit messages. PR body must cover: summary, linked issue, requirement sources,
scope, implementation, acceptance criteria, testing performed, security/database/API/environment
impact, documentation impact, known risks, and review status.

## 7. Testing strategy

Layers: end-to-end → integration/contract → component/service → unit, with most tests below the
end-to-end layer. Worker/D1 unit, repository, workerd, migration, auth, atomicity,
consistency, frozen-contract, data-conversion, and AI-response tests run as applicable.
Frontend: utility,
component, form, feature-level, error/empty/loading/success states, accessibility, responsive,
API-integration tests. End-to-end (Playwright) covers the full core loop: auth → discover → save →
review session → sentence submission → deterministic AI feedback → progress update → settings change
→ logout → unauthenticated-access rejection. Ordinary CI always uses a deterministic AI adapter, not
a paid/nondeterministic provider call.

Coverage direction (guides quality, not a target to game): backend ~70%, frontend unit/component
~60%, critical domain/security logic (auth, sessions, spaced repetition, daily progress, ownership
boundaries, AI structured-output parsing, migrations) 90%+.

CI levels: **Level 1** (fast PR checks — format, lint, typecheck, unit tests, generated/OpenAPI
drift, build, basic security); **Level 2** (full PR checks — reference PostgreSQL and target D1
integration/migration tests, contract parity, workerd, component tests, selected Playwright, and
different-role review); **Level 3** (separately authorized Cloudflare staging checks); **Level 4**
(separately authorized production release checks).

The Level 2 foundation path includes the required `local stack` job. It initializes
fresh temporary D1 state, runs both local Workers, proves direct browser routes and the
web `API` service binding, restarts once to prove persistence, and verifies child/port
cleanup. Contributor loops instead retain ignored state only at
`.wrangler/state/vocanova-local`; repository rollback does not delete it. Archive or
remove only that exact directory after stopping the loops—never recursively target a
workspace or home directory.

## 8. Database migrations

Active flow: `explicit SQLite schema → Wrangler D1 migration → local D1 rehearsal →
reconciliation`. The retired PostgreSQL schema is retained only as a compact, immutable
conversion-inventory fixture; it is not an executable migration path. Categorize risk,
run from-zero/upgrade/idempotency and integration tests, commit schema and code
together, and obtain independent migration-risk review. High-risk migrations (drop table/column, populated type change, large-table rewrite,
primary-key change, user-data deletion, or irreversible transformation) follow the live R0–R4
classification, protected-area controls, approval matrix, and EHR rules. Required evidence includes
migration lint, from-zero and upgrade-path tests, destructive-operation detection, recovery proof,
and independent migration-risk review as applicable. R4 consequences require complete decision,
impact, contingency, specialist, deterministic, and exact-revision review evidence; no R0-R4 class
requires founder or standing steward approval merely from its label. Production access and
irreversible external mutation retain separately defined action-specific authority. Use
expand-and-contract so `develop` does not carry an unrecoverable migration between merge and release.
See the [canonical governance index](../governance/README.md).

## 9. Security workflow

Mandatory independent security review for changes touching authentication, sessions, cookies, OAuth,
magic links, identity, user-owned data, AI-provider integration, logging, secrets, environment
variables, GitHub Actions, Cloudflare config, dependencies, or migrations. Severity: Critical (blocks
merge+deploy), High (normally blocks merge), Medium (fixed or explicitly tracked), Low (fixed or
scheduled).
