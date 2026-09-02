# Lighthouse tests

The Lighthouse suite checks representative VocaNova screens against the budgets in `budget.json`.

## Run

Build the shared packages and web application, then run:

```bash
pnpm run build:packages
pnpm --filter @vocanova/web build
pnpm --filter @vocanova/web exec playwright install chromium
LIGHTHOUSE_CHROME_PATH=/path/to/chrome pnpm --filter @vocanova/web test:lighthouse
```

CI starts the local mock API and production-mode Next.js server before running this command.

## Rules

- Test only local production builds; never point the suite at a live site.
- Keep the fixed screen and viewport matrix deterministic.
- A budget change must be intentional and reviewed together with `assertions.mjs`.
- Do not lower a threshold to hide a regression. Open an issue explaining a genuine limitation.
- Reports under `apps/web/lighthouse-reports` are generated artifacts and are not committed.
