# Web end-to-end tests

The Playwright suite covers VocaNova's critical browser flows and accessibility checks.

## Run

From the repository root:

```bash
pnpm run build:packages
pnpm --filter @vocanova/web test:e2e
```

The suite starts its configured local web and mock API servers. It does not use a remote environment or production data.

## Coverage

- landing, sign-in, magic-link, onboarding, and settings screens;
- home, discover, reviews, progress, and account settings;
- the integrated learning loop;
- keyboard and responsive behavior;
- axe accessibility scans.

Add or update an end-to-end test when a web change affects a user-visible flow. Prefer stable roles, labels, and test IDs over layout-dependent selectors. Keep fixtures deterministic and free of secrets or personal data.

## Debugging

```bash
pnpm --filter @vocanova/web test:e2e -- --headed
pnpm --filter @vocanova/web test:e2e -- --trace on
```

Failure artifacts are written under `apps/web/test-results` and the Playwright report directory; both are local generated output.
