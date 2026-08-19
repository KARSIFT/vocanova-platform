# VOC-078 — Clean GitHub Actions Control Plane

**Status: draft. This package is not adopted and does not authorize implementation.**

## Purpose

Replace the current external, agent-driven GitHub Actions control plane with a small,
self-contained set of deterministic repository checks. Pause deployment and server-health
automation while the future server architecture is undecided.

## Requirement sources

- [GitHub issue #69](https://github.com/KARSIFT/vocanova-platform/issues/69): remove every
  `KARSIFT/karsift-ai-infra` dependency and preserve essential safety properties.
- Founder clarification on 2026-08-19: reconstruct the repository step by step; prioritize
  clean, understandable GitHub Actions; do not invest in deployment or server-health logic
  because the server may change.

The clarification is recorded as planning input only. Adoption of this R4 package is the
canonical approval event.

## Proposed outcome

The target `.github/workflows/` contains only four narrowly scoped workflows:

1. `ci.yml` — deterministic install, lint, typecheck, test, and build.
2. `governance.yml` — governance structure, risk-floor, and diff checks.
3. `quality.yml` — path-filtered accessibility and Lighthouse checks.
4. `security.yml` — dependency and secret-oriented checks with read-only permissions.

There are no issue-driven planners, AI implementers/reviewers, remediation loops,
automatic merge gates, package auto-advance jobs, production release jobs, deployment jobs,
or scheduled Sentry-to-GitHub issue creation jobs.

Application code, runtime infrastructure, migrations, legal documents, and production data
are outside this package.

## Risk and authority

This is R4 because it replaces governance enforcement and suspends the existing automatic
production release/deployment path. Founder approval and exact-revision independent
verification are required. `automatic_merge_allowed` is therefore `false`.

See the remaining package files for scope, observable acceptance criteria, task ordering,
validation, and rollback.
