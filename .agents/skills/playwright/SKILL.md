---
name: playwright
description: Develop, run, and debug VocaNova browser tests with Playwright. Use for user-visible flows, accessibility behavior, responsive layouts, and browser regressions.
---

# Playwright

Tests live in `apps/web/tests/e2e`; configuration lives in `apps/web/playwright.config.ts`. The suite uses the production Next.js build plus the local mock API and requires no remote credentials.

```bash
pnpm run build:packages
pnpm --filter @vocanova/web build
pnpm --filter @vocanova/web exec playwright install chromium
pnpm --filter @vocanova/web test:e2e
```

Pass a spec path or `--grep` after the script for focused work. Prefer role, label, and stable test-id locators. Assert user-visible outcomes, avoid fixed sleeps, retain traces/videos for failures, and run every affected viewport project. Use `.playwright/cli.config.json` for interactive browser exploration.
