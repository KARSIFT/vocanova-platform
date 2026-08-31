# VOC-109 — Impact Analysis

## Foundation-policy and governance impact

This correction changes how one existing F2 validator distinguishes protected
baseline commands from future governed extensions. It preserves the entire original
sequence and narrows additions to one declared slot. No workflow or package command
changes in VOC-109, so the current execution graph is unchanged at merge. The result
removes only the false incompatibility that blocks adopted VOC-105.

Because a fail-open parser could let CI evidence disappear or move behind a bypass,
the semantic risk is R3. R4 is not triggered: mandatory independent review, original
checks, merge rules, credentials, action authority, and external-system boundaries do
not change.

## Security and privacy

The validator reads repository JSON and strings only. It must not invoke a shell,
resolve credentials, access the network, or inspect environment values. The exact
eight-segment prefix, terminal test, single-direct-Node extension grammar, unique
entry points, declaration checks, alias rejection, and shell-control negatives prevent
an extension label from disguising F2 omission or bypass. No secret or personal data
is used.

## Product, data, migration, analytics, and accessibility

There is no product behavior, UI, API, application runtime, database, D1 migration,
analytics, accessibility, dependency, or generated-artifact change. F2 remains
complete-effective and F3 remains governed solely by adopted VOC-105 after this
prerequisite; VOC-109 records no milestone change.

## Rollback and dependency ordering

Before merge, close the implementation PR for zero effect. After merge and before any
downstream extension lands, a separately reviewed revert of the two files restores the
exact prior validator and test. If VOC-105 or another governed extension has already
merged, first revert that downstream command/package change through its own reviewed
rollback, then revert VOC-109; reverting the prerequisite first would deliberately
make `ci:foundation` invalid.

## Risks, dependencies, and evidence

- `VOC-109-R00`: an overly broad extension parser accepts a bypass or arbitrary shell
  segment. Mitigation: one exact slot, exact eight-segment prefix and terminal,
  lowercase-hyphen names, single-direct-Node entry points, and independent negative
  fixtures.
- `VOC-109-R01`: an alias runs F2 zero or multiple times while the visible segment
  appears valid. Mitigation: direct exact F2 segment, exact entry point, alias scan,
  and one-at-a-time alias/duplication negatives.
- `VOC-109-R02`: a prerequisite rollback breaks an already merged downstream check.
  Mitigation: explicit reverse-dependency rollback order.
- `VOC-109-DEP-00`: issue #198 exact reproduction at the declared base.
- `VOC-109-DEP-01`: active VOC-081 validator and test behavior.
- `VOC-109-DEP-02`: adopted VOC-105 as a blocked downstream consumer only.
- `VOC-109-EV-00` through `VOC-109-EV-04`: defined in the test plan.
