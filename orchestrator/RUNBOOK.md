# Running the agent orchestrator

What this is: one script that runs the implement → review → merge → deploy
loop end-to-end, holding real context the whole way instead of relaying
through PR/issue comments between cold-started jobs. See the diagram from
the design discussion for the shape (`vocanova-agent-loop` artifact) — this
is the core of it: orchestrator, implementer, reviewer, merge, staging,
production. Self-healing (monitoring → new task) and auto-rollback aren't
built yet; this is the loop everything else attaches to next.

## 1. Prerequisites (install once, on whatever machine runs the loop)

- **Node** `24.18.0` (matches `.nvmrc`) — `nvm use`
- **pnpm** `11.14.0` — `corepack enable` or `npm i -g pnpm@11.14.0`
- **git**, with push access to this repo
- **`gh`** (GitHub CLI), authenticated with repo write + workflow scopes:
  `gh auth login` then `gh auth status` to confirm. The orchestrator uses
  `gh` for every GitHub write (issue comments, PRs, merges, triggering
  deploy workflows) — nothing here uses a bare API token directly.
- **`claude`** (Claude Code CLI), authenticated (`claude auth login`, or
  `ANTHROPIC_API_KEY` set in the environment). **Run `claude --help` and
  sanity-check the flags this script uses** (`-p`, `--permission-mode`,
  `--disallowedTools`, `--output-format`, `--model`) against your installed
  version before trusting it unattended — this was written without a live
  install to verify against, and CLI flags do change across versions.

## 2. Configure

Environment variables (all optional, sane defaults shown):

| Variable | Default | Meaning |
|---|---|---|
| `BASE_BRANCH` | `main` | branch tasks are built from and merged into |
| `MAX_ATTEMPTS` | `3` | implement/review retries before escalating to a human |
| `READY_LABEL` | `agent:ready` | issue label the `--watch` poller looks for |
| `POLL_INTERVAL_SECONDS` | `60` | how often `--watch` checks for new labeled issues |
| `AUTO_DEPLOY_PRODUCTION` | `false` | if `true`, promotes to production automatically once staging is healthy. **Leave this `false` until you've watched it run a few times** — this is a live app with real users; start by reviewing the staging result yourself and promoting by hand (`gh workflow run deploy-production.yml`) until you trust it. |
| `IMPLEMENTER_MODEL` / `REVIEWER_MODEL` | CLI default | pin specific models if you want; leave unset to use whatever `claude` defaults to |

## 3. Run it once, against a real issue (do this first)

```bash
cd vocanova-platform
node orchestrator/run.mjs --issue 123
```

Watch it work. It will: check out `agent/issue-123-<slug>`, run the
implementer, run your actual `pnpm lint/typecheck/test/build`, push, run the
reviewer, and either merge + deploy to staging or loop back with findings.
Read `orchestrator/logs/123.log` alongside the terminal output.

**Do this supervised the first several times.** Don't turn on `--watch` or
`AUTO_DEPLOY_PRODUCTION` until you've seen it handle at least a few real
issues correctly, including at least one that fails review and retries.

## 4. Run it continuously, unattended

```bash
AUTO_DEPLOY_PRODUCTION=true \
node orchestrator/run.mjs --watch
```

This polls open issues labeled `agent:ready` every `POLL_INTERVAL_SECONDS`
and processes each one it hasn't seen yet, in sequence. To feed it work,
label an issue `agent:ready` — nothing else needs to trigger it.

To keep this alive on a server rather than a terminal: run it under
`systemd` (a `[Service] Restart=always` unit), `pm2`, or as a scheduled,
long-running job in whatever you already use for that. A plain `nohup
node orchestrator/run.mjs --watch &` works for a first trial but won't
survive a machine restart.

## 5. What still needs you

Same four triggers as the design: retries exhausted (posted as an issue
comment, tagged for you), anything requiring an action with no API (a
dashboard click only a human can do — don't file those as `agent:ready`
issues, they'll just burn 3 attempts and escalate anyway), real product
ambiguity, and a production deploy repeating a rollback. Everything else is
meant to run without you.

## 6. Relationship to the existing `pipeline.yml`

This does not touch `.github/workflows/pipeline.yml` or `karsift-ai-infra`
yet. Both can run side by side. Once you've watched the orchestrator handle
real issues correctly, the natural next step is retiring `pipeline.yml`'s
`implement`/`review`/`adopt`/`merge-gate` jobs (keep `ci.yml`'s deterministic
checks and the deploy workflows — this script calls those same
`deploy-staging.yml`/`deploy-production.yml` files, it doesn't replace them)
— that's a deliberate follow-up, not done here.
