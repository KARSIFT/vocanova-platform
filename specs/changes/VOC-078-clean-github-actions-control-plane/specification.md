# VOC-078 — Specification

## Objective

Make GitHub Actions understandable, deterministic, self-contained, and proportionate to the
repository. Remove the `karsift-ai-infra` dependency rather than porting its ten reusable jobs
one for one. Suspend server-bound automation until a separate hosting decision exists.

## Decisions

### VOC-078-D00 — GitHub Actions performs deterministic checks only

Actions may install pinned toolchains, validate source, run tests/builds, classify changed
paths, scan dependencies/secrets, and publish non-sensitive test artifacts. It does not ask an
AI model to plan, implement, review, remediate, merge, release, or open work items.

### VOC-078-D01 — External workflow behavior is retired, not cloned

Delete all references to `KARSIFT/karsift-ai-infra`. The custom
plan → adopt → implement → review → remediate → merge-gate → auto-advance → release state
machine is retired. Ordinary GitHub issues and pull requests become the work record. Human
review remains required by policy, but the documentation must state that GitHub Free cannot
technically enforce private-repository branch protection.

### VOC-078-D02 — Agent orchestration is deferred

Remove the unproven `orchestrator/`, `.claude/agents/`, `.karsift/lessons.md`, and root
orchestrator scripts. Supersede ADR-0001 with a concise rejected/superseded record. A future
agent may propose code through a branch and PR, but agent-triggering, merging, and deployment
are not part of this package.

### VOC-078-D03 — Deployment and server health automation is paused

Delete the current staging/production deployment workflows and the failing scheduled error
monitor. Do not replace them with another server-specific workflow. Preserve `infra/`, deploy
scripts, Dockerfiles, migrations, and application health endpoints because they are runtime
assets and possible inputs to the later hosting decision.

No workflow may deploy, mutate Cloudflare, SSH to a host, poll server health, query Sentry, or
promote `develop` to `main` after this package.

### VOC-078-D04 — Four-workflow target

The final workflow set is:

- `ci.yml`
- `governance.yml`
- `quality.yml`
- `security.yml`

Each workflow has a one-paragraph header, explicit triggers, least-privilege permissions,
timeouts, pinned third-party action revisions, and commands that also work locally.

## Scope

In scope:

- Introduce the four target workflows.
- Delete obsolete/external/agent/deploy/monitoring workflows.
- Remove local orchestrator assets and package scripts.
- Reconcile every document that claims the retired automation is active.
- Preserve current deterministic CI, governance, accessibility, Lighthouse, dependency, and
  secrets-related safety properties in a simpler form.
- Add tests that assert the workflow inventory, permissions, triggers, and forbidden references.

Non-goals:

- No application behavior change.
- No database or migration change.
- No infrastructure, Cloudflare, DNS, Sentry, secret, or live-server mutation.
- No replacement hosting decision.
- No Git history rewrite and no deletion of historical change packages in this package.
- No event-driven orchestrator.
- No promotion of `develop` to `main`.

## Risk and protected areas

Effective risk is R4. The affected paths include workflow, deployment, repository-governance,
agent-authority, and canonical-governance documents. The effect suspends an already-authorized
automatic production path. Founder approval is required. Independent verification must be
bound to the exact final revision.

## Security and privacy

- New workflows default to `contents: read` and declare any additional permission at job level.
- Pull-request-controlled text is never interpolated into shell source.
- Secrets are not exposed to forked pull requests and are not required for ordinary CI.
- No workflow receives `contents: write`, `issues: write`, or `pull-requests: write` unless a
  separately adopted future package establishes a narrowly scoped need.
- Tests use no production credentials or production data.

## Data, migrations, analytics, and accessibility

No data migration or analytics change. Accessibility and Lighthouse checks remain, but are
consolidated under `quality.yml` and path-filtered so unrelated documentation changes do not run
browser-heavy jobs.
