# VOC-109 — Specification

## Objective and requirement source

[Issue #198](https://github.com/KARSIFT/vocanova-platform/issues/198) proves that the
VOC-081 F2 validator rejects every later foundation check because it compares the
entire command chain to one frozen array. Adopted VOC-105 requires exactly one new
direct `ci:f3-evidence` segment, but its exact authorized paths exclude the VOC-081
validator and test. The VOC-105 builder therefore stopped without edits.

VOC-109 defines a prerequisite correction only. It preserves the established F2
command and base order, creates a narrow declared-check extension slot, and leaves
VOC-105's adopted scope and R4 evidence obligations unchanged.

## Requirements

### VOC-109-D00 — Preserve lifecycle and evidence boundaries

The issue is intake, not implementation authority. The plan must bind base SHA
`669e419385dc8a4b8cfb007238dbaac017139238` and the exact reproduction result. No
validator edit may begin until this package has exact-SHA specialist and independent
cross-model R3 review, accountable adoption, and a normal non-author merge into
`develop`.

### VOC-109-D01 — Protect the original foundation sequence

The validator must treat the first eight current foundation segments—from
`pnpm run validate:workspace` through `pnpm run ci:settings-truth`—as the exact
ordered prefix. Each prefix segment must occur exactly once at its current position.
The final `node --test scripts/foundation/*.test.mjs` segment remains exact and
terminal.

The exact prefix is:

1. `pnpm run validate:workspace`
2. `pnpm run format:check`
3. `pnpm run build:packages`
4. `pnpm run ci:retirement`
5. `pnpm run ci:final-evidence`
6. `pnpm run ci:f2-evidence`
7. `pnpm run ci:closure-consistency`
8. `pnpm run ci:settings-truth`

The package script `ci:f2-evidence` must remain exactly
`node scripts/foundation/voc081-f2-evidence-policy.mjs`, and
`pnpm run ci:f2-evidence` must remain one direct executable segment in the foundation
chain. An alias, echo, comment, substring, or transitive package-script reference does
not satisfy this requirement and must not create a second execution path.

### VOC-109-D02 — Define one narrow extension slot

The only permitted additions are unique exact segments of the form
`pnpm run ci:<lowercase-alphanumeric-single-hyphen-name>` between
`pnpm run ci:settings-truth` and the terminal foundation test glob. The referenced
name and script must:

- match `ci:` followed only by lowercase alphanumeric hyphen-separated words;
- exist in the same `package.json` scripts map;
- contain exactly one direct
  `node scripts/foundation/<lowercase-alphanumeric-single-hyphen-name>-policy.mjs`
  command with no arguments, alias, compound command, comment, or metacharacter;
- be distinct by both package-script name and direct Node entry point; and
- not duplicate, invoke, or mention any of the eight baseline package-script names or
  entry points, including the canonical F2 package command and validator entry point.

Both the extension name after `ci:` and the target basename before `-policy.mjs` use
one or more lowercase alphanumeric tokens separated by exactly one hyphen. Uppercase,
underscore, empty names/tokens, leading or trailing hyphens, and doubled hyphens fail.
These are independent canonical identifiers: the package-script name and target
basename need not be equal. In the required positive fixture, package script
`ci:f3-evidence` is exactly
`node scripts/foundation/voc105-f3-evidence-policy.mjs`, while the sole extension
segment is exactly `pnpm run ci:f3-evidence`.
The target must remain directly under `scripts/foundation` and end exactly
`-policy.mjs`; a nested/outside path, `.js` or other suffix, missing `-policy`, or
otherwise noncanonical filename fails.

Zero extensions remains valid for the current repository. The exact synthetic
declaration and segment pair above must validate, proving the adopted VOC-105
integration shape is no longer blocked. Unknown, duplicated, aliased, compound,
entry-point-colliding, or misplaced extensions fail.

### VOC-109-D03 — Parse and reject shell-control ambiguity

The inspection remains network-free and must not execute commands. It parses the JSON
scripts map and exact `&&`-separated segments. Malformed JSON, non-string scripts,
empty segments, `||`, semicolons, newlines, comments, redirections, command
substitution, backgrounding, prefixes/suffixes, extension-script arguments or compound
commands, or any noncanonical segment fail with a concrete diagnostic. Changing any
of the exact eight prefix positions, drifting the terminal segment, or moving an
extension outside its one slot also fails.

The focused matrix must mutate one invariant at a time. It independently duplicates
each original prefix segment—not only F2—and separately exercises every malformed
extension-name class, wrong target directory/suffix/filename class, and reuse of each
non-F2 baseline package-script name or entry point. A failure caused by one grammar
check cannot stand in as evidence for an untested collision or uniqueness invariant.

### VOC-109-D04 — Keep implementation scope exact

One implementation PR may modify only:

- `scripts/foundation/voc081-f2-evidence-policy.mjs`; and
- `scripts/foundation/voc081-f2-evidence-policy.test.mjs`.

It must not modify `package.json`; VOC-105 owns the later command addition after this
prerequisite merges. It must not edit workflows, historical packages, F2/F3 evidence,
application/runtime code, manifests, settings, secrets, or any live-system surface.

### VOC-109-D05 — Verify protected policy independently

The exact implementation must pass the focused validator/tests, full foundation and
workspace validation, governance checks, risk classification, path audit, and
whitespace validation. A foundation-policy/CI-integrity specialist and a separate
independent cross-model R3 verifier must review the exact SHA as non-authors. Any
material review edit creates a new builder SHA requiring fresh checks and different-
actor review. A separate non-author actor performs any merge.

### VOC-109-D06 — Unblock but do not absorb VOC-105

After VOC-109 merges and post-merge validation passes, issue #198 may close and a
different VOC-105 builder may resume on the corrected `develop`. VOC-109 does not add
the F3 command, reconcile F3 evidence, establish milestone truth, or satisfy any
VOC-105 acceptance criterion.

### VOC-109-D07 — Observe the first real downstream integration

Per DOC-15 section 24.18, the accountable VOC-109 repository change owner recorded at
adoption owns a bounded repository-only observation period. It begins when the
VOC-109 implementation merges and ends when the first real VOC-105 integration
candidate uses the exact `ci:f3-evidence` declaration and sole chain segment and its
focused validator, `ci:foundation`, and hosted required-check results are recorded.
If VOC-105 is formally abandoned or superseded before that attempt, the window ends
only when that governed disposition is recorded.

The monitored signal is whether the exact real VOC-105 integration is accepted while
the current chain and all original F2 protections continue to pass. Rejection of that
exact fixture, acceptance of a malformed/colliding/bypass fixture, or regression of
the current F2/foundation checks is the failure trigger. On failure, the owner must
stop VOC-105 merge and VOC-109 closure, record the failing evidence in issue #198 (or
a linked plain bug issue if #198 is already closed), and route a separately governed
remediation or dependency-ordered revert. Observation grants no deployment or other
external-action authority.

## Risk and protected areas

The plan and implementation are R3 because they change a fail-closed foundation
policy validator. They are not R4: the extension slot accepts only declared direct
checks while retaining the complete original sequence, exact F2 execution, independent
verification, and all action-authority boundaries. There is no autonomous privilege
expansion, irreversible action, product decision, privacy effect, or launch.

## Security, privacy, data, analytics, and accessibility

No dependency, network request, shell execution, secret, credential, learner data,
production data, database, migration, UI, analytics, or accessibility behavior is
introduced. Fixture script names and commands are synthetic repository text only.
