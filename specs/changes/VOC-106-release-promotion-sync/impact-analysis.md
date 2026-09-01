# VOC-106 — Impact Analysis

## Security and privacy

The action changes protected Git history only. PR events must not be represented as
Cloudflare delivery: Cloudflare environment jobs are expected to remain skipped unless
a separately authorized manual dispatch occurs. No secret, personal, learner, or
production data is read or written.

## History, data, and migrations

The release merge makes the reviewed frozen `develop` tree canonical on `main` from
an exact immutable short-lived alias.
Synchronization then restores `main` ancestry to `develop` via a merge commit. There
is no application-data migration or production effect. The only branch deletion that
may occur is GitHub's existing automatic deletion of the merged synchronization head;
protected release refs remain immutable. It requires a recorded name, SHA, tree, and
nonexecuted recreate command. Permanent `main` and `develop` must remain present; any
contrary outcome blocks the action.

## Risks, dependencies, and evidence

- `VOC-106-R00`: stale freeze could promote or synchronize a different tree.
  Mitigation: fetch/ref/tree/merge-base evidence immediately before exact review;
  invalidate and restart on any movement.
- `VOC-106-R01`: promotion-alone leaves branches out of finalization order.
  Mitigation: require the separately reviewed short-lived synchronization PR and
  final ancestry/behind proof before closure.
- `VOC-106-R02`: source deletion or a settings workaround could harm a permanent
  branch or expand scope. Mitigation: exact disposable release/sync heads; no
  settings-query/mutation or manual-deletion authority; block if permanent-branch
  safety cannot be demonstrated.
- `VOC-106-R03`: repository promotion may be mistaken for deployment. Mitigation:
  inspect required workflow behavior and record skipped/absent live actions.
- `VOC-106-R04`: a drifted or colliding attempt is reused or overwritten. Mitigation:
  immutable attempt binders, fail-closed collision/ownership proof, close/abandon
  without ref deletion or mutation, and a new freeze/name/PR/evidence set.
- `VOC-106-R05`: divergence or merge synthesis changes the released tree. Mitigation:
  frozen main as merge base, zero main-only, exact head/develop SHA/tree identity,
  no extra compare content, and prospective/actual release-tree equality.
- `VOC-106-DEP-00`: adopted exact plan, fresh release freeze/reviews/checks, and
  separate authorized merger are prerequisites to promotion.
- `VOC-106-DEP-01`: release merge/readback is a prerequisite to fresh sync freeze.
- `VOC-106-EV-00`: initial plan observation and #190 failure diagnosis.
- `VOC-106-EV-01`: release base/source/tree/compare/check/review/merge evidence.
- `VOC-106-EV-02`: synchronization source/main/tree/check/review/merge evidence.
- `VOC-106-EV-03`: separately reviewed synchronization merge evidence.
- `VOC-106-EV-04`: final refs, actual release-tree equality, ancestry/behind proof,
  and permanent-branch readback.
- `VOC-106-EV-05`: both short-lived-head recovery records and
  no-settings/no-manual-deletion/no-live-action evidence.

## Rollback and contingency

Before either merge, close its PR. After a release or synchronization merge, use a
new separately reviewed revert PR for the identifiable merge commit; never reset or
force-push a protected branch. If current ref safety, exact evidence, or merge method
is ambiguous, stop without a workaround and preserve the refs for accountable review.

## VOC-115 durable release-attempt contract

This is the operative prospective procedure; every conflicting SHA-only, generic
collision, blanket abandonment/retry, and release-attempt auto-deletion instruction
above is retained only as superseded history. Adopted VOC-115 uses deterministic
`release/voc-106-claim-*`, a full-SHA attempt ref, and allocation-bound
`release/voc-106-submit-*`. Exact same-target atomic requests coalesce; foreign,
malformed, or post-claim stale topology stops. Only the exact invocation verifying the
submit-marker `201` may send one canonical no-retry/no-redirect PR POST. Every other
observer/response and marker-plus-zero is `submit-outcome-unknown`, never retry.

The separately authorized held active no-bypass three-pattern ruleset plus exhaustive
numeric-max history equality is a prerequisite. Lossless exact page/object/command/
scan/pass schemas, dual-source refs, two stable passes, null-provenance stops, and
cardinality-first cleanup apply. Claim, attempt, and submit refs remain immutable and
never deletion eligible; same-`develop` retry requires a deterministic closed/conflict
frontier and fresh distinct identity. `VOC-080-HOLD-01` and every settings/ref/release/
deployment/live hold remains. Approved SHA/review/adoption evidence is unchanged.
