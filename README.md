# Vocanova

Vocanova is an AI-powered platform for practical English learning. It is maintained
by KARSIFT as a pnpm Cloudflare Workers monorepo. The repository is public on GitHub,
current as observed at 2026-08-24. See the [point-in-time repository settings
record](docs/governance/repository-settings-current.yaml) and
[`docs/governance/repository-settings.md`](docs/governance/repository-settings.md)
for the exact hosted posture: selected Actions with SHA pinning and dependency/
vulnerability alerts and automatic deletion of merged branches are enabled as
observed, while rulesets and branch protection are absent and Dependabot security
updates and GitHub-hosted secret scanning/push protection are disabled. Public
availability does not mean a control is configured.

Its canonical runtime roots are `apps/web`, `apps/api-worker`, and the shared packages under `packages/`.
Real, shipped product surfaces exist today - `apps/web` has working Home, Progress, and
Journey/Discover (including situation drill-down) screens (VOC-018 through VOC-022), built
against the wired design-token system - not skeletons awaiting later approved changes. See
the [local development guide](docs/development.md) for exact tools and commands.

The contributor entry points are `pnpm dev:init` for repeatable local D1 migrations,
`pnpm dev` for the supervised Next/API edit loop, `pnpm dev:workers` for the supervised
two-Worker loop, and `pnpm test:local-stack` for disposable end-to-end foundation
proof. They are loopback-only and credential-free; staging and production remain held.

## Documentation

- [Documentation index](docs/README.md)
- [Product documentation](docs/product/)
- [Architecture documentation](docs/architecture/)
- [Planning documentation](docs/planning/)
- [Architecture Decision Records](docs/decisions/README.md)
- [Executable change packages](specs/README.md)
- [Autonomous development governance](docs/governance/README.md)
- [Workflow templates](docs/templates/README.md)
- [GitHub repository configuration](.github/README.md)
- [Contribution guidelines](CONTRIBUTING.md)
- [Security policy](SECURITY.md)

The repository uses three distinct knowledge systems: `docs/` for approved living
documentation, `docs/decisions/` for material decision rationale, and `specs/` for
bounded executable change packages. Documents 00–13 were migrated and adopted as canonical
(VOC-007/VOC-008); DOC-14 was deliberately reconciled but not adopted (see
[docs/README.md](docs/README.md) for the full index and each document's actual status -
that index, not this paragraph, is the source of truth for migration state going forward).
