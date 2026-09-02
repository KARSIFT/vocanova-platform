---
name: tdd
description: Develop VocaNova behavior through a focused red-green-refactor cycle. Use when changing logic, fixing a regression, or adding a contract.
---

# Test-driven development

1. Choose the lowest test level that proves the requested behavior: utility, service, contract, integration, or Playwright.
2. Add one focused assertion and run it to observe the expected failure. A compile error is not a useful red state unless the task changes a type contract.
3. Implement the smallest complete behavior that makes the test pass.
4. Refactor only after green, preserving the same observable contract.
5. Run the owning workspace gate from `verify` to catch adjacent regressions.

Avoid tests coupled to private implementation details, snapshots without a reviewed contract, fixed browser sleeps, and mocks that bypass the boundary under test.
