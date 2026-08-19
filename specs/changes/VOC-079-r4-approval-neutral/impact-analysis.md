# VOC-079 — Impact Analysis

## Security and privacy

The proposal increases the set of high-consequence repository changes that may merge
without a standing personal approval. The compensating controls are not optional:
exact-revision independent verification, builder/reviewer separation, deterministic
checks, specialist review, complete R4 decision and contingency evidence, fail-closed
parsing, EHR when actually triggered, and explicit authority for external actions.

No secret, personal data, production access, or privacy-policy content changes.

## Governance and operational impact

- R4 remains the highest consequence class; it is not renamed or downgraded.
- Founder becomes a possible decision owner or reviewer, not an automatic gate caused
  by the R4 label.
- Humans and AI agents use the same role-separation and evidence rules.
- A future orchestrator may rely on the policy only after GitHub records all required
  evidence and the repository's deterministic gates pass.
- The local eligibility evaluator is a pure, read-only policy component. It grants no
  repository credential and cannot merge or mutate GitHub by itself.
- Existing historical approvals remain valid evidence for the revisions they governed.

## Data, migrations, analytics, and accessibility

No data, migration, analytics, or accessibility effect. The implementation is confined
to repository governance, templates, tests, and merge-policy automation.

## Risks, dependencies, and evidence

- `VOC-079-R00`: An autonomous change could satisfy superficial checks while making a
  consequentially wrong decision. Mitigation: decision/impact records, specialist and
  independent review, exact revision binding, and EHR for unresolved critical conflict.
- `VOC-079-R01`: Old documentation or an external workflow could keep enforcing founder
  approval. Mitigation: complete semantic inventory, removal of the external gate through
  VOC-078, and a local provider-neutral evaluator with positive R4 eligibility tests.
- `VOC-079-R02`: A named external-action hold could recreate blanket R4 approval.
  Mitigation: each hold must identify a concrete action and evidence condition and is
  tested separately from risk class.
- `VOC-079-R03`: The transition could self-authorize. Mitigation: adoption and merge use
  the pre-transition exact-revision founder rule once, with permanent GitHub evidence.
- `VOC-079-DEP-00`: one-time pre-transition approval.
- `VOC-079-DEP-01`: retirement of the external merge-gate invocation.
- `VOC-079-DEP-02`: named independent verifier and implementation shape at adoption.
- `VOC-079-EV-00` through `VOC-079-EV-06`: evidence defined by the acceptance and test plans.
