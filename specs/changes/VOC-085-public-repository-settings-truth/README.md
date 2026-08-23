# VOC-085 — Reconcile public repository settings and active guidance

Status: **draft plan; not adopted and not implementation authority**.

This package responds to [GitHub issue #119](https://github.com/KARSIFT/vocanova-platform/issues/119).
The repository is now public, but several living documents still describe the
private-repository settings snapshot captured during VOC-080. The package will make
the hosted posture truthful as observed at a point in time while keeping the old
snapshot intact as historical evidence.

The read-only state is current as observed at 2026-08-24:

- `observed_at`/`as_of`: `2026-08-24`;
- source: read-only GitHub REST API;
- point-in-time observation only; the network-free guard proves internal consistency,
  not live freshness;
- stale after a later settings mutation or when the observation cannot be independently
  reverified; any future mutation requires an immediate governed doc-only follow-up.

- public repository; default branch `main`;
- merge commits and squash merges enabled, rebase merges disabled;
- automatic branch deletion disabled;
- Actions enabled with selected actions, required SHA pinning, read-only default
  workflow token permissions, and pull-request review approval disabled;
- no repository rulesets; `develop` and `main` branch-protection reads returned HTTP
  404 (unprotected);
- Dependabot security updates disabled; secret scanning, push protection, and
  validity checks disabled.

These are point-in-time observations, not authorization to change settings. Desired
mature controls—branch rulesets, protected `develop`/`main`, security alerts/scanning,
and any future release protections—remain explicitly prospective and held by
`VOC-085-HOLD-00`. GitHub's public-repository availability does not mean a control is
configured.

VOC-080's private-repository snapshot remains immutable historical evidence in
[`voc-080-transition-record.md`](../../docs/operations/voc-080-transition-record.md)
and its JSON source. No file in that record is rewritten to make it resemble the
public state current as observed at 2026-08-24.

The package authorizes no deployment, Cloudflare/Sentry/DNS/server action, secret or
production-data access, repository/environment settings mutation, `main` promotion,
branch deletion, or issue closure before final merge and post-merge proof. Normal
isolated task branches, pull requests, and separately authorized repository merges are
not prohibited. A distinct R4 repository-governance/settings specialist must review the
exact final revision; specialist evidence is pending until that review occurs.
