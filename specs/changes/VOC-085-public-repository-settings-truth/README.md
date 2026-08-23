# VOC-085 — Reconcile public repository settings and active guidance

Status: **draft plan; not adopted and not implementation authority**.

This package responds to [GitHub issue #119](https://github.com/KARSIFT/vocanova-platform/issues/119).
The repository is now public, but several living documents still describe the
private-repository settings snapshot captured during VOC-080. The package will make
the current hosted posture truthful while keeping the old snapshot intact as
historical evidence.

The read-only state observed on 2026-08-23 is:

- public repository; default branch `main`;
- merge commits and squash merges enabled, rebase merges disabled;
- automatic branch deletion disabled;
- Actions enabled with selected actions, required SHA pinning, read-only default
  workflow token permissions, and pull-request review approval disabled;
- no repository rulesets; `develop` and `main` branch-protection reads returned HTTP
  404 (unprotected);
- Dependabot security updates disabled; secret scanning, push protection, and
  validity checks disabled.

These are observations, not authorization to change settings. Desired mature controls
—branch rulesets, protected `develop`/`main`, security alerts/scanning, and any future
release protections—remain explicitly prospective and held. GitHub's public-repository
availability does not mean a control is configured.

VOC-080's private-repository snapshot remains immutable historical evidence in
[`voc-080-transition-record.md`](../../docs/operations/voc-080-transition-record.md)
and its JSON source. No file in that record is rewritten to make it resemble the
current public state.

The package authorizes no deployment, Cloudflare/Sentry/DNS/server action, secret or
production-data access, repository/environment settings mutation, `main` promotion,
branch deletion, or issue closure before final merge and post-merge proof.
