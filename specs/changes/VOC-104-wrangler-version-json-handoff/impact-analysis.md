# VOC-104 — Impact Analysis

## Security and operations

The current failure is fail-closed but occurs after authorized staging writes. The
repair removes concurrency from the JSON handoff while preserving the resolver's
exact-tag and UUID checks. The main implementation risk is accepting a partial,
mismatched, stale, or ambiguous versions document. Distinct files, producer-complete
ordering, exact Worker-to-file mapping, and negative complete/truncated/ambiguous
tests contain that risk.

Temporary-file handling adds a local runner surface. Secure creation, quoting,
failure-safe deletion, no logging or artifact upload, and synthetic-only tests keep
JSON and paths within the step. The version listing is operational metadata, not a
credential, but it is still excluded from repository evidence; credentials remain
environment-only and are never redirected to these files.

## Partial state, migrations, and rollback

The observed state is coherent: expand-compatible D1 migrations are applied,
immutable versions exist with zero promoted traffic, and the previous deployment
continues serving. A later run can safely rediscover serving rollback targets, rely
on D1's migration ledger to apply only pending entries, upload freshly tagged
versions, and select only the fresh tag. The plan does not authorize deletion or use
of earlier version IDs.

Before promotion, failure needs no Worker rollback because traffic is unchanged.
After promotion starts, both Worker rollback attempts remain mandatory and D1 remains
forward-corrected rather than reversed. Repository rollback is a separately reviewed
three-file revert and does not undo live staging state.

## Blast radius and reversibility

The workflow edit controls a live staging deployment boundary and has an R3 path
floor. The inspector and tests make the boundary deterministic. The change is
independently reversible in the repository, but reverting would restore the known
unsafe pipe and must not be treated as a live remediation. No implementation action
touches Cloudflare, GitHub settings, secrets, traffic, DNS, production, or billing.

## Privacy, product data, analytics, and accessibility

None. The implementation uses synthetic fixtures and changes no learner data,
application schema, analytics, UI, or accessibility behavior. Existing staging D1
migrations are observed evidence, not implementation work.

## Dependencies, risks, and evidence

- `VOC-104-R00`: a shared or swapped temporary file could resolve the wrong Worker;
  exact distinct mapping and negative mutations are mandatory.
- `VOC-104-R01`: cleanup could hide a list/resolver failure or leave operational
  metadata behind; trap ordering and primary-status tests are mandatory.
- `VOC-104-R02`: weak static markers could allow the direct pipe to return; the
  inspector must reject the current exact pattern and structurally validate the
  upload step order.
- `VOC-104-R03`: stale unpromoted versions could be selected if tag exactness drifts;
  the existing SHA/run/attempt tag and ambiguity failures remain invariant.
- `VOC-104-R04`: a pre-promotion failure could accidentally trigger or bypass the
  wrong recovery path; ordering and rollback-condition tests remain mandatory.
- `VOC-104-DEP-00`: issue #186 and hosted run `33372680216` establish the exact
  failure and sanitized partial state without disclosing version IDs.
- `VOC-104-DEP-01`: VOC-100 through VOC-103 are present at the base SHA; their
  delivery, response-decoding, and reviewer-rule controls remain invariants.
- `VOC-104-EV-00` through `VOC-104-EV-05`: defined in `test-plan.md` and required at
  the applicable plan, implementation, and post-merge lifecycle stages.

## Documentation reconciliation

The current runbook already describes the preserved behavior and partial-state
boundary. This correction changes the internal stream transport, not the documented
delivery sequence or authority. No documentation change is required; if
implementation discovers a contrary statement, it must stop as material scope drift
rather than silently broaden this package.

## Rollback

Close an unmerged PR for zero effect. After merge, a separately reviewed revert PR
restores the three approved files from the pre-implementation `develop` revision and
reruns the same checks. The implementation owner owns rollback. No Cloudflare or D1
rollback action is authorized.
