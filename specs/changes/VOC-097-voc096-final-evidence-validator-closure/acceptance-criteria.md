# VOC-097 — Acceptance Criteria

## VOC-097-AC-00 — Exact governed scope

The plan contains one nine-file package and one task. The later implementation is the
preserved VOC-096 PR1, with an exact 29-path core and nine exact VOC-096 package
reconciliation paths, for 38 authorized paths total. No unrelated path or external
action is present.

## VOC-097-AC-01 — Prepared staging validates only through the complete gate

The repository-positive final-evidence test passes with top-level/staging `prepared`
only because the complete current VOC-096 delivery validator, exact configs, closed
runtime contract, prepared tuple, binders, resources, baselines, Free/$0 state,
privacy controls, and dispatch-ineligible state pass. A partial local exception cannot
satisfy it.

## VOC-097-AC-02 — Legacy and production boundaries remain fail closed

The immutable legacy held fixture remains accepted. Production remains `held`, all
production sentinels remain unchanged, and `VOC-080-HOLD-01`/`HOLD-02` remain held.
Committed `authorized`, active production, or any hold weakening is rejected.

## VOC-097-AC-03 — Negative matrix closes the discovered gap

Deterministic tests reject malformed or mismatched prepared state, missing runtime
binder, tuple/schema/digest drift, generic URL fallback, self-asserted authority or
envelope metadata, production activation, hold weakening, and prepared state that is
dispatch-eligible without the live binder.

## VOC-097-AC-04 — Canonical package surfaces agree

All nine VOC-096 package files state the corrected 29-path core and 38-path total
reconciliation scope without rewriting immutable review/adoption history. All nine
VOC-094 surfaces contain the same bounded operative correction. No stale operative
27-path instruction remains.

## VOC-097-AC-05 — Exact validation and role separation pass

All required local and hosted checks pass on the exact implementation revision;
separate Cloudflare, security/settings, and independent R4 reviewers report zero
blockers; a different non-author actor merges; worktrees/recovery refs remain
preserved; and no external action occurs.
