# Agent Instructions

Vocanova is a pnpm + Go monorepo: a Next.js web app (`apps/web`), a Go API (`apps/api`),
and shared TypeScript packages (`packages/`).

## Setup

```bash
corepack enable
corepack prepare pnpm@11.14.0 --activate
pnpm install --frozen-lockfile
```

Go uses the toolchain declared in `apps/api/go.mod` (downloaded automatically).

## Commands

| Command         | Purpose                                                    |
| --------------- | ----------------------------------------------------------- |
| `pnpm dev`      | Run the Next.js web dev server                              |
| `pnpm validate` | Full gate: workspace check, format, lint, typecheck, test, build |
| `pnpm lint`     | Web lint + package ESLint + `go vet`                         |
| `pnpm typecheck`| Type-check web and shared packages                           |
| `pnpm test`     | Foundation tests + API tests                                 |
| `pnpm build`    | Build web, packages, and API                                  |
| `pnpm format`   | Apply Prettier + `gofmt`                                     |

Always run `pnpm validate` before opening a PR. It is also the required CI check.

## Directory map

- `apps/web` — Next.js app (App Router), UI in `src/app`
- `apps/api` — Go API: `business/` (domain logic), `ent/` (schema/ORM), `migrations/`
- `packages/api-client`, `packages/design-tokens` — shared TypeScript packages
- `docs/product`, `docs/engineering`, `docs/design` — product and technical reference docs

## Rules

- Don't touch `apps/api/business/auth/**` or `apps/api/migrations/**` without calling
  that out explicitly in the PR description — a human reviews those by hand before merge.
- Don't invent or claim a check passed that you didn't actually run.
- Keep changes scoped to what was asked; don't bundle unrelated refactors.
- Never commit secrets, credentials, or production configuration.
