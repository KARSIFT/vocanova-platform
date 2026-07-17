# Change Risk Classification

Risk is classified by consequence, reversibility, blast radius, data sensitivity,
and authority impact—not by diff size alone. The effective class is the highest class
identified by the builder, path-based policy check, independent verifier, technical
steward, or founder.

| Class | Objective criteria and examples | Required verification | Approval | Release and rollback |
|---|---|---|---|---|
| R0 | Documentation, comments, formatting, tests, or metadata with no behavioral, policy, authority, security, or release effect | Policy check; applicable document/link checks; independent verification proportionate to the change | No founder or technical-steward approval unless a protected policy is affected | May release automatically; revert commit or redeploy prior artifact |
| R1 | Low-risk behavioral implementation; small blast radius; no sensitive data; backward compatible; independently reversible | Full installed baseline CI, acceptance evidence, independent verifier, preview when relevant | No founder or technical-steward approval | May release automatically after gates; tested revert, flag, or prior-artifact redeploy |
| R2 | Moderate blast radius, cross-component change, non-destructive schema addition, API addition, significant dependency update, or operational change with tested recovery | R1 plus integration/contract, accessibility, migration, security, performance, or staging checks as applicable | Independent verifier; designated domain review may be required | May release automatically only with staged evidence, monitoring, named rollback owner, and tested recovery |
| R3 | Authentication/authorization; sensitive-data handling; schema migrations; billing implementation; secrets; production infrastructure; AI-provider controls; audio/voice storage; backups; CI/CD, rollback, security, governance enforcement, or agent authority | All applicable CI; specialist security/architecture/migration/deployment review; independent verifier; explicit protected-area evidence | Qualified, accountable human technical steward | Steward approval required; controlled rollout and tested rollback/recovery required; destructive operations require restore evidence |
| R4 | New or changed strategy, pricing, financial commitment, legal position, privacy policy, material product direction, public promise, user-trust posture, difficult-to-reverse action, initial public launch, or major launch | R3 checks when technical areas are affected; decision record; impact analysis; independent verification | Founder; technical steward additionally when R3 areas are affected | Founder approval required; explicit go/no-go and rollback or contingency plan |

The table above is the current pre-A-003 authority. After valid A-003 activation, the
R0-R4 risk definitions and verification requirements remain, but routine R3 no
longer requires standing technical-steward approval or founder approval merely
because it is R3. R3 instead requires strengthened applicable technical controls and
independent verification. R4 remains founder-controlled. EHR is an exceptional
escalation condition, not a routine approval layer or risk class.

The A-003 transition itself is fixed at R4 with an R3 protected governance/authority
effect. It is classified and approved under pre-A-003 governance; a classifier change
inside VOC-002 cannot downgrade or authorize that same transition.

## Classification tests

Use the highest `Yes` answer:

1. Does this decide an R4 matter, commit the company publicly or financially, change
   user rights/trust, or authorize the initial/major launch? Classify R4.
2. Does it touch a protected technical path or change security, data, infrastructure,
   deployment, rollback, governance enforcement, or agent authority? Classify at
   least R3.
3. Does it have moderate blast radius, require coordinated migration, or require
   specialized validation even though it is not protected? Classify at least R2.
4. Does it change behavior but remain small, backward compatible, and independently
   reversible? Classify at least R1.
5. Is it demonstrably non-behavioral and non-policy documentation or maintenance?
   Classify R0.

Uncertainty raises the class until resolved. Splitting a change does not lower the
classification if the parts produce one combined consequence.

## Initial governance bootstrap classification

The initial DOC-16/A-002 adoption is R4 because it establishes consequential
governance. It requires founder approval, independent Claude Code verification, and
passing repository validation. The one-time bootstrap exception permits that initial
governance pull request to merge without a nonexistent technical steward, but does
not lower its risk, satisfy steward approval, authorize production, or apply to any
later R3/R4 change. The steward requirement is effective immediately after merge;
R3 production remains blocked until a qualified human steward is appointed and
enforcement is active.

## Automated risk floor

`scripts/governance/classify-change-risk.sh` computes a floor from changed paths and
the pull-request declaration. The workflow fails when the declared class is below
the detected floor. The classifier cannot identify semantic R4 decisions reliably;
the independent verifier must compare the diff with this document and escalate.

False positives are corrected by changing the classifier in the same independently
reviewed pull request. A comment, label, or approval cannot simply suppress the
detected floor.

Path classification remains a risk floor, not proof of a human approval requirement.
After valid A-003 activation, an R3 path does not by itself require founder or
standing technical-steward approval.

## Waivers

Required deterministic security checks and R4 founder approval are not
builder-waivable. While A-003 remains inactive, required R3 steward approval is also
not builder-waivable. After valid activation, no waiver may recreate routine steward
approval; EHR and independently applicable controls remain mandatory when triggered.
A time-limited waiver for another blocking check must name
the authority, reason, scope, expiry, compensating control, follow-up issue, and
rollback condition. The release record links the waiver.
