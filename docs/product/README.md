# Product Documentation

| ID     | Document                                                 | Status   | Owner   | Related                                                        |
| ------ | -------------------------------------------------------- | -------- | ------- | -------------------------------------------------------------- |
| DOC-00 | [Product Bible](00-product-bible.md)                     | approved | founder | DOC-01, DOC-02, DOC-03, DOC-05, DOC-09, DOC-12, ADR-0005       |
| DOC-01 | [MVP PRD](01-mvp-prd.md)                                 | approved | founder | DOC-00, DOC-03, DOC-08, DOC-09, DOC-12                         |
| DOC-12 | [MVP Implementation Plan](12-mvp-implementation-plan.md) | approved | founder | DOC-00, DOC-01, DOC-03, DOC-04, DOC-10, DOC-11, DOC-13, DOC-18 |

DOC-12's product milestones remain authoritative. DOC-00 preserves founder/product-owner
decision authority; [ADR-0005](../decisions/ADR-0005-provider-neutral-distinct-agent-role-separation.md)
defines provider-neutral delivery-role separation. VOC-080 supplies the current
technical migration sequence to Cloudflare Workers/D1 and the external Ruflo role model.
VOC-081 supplies the contributor-verifiable F2 foundation. Its complete stack was
integrated by PR #108 and passed post-merge revalidation, so the
[evidence record](../operations/voc-081-f2-evidence.md) now reports repository/local
F2 complete and effective while preserving the earlier candidate state as history.
The [VOC-105 evidence record](../operations/voc-105-f3-evidence.md) separately
validates every DOC-12 F3 gate item and reports the F3 staging foundation
complete-effective. A1/P1+ acceptance remains unresolved and is a separate future
outcome. Production readiness and traffic, learner-data access, and public launch
remain unresolved or held; `VOC-080-HOLD-01` and `VOC-080-HOLD-02` remain held.

[Migration notes](../archive/README-migration-notes.md) preserve VOC-007 source reconciliation evidence;
[adoption notes](../archive/README-adoption-notes.md) record the VOC-008 semantic correction decisions.
