---
name: verify
description: Select and run proportionate VocaNova validation, then report exact evidence and remaining limits. Use before handoff, review, or pull-request creation.
---

# Verify

Choose checks by impact:

- Harness, repository, docs, or workflow changes: `pnpm run ci:foundation`.
- Shared packages: `pnpm run ci:packages`.
- Web: `pnpm run ci:web`; add `pnpm --filter @vocanova/web test:e2e` for visible flows.
- API Worker, D1, or contracts: `pnpm run ci:worker-api`.
- Cross-Worker local behavior: `pnpm run ci:local-stack`.
- Broad or cross-cutting work: `pnpm validate` and `pnpm audit --audit-level high`.

Also run `git diff --check`. Report commands exactly as run, pass/fail status, and any check not run. Never describe an unavailable or skipped check as passing.
