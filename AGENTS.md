# VocaNova Engineering Guide

This file applies to the whole repository. Add a scoped `AGENTS.md` only when a subtree genuinely needs different technical guidance.

## Repository layout

- `apps/web`: Next.js application deployed with OpenNext on Cloudflare Workers.
- `apps/api-worker`: Hono API Worker, D1 migrations, OpenAPI contract, and tests.
- `packages/api-client`: shared API types and client.
- `packages/design-tokens`: shared design tokens.
- `packages/eslint-config` and `packages/typescript-config`: shared tooling.
- `scripts/foundation`: local-development and repository validation utilities.
- `docs`: current product, design, engineering, legal, and development guidance.

## Working agreement

- Use English for engineering text.
- Prefer the simplest complete implementation and avoid speculative abstractions.
- Preserve unrelated work in a dirty worktree.
- Never commit credentials, production data, or unnecessary personal information.
- Keep application behavior, contracts, tests, and relevant documentation together.
- Add tests for changed logic. Do not weaken checks to make a change pass.
- Use the existing pnpm workspace and dependencies before adding new tooling.

## GitHub workflow

- `main` is the only long-lived branch.
- Create a short-lived branch from current `main`.
- Keep each pull request focused on one logical outcome.
- Discuss large architecture, public API, persistence, authentication, or execution boundary changes in an issue first. Routine fixes and small features need no ceremony beyond a clear pull request.
- Use a Conventional Commit pull-request title such as `fix: handle expired sessions`.
- Record what changed and the validation performed. Resolve review findings before squash-merging.
- GitHub issues, pull requests, commits, checks, and reviews are the project record. No change package, risk class, adoption step, EHR, evidence binder, or permanent planner/reviewer role is required.

## Commands

```bash
pnpm install --frozen-lockfile
pnpm dev:init
pnpm dev
pnpm dev:workers
pnpm validate
pnpm audit --audit-level high
```

Use the narrower scripts in `package.json` while iterating. Before handoff, run the checks relevant to the affected workspace. See `docs/development.md` for local runtime details and troubleshooting.

## Cloudflare and external effects

Pull-request checks are credential-free. Do not deploy, mutate remote D1 data, change DNS, expose secrets, or perform another production action unless the user explicitly requests that exact external action. Keep environment-specific identifiers and credentials out of tracked files.
