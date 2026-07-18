# VOC-006 Specification

## Objective and requirement source

Founder-approved GitHub issue #19 is the requirement source for only `F2-I03`. This
package is grounded on canonical `develop` commit
`e97cce408c19312d1f88afb8be4bffa697d98a82`, after completion of F2-I01/F2-I02. It
authorizes the planned `PR-F2-02` foundation and explicitly excludes F2-I04 and later
work.

## Stable requirements

- **VOC-006-R01:** Convert the existing framework-neutral TypeScript skeleton into a
  genuine Next.js App Router application at canonical `apps/web`; do not move or
  duplicate the web root.
- **VOC-006-R02:** Add only the minimal App Router structure, root layout, global
  styling entry point, and intentionally non-product root page needed to prove real
  rendering and framework operation.
- **VOC-006-R03:** Use React and TypeScript with the approved minimal Tailwind CSS
  foundation appropriate to the supported stable Next.js setup; preserve responsive,
  mobile-first foundations without implementing a design system or product UI.
- **VOC-006-R04:** Resolve supported stable Next.js, React, React DOM, Tailwind CSS,
  and only directly required framework dependencies at implementation time from
  authoritative upstream sources; exactly pin them and record rationale and
  compatibility with the repository's pinned Node and pnpm toolchain.
- **VOC-006-R05:** Exclude beta, canary, release-candidate, and experimental releases
  unless separately approved; do not upgrade unrelated dependencies or copy versions
  blindly from historical planning material.
- **VOC-006-R06:** Add the minimum Next.js-aware TypeScript, Next.js, lint, and styling
  configuration, reusing shared repository configuration where sensible and changing
  shared/root configuration only when strictly required and justified.
- **VOC-006-R07:** Replace framework-neutral web development and build behavior with
  real Next.js commands; provide real start, lint, and type-check behavior within the
  existing root command model, with failures propagated.
- **VOC-006-R08:** Reproduce dependency installation with `pnpm install
  --frozen-lockfile`, commit only the intended manifest and lockfile changes, and
  prove a clean checkout can build the web application.
- **VOC-006-R09:** Smoke-test the real development server with a bounded start/readiness/
  termination procedure; do not claim a long-running server completed normally.
- **VOC-006-R10:** Preserve all existing root, workspace, API, and governance
  validation. Narrow integration changes outside `apps/web` require direct necessity,
  traceability, and explicit implementation-PR justification.
- **VOC-006-R11:** Keep the Go backend as business authority and introduce no direct
  PostgreSQL or other data-store access, real API consumption, generated API client,
  backend behavior, schema, or migration in the frontend.
- **VOC-006-R12:** Do not add product screens or flows, auth, speculative route groups,
  shadcn components, TanStack Query, React Hook Form, Zod feature setup, Vitest, React
  Testing Library, Playwright, or later F2 infrastructure merely for future use.
- **VOC-006-R13:** Introduce no Cloudflare/OpenNext deployment, preview environment,
  staging, production, automatic/autonomous merge, RL1/RL2 activation, autonomous
  release, unrelated governance redesign, or planning-document migration.
- **VOC-006-R14:** Publish implementation separately as a draft PR to `develop`,
  classify its exact diff, obtain required exact-SHA independent review and applicable
  gates, and stop without merge, deployment, self-approval, or issue closure.

## Compatibility and error behavior

The implementation must work with committed Node and pnpm versions on a clean
WSL2/Linux or equivalent CI checkout. Commands use repository-relative paths and
return nonzero for dependency drift, compilation, type, lint, build, or governance
failure. Framework-generated type artifacts may be produced locally as documented but
must not be confused with canonical hand-written source or implementation evidence.

## Data, security, privacy, analytics, and accessibility

The scaffold handles no learner data, credentials, production configuration,
analytics, telemetry, authentication, or database connection. Dependency additions
create a supply-chain surface controlled by minimal selection, stable exact versions,
frozen installation, audit, and diff review. The technical placeholder uses sound
HTML defaults but does not claim completion of later accessibility or product testing.

## Explicitly out of scope

Every exclusion in issue #19 remains binding. In particular this package authorizes
neither F2-I04, test-foundation slices, configuration-loading architecture, backend
health/logging/error work, API/schema generation, product behavior, nor any deployment
or technical-autonomy capability.
