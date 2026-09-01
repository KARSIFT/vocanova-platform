# VOC-117 — Specification

## Problem and exact reproduction

Issue #221 identifies a race in the signal-loop tests in
`scripts/foundation/local-development-supervisor.test.mjs`. The test starts a
`node -e` child that installs a signal handler and then sleeps a fixed 75 ms before
calling `children.stopAll(signal)`. On hosted run `33508619896`, foundation job
`99858760273`, candidate `d464d7b2a07d8e43213ae89471c4a8b8461e7781`, the SIGINT case
failed at line 306 with `null !== 23`; the job reported 203 pass / 1 fail / 204
total in 794,979 ms. The SIGTERM neighbor passed. The parent sleep is not evidence
that the child evaluated `process.on(...)`; `SupervisedChildren` records the real
exit event correctly.

Focused reproduction from the exact base is:

```bash
node --test --test-name-pattern="owned children receive SIGINT once and settle" scripts/foundation/local-development-supervisor.test.mjs
```

The full hosted reproduction is:

```bash
pnpm run ci:foundation
```

The focused test can pass locally by chance, which is why elapsed time is not an
acceptable precondition.

## Desired outcome

The parent receives an exact readiness sentinel from each signal fixture only after
that fixture registers its requested signal handler. The parent awaits that bounded
handshake and only then sends SIGINT or SIGTERM. The complete test still proves one
signal request, non-forced cleanup, the expected fixture exit code (23 or 24), and a
settled child.

## Scope and non-goals

### In scope

- One test-only bounded readiness waiter in
  `scripts/foundation/local-development-supervisor.test.mjs`.
- A unique sentinel fixture for both parameterized signal cases.
- Exact signal-handler-before-sentinel ordering, with a pre-spawn source-order
  assertion that proves the registration token precedes the marker token.
- Bounded timeout, wrong/missing sentinel, early-exit, split-output, and cleanup
  negatives.
- Isolated mutation checks for readiness order, fixed-delay regression, and exit-code
  assertion preservation.

### Out of scope

Changing `local-development-supervisor.mjs`, `SupervisedChildren`,
`runLocalDevelopment`, production signal forwarding, shutdown grace or force-kill
constants, readiness HTTP behavior, docs, package scripts, CI workflows, validators,
dependencies, application/runtime code, API/data/migrations, settings, credentials,
Cloudflare, deployment, production/learner data, DNS/traffic, spending, release,
main promotion, launch, retries, or issue closure.

## Functional requirements

1. The signal fixture registers exactly its parameterized handler before writing one
   exact ready sentinel to stdout. Before spawning it, the test finds exactly one
   handler-registration token and one marker-emission token in the generated source
   and asserts that registration precedes emission; this must fail an early-marker
   mutation without relying on process scheduling.
2. The parent waits for that sentinel through the supervised child's existing stream
   and buffered output; it does not sleep a fixed number of milliseconds.
3. The waiter has a finite declared timeout of at most 5,000 ms, handles split chunks,
   and cleans all listeners/timers on every settlement (success, error, early exit,
   or timeout).
4. Missing/wrong readiness and child error/early exit reject with a bounded,
   fixture-specific diagnostic and leave no child or timer running after cleanup.
5. SIGINT expects exit code 23 and SIGTERM expects exit code 24. `stopAll` remains
   non-forced for these fixtures and `record.outcome` remains the observed code.

## Preservation, security, and privacy

The supervisor runtime already owns process spawning, signal forwarding, bounded
grace/force-kill escalation, output diagnostics, and close settlement. This package
does not alter that runtime or public local-development contract. The exact
`pnpm run ci:foundation` package script and wildcard discovery remain unchanged.
The tests are local, synthetic, credential-free, network-free, and do not touch
production or learner data.

## Risk and authority

The changed path has an R1 automated floor, but this required foundation verifier has
R3 semantic consequence: a bad test synchronization could falsely pass or hide a
real cleanup defect. The plan therefore requires local-process lifecycle specialist
review, exact-SHA independent cross-model R3 review, complete deterministic checks,
and a separate non-author merge actor. This is not governance self-modification;
cross-model evidence is defense in depth, not authority. The issue and draft grant no
implementation authority.

## Performance, errors, and compatibility

The positive readiness bound must be finite and no more than 5,000 ms. Negative tests
inject a short timeout and must fail within that bound without internal retries or
hangs. Unix-like Node 24.18.0 behavior and current stream-based child supervision are
the compatibility targets. Native Windows process behavior remains unclaimed as in
`docs/development.md`.

## Open questions

None. The marker spelling and exact waiter API may be refined internally only if the
final implementation preserves every requirement and the one-file inventory.
