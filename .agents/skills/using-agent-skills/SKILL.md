---
name: using-agent-skills
description: Choose the smallest VocaNova repository skill for a development task. Use when a request spans planning, implementation, verification, browser work, review, or pull-request delivery.
---

# Using agent skills

Route work by outcome:

- New behavior or a substantial change: `plan`, then `tdd` and `implement`.
- Confirmed bug: `debug`, then `tdd` and `implement` with a regression test.
- Browser behavior: `playwright` alongside `implement` or `verify`.
- Validation and handoff: `verify`.
- Review an existing change: `code-review`.
- Publish a completed branch: `pr`.
- Remove merged branches and worktrees: `clean-branches`.
- Change the agent/tool harness: `harness-improvement`.

Use the smallest covering set and say which guides you are following. Work in the user-started conversation. Use parallel agents only when the user explicitly requests delegation and the tasks are genuinely independent.
