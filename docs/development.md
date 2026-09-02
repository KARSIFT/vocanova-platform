# Development guide

## Requirements

- Node.js `24.18.0`
- pnpm `11.14.0`

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

| Command               | Purpose                                             |
| --------------------- | --------------------------------------------------- |
| `pnpm lint`           | Lint web, Worker API, and packages                  |
| `pnpm typecheck`      | Type-check all workspaces                           |
| `pnpm test`           | Run foundation and workspace tests                  |
| `pnpm build`          | Build packages, web, and Worker API                 |
| `pnpm format:check`   | Check formatting                                    |
| `pnpm ci:foundation`  | Validate repository and local-development utilities |
| `pnpm ci:packages`    | Validate shared packages                            |
| `pnpm ci:web`         | Validate Next.js/OpenNext/workerd behavior          |
| `pnpm ci:worker-api`  | Validate Hono, D1, contracts, and Worker builds     |
| `pnpm ci:local-stack` | Validate the disposable two-Worker stack            |

Useful workspace commands:

```bash
pnpm --filter @vocanova/web test:e2e
pnpm --filter @vocanova/web test:lighthouse
pnpm --filter @vocanova/api-worker test
pnpm --filter @vocanova/api-worker test:data-conversion
pnpm --filter @vocanova/api-worker openapi:check
pnpm --filter @vocanova/api-worker contract:check
```

Wrangler `dry-run` scripts build local, staging, and production configurations without uploading or provisioning resources.

## Troubleshooting

- If Node or pnpm versions differ, activate the versions declared in `.nvmrc` and `package.json`, then reinstall.
- If frozen installation fails, reconcile `package.json` and `pnpm-lock.yaml`; do not bypass the frozen lockfile in CI.
- `pnpm dev` and `pnpm dev:workers` require ports 3000 and 8080 to be free.
- Delete local D1 state only when you intentionally want a clean database; otherwise preserve `.wrangler/state/vocanova-local` across branch changes.
- Use a focused `ci:*` command to reproduce a hosted failure, then run the broader validation affected by your change.
