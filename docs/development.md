# Local development

## Prerequisites

- Node.js `24.18.0` (LTS), declared in `.nvmrc` and `package.json`.
- Bun `1.1.0`, declared by the root `packageManager` field.
- Go `1.26.5`, declared by `apps/api/go.mod` (`go1.26.0` language level and
  `go1.26.5` toolchain).

From a clean checkout, install the exact frozen dependency graph:

```bash
bun install --frozen-lockfile
```

Go downloads the declared toolchain when needed. This requires ordinary access to the
official Go toolchain distribution and no repository secret.

## Root commands

| Command             | Purpose                                                                         |
| ------------------- | ------------------------------------------------------------------------------- |
| `bun dev`           | Run the Next.js web development server.                                         |
| `bun validate`      | Run workspace, format, lint/vet, type, test, and build validation.              |
| `bun lint`          | Run Next.js-aware web lint, package ESLint, and `go vet` for the API.           |
| `bun typecheck`     | Generate Next.js route types and type-check the web and shared packages.        |
| `bun test`          | Run workspace foundation tests and API tests.                                   |
| `bun build`         | Build the Next.js web app, TypeScript packages, and Go API skeleton.            |
| `bun format:check`  | Check Prettier and `gofmt` formatting without writing.                          |
| `bun format`        | Apply Prettier and `gofmt` formatting.                                          |
| `bun audit`         | Fail when the Bun production dependency graph has a high or critical advisory.  |

The audit policy permits moderate and low advisories to be reported without failing;
all reported advisories remain visible and must be recorded in the pull request.

## Workspaces

This is a **Bun workspace** monorepo. The `workspaces` field in `package.json` links:
- `apps/web`: Next.js web application
- `packages/*`: Shared packages (api-client, design-tokens, eslint-config, typescript-config)

When you run `bun install` at the root, Bun automatically hoists and links all workspace packages, allowing imports like `@vocanova/design-tokens` from any workspace package.

Use `bun --filter <package-name>` to run commands in specific workspaces:
```bash
bun --filter @vocanova/web dev    # Run dev server for web app
bun --filter @vocanova/api-client test  # Run tests in api-client package
```

## Project-specific commands

Use `bun --filter @vocanova/web dev`, `build`, `start`, `lint`, or `typecheck` for
the Next.js application. `start` serves a prior production build. The root page is a
technical framework-validation placeholder and contains no product UI.

Run API commands from `apps/api`:

```bash
gofmt -l .
go vet ./...
go build ./...
go test ./...
```

`ent/` and `migrations/` are non-executable structural foundations only.

## Troubleshooting

- An engine or package-manager mismatch means the exact declared Node/Bun versions
  are not active; switch versions and repeat the frozen install.
- A frozen-install failure means `package.json` and `bun.lock` disagree. Do not
  bypass it with a non-frozen CI install; reconcile dependencies in an authorized
  change.
- `bun validate` stops at the first failing child command and preserves its output.
- Go may download `go1.26.5` on first use. A network failure is not a passing API
  check; restore official toolchain access and rerun it.
- No deployment, migration, integration, accessibility, staging, or production check
  exists in this foundation.
