# VOC-080 — Cloudflare-native runtime, evidence-driven CI/CD, and external Ruflo orchestration

Status: adopted for repository-only implementation authority on merge of plan PR #86.
The exact candidate revision received independent review, and the adoption record is
complete. A role other than the package author must merge the plan PR before implementation
begins.

VOC-080 replaces the old server-hosting direction with a staged Cloudflare-native
architecture and defines Ruflo as an external development orchestrator. GitHub remains
the canonical evidence and deterministic-check layer. The package deliberately separates
repository implementation authority from live Cloudflare, DNS, spend, secret, data, and
production activation authority.

The migration is ordered: CI/CD clarity first, then Cloudflare web compatibility, API and
D1 parity, synthetic data migration, deployment controls, and only then retirement of the
old server assets. No task may claim that a live environment changed unless separately
authorized and evidenced.

Primary intake: [GitHub issue #85](https://github.com/KARSIFT/vocanova-platform/issues/85).
