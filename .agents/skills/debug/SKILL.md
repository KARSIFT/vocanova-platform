---
name: debug
description: Diagnose a VocaNova failure from reproducible evidence before changing code. Use for bugs, failed checks, runtime errors, and flaky tests.
---

# Debug

1. Capture the exact command, input, environment, expected behavior, and observed failure.
2. Reproduce with the smallest existing test or local-only command.
3. Trace from the failing boundary to the first incorrect state; distinguish root cause from downstream symptoms.
4. Check recent changes and nearby working patterns without discarding unrelated work.
5. State the root cause and proposed regression-test level before editing.
6. Apply the smallest complete correction through `implement`, then rerun the reproducer and the affected workspace gate.

Do not hide a failure with retries, longer sleeps, disabled checks, or broader exception handling.
