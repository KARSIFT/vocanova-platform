# Workflow Templates

Use these templates to keep changes traceable and proportionate:

- [Change specification](change-specification.md)
- [Acceptance criteria](acceptance-criteria.md)
- [Founder decision card](founder-decision-card.md)
- [Technical approval request](technical-approval-request.md)
- [Independent verification report](verification-report.md)
- [Release record](release-record.md)
- [Rollback report](rollback-report.md)

`technical-approval-request.md` is the current pre-A-003/R3 and one-time VOC-002
transition template. After valid A-003 activation it is legacy for routine R3 and may
be used only to preserve historical evidence or document qualified review triggered
by EHR or another explicit requirement. EHR must not become standing approval.

R0 documentation and small maintenance changes may use the lightweight section in
the pull-request template instead of copying a complete change specification. A
change is not lightweight if it affects behavior, policy, authority, security,
privacy, data, deployment, or another protected area.
