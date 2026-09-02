---
name: code-review
description: Review a VocaNova change for correctness, regressions, security, and missing tests. Use when the user asks for review or a pull request has actionable findings.
---

# Code review

1. Read the issue or request, diff, owning code, tests, and relevant documentation.
2. Prioritize observable defects, contract drift, data loss, authentication mistakes, unsafe external effects, race conditions, and missing regression coverage.
3. Confirm findings against the exact changed lines and current repository behavior.
4. Report findings in severity order with file and line references, a concrete failure scenario, and the smallest credible correction.
5. If no findings remain, state that directly and list residual test or environment limits.

Do not manufacture process objections or style findings that automated tools already settle.
