<!-- karsift lessons: keep this file under ~10KB. When it grows past that,
     move the oldest/least-relevant entries into .karsift/lessons-archive.md
     (create if needed) rather than deleting them - this file is read into
     every plan/implement/review prompt, so unbounded growth silently
     inflates cost and dilutes signal on every future run. Archive by hand;
     no automated pruning exists yet. -->

# Lessons learned - vocanova-platform-sandbox

Append-only. Read into every planner/implementer/reviewer prompt
(karsift-ai-infra's plan.yml/implement.yml/review.yml "Build prompt" steps).
Seeded and maintained manually by the founder-gate operator - no automated
write-path exists yet (deliberately: unsupervised auto-written lessons were
ruled out to avoid bad lessons being written silently).

## 2026-07-29: Tailwind `max-w-{size}` token collision - ROOT CAUSE STILL UNFIXED

`packages/design-tokens/src/spacing.ts` generates
`apps/web/src/app/tokens.generated.css`'s `@theme static { --spacing-md: 16px;
--spacing-xl: 32px; ... }` block. Tailwind v4 resolves named `max-w-{size}`
container utilities (sm/md/lg/xl/2xl/...) against this same named scale
before the intended `--container-{size}` default (28rem/36rem/etc.) when
both happen to share a key name - this repo doesn't define its own
`--container-*` namespace, so every one of them collides. Confirmed by
inspecting the compiled CSS: `.max-w-md{max-width:var(--spacing-md)}` (16px,
not 448px), `.max-w-xl{max-width:var(--spacing-xl)}` (32px, not 576px).

**Do not use `max-w-md`, `max-w-xl`, `max-w-lg`, `max-w-sm`, `max-w-2xl`, etc.
anywhere in `apps/web` until this is actually fixed.** The current workaround
at every call site that has hit this so far is an explicit arbitrary value
with an inline comment, e.g.:

    <div className="w-full max-w-[28rem] ...">
    {/* max-w-[28rem] (not max-w-md): this repo's tokens.generated.css only
        defines a --spacing-* scale, which shadows Tailwind's intended
        28rem max-w-md container size - see .karsift/lessons.md */}

Known locations already patched this way (as of 2026-07-29):
`apps/web/src/app/auth/magic/_components/magic-link-page-content.tsx`,
`apps/web/src/app/auth/magic/page.tsx`,
`apps/web/src/app/onboarding/page.tsx` (max-w-xl -> max-w-[36rem]),
`apps/web/src/app/signin/page.tsx`,
`apps/web/src/app/(app)/reviews/_components/review-session.tsx`.
If you touch any of these files, keep the arbitrary-value pattern - don't
"simplify" it back to `max-w-md`/`max-w-xl`, it will silently shrink the
container to 16px/32px and was the confirmed root cause of VOC-031-T08's
core-loop test reporting a heading as CSS-hidden (word-wrapped to 0px
measured width under Playwright's visibility check).

If you're implementing a task that touches design tokens or Tailwind config
and can permanently fix this (e.g. by adding an explicit `--container-*`
namespace to `tokens.generated.css`'s generator so `max-w-*` no longer
aliases onto `--spacing-*`), that is the correct real fix - do it if in
scope, and delete this lesson entry once every workaround site above is
reverted to the plain `max-w-{size}` utility and confirmed correct.

## 2026-07-29: Lighthouse `LIGHTHOUSE_CHROME_PATH` needs shell expansion, not `env:` expansion

`.github/workflows/lighthouse.yml`'s "Run Lighthouse suite" step resolves the
Playwright-installed Chromium binary path with a glob
(`~/.cache/ms-playwright/chromium-*/chrome-linux/chrome`) because the exact
revision directory name changes with Playwright version bumps. GitHub
Actions does NOT shell-expand `env:` block values (only `run:` script bodies
are shell-expanded) - so the `ls -d ... | head -1` command substitution that
resolves the real path MUST happen inside the `run:` step body itself
(`export LIGHTHOUSE_CHROME_PATH="$(ls -d ...)"`), not as a literal string in
the step's `env:` block. Putting it in `env:` silently passes the unexpanded
glob pattern as a literal path, and Lighthouse's `chrome-launcher` then fails
to find the binary with `ECONNREFUSED`. Keep this in mind if this workflow's
Chrome-path resolution is ever refactored - the same rule applies to any
similar path resolution added elsewhere in CI.

## 2026-07-29: Lighthouse 12's `emulatedFormFactor` was renamed to `formFactor`

`apps/web/tests/lighthouse/runner.mjs` currently uses `formFactor` correctly
(both per-layout, e.g. `formFactor: "mobile"`, and in the resulting Lighthouse
config object). Older Lighthouse docs/examples (pre-v10ish) use
`emulatedFormFactor` instead - if you're implementing or planning against
web-fetched or memorized Lighthouse config examples, `emulatedFormFactor` is
STALE for the Lighthouse version this repo runs (pinned to v12+ via the
lockfile) and is silently ignored rather than erroring - Lighthouse just
falls back to its own default form factor ("mobile"), defeating the point of
the mobile/desktop layout matrix this test suite deliberately covers. Use
`formFactor` only.
