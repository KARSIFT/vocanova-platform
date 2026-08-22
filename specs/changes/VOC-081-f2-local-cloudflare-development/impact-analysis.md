# VOC-081 Impact Analysis

## Consequence classification

R3 is the effective floor. The package changes local D1 migration execution, Worker
configuration/origins, development process supervision, and CI-required evidence. It
does not alter production data, remote resources, or deployment authority. R4 is not
warranted unless implementation discovers a governance replacement, irreversible data
effect, live action, or material production architecture change; such work is outside
scope and requires a new package or explicit escalation.

## Security and privacy

Primary risks are accidental remote binding, credential discovery, auth-origin drift,
unsafe local debug endpoints, token/cookie logging, and orphaned processes. Controls:

- explicit `--local`, configs, persistence, ports, and no-auto-provision flags;
- denylisted remote/deploy/staging/production commands in executable policy;
- no `.dev.vars` requirement and no provider/email/OAuth/AI invocation;
- technical fixtures only, no auth bypass or production-shaped personal data;
- redacted bounded logs and local loopback listeners; and
- exact security review of scripts, configs, and origin/cookie implications.

## Data and migration integrity

Only local D1 is mutated. The initializer applies existing forward migrations through
Wrangler and reuses its migration table. Tests use disposable state, prove replay, and
never run destructive reset against developer state. A failed migration must preserve
prior successful migrations and expose failure. No PostgreSQL or production export is
used.

## Reliability and process lifecycle

Risks include silent port fallback, readiness races, a dead API with a live web process,
orphaned children, signal loss, nondeterministic state paths, and CI hangs. Controls are
preflight port ownership, API-first readiness, bounded polling, one supervising parent,
signal escalation, sibling teardown, finite timeouts, and negative failure injection.

## CI/CD and governance

Any new job remains inside `ci.yml`, uses the shared frozen toolchain, has read-only
permissions and timeouts, and joins the required aggregate. Exactly four workflows and
the no-local-orchestrator boundary remain invariant. Generated Next agent instructions
are disabled and explicitly rejected.

## Developer experience

The fast edit loop and production-like Worker loop serve different needs and must be
named honestly. The latter may rebuild before startup and is slower. Unsupported host
platform behavior is documented; Linux CI is authoritative. Commands fail with fixes,
not silent port changes or hidden background processes.

## Operations and cost

No Cloudflare account or cost is possible from package commands. F3 resource, secret,
budget, domain, staging, and rollback actions remain under VOC-080-HOLD-00. Production
and learner-data holds remain unchanged.

## Risks and mitigations

- `VOC-081-RISK-00`: a local command reaches remote D1/Workers. Mitigation: explicit
  local flags, policy scanning, synthetic negative fixtures, no credentials.
- `VOC-081-RISK-01`: browser and service-binding paths hit different origins/revisions.
  Mitigation: canonical port/origin manifest and end-to-end marker test.
- `VOC-081-RISK-02`: migration state diverges or is reset. Mitigation: explicit state
  path, forward-only apply, replay/persistence tests, no reset in ordinary commands.
- `VOC-081-RISK-03`: children survive or CI hangs. Mitigation: bounded supervisor,
  signal tests, child-exit propagation, workflow timeout.
- `VOC-081-RISK-04`: Next regenerates nested authority instructions. Mitigation:
  supported `agentRules: false`, tree-clean test, authority-policy guard.
- `VOC-081-RISK-05`: F2 closure is mistaken for staged product acceptance. Mitigation:
  final record names F3/A1 and inherited holds as unresolved.

## Rollback

Each task is independently revertible. Reverting scripts/config/docs removes only local
developer capability and ignored state; it does not touch a live service. Developers
may retain ignored local D1 state across a repository rollback, so docs must explain
how to archive or deliberately remove a specific local state directory without broad
recursive deletion. Final reverse-order rollback reproduces the T12 base tree.
