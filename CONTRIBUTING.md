# Contributing

`main` is the only long-lived branch. Work in a short-lived branch and open a PR
against `main`; PRs are squash-merged.

Branch prefixes:

- `feature/` for new capabilities
- `fix/` for corrections
- `docs/` for documentation changes
- `refactor/` for behavior-preserving code changes
- `chore/` for tooling/maintenance

Before opening a PR, run:

```bash
pnpm validate
```

This runs workspace validation, formatting, lint, typecheck, tests, and build — it's
also the required CI check. Use the exact checked-in tool versions (see
[docs/development.md](docs/development.md)) and don't claim an unavailable check passed.

Changes to `apps/api/business/auth/**` or `apps/api/migrations/**` need a human
reviewer's explicit sign-off before merge — flag this in the PR description.

Never commit secrets, credentials, or production configuration.
