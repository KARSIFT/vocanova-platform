# VOC-002 — Release Plan

## Release and deployment authorization

This is repository governance adoption into `develop`, not a production release.
Automatic merge and autonomous production release remain disabled. Codex must not
merge the PR.

## Pre-merge transition

Require passing deterministic validation, independent Claude verification bound to
the exact final head, and approval by `@m-e-h-r-d-a-a-d` explicitly in both R4 founder
and one-time R3 technical-steward capacities bound to that same SHA.

## Adoption and activation

After merge, record the approved PR head SHA and the distinct resulting adopted
`develop` SHA. Run governance validation on that adopted state and record its durable
evidence. Only then may effective activation and migration-approval exhaustion be
recorded. The adoption PR cannot claim these future facts.

## Canonical lifecycle synchronization

A later small PR may synchronize already-completed activation fields and appointment
status. Under active A-003 it does not require founder or standing steward approval
merely because paths are R3, unless it makes a separate R4 decision.

## Rollback

Before dependent A-003 work, revert the adoption commit. Preserve the amendment,
approval, adoption, and appointment evidence as history. If dependent changes exist,
prepare a separately governed rollback package and impact analysis.

## Independent verification, human approvals, and closure

Repository adoption remains pending exact-SHA Claude, founder, and transition-steward
evidence. Effective activation and package closure remain pending post-merge evidence.
