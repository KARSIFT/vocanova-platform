# VOC-015 — Impact Analysis

## Security and privacy

None. The new file contains only static hex string literals — no secrets,
credentials, personal data, user input, or network/filesystem access.

## Data and migrations

None. Purely additive: a new `brand.ts` file plus one more re-export in
`index.ts`; the VOC-010→VOC-014 existing exports (including the `neutral` ramp)
are unchanged. Non-breaking for the (currently zero) consumers of this package.
Rollback is a plain `git revert`, no data implications.

## Analytics and accessibility

Not applicable to this package. No user-facing surface or rendered UI is
introduced; nothing consumes the tokens. Note for future consumers, not this
package: brand colors, unlike the neutral ramp, are likely to be used for
interactive/accent surfaces where WCAG 1.4.3 (contrast) and 1.4.11 (non-text
contrast) apply. When a component eventually pairs, say, `brand.primary.500`
text on a light background, that pairing must be contrast-checked — but that
belongs to the consuming change, not to this value-only addition.

## Risks, dependencies, and evidence

- `VOC-015-R00`: Low. Values are fixed literals with no computation step, so the
  main failure mode is a plain transcription error against the twenty-value
  tables, or an accidental change to the existing `neutral` ramp.
  `VOC-015-TEST-00`/`TEST-01` and the independent reviewer both check
  value-by-value, byte-for-byte, and confirm `neutral` is untouched.
- `VOC-015-R01`: Brand hue selection (`VOC-015-D01`) is a genuine design
  decision, not a correctness fact. The planner proposes concrete, monotonic,
  professionally balanced blue/violet ramps so the request is actionable, but a
  human should confirm or replace the hues at adoption. This is not a
  correctness risk to the *structure*, but the *values* are provisional until
  confirmed — tracked as `VOC-015-DEP-04`.
- `VOC-015-R02`: Structural ambiguity — "brand color scale (primary/secondary)"
  could be read as one grouped `brand` export or two separate exports. Resolved
  in `VOC-015-D00` as one grouped `brand` object with two `neutral`-shaped
  sub-ramps, which best fits "the same 50→900 shape as `neutral`" and the
  founder's singular phrase "a `brand` color scale". A human may prefer the
  two-export form at adoption; if so, only `index.ts` and `brand.ts`'s top-level
  shape change.
- `VOC-015-DEP-01`: Requirement must reach a founder-approved,
  implementation-ready state at adoption (issue #15 exists but an issue alone is
  not implementation authority). This draft is not implementation authority on
  its own.
- `VOC-015-DEP-02`: Base state (`base_sha`) to be pinned to the then-current
  `develop` head at adoption.
- `VOC-015-DEP-03`: Depends on the VOC-010→VOC-014 exports (`spacing`,
  `neutral`, `fontSize`, `radius`, `duration`, `easing`, `elevation`) already
  present on `develop`. All seven are present at this draft's authoring
  (`index.ts` shows all seven).
- `VOC-015-DEP-04`: Brand hue values pending founder confirmation (see
  `VOC-015-D01`/`R01`).
- `VOC-015-EV-00`..`VOC-015-EV-02`: CI run output (lint/typecheck/build) plus the
  independent reviewer's verdict, bound to the exact reviewed commit SHA —
  produced at implementation time, not now.
