# External Ruflo orchestration runbook

This runbook implements VOC-080-T02 and ADR-0004. It describes an operator-side
coordination aid. It does not grant repository, GitHub, Cloudflare, deployment,
production-data, spending, DNS, or launch authority.

## Installed and audited baseline

The 2026-08-22 operator installation is outside the repository at
`~/.local/share/vocanova-ruflo/3.38.16`. A fresh clone does not install or start it.
The installation has no repository launcher, daemon, hook, plugin, MCP registration,
or generated project instruction file.

| Artifact              | Exact evidence                                                                                                                                                                                                                                |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ruflo`               | `3.38.16`; upstream commit `5234333c3462640ab348363ba4a142945fd2bc47`; npm integrity `sha512-a9wmeKchybcjmG1XKXDJneliDkMCLLtAJWjiRLhkgLf2W7pFvEimDH1ZkQHM393XaJEpBCxSfKZ0NQe3/DfybA==`; npm shasum `bfc38266a41029fac7117c2f4ae62615033ec22b` |
| `@claude-flow/cli`    | `3.38.16`; same upstream commit; npm integrity `sha512-GrVRXJDWMCfrI949JOGU4PsVfR3WjzuKXN5vn9z/mGF13Z7IWWIRGgnl1uTwk3OH/qSKx5hhMEkF9tJPQKJfyA==`; npm shasum `0c8e93382c1ceb4b25fb19354c4bf5e07d72a4d3`                                       |
| External manifest     | SHA-256 `ebf74805d962a242243b22390d7c2e735b0f34d3d42626dfd6a5a0ff9327c134`                                                                                                                                                                    |
| Frozen pnpm lock      | SHA-256 `ffa811698b9d7c5d51b494a6841b95032e749e4abe79e20caba22c007b2e714d`                                                                                                                                                                    |
| pnpm settings         | SHA-256 `d1975780b0e4c284bf72ac1a2d0d9718f03eca5e3487d963d81a4a5800d37b17`                                                                                                                                                                    |
| VocaNova role overlay | SHA-256 `a7f644c69a1b703aa4226d91b4d517c98f04971a43373af065c9d64e4dd19202`                                                                                                                                                                    |

The external manifest pins both direct packages and overrides Ruflo's upstream
`@claude-flow/cli` caret dependency. pnpm's transitive overrides pin patched
`protobufjs 7.6.5`, `adm-zip 0.6.0`,
`@opentelemetry/propagator-jaeger 2.10.0`, and `sharp 0.35.3`. These overrides are
part of the reviewed resolution and must be retested on any upgrade.

Lifecycle scripts are disabled for installation and replay. This matters because the
CLI's postinstall rewrites installed `agentdb` directories and package exports. The
published Ruflo archive also carries a much larger development surface than its thin
wrapper requires, including bundled project, deployment, and mutable-state artifacts;
none are copied into VocaNova.

The first npm 11 replay was rejected because `@agntcy/slim-bindings 2.0.0-alpha.5`
declares three optional platform packages that are absent from the registry. The
incomplete npm lock is retained only as operator-side audit evidence. The operational
pnpm lock omits unavailable non-host optional artifacts and replays successfully with
lifecycle scripts disabled.

Verification after a clean frozen install:

- `ruflo --version` and the help implementation both report `3.38.16`;
- the resolved lock contains no `@claude-flow/cli 3.38.12` fallback;
- `pnpm audit --audit-level high` passes with zero critical and zero high findings;
- one optional moderate OpenTelemetry baggage-propagation advisory remains:
  `GHSA-8988-4f7v-96qf`;
- no background Ruflo or Claude Flow process remains after the bounded rehearsal.

An upgrade is a new supply-chain decision: recheck registry metadata, upstream commit,
archive contents, lifecycle scripts, the complete frozen graph, advisories, both
version surfaces, bounded initialization, and this runbook. Never execute a floating
`latest` reference.

## Authority and role shape

```text
adopted VOC package + GitHub issue
              |
      external task-orchestrator
       /       |       |       \
 planner   specialist  builder  independent reviewer
    |          |          |              |
 plan/impact  advice   isolated       read-only exact-SHA
 evidence              worktree       verdict; no test replay
       \         |         /              /
        GitHub PR, checks, review evidence
                       |
             read-only eligibility result
                       |
       accountable non-author merge actor
