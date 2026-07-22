# Vocanova

Vocanova is an AI-powered platform for practical English learning. It is maintained
by KARSIFT as a private pnpm and Go monorepo.

The repository is in the application-foundation phase. Its canonical roots are
`apps/web`, `apps/api`, and the four approved shared packages under `packages/`.
VOC-005 establishes buildable framework-neutral and Go skeletons only; product
behavior remains subject to later approved changes. See the
[local development guide](docs/development.md) for exact tools and commands.

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
bounded executable change packages. Documents 00–14 have not been migrated; any
preservation-first migration requires a separately approved change.
