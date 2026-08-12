# VOC-073 — Close Accessibility Test Coverage Gap (Issue #536)

**Status: draft, not adopted.** Nothing in this package is implementation-authorized.
It is a draft response to
[issue #536](https://github.com/KARSIFT/vocanova-platform-sandbox/issues/536),
prepared for founder/steward review at adoption time.

## Identity and lifecycle

- Package ID: VOC-073
- Title: Close Accessibility Test Coverage Gap for Sign-In, Landing, Magic Link,
  and Settings Account Entry Pages
- Canonical path: `specs/changes/VOC-073-same-request-as-github-issue-536-accessibility`
- Lifecycle state: `draft` (not adopted, not authorized for implementation)
- Proposed risk: `R2` (draft proposal only — path floor `R3` when `/auth/magic`
  UI is touched; see `change.yaml`'s `planned_implementation_risk_floor`, not a
  determination)
- Owner: unassigned (see `change.yaml`'s `owners` block)
- Approval evidence: none yet — `approval_status: not-approved`,
  `implementation_authorized: false`
- Target branch: `develop`
- Linked GitHub issue:
  [#536](https://github.com/KARSIFT/vocanova-platform-sandbox/issues/536)

## Why this exists

VOC-031-T07b shipped automated axe-core accessibility scans across the core learning
loop at 360px, 430px, and 1280×720 desktop (`apps/web/tests/e2e/README.md` coverage
matrix). That matrix deliberately covered authenticated app screens but left four
high-traffic entry surfaces without dedicated specs:

| Route | Page source | Dedicated spec today | Notes |
| ----- | ----------- | -------------------- | ----- |
| `/signin` | `apps/web/src/app/signin/page.tsx` | **No** | Highest-traffic unauthenticated entry |
| `/` | `apps/web/src/app/page.tsx` | **No** | Root landing placeholder |
| `/auth/magic` | `apps/web/src/app/auth/magic/page.tsx` | **No** | Magic-link consume flow |
| `/settings/account` | `apps/web/src/app/(app)/settings/account/page.tsx` | **Partial** | Scanned inside `settings-accessibility.spec.ts` as a second test, not its own file |

Lighthouse budgets (`apps/web/tests/lighthouse/`) likewise cover only `/home`,
`/discover`, `/reviews`, and `/progress` — not these routes. Issue #536 asks to
close the Playwright + axe-core gap first, using the same harness as
`home-accessibility.spec.ts` and sibling T07b specs, and to fix any real violations
the scans surface rather than assuming the pages are clean.

## What this package does

Four independently reviewable tasks (`VOC-073-T00` through `VOC-073-T03`), each
delivering one dedicated `*-accessibility.spec.ts` file plus any page-level
accessibility remediation required for that route to pass:

1. **`VOC-073-T00`** — `signin-accessibility.spec.ts` for `/signin`
2. **`VOC-073-T01`** — `landing-accessibility.spec.ts` for `/`
3. **`VOC-073-T02`** — `auth-magic-accessibility.spec.ts` for `/auth/magic`
4. **`VOC-073-T03`** — `settings-account-accessibility.spec.ts` for
   `/settings/account`, extracting the existing test from
   `settings-accessibility.spec.ts` and updating the e2e README coverage matrix

Every new spec follows the T07b bar inherited from `axe-helper.ts`:

1. `scanForAxeViolations` — WCAG 2.2 AA tags, zero critical/serious findings.
2. `assertKeyboardReachable` — page operable from keyboard alone.
3. `assertNonColorOnlyFeedback` — named status/copy selectors carry text, not
   color alone.

Specs run across all three Playwright projects (`home-desktop-1280`, `mobile-360`,
`mobile-430`) unless a route-specific constraint is documented in the task (none
anticipated for these four routes).

## What this package deliberately does NOT do

- Not expanding Lighthouse (`apps/web/tests/lighthouse/`) to these routes — out of
  issue #536's stated scope (Playwright + axe-core only).
- Not redesigning the `/` landing placeholder into marketing content — a11y fixes
  on the current page only unless adoption expands scope (`VOC-073-DEP-02`).
- Not changing authentication business logic, OAuth behavior, magic-link token
  handling, or API contracts — only test coverage and accessibility remediation.
- Not weakening axe rule sets, adding blanket suppressions, or lowering the
  critical/serious bar established by VOC-031-T07a/T07b.
- Does not adopt itself. `change.yaml` leaves every adoption/authorization field
  at its unadopted default.

## Open questions for the reviewing human

See `specification.md`. The most important:

1. **`VOC-073-DEP-00`** — Confirm removing the `/settings/account` test from
   `settings-accessibility.spec.ts` when extracting to the dedicated file.
2. **`VOC-073-DEP-01`** — Which `/auth/magic` UI states to scan (success path
   redirects away; error/loading states are the stable scan targets).
3. **`VOC-073-DEP-02`** — Confirm landing-page scope stays a11y-only on the
   placeholder.

## Verification, approvals, release, and closure

See `test-plan.md`, `release-plan.md`, and `implementation-plan.md`. This package
carries no standing approval; adoption, implementation authorization, independent
verification, and any required human approval remain to be recorded against the
exact implemented revision, per AGENTS.md and CLAUDE.md.
