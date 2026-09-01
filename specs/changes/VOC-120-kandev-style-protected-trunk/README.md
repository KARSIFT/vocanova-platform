# VOC-120 — Kandev-style protected trunk

## Status

Draft R4 governance replacement. Issue
[#232](https://github.com/KARSIFT/vocanova-platform/issues/232) is the requirement
source. The package is not adopted and grants no implementation or GitHub settings
authority.

## Objective

Replace VocaNova's governance-heavy default workflow with a clean system modeled on
the useful operational properties of Kandev:

```text
short-lived branch
  -> focused pull request
  -> path-aware always-reporting checks
  -> attributable review appropriate to consequence
  -> resolved threads
  -> protected main merge queue
  -> squash merge
  -> separately authorized staging or production action
```

Routine reversible work should take one PR. Protected work receives stronger tests
and specialist review. Real external effects remain human-authorized.

## Why this is one package and two implementation PRs

The outcome is one governance replacement, so it remains one package. The delivery
has two implementation PRs because GitHub settings form a hard external-action and
rollback boundary:

1. Prepare the repository and dual-compatible checks on `develop` without deleting
   the old enforcement path.
2. Promote and synchronize once under the pre-change rules, activate and verify
   native `main` protection, then remove legacy machinery through protected `main`.

This avoids deleting the controls needed to review the change itself and prevents a
period in which neither old nor new enforcement is effective.

## Scope

- One normative governance/contribution source.
- Standard, Protected, and External Action lanes.
- Concise PR and issue surfaces.
- Internal path selection with stable aggregate check names.
- Native review/check/thread evidence.
- Protected single `main`, squash history, merge queue, and immutable version tags.
- Removal of active nine-file packages, historical-prose replay, merge-eligibility
  polling, duplicated policy wording, and reverse-synchronization machinery.
- Explicit EHR resolution and external-action boundaries.

## Non-goals

- No learner-facing feature or behavior change.
- No Cloudflare, deployment, production, DNS, learner-data, secret-value, spending,
  contract, or launch action.
- No silent resolution of PR #215 or issue #231.
- No wholesale copy of Kandev's workflow count, spec corpus, admin bypass, or review
  policy.

## Reference evidence

The Kandev comparison is bound to commit
`b4f1933812a15f27cd3f07a355a62e576d12a9f1`, especially its contribution guide,
concise PR template, main ruleset/merge-queue record, internal path selection,
review automation, stale approval cleanup, and immutable tag rule.

## Authority and review

The replacement is evaluated under the authority effective before it. A distinct
non-author reviewer must assess the exact plan candidate. After all blocking findings
are resolved, adoption bookkeeping is recorded under the current rules before either
implementation PR begins. Repository review never satisfies the separately held live
GitHub settings actions.
