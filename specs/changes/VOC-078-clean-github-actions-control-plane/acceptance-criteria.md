# VOC-078 — Acceptance Criteria

## VOC-078-AC-00 — Workflow inventory is minimal

- Exactly `ci.yml`, `governance.yml`, `quality.yml`, and `security.yml` exist under
  `.github/workflows/`.
- No workflow references `KARSIFT/karsift-ai-infra`.
- Evidence: `VOC-078-EV-00`

## VOC-078-AC-01 — CI remains complete and deterministic

- A pull request runs frozen installation, formatting, lint, typecheck, tests, and builds using
  committed package scripts and pinned Node/Go/pnpm versions.
- Local `pnpm validate` and governance checks pass in a clean environment.
- Evidence: `VOC-078-EV-01`

## VOC-078-AC-02 — Governance checks remain fail-closed

- Governance structure and changed-path risk-floor validation run on pull requests.
- Negative fixtures prove under-classified protected changes fail.
- No check relies on an AI verdict, issue comment, mutable external workflow, or untrusted shell
  interpolation.
- Evidence: `VOC-078-EV-02`

## VOC-078-AC-03 — Quality and security controls remain

- Accessibility and Lighthouse jobs run only for relevant web paths.
- Dependency audit and secret-oriented scanning run with read-only repository permissions.
- All third-party actions are pinned to immutable revisions.
- Evidence: `VOC-078-EV-03`

## VOC-078-AC-04 — Deployment and monitoring automation is paused

- No workflow deploys, promotes branches, SSHs to servers, mutates Cloudflare, queries Sentry,
  polls server health, or uses production/staging secrets.
- Existing runtime source and infrastructure files are unchanged.
- Documentation states that deployment is intentionally manual/unavailable pending a future
  hosting package; it does not claim production was stopped.
- Evidence: `VOC-078-EV-04`

## VOC-078-AC-05 — Agent authority is removed from CI

- Issue creation, labels, and comments do not trigger planning or implementation.
- The current orchestrator and Claude subagent assets are absent.
- No workflow or repository script can autonomously merge or close a PR/issue.
- Evidence: `VOC-078-EV-05`

## VOC-078-AC-06 — Documentation is truthful and concise

- `AGENTS.md`, `CONTRIBUTING.md`, `.github/README.md`, governance, operations, and ADR text agree
  with the four-workflow model.
- Historical approval evidence remains in Git history; active docs do not describe retired
  automation as live.
- Evidence: `VOC-078-EV-06`

## VOC-078-AC-07 — Reconstruction is reversible

- Reverting the task commits restores the pre-package workflows without data migration or server
  mutation.
- The rollback rehearsal passes syntax, governance, and diff validation.
- Evidence: `VOC-078-EV-07`
