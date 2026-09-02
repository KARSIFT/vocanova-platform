---
name: implement
description: Implement an approved VocaNova change as a focused, tested vertical slice. Use when the user asks to build, change, or fix repository behavior.
---

# Implement

1. Start from current `main` on a short-lived branch and preserve unrelated work.
2. Read the owning source, tests, contracts, and scoped instructions before editing.
3. Add or update the narrowest test that proves changed logic. For a defect, make the regression fail before the fix when practical.
4. Keep API types, frontend use, Worker behavior, migrations, tests, and current docs consistent.
5. Reuse workspace packages and existing dependencies before adding abstractions or packages.
6. Run focused checks while iterating, then follow `verify` before handoff.

Never deploy or mutate remote data as an incidental implementation step.