```

The task-orchestrator coordinates handoffs but cannot adopt a plan, change scope,
declare a check passing, approve a review, or complete an action-specific hold.
Participants are provider-neutral. A role is a responsibility and an actor is the
attributable human or separately instantiated AI participant assigned to it. A builder
and its exact-revision reviewer must be different actors with no authorship of the
reviewed revision; relabeling an actor, changing a prompt/session, or selecting a
different model/provider is not separation. Runtime provenance may harden evidence but
does not grant authority. A material reviewer edit makes that reviewer the builder of
the new SHA and requires fresh checks and a different reviewer. The non-author merge
actor audits exact evidence only; it cannot satisfy an action-specific hold. By
default, the assigned work unit is one coherent implementation pull request; task IDs
remain traceability groupings unless an adopted package explicitly records a justified
multi-PR boundary and rationale.

| Role                 | Workspace and output                                                                             | Permission ceiling                                                                                                              |
| -------------------- | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| Planner              | Read-only source plus a separate `plan/` worktree only when an approved planning task permits it | Proposes requirements and evidence; cannot adopt or authorize                                                                   |
| Task-orchestrator    | Sanitized external task ledger and worktree map                                                  | Coordinates only; cannot write GitHub or the product repository                                                                 |
| Builder              | Exactly one assigned isolated implementation worktree/PR unit                                    | May implement adopted scope; cannot review, merge, deploy, or use held data/secrets                                             |
| Specialist/tester    | Read-only exact revision or separately assigned test workspace                                   | Returns focused findings/evidence; cannot expand scope or authority                                                             |
| Independent reviewer | Read-only clean exact revision and completed deterministic evidence                              | Returns an exact-SHA verdict; does not duplicate completed long suites or start background processes without a specific finding |

Only the assigned integration participant changes shared manifests or lockfiles. Two
writers never share a worktree. The worktree map is keyed by implementation work
unit, normally one coherent PR rather than each task ID. A handoff identifies the
package, task-to-PR mapping, base, head SHA, owned paths, completed commands/results,
unresolved findings, rollback, and prohibited effects. GitHub holds the canonical
copy of the accepted evidence.

## Permission envelope

Ruflo's generated `strict` preset is useful evidence but not a security boundary. The
upstream source states that it does not enforce permissions at the syscall layer; the
preset currently defines only planner, researcher, and reviewer roles. The external
`vocanova-role-contract.json` adds the VocaNova task-orchestrator and builder semantics,
but it too is an operator contract rather than a sandbox.

Enforcement therefore comes from all of these layers together:

1. no repository-local launcher, state, generated instructions, or dependency;
2. no GitHub, Cloudflare, DNS, production, or paid-provider credentials supplied;
3. isolated worktrees and separate builder/reviewer participants;
4. repository guards and deterministic checks;
5. exact-SHA review and canonical GitHub evidence;
6. action-specific holds and EHR where genuinely applicable.

Denied actions include GitHub approve/comment/merge/close/dispatch, issue-triggered
execution, `ruflo init` in the repository, daemon/autopilot/background operation,
Cloudflare or DNS mutation, deployment, secret or production-data access, spending,
and public launch. A request for one is rejected or handed to the separately named
accountable role; it is never inferred from a task prompt.

Memory may contain sanitized development patterns, public repository identifiers, and
non-sensitive task status. Tokens, credentials, personal data, learner content,
production output, private provider payloads, raw prompts containing secrets, and
copied `.env` material are prohibited. Delete non-canonical memory after the task's
GitHub evidence is complete.

## Safe operating procedure

1. Confirm the task belongs to an adopted package and record its exact scope.
2. Confirm the external manifest, lock, settings, and role-overlay hashes above.
3. Use the exact installed binary, never `npx`, `latest`, an updater, or a repository
   package script.
4. Create Ruflo state only in a disposable external workspace. Do not run `init`,
   `start`, `daemon`, `autopilot`, `deployment`, `issues`, or MCP setup in the clone.
5. Start with no credentials and no sensitive environment. Add no tool merely because
   an upstream preset names it.
6. Assign one worktree per writer and retain a provider-neutral actor receipt with
   role, exact SHA, authorship independence, verdict/findings, and optional runtime
   provenance.
7. Give the reviewer the exact SHA and completed evidence. Explicitly prohibit
   duplicate long-running suites and background processes.
8. Publish only sanitized exact-SHA evidence to the pull request. A Ruflo receipt is
   provenance, never approval.
9. Stop and remove disposable state after handoff. Do not delete task branches while
   their pull requests remain open.

## Synthetic rehearsal record

The repository-only rehearsal ran on 2026-08-22 in
`/tmp/voc080-ruflo-rehearsal-patched`, not in the clone. The process received an empty
environment with only a bounded executable path. The exact CLI initialized swarm
`swarm-1787393797659-6gn8g2` using hierarchical topology, specialized strategy, four
maximum agents, and the strict preset. It created only `.swarm/` and `.claude-flow/`
inside the disposable directory. No agent/provider was launched, no network host or
credential was allowed, and no background process remained.

The synthetic handoff represented separate planner, task-orchestrator, builder, and
independent-reviewer participants. The reviewer received completed evidence, did not
repeat a long suite, started no process, and returned
`PASS-synthetic-boundary-only`. The receipt SHA-256 is
`db1b67fbe0895d91b6e013ed0d99ad1346ca69df92b500620877355f7dd1e564`.
That verdict proves only the rehearsal contract; it is not the independent review of
the T02 implementation revision.

The rehearsal also exposed two upstream behaviors that this boundary deliberately
contains: `swarm init` labels its persisted swarm state `running` even though it starts
no process, and the strict preset is advisory and incomplete for VocaNova's role set.
Neither label is treated as hosted enforcement or authority.

## Rollback

Rollback is operator-side and repository-safe: stop any Ruflo process if one was
separately started, quarantine or remove only the exact versioned installation and
its disposable workspaces, and remove non-sensitive Ruflo memory/configuration. Do
not touch the repository worktrees, GitHub evidence, or live systems. Because no
tracked runtime depends on Ruflo, CI and ordinary role-separated development continue
without it.
