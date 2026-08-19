# Running the agent orchestrator (temporary, pending VOC-078-T02 removal)

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
  `ANTHROPIC_API_KEY` set in the environment). The flags this script uses
  (`-p`, `--permission-mode acceptEdits`, `--disallowedTools`,
  `--output-format json`, `--model`) were verified against a live install
  (Claude Code CLI 2.1.233) via `claude --help` on 2026-08-15 — all five are
  current and valid at that version. CLI flags can still change across
  versions, so re-verify with `claude --help` if the installed version has
  moved on since, but this is no longer an open, never-checked assumption.

## 2. Configure

Environment variables (all optional, sane defaults shown):

| Variable | Default | Meaning |
|---|---|---|
| `BASE_BRANCH` | `develop` | branch tasks are built from and merged into. This repo uses `develop` for integration and `main` for production history. |
| `PRODUCTION_BRANCH` | `main` | where `BASE_BRANCH` gets promoted to when `AUTO_DEPLOY_PRODUCTION=true` |
| `MAX_ATTEMPTS` | `3` | implement/review retries before escalating to a human |
| `READY_LABEL` | `agent:ready` | issue label the `--watch` poller looks for |
| `POLL_INTERVAL_SECONDS` | `60` | how often `--watch` checks for new labeled issues |
| `AUTO_DEPLOY_PRODUCTION` | `false` | **Leave this false.** Promotion is prohibited during VOC-078 reconstruction; the previous package release workflow was retired in T01 and no replacement is authorized. |
| `IMPLEMENTER_MODEL` / `REVIEWER_MODEL` | CLI default | pin specific models if you want; leave unset to use whatever `claude` defaults to |

Neither `deploy-staging.yml` nor `deploy-production.yml` is triggered directly by this script — both already fire on their own `push` trigger (to `develop` and `main` respectively). The orchestrator merges, then watches for the run that push already started; it never dispatches these workflows itself, which matters for `deploy-production.yml` specifically since its `workflow_dispatch` inputs (production hostnames, Cloudflare cutover mode) are meant for a deliberate manual re-run, not an automated one.

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

## 6. Relationship to GitHub Actions

VOC-078-T01 retired the external planning/review/merge/release workflow relay.
GitHub Actions now performs deterministic checks only; it does not trigger this
script or act as its fallback. Any use before T02 removal must still create an
ordinary pull request, run the repository checks, attach exact-revision independent
review, and obey DOC-16. Production promotion is disabled during reconstruction.
