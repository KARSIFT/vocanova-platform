# VocaNova

VocaNova is an AI-powered platform for practical English learning. It is a pnpm monorepo built for Cloudflare:

- `apps/web` — Next.js and OpenNext web application
- `apps/api-worker` — Hono API Worker backed by D1
- `packages/api-client` — shared API client and contracts
- `packages/design-tokens` — shared visual tokens

## Quick start

```bash
pnpm install --frozen-lockfile
pnpm dev:init
pnpm dev
```

`pnpm dev` starts the supervised local web/API loop. Use `pnpm dev:workers` for the two-Worker service-binding loop and `pnpm test:local-stack` for a disposable end-to-end local stack.

## Validate

```bash
pnpm validate
pnpm audit --audit-level high
```

## Documentation

- [Development guide](docs/development.md)
- [Product documentation](docs/product/README.md)
- [Design documentation](docs/design/README.md)
- [Engineering documentation](docs/engineering/README.md)
- [Architecture decisions](docs/decisions/README.md)
- [Contribution guide](CONTRIBUTING.md)
- [Security policy](SECURITY.md)

Development uses a conventional trunk workflow: branch from `main`, open a focused pull request, pass CI, address review, and squash-merge.
