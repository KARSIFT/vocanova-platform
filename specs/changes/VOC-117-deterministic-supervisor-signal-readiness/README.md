# VOC-117 — Replace fixed-delay supervisor signal tests with a bounded child-ready handshake

Issue [#221](https://github.com/KARSIFT/vocanova-platform/issues/221) records a
real hosted foundation-suite race. The SIGINT fixture sleeps 75 ms and can be
signaled before its `process.on("SIGINT", ...)` handler is installed. The failed
job [99858760273](https://github.com/KARSIFT/vocanova-platform/actions/runs/33508619896/job/99858760273)
reported 203 pass / 1 fail / 204 total and `null !== 23`; the neighboring SIGTERM
case passed.

This draft R3 repository-only package changes exactly one implementation path,
`scripts/foundation/local-development-supervisor.test.mjs`. It adds a test-only
stdout sentinel emitted after handler registration and a finite waiter that handles
buffered/split output, child exit/error, timeout, and cleanup. Both SIGINT and
SIGTERM then signal only after readiness. Existing exit-code, forced-kill, sibling,
close, and production supervisor semantics remain unchanged.

The package is complete for independent plan review but remains `draft` with
`implementation_authorized: false` until exact candidate review, adoption
bookkeeping, and normal plan-branch merge. Cross-model exact-SHA R3 review is
required as defense in depth; it is not authority. No settings, secrets, workflow
dispatch, deployment, Cloudflare, production/data, DNS/traffic, spending, release,
or launch action is authorized.

## Artifacts

- [Specification](specification.md)
- [Acceptance criteria](acceptance-criteria.md)
- [Impact analysis](impact-analysis.md)
- [Implementation plan](implementation-plan.md)
- [Tasks](tasks.md)
- [Test plan](test-plan.md)
- [Release plan](release-plan.md)
