# Contributing to VocaNova

## Before opening a pull request

Discuss a large architectural change in an issue first. This includes a new subsystem, public API or protocol change, persistence-model change, authentication or permission change, or a new execution boundary. Describe the problem, proposed direction, alternatives, and migration risk.

Routine fixes, documentation improvements, dependency updates, and focused features can go directly to a pull request.

## Workflow

1. Branch from current `main`.
2. Make one logical change.
3. Add or update tests for changed behavior.
4. Update relevant documentation.
5. Run the applicable checks, normally `pnpm validate`.
6. Open a pull request with a Conventional Commit title.
7. Resolve review findings and squash-merge after required checks pass.

Do not mix unrelated cleanup or refactoring into a feature pull request.

## Local commands

```bash
pnpm install --frozen-lockfile
pnpm dev:init
pnpm dev
pnpm validate
pnpm audit --audit-level high
```

See [docs/development.md](docs/development.md) for focused commands and local Workers details.

## Security

Never include secrets, tokens, private user data, or production data in issues, pull requests, logs, fixtures, or screenshots. Report vulnerabilities through [GitHub private security advisories](https://github.com/KARSIFT/vocanova-platform/security/advisories/new).
