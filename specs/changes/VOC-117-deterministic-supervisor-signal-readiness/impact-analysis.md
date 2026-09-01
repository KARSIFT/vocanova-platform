# VOC-117 — Impact Analysis

## Classification and root cause

The automated path floor for `scripts/foundation/local-development-supervisor.test.mjs`
is R1. The highest semantic class is R3 because this test is part of the required
foundation CI verifier for local-process lifecycle and signal cleanup. A false pass
could conceal a real child-shutdown defect or weaken evidence at a required gate. The
change is repository-only, reversible, credential-free, and does not affect the
runtime implementation or external systems; it is not an R4 decision.

The defect is a missing readiness precondition. Parent elapsed time (`delay(75)`) does
not prove that a newly spawned child evaluated its signal handler. On a loaded hosted
runner, SIGINT can therefore use Node's default behavior and produce `code: null`
before the fixture's handler is installed. `SupervisedChildren` correctly records
that outcome; its implementation is not the defect.

## Exact baseline and evidence

- Base: `origin/develop` at
  `b22a735fa5986023a7795c3f7cb89af7cf1cfccb`.
- Intake: issue #221.
- Candidate: `d464d7b2a07d8e43213ae89471c4a8b8461e7781` from PR #219.
- Hosted run/job: `33508619896` / `99858760273`.
- Result: 203 pass, 1 fail, 204 total; 794,979 ms.
- Failure: SIGINT case line 306, `null !== 23`; SIGTERM neighbor passed.
- Current focused base check: the three relevant local tests pass, but this does not
  establish startup readiness and is not a substitute for hosted evidence.

## Privilege and self-modification analysis

The only future implementation path is the focused test file. There is zero
permission, trigger, secret, credential, network, workflow, dependency, runtime,
deployment, merge, release, or live-system expansion. DOC-16 self-modification rules
do not apply because no governance, validator, review condition, agent authority, or
runtime supervisor source changes. An exact-SHA cross-model R3 review is required as
defense in depth for this required verifier; it is evidence only and cannot authorize
an action.

## Impact matrix

| Area                                   | Status                | Analysis                                                                                                                                                |
| -------------------------------------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Product scope / UX / users             | Not affected          | No product or learner-facing behavior changes.                                                                                                          |
| Supervisor runtime                     | Preservation-critical | `local-development-supervisor.mjs` remains unchanged; existing signal, grace, force-kill, close, diagnostics, and sibling semantics stay authoritative. |
| Foundation CI / testing                | Affected              | The race precondition becomes an exact bounded child-ready handshake; all existing assertions remain.                                                   |
| Living documents                       | Not affected          | `docs/development.md` describes the unchanged runtime contract and needs no test-internal wording.                                                      |
| Package scripts / workflow             | Not affected          | `package.json`, `pnpm-lock.yaml`, `.github/workflows/ci.yml`, and exact `ci:foundation` discovery remain unchanged.                                     |
| API / frontend / database / migrations | Not affected          | No application or data surface is changed.                                                                                                              |
| Security / privacy / credentials       | Not affected          | Fixtures are synthetic, local, credential-free, and network-free.                                                                                       |
| Accessibility / analytics / AI         | Not affected          | No UI, telemetry, model, or evaluation behavior changes.                                                                                                |
| Performance                            | Affected-test-only    | Positive startup wait is bounded at no more than 5,000 ms; negative cases use short injected bounds. No production timeout changes.                     |
| Deployment / Cloudflare / production   | Prohibited and held   | No dispatch, environment, resource, traffic, DNS, production, or learner-data action exists.                                                            |
| Rollback / operations                  | Affected              | One-file revert restores the true parent; post-merge monitoring watches exact foundation and aggregate outcomes.                                        |

## Exact implementation inventory

The future implementation must change exactly:

1. `scripts/foundation/local-development-supervisor.test.mjs`

Inspected preservation surfaces are `scripts/foundation/local-development-supervisor.mjs`,
`docs/development.md`, `package.json`, `pnpm-lock.yaml`, and
`.github/workflows/ci.yml`. No source, docs, script, workflow, or dependency change is
needed because the test file is already included by `node --test scripts/foundation/*.test.mjs`
inside the unchanged `pnpm run ci:foundation` command.

## Failure modes and controls

- Handler race: exact post-registration sentinel and parent await.
- Sentinel omitted or wrong: bounded timeout negative and cleanup.
- Output split/buffered: stream listener plus buffered-output inspection.
- Child exits early/errors: outcome-specific rejection and `finally` cleanup.
- Marker emitted too early: deterministic source-order mutation failure.
- Fixed delay returns: no-fixed-delay source/mutation audit failure.
- Changed expected code: SIGINT/SIGTERM outcome assertions fail.
- Timer/listener leak: settle checks, disposal, and complete foundation run.
- Runtime semantic drift: exact one-file inventory and untouched-source audit.
- Reviewer coupling: distinct specialist, cross-model verifier, and merge actor with
  fresh evidence per exact revision.

## Delivery shape and external effects

One task and one implementation PR are the largest safe coherent unit. Helper,
fixtures, negatives, preservation proof, and rollback must land together; splitting
would create an unproven intermediate verifier. The plan and implementation are
network-free repository work. They do not query or mutate settings, secrets,
Cloudflare, production/learner data, DNS/traffic, spending, release, or launch state.
