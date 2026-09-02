---
description: Update VocaNova's shared development harness without duplicating repository policy.
argument-hint: "[requested harness change]"
allowed-tools: Bash Read Edit Write Grep Glob
model: inherit
---

Use `.agents/skills/harness-improvement/SKILL.md`. Keep `AGENTS.md` and `.agents/skills` canonical, update affected thin adapters and validator tests together, and do not commit unless the user requested repository delivery.
