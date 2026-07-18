# VOC-006 — F2 Next.js Application Foundation

## Identity and lifecycle

- Change ID: `VOC-006`
- Proposed lifecycle after valid adoption: `implementation-ready`
- Package-adoption risk: `R3`
- Expected implementation risk floor: `R2`, subject to the actual implementation diff
- Requirement source: founder-approved GitHub issue #19
- Roadmap slice: `F2-I03`; planned grouping `PR-F2-02`
- Base branch: `develop`
- Exact grounded base: `e97cce408c19312d1f88afb8be4bffa697d98a82`
- Canonical path: `specs/changes/VOC-006-f2-nextjs-application-foundation`

This package is a candidate until deterministic and hosted validation, exact-revision
independent verification, applicable routine-R3 controls, and an authorized merge into
canonical `develop` complete. A branch, issue, draft pull request, or review alone
grants no implementation, merge, deployment, release, or production authority.

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

Active A-003 requires strengthened applicable controls and exact-SHA Claude Code
verification for routine R3. It does not impose standing founder or technical-steward
approval merely because work is R3. R4 remains founder-controlled; EHR is not
triggered. Codex may not approve, merge, enable auto-merge, deploy, or activate
technical autonomy.
