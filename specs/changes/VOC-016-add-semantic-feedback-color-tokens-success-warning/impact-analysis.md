# VOC-016 — Impact Analysis

## Security and privacy

None. The new file contains only static hex string literals — no secrets,
credentials, personal data, user input, or network/filesystem access.

## Data and migrations

None. Purely additive: a new `feedback.ts` file plus one more re-export in
`index.ts`; the VOC-010→VOC-015 existing exports (including the `neutral` ramp
and the `brand` scale) are unchanged. Non-breaking for the (currently zero)
consumers of this package. Rollback is a plain `git revert`, no data
implications.

## Analytics and accessibility

Analytics: not applicable — no user-facing surface or rendered UI is introduced;
nothing consumes the tokens.

Accessibility: partially in scope, and deliberately bounded. Unlike VOC-015's
`brand` scale, DOC-03 §10 explicitly governs feedback states, so this package
takes on the **contrast-capability** obligation directly:

- `VOC-016-AC-01` fixes a deterministic WCAG 2.2 contrast property: the `800` and
  `900` step of every ramp reaches ≥4.5:1 against white, so each feedback state
  has a token step usable for AA body text on a light background (§10, WCAG
  1.4.3). This is verified by computation, not asserted (`VOC-016-TEST-01`).
- What this package **cannot** satisfy — and does not claim to — is §10's "no
  information conveyed by color alone" clause ("correct/incorrect review feedback
  must also use an icon or text label"). That is a property of the *consuming
  component*, not of a color value. It is recorded here as a hard downstream
  obligation (`VOC-016-R04`) so an adopter does not mistake "we shipped feedback
  color tokens" for "we satisfied §10."
- §11's "avoid harsh error red" is addressed at the value level by proposing a
  softer rose family for `error` rather than a saturated red (`VOC-016-D01`).
  There is a genuine tension with §10 (softer hues trend lower-contrast); it is
  resolved by ramp shape, not by compromising either clause — see
  `VOC-016-R03`/`VOC-016-D03`.

## Risks, dependencies, and evidence

- `VOC-016-R00`: Low. Values are fixed literals with no computation step, so the
  main failure mode is a plain transcription error against the thirty-value
  tables, or an accidental change to an existing ramp. `VOC-016-TEST-00`/`TEST-02`
  and the independent reviewer both check value-by-value, byte-for-byte, and
  confirm `neutral`/`brand` are untouched.
- `VOC-016-R01`: Hue selection (`VOC-016-D01`) is a design decision, not a
  correctness fact. The planner proposes concrete, monotonic, contrast-vetted
  green/amber/rose ramps so the request is actionable, but a human should confirm
  or replace the hues at adoption. Not a correctness risk to the *structure*; the
  *values* are provisional until confirmed — tracked as `VOC-016-DEP-04`.
- `VOC-016-R02`: Structural/naming ambiguity — "semantic feedback color tokens"
  could be one grouped `feedback` export, three separate exports, or a differently
  named group (`semantic`/`status`) and sub-ramp (`error` vs `danger`). Resolved
  in `VOC-016-D00`/`D02` as one grouped `feedback` object with three
  `neutral`-shaped sub-ramps, matching the `brand` precedent. A human may prefer a
  different form at adoption; if so, only `index.ts` and `feedback.ts`'s top-level
  shape change.
- `VOC-016-R03`: §10↔§11 tension (contrast vs. "not harsh"). Softer, less
  saturated error hues can reduce contrast. Mitigation is ramp shape, not a
  compromise: soft mid-tones exist for large fills/accents (§11), dark `800`/`900`
  steps meet AA text contrast (§10), and `VOC-016-AC-01` makes the contrast half
  testable. If an adopter softens the `error` hues further, `VOC-016-TEST-01` will
  catch any `800`/`900` step that drops below 4.5:1.
- `VOC-016-R04`: **Downstream, non-enforceable-here.** §10's "no information by
  color alone" cannot be satisfied by a token file; the consuming component must
  pair a feedback color with an icon or text label. This package provides the
  colors only. A future consuming change must own that obligation and its
  accessibility tests. Recorded so it is not silently assumed satisfied.
- `VOC-016-DEP-01`: Requirement must reach a founder-approved,
  implementation-ready state at adoption (DOC-03 is approved as a design document
  but an approved doc alone is not implementation authority — `AGENTS.md`). This
  draft is not implementation authority on its own.
- `VOC-016-DEP-02`: Base state (`base_sha`) to be pinned to the then-current
  `develop` head at adoption (recorded provisionally as the current head).
- `VOC-016-DEP-03`: Depends on the VOC-010→VOC-015 exports (`spacing`, `neutral`,
  `brand`, `fontSize`, `radius`, `duration`, `easing`, `elevation`) already
  present on `develop`. All eight are present at this draft's authoring
  (`index.ts` shows all eight).
- `VOC-016-DEP-04`: Feedback hue values and the `feedback`/`error` naming pending
  founder confirmation (see `VOC-016-D01`/`D02`/`R01`).
- `VOC-016-DEP-05`: Contrast targets (`VOC-016-AC-01`, AA ≥4.5:1 for `800`/`900`
  on white) pending founder confirmation; if the founder wants a stricter target
  (e.g. AAA 7:1, or a passing `700` step) that is set at adoption.
- `VOC-016-EV-00`..`VOC-016-EV-03`: CI run output (lint/typecheck/build), the
  contrast computation output, and the independent reviewer's verdict, bound to
  the exact reviewed commit SHA — produced at implementation time, not now.
