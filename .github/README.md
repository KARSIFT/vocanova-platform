# GitHub Configuration

This directory contains repository contribution and governance controls:

- `pull_request_template.md` records traceability, risk, evidence, impact, verification,
  and approvals with a lightweight R0 path.
- `ISSUE_TEMPLATE/` provides governed change intake and private security routing.
- `CODEOWNERS` uses the verified human repository identity for review routing. It is
  not approval evidence and does not create a standing post-A-003 authority.
- `workflows/ci.yml` runs the repository's deterministic validation command.
- `workflows/governance.yml` validates repository structure and prevents a pull request
  from declaring a risk below its changed-path floor.
- `workflows/quality.yml` runs path-filtered accessibility and Lighthouse checks.
- `workflows/security.yml` audits dependencies and scans changed history for secrets.

## VOC-078 transition

T00 proved the four replacement workflows on a real pull request. T01 removed the
three external control-plane callers (`pipeline.yml`, `change-package.yml`, and
`package-release.yml`). GitHub Actions no longer plans, adopts, implements, reviews,
remediates, merges, releases, opens task issues, or advances packages, and no workflow
references `KARSIFT/karsift-ai-infra`.

During the remaining transition, older standalone quality/governance workflows and
server-bound deploy/monitor workflows still coexist with the four target files. T03
removes server-bound automation; T04 removes superseded deterministic duplicates.
Until then, the exact current inventory is the files in this directory, not the final
four-file target.

The four target workflows use read-only repository permissions and deterministic local
commands. They do not call an AI model or write to GitHub. Requirements, human/agent
work, independent review, and merge decisions are recorded through ordinary issues,
branches, pull requests, and comments. GitHub Free does not technically enforce private-
repository branch protection, so policy and evidence must not be described as a hosted
enforcement capability that does not exist.

See [`docs/governance/repository-settings.md`](../docs/governance/repository-settings.md)
for the continuously maintained built-versus-pending record. DOC-17 and DOC-18's
unbuilt Control Plane remains superseded and archived under `docs/archive/`.
