# Operations Documentation

| ID      | Document                                                                                                     | Status                            | Owner    | Related                         |
| ------- | ------------------------------------------------------------------------------------------------------------ | --------------------------------- | -------- | ------------------------------- |
| DOC-10  | [Development Workflow](10-development-workflow.md)                                                           | approved                          | founder  | DOC-11, DOC-15, DOC-16, DOC-19  |
| DOC-11  | [DevOps and CI/CD Plan](11-devops-and-ci-cd.md)                                                              | approved                          | founder  | DOC-10, DOC-16, DOC-19          |
| DOC-15  | [AI-Native Product and Engineering Operating Model](15-ai-native-product-and-engineering-operating-model.md) | approved                          | founder  | DOC-16                          |
| RUNBOOK | [External Ruflo orchestration](ruflo-external-orchestration.md)                                              | active                            | operator | ADR-0004, VOC-080-T02           |
| RUNBOOK | [PostgreSQL-to-D1 conversion rehearsal](postgresql-to-d1-conversion.md)                                      | active                            | operator | ADR-0003, VOC-080-T09           |
| RUNBOOK | [Held Cloudflare delivery and rollback](cloudflare-delivery.md)                                              | active                            | operator | ADR-0003, VOC-080-T10           |
| RECORD  | [Server-runtime retirement and repository rollback](server-runtime-retirement.md)                            | active                            | operator | ADR-0003, VOC-080-T11           |
| RECORD  | [VOC-080 repository transition](voc-080-transition-record.md)                                                | historical point-in-time evidence | operator | ADR-0003, ADR-0004, VOC-080-T12 |
| RECORD  | [VOC-081 F2 repository/local evidence](voc-081-f2-evidence.md)                                               | candidate                         | operator | ADR-0003, VOC-081-T04           |
| VISUAL  | [VOC-080 architecture and evidence map](voc-080-architecture.html)                                           | active                            | operator | VOC-080-T12                     |

The VOC-080 transition record is historical point-in-time evidence, not the current
hosted repository state. VOC-080 amends the active operating direction: Cloudflare Workers/D1 replaces the
owned-server target, and Ruflo may coordinate roles only from an external,
deny-by-default installation. See [ADR-0003](../decisions/ADR-0003-cloudflare-native-runtime-and-data.md)
and [ADR-0004](../decisions/ADR-0004-external-ruflo-orchestration.md).
VOC-081's record is intentionally integration-pending: it proves the candidate local
foundation but does not claim F3, authenticated-product acceptance, or live activation.

DOC-13 (F1 execution package, historical) and DOC-19 (governance reconciliation
notes, historical since DOC-16 v2.0 folded its role in directly) have moved to
[`docs/archive/`](../archive/) - both are retired records, not live operations
documents. See [`docs/README.md`](../README.md)'s canonical index for their
current path and status.
