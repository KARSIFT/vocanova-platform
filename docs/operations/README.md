# Operations Documentation

| ID      | Document                                                                                                     | Status                                | Owner    | Related                         |
| ------- | ------------------------------------------------------------------------------------------------------------ | ------------------------------------- | -------- | ------------------------------- |
| DOC-10  | [Development Workflow](10-development-workflow.md)                                                           | approved                              | founder  | DOC-11, DOC-15, DOC-16, DOC-19  |
| DOC-11  | [DevOps and CI/CD Plan](11-devops-and-ci-cd.md)                                                              | approved                              | founder  | DOC-10, DOC-16, DOC-19          |
| DOC-15  | [AI-Native Product and Engineering Operating Model](15-ai-native-product-and-engineering-operating-model.md) | approved                              | founder  | DOC-16                          |
| RUNBOOK | [External Ruflo orchestration](ruflo-external-orchestration.md)                                              | active                                | operator | ADR-0004, VOC-080-T02           |
| RUNBOOK | [PostgreSQL-to-D1 conversion rehearsal](postgresql-to-d1-conversion.md)                                      | active                                | operator | ADR-0003, VOC-080-T09           |
| RUNBOOK | [Standard staging delivery and held production](cloudflare-delivery.md)                                      | active; PR2 settings truth recorded   | operator | ADR-0003, VOC-100               |
| RECORD  | [Server-runtime retirement and repository rollback](server-runtime-retirement.md)                            | active                                | operator | ADR-0003, VOC-080-T11           |
| RECORD  | [VOC-080 repository transition](voc-080-transition-record.md)                                                | historical point-in-time evidence     | operator | ADR-0003, ADR-0004, VOC-080-T12 |
| RECORD  | [VOC-081 F2 repository/local evidence](voc-081-f2-evidence.md)                                               | active (repository/local F2 complete) | operator | ADR-0003, VOC-081-T04           |
| RECORD  | [VOC-105 F3 staging-foundation evidence](voc-105-f3-evidence.md)                                             | active (F3 complete-effective)        | operator | DOC-12, VOC-105                 |
| VISUAL  | [VOC-080 architecture and evidence map](voc-080-architecture.html)                                           | active                                | operator | VOC-080-T12                     |

The VOC-080 transition record is historical point-in-time evidence, not the current
hosted repository state. VOC-080 amends the active operating direction: Cloudflare Workers/D1 replaces the
owned-server target, and Ruflo may coordinate roles only from an external,
deny-by-default installation. See [ADR-0003](../decisions/ADR-0003-cloudflare-native-runtime-and-data.md)
and [ADR-0004](../decisions/ADR-0004-external-ruflo-orchestration.md).
VOC-081's complete stack was integrated by PR #108 and passed post-merge
revalidation, so repository/local F2 is complete and effective. The record preserves
its earlier integration-pending candidate state as history. The separate VOC-105
record validates every DOC-12 gate item and reports F3 staging foundation
complete-effective. A1/P1+ acceptance remains unresolved and separate. Production
readiness and traffic, learner-data access, and public launch remain unresolved or
held; `VOC-080-HOLD-01` and `VOC-080-HOLD-02` remain held.

VOC-100 replaces the prospective custom staging binder with a standard GitHub
environment design. VOC-100 PR2 records that the separately authorized settings
action created `cloudflare-staging` with exactly the two environment secret names,
sole `develop` branch policy, disabled admin bypass, identity-layer self-review
allowed, and no matching repository or organization secret names. No dispatch,
deployment, production, DNS, billing, spending, learner-data, launch, or unrelated
settings action occurred. VOC-105 later records the exact successful delivery event
as one input to the complete F3 gate decision; it performs no new live action.

DOC-13 (F1 execution package, historical) and DOC-19 (governance reconciliation
notes, historical since DOC-16 v2.0 folded its role in directly) have moved to
[`docs/archive/`](../archive/) - both are retired records, not live operations
documents. See [`docs/README.md`](../README.md)'s canonical index for their
current path and status.

RUNBOOK: [Procedure template](%61%31-%73taging-acceptance.md) — pending-separate-authority; owner: operator; related: DOC-12, VOC-112.
