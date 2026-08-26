# VOC-095 — Specification

## Objective and authority boundary

Correct the stale canonical lifecycle record for VOC-094-AM-01 after PR #160's
bookkeeping, exact review, eligibility, normal merge, and post-merge checks completed.
The correction is repository-only. It does not authorize or perform Cloudflare,
DNS, GitHub settings/secrets, deployment, migration, traffic, spending, production,
data, public-launch, or `main` actions.

The plan PR contains only this new package. A single later implementation PR, after
VOC-095 adoption and fresh exact review, updates the VOC-094 package surfaces listed
in `change.yaml`. No living-document edit is preclaimed here.

## Canonical facts to bind

The implementation PR must bind these immutable facts without rewriting historic
reviews or adoption:

1. AM-01 approved candidate `c99be122fa2143ebceaf18bb64639a2bbf66a1a3`, its accountable
   approval, and its Cloudflare/security/independent review history.
2. Final bookkeeping candidate `aad884a6d53c5e0f13b94f8042774b14a07015af`, final
   independent R4 PASS, Cloudflare PASS, and security/settings PASS.
3. Governance run `32913984893` on that exact candidate with literal
   `eligible: true` and `reasons: []`.
4. Normal non-author PR #160 merge from that candidate into `develop`, producing
   `75e5c9909fe105a9af3e6e8a3600fec27fcbd593`.
5. Successful post-merge CI `32914336969`, Security `32914336980`, and Governance
   `32914336981`, plus the lifecycle/source-head evidence comment.

The correction must set the AM-01 adoption bookkeeping gate and the package's
implementation authority fields to reflect these facts, while changing release and
blocker prose from “AM-01 bookkeeping pending” to “AM-01 bookkeeping complete;
external ACT records remain held.” It must not turn ACT-02 or any other external
action hold into an authorization.

## Incident and preserved staging state

Issue #161 records that stale bookkeeping was detected during ACT-02 pre-authority
review. ACT-02 stopped before Worker creation, D1 migration, Custom Domain, DNS,
traffic, deployment, rollback, production, billing, or launch action. ACT-01 had
already created D1 `vocanova-staging` UUID
`22ae386f-e3f5-4d98-a3ad-18b39d3b8556` under its own explicit external authority;
the preserved evidence says it has zero tables, no user data, no migrations, no
jurisdiction, and zero incremental cost. VOC-095 records this as a historical
sequencing incident only. It neither deletes nor uses the D1 and does not authorize
ACT-02.

## Required implementation boundary

The later implementation PR must remain one coherent repository-only correction.
It must audit direct VOC-094 AM-01 claims in the eight VOC-094 package documents and
change only stale lifecycle/effectiveness/bookkeeping assertions. A search of other
living repository documents must be recorded; unrelated documents remain unchanged
unless a direct contradiction is demonstrated. No application, workflow, policy,
Cloudflare, DNS, secret, environment, billing, production, or launch content is in
scope.

## Fresh ACT-02 boundary

After the correction merges, ACT-02 remains held until its corrected merged SHA is
independently reviewed and a new exact action record binds current overlay/resource
hashes, current Free/$0 evidence, permissions, account/zone/resource readbacks,
authority, expiry, and drift stops. The preserved D1 must not be migrated or used
under VOC-095. A package bookkeeping correction is not a substitute for action
authority.
