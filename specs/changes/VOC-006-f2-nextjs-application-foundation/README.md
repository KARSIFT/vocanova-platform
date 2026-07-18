# VOC-006 — F2 Next.js Application Foundation

## Identity and lifecycle

- Change ID: `VOC-006`
- Status: `implementation-ready`
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
That valid adoption makes VOC-006 implementation authority only for bounded F2-I03
through active issue #19. Implementation has not begun or completed. Adoption grants
no automatic future implementation merge, deployment, production release, autonomous
development, RL1/RL2 activation, or F2-I04 or later authority.

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

This package changes protected `specs/README.md`, establishing an R3 package-adoption
path floor. The later implementation is expected to have at least an R2 path floor
because it changes dependency manifests and the lockfile, but its effective risk is
the highest path, semantic, builder, verifier, security, or authority assessment of
the actual diff.

Package adoption completed through PR #20 after deterministic validation, applicable
hosted R3 controls, and exact-SHA Claude Code verification with no finding. Active
A-003 did not require standing founder or technical-steward approval merely because
this was routine R3; R4 remains founder-controlled and EHR was not triggered. The
adoption and its evidence grant no automatic merge, deployment, release, F2-I04 or
later work, RL1/RL2, or autonomous-development activation. Codex may not approve or
merge its own future implementation work.
