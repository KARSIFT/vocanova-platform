# VOC-006 — F2 Next.js Application Foundation

## Identity and lifecycle

- Change ID: `VOC-006`
- Status: `completed`
- Package-adoption risk: `R3`
- Expected implementation risk floor: `R2`, subject to the actual implementation diff
- Requirement source: founder-approved GitHub issue #19
- Roadmap slice: `F2-I03`; planned grouping `PR-F2-02`
- Base branch: `develop`
- Exact grounded base: `e97cce408c19312d1f88afb8be4bffa697d98a82`
- Canonical path: `specs/changes/VOC-006-f2-nextjs-application-foundation`

PR #20 adopted the exact package candidate
`2d6996234c2c9132bef2f59a018008788809a71c` into canonical `develop` at
`b02327e995c7d0e754ea1a2a0a9ad331cb67145f` after deterministic and hosted checks,
applicable routine-R3 controls, and exact-revision Claude Code verification returned
`PASS`. The verification evidence is
<https://github.com/KARSIFT/vocanova-platform/pull/20#issuecomment-5011433552>.
PR #21 then synchronized that completed package-adoption history into the canonical
lifecycle records at `b1005adc7922c544b8773ff0b7af5b72bf7c6693` without changing
the package scope or implementing F2-I03.

PR #22 implemented only F2-I03. Claude Code independently reviewed exact
implementation candidate `bda66e379065a59b52a88758933e912d22bf7a38` and returned
`PASS WITH NON-BLOCKING FINDINGS`; the PR was manually squash-merged into `develop`
on `2026-07-18T21:02:34Z` as canonical implementation adoption
`857a700faebbdd6b0095f2236419ae8016cea91f`. F2-I03 implementation is complete.
Issue #19 closes only when the final lifecycle synchronization PR is validly merged.
These events grant no deployment, production release, automatic merge, autonomous
release, RL1/RL2 activation, or F2-I04 or later authority.

## Objective

Authorize only `F2-I03 — Scaffold the Next.js App Router web application`: convert the
framework-neutral TypeScript skeleton at the existing `apps/web` root into the smallest
real, runnable Next.js App Router foundation. The result proves framework rendering,
development, build, lint, type-check, styling, and frozen-install behavior without
product behavior.

## Approved boundaries

The later implementation may add supported stable, exactly pinned Next.js, React,
React DOM, Tailwind CSS, and directly required framework dependencies; minimal App
Router files; real commands; framework-aware configuration; lockfile updates; and
narrow workspace integration or documentation strictly necessary for a coherent web
foundation.

It may not add product screens, auth, API/data access, backend work, test harnesses
scheduled later in F2, deployment, infrastructure, automatic merge, autonomous
activation, or F2-I04 and later scope. The placeholder page is technical and minimal,
not fake product UI. The frontend never accesses PostgreSQL directly.

## Risk, verification, and adoption

This package changed protected `specs/README.md`, establishing an R3 package-adoption
path floor. The implementation reached R2 because it changed dependency manifests and
the lockfile; independent review confirmed R2 as the highest path, semantic, builder,
verifier, security, or authority assessment of the exact implementation diff.

Package adoption completed through PR #20, its lifecycle was synchronized through PR
#21, and bounded F2-I03 implementation completed through PR #22 after their respective
deterministic and hosted checks and exact-SHA Claude Code verification. The
implementation verdict was `PASS WITH NON-BLOCKING FINDINGS`. Active A-003 did not
require standing founder or technical-steward approval merely because package work
was routine R3; R4 remains founder-controlled and EHR was not triggered. The completed
F2-I03 implementation grants no automatic merge, deployment, release, F2-I04 or later
work, RL1/RL2, or autonomous-development activation.
