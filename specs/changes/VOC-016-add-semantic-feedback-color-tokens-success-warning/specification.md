# VOC-016 — Semantic Feedback Color Scale (success / warning / error): Specification

## Objective and requirement source

Adds a typed `feedback` color scale — `success`, `warning`, and `error`
sub-ramps, each a 50→900 ramp mirroring the existing `neutral` (VOC-010) and
`brand` (VOC-015) scales — to `packages/design-tokens`, continuing the
VOC-010→VOC-015 foundation. The requirement source is the approved design
document `docs/design/03-ui-ux-design.md` (DOC-03), specifically:

- §10 Accessibility — target **WCAG 2.2 AA**: "sufficient color contrast, and no
  information conveyed by color alone (e.g. correct/incorrect review feedback
  must also use an icon or text label, not just a color change)."
- §11 Visual design direction: "Avoid visual patterns that read as 'grading'
  (red X marks, harsh error colors) in favor of supportive framing."

DOC-03 is `status: approved`, but an approved design document is not by itself a
founder-approved, implementation-ready change authority; that state must be
recorded before implementation (`AGENTS.md`). This document is a draft, not an
approved specification.

## Scope and non-goals

In scope:
- `packages/design-tokens/src/feedback.ts` — a typed `feedback` scale as a
  readonly object with three keys, `success`, `warning`, and `error`, each itself
  a readonly object of the exact ten keys used by `neutral`
  (`50`,`100`,`200`,`300`,`400`,`500`,`600`,`700`,`800`,`900`) → hex string
  values, with the exact values specified in `acceptance-criteria.md`
  (`VOC-016-AC-00`).
- `packages/design-tokens/src/index.ts` — add a re-export of `feedback` alongside
  the existing `spacing`, `neutral`, `brand`, `fontSize`, `radius`, `duration`,
  `easing`, and `elevation` exports (do not remove, rename, or alter those).

Explicitly excluded: component-level consumption; CSS custom property / Tailwind
config generation; dark-mode variants; the icon/text-label components that §10
requires so feedback is not conveyed "by color alone" (that obligation is
downstream of this value-only package and cannot be enforced by a token file —
see `impact-analysis.md`, `VOC-016-R04`); any modification to the existing
`neutral`, `brand`, or other ramps; any change in `apps/web`.

## Risk and protected areas

Proposed risk: R1, same reasoning as VOC-010→VOC-015
(`packages/design-tokens/src/*` falls to the classifier's R1 default). This is a
draft proposal — `scripts/governance/classify-change-risk.sh` and a human's
judgment govern the actual class at implementation time. No protected areas
touched.

## Decisions, contradictions, security, and privacy

`VOC-016-D00`: Structure. `feedback` is a nested readonly object:
`Readonly<Record<string, Readonly<Record<string, string>>>>`, with top-level keys
`success`, `warning`, and `error`, each mapping to a ten-key 50→900 hex ramp with
the **identical key set and ordering** as `neutral` (`colors.ts`) and `brand`
(`brand.ts`). This is the direct continuation of the `brand` precedent (VOC-015):
one grouped export containing several `neutral`-shaped ramps, not several separate
top-level exports. Each ramp is monotonic light→dark from `50` to `900`, matching
the monotonicity constraint VOC-010 placed on `neutral`.

`VOC-016-D01`: Proposed hue values (OPEN DECISION FOR THE HUMAN ADOPTER). The
exact hues are a genuine design decision the planner cannot settle
authoritatively. This package proposes concrete, self-consistent, monotonic ramps
so the request is actionable, but the **exact hex values are a proposal to confirm
or replace at adoption** (analogous to VOC-015's `brand` hues). The proposal
reuses well-known, professionally balanced ten-step families so the values are
unambiguous and byte-for-byte testable, chosen to honour §11 and §10 together:
- `success` → a calm green family (`#ecfdf5` … `#064e3b`).
- `warning` → an amber family (`#fffbeb` … `#78350f`).
- `error` → a **softer rose family** (`#fff1f2` … `#881337`) rather than a
  saturated fire-engine red, directly serving §11's "avoid harsh error red."
The exact thirty values are fixed in `acceptance-criteria.md` (`VOC-016-AC-00`).
If the founder substitutes different hues at adoption, only the values in that
table change; the structure, keys, export wiring, tasks, and tests are otherwise
unaffected (the contrast property in `VOC-016-AC-01` must still hold for whatever
values are chosen). `VOC-016-DEP-04` tracks this open confirmation.

`VOC-016-D02`: Naming. The scale is named `feedback` (file `feedback.ts`, export
`feedback`), with sub-ramps `success`/`warning`/`error` per the request's exact
wording. Two naming points are flagged for the adopter (`VOC-016-DEP-04`), not
silently resolved:
- The group could instead be named `semantic` or `status`. `feedback` is chosen
  because DOC-03 frames these states as *feedback* to the learner (§9 empty/
  loading/error states, §11 AI-result framing) and it avoids overloading the
  broader word "semantic."
- The sub-ramp is named `error` per the request. Note the §11 tone tension: the
  *token name* is an internal API string (never shown to a learner), so keeping
  `error` does not itself violate §11 — the tone rule constrains the *hue*
  (addressed by the rose family) and the *user-facing copy* (out of scope here).
  An adopter who prefers `danger`/`attention`/`caution` may rename it; only
  `feedback.ts` and `index.ts` shape change.

`VOC-016-D03`: Accessibility boundary and the §10↔§11 tension. This package can
satisfy the *contrast-capability* half of §10 (provide ramp steps dark enough to
reach WCAG 2.2 AA text contrast on a light background — `VOC-016-AC-01`) but
**cannot** satisfy the "no information by color alone" half, which is a property
of the *consuming component* (it must also render an icon or text label). This
package therefore does not claim §10 compliance outright; it provides
contrast-capable primitives and records the downstream obligation
(`impact-analysis.md`, `VOC-016-R04`). There is a real design tension between §11
("softer, less harsh" hues, which tend to be lighter/less saturated and thus
*lower* contrast) and §10 (contrast). It is resolved by ramp shape: soft mid-tones
(`400`/`500`) are available for large fills/accents where §11 matters most, while
each ramp also carries dark steps (`800`/`900`) that meet AA text contrast for
where §10 matters most. The two clauses do not have to be satisfied by the same
step.

`VOC-016-D04`: Single task, per the VOC-010/011/012/014/015 precedent — the new
`feedback.ts` file and its `index.ts` wiring are one tightly-coupled change
reviewed against the whole package's acceptance criteria, so they must not be
split across separate per-task PRs.

No security, secrets, or personal-data impact.

## Data, migrations, analytics, and accessibility

None for data/migrations/analytics — no data storage, no migration, no analytics
event, and no rendered UI is introduced by this package. Accessibility **is**
in scope in a limited, testable way (unlike VOC-015's `brand`): because these are
feedback/status colors likely to carry text and iconography, this package fixes a
verifiable contrast property on the ramps (`VOC-016-AC-01`) and explicitly records
the "not by color alone" obligation as downstream (`VOC-016-R04`). Full
accessibility verification of any actual feedback surface belongs to the consuming
change, not to this value-only addition.
