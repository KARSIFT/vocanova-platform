# Change Risk Classification

Risk is classified by consequence, reversibility, blast radius, data sensitivity,
and authority impact—not by diff size, line count, task count, or PR count alone.
The effective class is the highest class identified by the builder, path-based
policy check, independent verifier, technical steward, or founder.

| Class | Objective criteria and examples                                                                                                                                                                                                                                 | Required verification                                                                                                                                                                                                       | Approval                                                                                                           | Release and rollback                                                                                                                      |
| ----- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------- |
| R0    | Documentation, comments, formatting, tests, or metadata with no behavioral, policy, authority, security, or release effect                                                                                                                                      | Policy check; applicable document/link checks; independent verification proportionate to the change                                                                                                                         | No founder or technical-steward approval unless a protected policy is affected                                     | May release automatically; revert commit or redeploy prior artifact                                                                       |
| R1    | Low-risk behavioral implementation; small blast radius; no sensitive data; backward compatible; independently reversible                                                                                                                                        | Full installed baseline CI, acceptance evidence, independent verifier, preview when relevant                                                                                                                                | No founder or technical-steward approval                                                                           | May release automatically after gates; tested revert, flag, or prior-artifact redeploy                                                    |
| R2    | Moderate blast radius, cross-component change, non-destructive schema addition, API addition, significant dependency update, or operational change with tested recovery                                                                                         | R1 plus integration/contract, accessibility, migration, security, performance, or staging checks as applicable                                                                                                              | Independent verifier; designated domain review may be required                                                     | May release automatically only with staged evidence, monitoring, named rollback owner, and tested recovery                                |
| R3    | Authentication/authorization; sensitive-data handling; schema migrations; billing implementation; secrets; production infrastructure; AI-provider controls; audio/voice storage; backups; CI/CD, rollback, security, governance enforcement, or agent authority | All applicable CI; specialist security/architecture/migration/deployment review; independent verifier; explicit protected-area evidence                                                                                     | No standing technical-steward or founder approval solely because work is R3; EHR only when exceptionally triggered | Strengthened controls required; controlled rollout and tested rollback/recovery required; destructive operations require restore evidence |
| R4    | New or changed strategy, pricing, financial commitment, legal position, privacy policy, material product direction, public promise, user-trust posture, difficult-to-reverse action, initial public launch, or major launch                                     | R3 checks when technical areas are affected; decision record; impact analysis; specialist and deterministic evidence; rollback or contingency plan; exact-revision independent verification; no unresolved blocking finding | No approval from risk class; separately defined action-specific authority remains mandatory                        | Eligible only with complete R4 evidence, no active EHR, and every explicit external-effect hold satisfied                                 |

The table above is the current VOC-079 authority. R0-R4 remain consequence classes,
not personal-approval classes. No class requires founder or standing technical-steward
approval merely because of its label. R4 remains the highest class and requires the
strongest evidence. EHR is an exceptional escalation condition, not a routine approval
layer or risk class.

Action-specific authority remains separate from classification. Signing contracts,
committing spend, disclosing secrets or personal data, accessing production, making an
irreversible external mutation, and performing an initial public or predefined major
launch require the explicitly assigned authority and technical controls for that
action. A hold must name the action, accountable role, evidence, and completion or
expiry condition; it cannot silently apply to all R4 work.

Independent review is actor- and exact-revision-based: a different attributable human
or separately instantiated AI actor must not have authored the reviewed SHA. Model or
provider choice can be evidence hardening, but is never approval or authority; any
express cross-model requirement stays scoped to its applicable control.

The completed A-003 transition was fixed at R4 with an R3 protected
governance/authority effect and was approved under pre-A-003 governance. Its one-time
migration approval is exhausted and cannot authorize another change. Canonical A-003
lifecycle state (`docs/governance/a003-transition-state.yaml`) retains an R4 floor.

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
classification if the parts produce one combined consequence. Task count, line count,
or proposed PR count does not mandate or reduce the class.

## Initial governance bootstrap classification

The initial DOC-16/A-002 adoption was R4 because it established consequential
governance. Under the rules then in force it required founder approval, independent
Claude Code verification, and passing repository validation. The one-time bootstrap
exception permitted only that pull request to merge without a then-nonexistent
technical steward. It is historical, expired, non-reusable, and does not describe the
current R4 authority model.

## Automated risk floor

`scripts/governance/classify-change-risk.sh` computes a floor from changed paths and
the pull-request declaration. The workflow fails when the declared class is below
the detected floor. The classifier cannot identify semantic R4 decisions reliably;
the independent verifier must compare the diff with this document and escalate.

False positives are corrected by changing the classifier in the same independently
reviewed pull request. A comment, label, or approval cannot simply suppress the
detected floor.

Path classification remains a risk floor, not proof of a human approval requirement.
Under VOC-079, no R0-R4 path floor by itself requires founder or standing technical-
steward approval.

## Waivers

Required deterministic security checks, exact-revision independent review, complete
R4 evidence, and action-specific authority are not builder-waivable. No waiver may
recreate routine founder or steward approval from a risk label; EHR and independently
applicable controls remain mandatory when triggered.
A time-limited waiver for another blocking check must name
the authority, reason, scope, expiry, compensating control, follow-up issue, and
rollback condition. The release record links the waiver.
