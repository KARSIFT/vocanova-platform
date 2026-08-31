# VOC-107 — Specification

## Objective and observed evidence

The required `local stack` job failed in CI push run
[33406243445](https://github.com/KARSIFT/vocanova-platform/actions/runs/33406243445)
at `abf35db76d8182e82aebd4ee78773a09528153d6`. Its ten unit fixtures passed, the
disposable smoke completed build/compatibility preparation, and both first-cycle and
second-cycle HTTP/service-binding probes reached success. The API child then emitted
`fatal error: all goroutines are asleep - deadlock!` with an esbuild service stack;
the bounded output classifier correctly failed the command. Foundation, packages,
web, worker API, and delivery-policy jobs passed; the aggregate therefore failed and
delivery jobs were skipped.

This is not a root-cause finding. The evidence does not establish whether the trigger
is child shutdown timing, stdio/process settlement, a Wrangler/workerd interaction,
an esbuild defect, generated build state, host scheduling, or another dependency.

## Requirements

### VOC-107-D00 — Evidence, not presumption

Preserve the exact hosted symptom as an input and retain its diagnostic fail-closed.
Diagnosis must distinguish observations from hypotheses. No final implementation may
claim a root cause or stable fix without evidence that identifies a causal or tightly
bounded triggering condition.

### VOC-107-D01 — Bounded diagnosis first

Before changing behavior, inventory the local-stack command/process graph:

- the root `ci:local-stack` and `test:local-stack` composition;
- preparation/build and local D1 initialization;
- API/web Wrangler argv, environment sanitization, fixed ports, service binding, and
  state root;
- child signals, exit/stdio-close ordering, output collector, readiness, and restart;
- the exact lock-resolved Wrangler, workerd, esbuild, OpenNext, Node, and pnpm chain.

Use clean worktrees and credential-free bounded attempts. Capture only redacted,
bounded evidence (revision, platform/tool versions, cycle/stage, command shape,
elapsed time, exit/signal, and classified diagnostics). Do not retain raw logs,
tokens, generated artifacts, `.wrangler` state, or temporary databases in Git.

### VOC-107-D02 — Minimum evidence-supported remediation

After diagnosis, change only the proven causal source(s) and focused tests. A pinned
dependency update is permitted only when the exact affected package(s) and lockfile
entry are demonstrated to be causal and compatibility is verified. A causally
unsupported refactor, tool upgrade, timeout increase, port/topology change, or retry
is out of scope.

An unexpected esbuild/workerd fatal diagnostic remains terminal. The implementation
must not add it to an allowlist, discard it during shutdown, retry it as though it
were a bind collision, or declare success after it is observed.

### VOC-107-D03 — Preserve local-stack contract

Keep OS-temporary disposable D1 state, loopback-only ports `8080` and `3000`, no
remote mode, stripped credentials, the local-only marker/service-binding proof,
double migration and restart persistence checks, bounded timeouts, child cleanup,
stdio settlement, and repository-tree cleanup. Retain the standalone workerd smoke's
existing narrow bind-collision retry policy unless inventory proves a smaller,
reviewed lifecycle correction.

### VOC-107-D04 — Regression and operational proof

Add a deterministic regression for the proven trigger and one for the observed fatal
diagnostic's terminal classification. It must fail before the selected correction and
pass after it. If no deterministic trigger can be made, the package may add a focused
deterministic lifecycle/collector invariant plus a bounded repeated real-smoke
protocol, but must label the root cause unresolved and cannot represent a heuristic
as a deterministic remediation.

The implementation requires successful focused tests, local-stack command, relevant
workspace checks, exact hosted CI evidence, and clean artifact/state checks at the
reviewed SHA.

### VOC-107-D05 — Exclusions and review

No workflow change, GitHub setting/secret change, Cloudflare call, deployment,
dispatch, D1 migration, production/data access, traffic/DNS change, spend, user
behavior change, or historical-package change is authorized. One implementation PR
requires distinct CI/local-runtime specialist and independent R3 reviews, with a
separate non-author merge actor.

## Risk

R3 is required by the semantic consequence: this repair governs a fail-closed job
that `CI / ci required` depends on for Worker integration integrity. Candidate code
paths are at most R2 by automated path classification, but a required CI control is
not downgraded to the path floor. There is no R4 external, privacy, launch, strategic,
or irreversible action; EHR is not triggered.
