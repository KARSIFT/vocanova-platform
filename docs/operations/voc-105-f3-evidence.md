# VOC-105 F3 staging-foundation evidence record

Status: **F3 staging foundation complete-effective**.

The canonical structured source is
[`voc-105-f3-evidence.json`](voc-105-f3-evidence.json). This current record evaluates
every DOC-12 F3 gate item; it does not infer milestone completion from one successful
delivery run.

## Milestone gate

Repository/local F2 is complete-effective through [PR #108](https://github.com/KARSIFT/vocanova-platform/pull/108).
The bounded VOC-094 Phase 1 record proves isolated staging resources, privacy-safe
observability, compatible migrations, and the rollback baseline/rehearsal
([evidence](https://github.com/KARSIFT/vocanova-platform/issues/158#issuecomment-5438014817));
Phase 2 records sanitized external closure
([evidence](https://github.com/KARSIFT/vocanova-platform/issues/158#issuecomment-5438136312)).
The standard protected environment and credential boundary is established by VOC-100
PRs [#175](https://github.com/KARSIFT/vocanova-platform/pull/175) and
[#179](https://github.com/KARSIFT/vocanova-platform/pull/179), VOC-101
[#178](https://github.com/KARSIFT/vocanova-platform/pull/178), and the sanitized
[settings readback](https://github.com/KARSIFT/vocanova-platform/issues/158#issuecomment-5471376705).

Together with the exact successful delivery event below, those records validate the
DOC-12 gate: the workerd-proven application foundation was delivered through the
documented isolated staging path, observed, smoke-tested, and shown reversible.

## Delivery event

[CI run 33386240492](https://github.com/KARSIFT/vocanova-platform/actions/runs/33386240492),
attempt 1, ran at exact event SHA
`03528a84988ebe664207c6a439e133070627c92a`. Required validation, the delivery gate,
and staging job succeeded. D1 migration, immutable upload, exact promotion, bounded
smoke, and sanitized outcome succeeded. Rollback after promotion failure was
`skipped-expected` because promotion and smoke succeeded. Production was
`skipped-held`. The sanitized completion record is
[here](https://github.com/KARSIFT/vocanova-platform/issues/158#issuecomment-5477915272).

## Boundary

This record makes only the F3 staging-foundation acceptance claim. A1 and P1+
acceptance remain unresolved; production readiness and traffic, learner-data access,
and public launch remain held or unresolved. `VOC-080-HOLD-01` and
`VOC-080-HOLD-02` remain held. Future staging dispatches still require their own
authority and evidence.

VOC-094 through VOC-104 remain immutable historical snapshots. This later exact
record supersedes their prospective pending language only for current F3 status; it
does not rewrite their evidence. VOC-105 performed no Cloudflare or GitHub query or
mutation, dispatch, deployment, migration, traffic/DNS change, secret handling,
production/data access, spending, or launch action. No token value or immutable
Worker-version identifier is recorded.
