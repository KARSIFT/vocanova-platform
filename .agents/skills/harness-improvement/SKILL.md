---
name: harness-improvement
description: Keep VocaNova agent skills, tool adapters, local tooling, and CI validation consistent. Use when adding or changing .agents, Claude, Codex, Cursor, OpenCode, Playwright CLI, VS Code, Mise, or pre-commit behavior.
---

# Harness improvement

1. Treat `AGENTS.md` and `.agents/skills` as canonical; tool directories remain thin adapters.
2. Inspect every affected adapter before changing shared behavior. Avoid copied policy and platform-only assumptions.
3. Keep instructions factual, concise, tool-neutral where possible, and free of secrets or production authority.
4. Update `scripts/foundation/validate-agent-harness.mjs` when the harness contract changes and add a regression test for new validation logic.
5. Run `pnpm run ci:foundation` and `git diff --check`.

Do not copy third-party prompts or workflows verbatim. Reimplement useful behavior for VocaNova's architecture and preserve source attribution where inspiration is material.
