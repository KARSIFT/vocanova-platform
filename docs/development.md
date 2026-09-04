# Development guide

## Requirements

- Node.js `24.18.0`
- pnpm `11.14.0`

The same versions are available through [Mise](https://mise.jdx.dev/):

```bash
mise install
```

Install the frozen workspace from the repository root:

```bash
pnpm install --frozen-lockfile
```

## Local development

Initialize the persistent local D1 database, then start the supervised web/API loop:

```bash
pnpm dev:init
pnpm dev
```

The web application listens on `127.0.0.1:3000` and the API Worker on `127.0.0.1:8080`. Local state is stored under the ignored `.wrangler/state/vocanova-local` directory.

Use the two-Worker service-binding loop when testing the Cloudflare topology:

```bash
pnpm dev:workers
```

Run the disposable end-to-end stack smoke test with:

```bash
pnpm test:local-stack
```

The local commands use workerd and local D1. They do not deploy, access a Cloudflare account, send email, call a paid AI provider, or require production credentials.

## Validation

Run the complete local gate before handing off a broad change:

```bash
pnpm validate
pnpm audit --audit-level high
```

Focused root commands:

| Command                   | Purpose                                             |
| ------------------------- | --------------------------------------------------- |
| `pnpm lint`               | Lint web, Worker API, and packages                  |
| `pnpm typecheck`          | Type-check all workspaces                           |
| `pnpm test`               | Run foundation and workspace tests                  |
| `pnpm build`              | Build packages, web, and Worker API                 |
| `pnpm format:check`       | Check formatting                                    |
| `pnpm ci:foundation`      | Validate repository and local-development utilities |
| `pnpm harness:check`      | Validate shared agent guides and tool adapters      |
| `pnpm architecture:check` | Enforce workspace import boundaries                 |
| `pnpm workflows:check`    | Validate GitHub Actions security and event coverage |
| `pnpm ci:packages`        | Validate shared packages                            |
| `pnpm ci:web`             | Validate Next.js/OpenNext/workerd behavior          |
| `pnpm ci:worker-api`      | Validate Hono, D1, contracts, and Worker builds     |
| `pnpm ci:local-stack`     | Validate the disposable two-Worker stack            |

Useful workspace commands:

```bash
pnpm --filter @vocanova/web test:e2e
pnpm --filter @vocanova/web test:lighthouse
pnpm --filter @vocanova/api-worker test
pnpm --filter @vocanova/api-worker test:data-conversion
pnpm --filter @vocanova/api-worker openapi:check
pnpm --filter @vocanova/api-worker contract:check
```

The data-conversion command is synthetic-only. See the
[conversion guide](operations/data-conversion.md) for its checkpoint, retry, and
reconciliation behavior.

Wrangler `dry-run` scripts build local, staging, and production configurations without uploading or provisioning resources.

## GitHub workflow

Start each change from the current `main` branch and keep the branch focused on one
logical outcome:

```bash
git switch main
git pull --ff-only
git switch -c docs/describe-change
```

Make the change, run the narrowest relevant checks, and inspect the diff before
committing. For a documentation or repository-harness change, for example:

```bash
pnpm run ci:foundation
git diff --check
git status --short
git diff
git add --patch
git commit -m "docs: describe change"
```

Push the branch and open a pull request that links its issue when one exists:

```bash
git push -u origin HEAD
gh pr create --title "docs: describe change" --body "Closes #123"
gh pr checks --watch
```

Resolve actionable review findings and wait for every required check to pass. Then
squash-merge the pull request (or enqueue it when `main` requires the merge queue):

```bash
gh pr merge --squash
```

This workflow does not deploy the application or access Cloudflare production
resources.

## Development harness

The repository follows [Kandev's](https://github.com/kdlbs/kandev) portable-harness shape with VocaNova-specific content:

- `.agents/skills` is the shared, tool-neutral task-guide library.
- `.claude`, `.codex`, `.cursor`, and `.opencode` adapt that library without duplicating policy.
- `.playwright/cli.config.json` gives interactive browser tools a predictable Chromium default.
- `.vscode/tasks.json` and `.vscode/launch.json` expose the same root commands used by contributors and CI.
- `mise.toml` pins optional local tools, and `.pre-commit-config.yaml` runs fast formatting and harness checks.

Install the optional hooks after `mise install`:

```bash
pre-commit install
```

The hooks are convenience feedback. CI remains authoritative and runs the same repository-owned validators.

## Troubleshooting

- If Node or pnpm versions differ, activate the versions declared in `.nvmrc` and `package.json`, then reinstall.
- If frozen installation fails, reconcile `package.json` and `pnpm-lock.yaml`; do not bypass the frozen lockfile in CI.
- `pnpm dev` and `pnpm dev:workers` require ports 3000 and 8080 to be free.
- Delete local D1 state only when you intentionally want a clean database; otherwise preserve `.wrangler/state/vocanova-local` across branch changes.
- Use a focused `ci:*` command to reproduce a hosted failure, then run the broader validation affected by your change.
