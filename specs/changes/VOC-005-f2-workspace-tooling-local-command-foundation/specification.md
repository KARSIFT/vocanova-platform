# VOC-005 Specification

## Objective and requirement source

GitHub issue #14 is the founder-approved requirement source for `F2-I01` and
`F2-I02`. This package is grounded on live `develop` commit
`76d5ab47cd847a5634f3b8f429247726bd72a579` and preserves the issue without
redesigning its application layout or expanding into later F2 work.

## Stable requirements

- **VOC-005-R01:** Create canonical application roots `apps/web` and `apps/api`; do
  not create `services/api`, a repository-root `backend/`, or `apps/mobile`.
- **VOC-005-R02:** Create shared workspace boundaries at `packages/api-client`,
  `packages/design-tokens`, `packages/eslint-config`, and
  `packages/typescript-config` without feature behavior; preserve the existing
  `docs/` and `scripts/` roots and add only a non-deploying structural `infra/`
  placeholder required by the approved canonical layout.
- **VOC-005-R03:** Organize `apps/api` as a minimal Go modular-monolith foundation
  with appropriate tracked foundations for `cmd`, `app`, `business`, `foundation`,
  `ent`, and `migrations`; do not implement domain schema, real migrations, or
  business endpoints.
- **VOC-005-R04:** Configure pnpm only for the root, `apps/web`, and shared
  JavaScript/TypeScript packages. Do not force `apps/api` into the pnpm workspace.
- **VOC-005-R05:** Declare and pin the package manager and supported Node.js and Go
  toolchain versions through conventional checked-in files and manifests. Resolve
  exact versions at implementation time from supported stable releases and record
  them in the implementation PR; do not use floating dependency ranges where a
  reproducible exact version is required.
- **VOC-005-R06:** Provide simple root command entry points for development,
  validation, linting, type checking, tests, builds, formatting checks, formatting,
  and dependency audit where applicable to the initialized skeleton.
- **VOC-005-R07:** Ensure every advertised root command either performs its real
  check or fails clearly. Do not add passing placeholders, no-op checks, or claims
  for unavailable deployment, integration, migration, or accessibility systems.
- **VOC-005-R08:** Add the smallest per-workspace manifests and configuration needed
  for root commands to resolve deterministically from a clean checkout with a frozen
  pnpm lockfile.
- **VOC-005-R09:** Validate `apps/web` through its real initialized build, lint, and
  type-check paths without product screens or features. This package does not select,
  replace, or upgrade a frontend product framework; framework-specific work requires
  separate canonical authority if none is already available at implementation time.
- **VOC-005-R10:** Validate `apps/api` with real Go format, vet, build, and test paths
  using only minimal compile/test scaffolding; a health/build placeholder is allowed
  only when strictly necessary to prove the skeleton.
- **VOC-005-R11:** Add only cross-platform ignore, editor, and local configuration
  needed for WSL2/Linux and ordinary CI use, plus concise setup and root-command
  documentation.
- **VOC-005-R12:** Preserve existing governance and documentation, run all existing
  governance/foundation validation, and add deterministic F2 validation appropriate
  to the actual workspace without weakening any control.
- **VOC-005-R13:** Enable dependency-audit coverage now that manifests exist, while
  introducing no secret, production credential, production data, deployment, or
  write-capable production integration.
- **VOC-005-R14:** Introduce no product feature, authentication, domain data model,
  database schema, real migration, business API, production/Cloudflare deployment,
  broad unrelated CI/CD expansion, DOC-17/DOC-18 roadmap implementation, Control
  Plane, RL1/RL2, automatic merge, autonomous merge, or autonomous release.
- **VOC-005-R15:** Publish the implementation separately as a draft PR to `develop`,
  classify its actual diff with the repository classifier, obtain exact-SHA Claude
  verification, and stop without merge, auto-merge, deployment, or self-approval.

## Compatibility and error behavior

Root commands must use repository-relative paths, propagate nonzero failures, avoid
machine-specific absolute paths, and be runnable in a clean WSL2/Linux or normal CI
environment after documented prerequisites and frozen installation. Missing tools,
dependency drift, lint/type/build/test failure, formatting drift, audit failure under
the approved policy, or governance failure must be visible and deterministic.

## Data, security, privacy, analytics, and accessibility

No application data, personal data, schema, production secret, analytics, telemetry,
user interface, or accessibility behavior is introduced. Accessibility automation is
not represented as passing when no UI exists. Empty `ent` and `migrations` foundations
must not imply a database schema or migration has been approved.

## Explicitly out of scope

Everything listed in issue #14's out-of-scope section remains excluded, including
later F2 slices and all product features. Toolchain configuration must not be used as
a pretext for unrelated refactoring, governance redesign, deployment automation, or
monorepo/task-runner framework adoption.
