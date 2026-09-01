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

## Why this is one package and five implementation PRs

The outcome is one governance replacement, so it remains one package. Five PRs are
required because GitHub settings, immediate truth documentation, pre-change
verification, and EHR form real boundaries:

1. Prepare dual-compatible checks and an immutable pre-change verifier.
2. Apply both qualified-human EHR outcomes and their minimal required correction.
3. Immediately record additive, old-flow-compatible live settings after authorization.
4. Perform the coherent cleanup only after EHR resolution, still applying frozen
   pre-change authority through the final old-model promotion and synchronization.
5. After the final old-model synchronization, activate the future settings and
   immediately record final branch-retirement truth.

This accepts several final old-process reviews to avoid self-authorization, stale
settings claims, an enforcement gap, or silent EHR supersession.

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
are resolved, adoption bookkeeping is recorded under the current rules before any
implementation PR begins. The accountable adoption decision owner is the
founder-repository-owner. Repository review never satisfies the separately held live
GitHub settings actions.
