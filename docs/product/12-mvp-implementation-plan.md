# VocaNova MVP implementation plan

## Product loop

The MVP proves one coherent loop:

> discover useful words → save → review with spaced repetition → write an original sentence → receive focused AI feedback → complete daily missions → build a habit

The [MVP PRD](01-mvp-prd.md) defines product completion. This document provides sequencing and acceptance guidance.

## Milestones

| Milestone              | Outcome                                                            |
| ---------------------- | ------------------------------------------------------------------ |
| Application foundation | Reproducible web, API, D1, contracts, tests, and local development |
| Authentication         | Secure learner identity, sessions, and account lifecycle           |
| Discover and save      | Discover words, inspect details, save, and remove vocabulary       |
| Review                 | Complete scheduled spaced-repetition sessions                      |
| Sentence practice      | Write original sentences and receive bounded AI feedback           |
| Habit and progress     | Complete daily missions and understand progress                    |
| Integrated loop        | Complete the full mobile-first journey reliably                    |
| Staging readiness      | Validate deployment, migrations, observability, and rollback       |
| Production readiness   | Complete security, privacy, legal, cost, and operations checks     |
| Controlled launch      | Release gradually, monitor outcomes, and retain rollback control   |

Dependencies are intentional: authentication precedes learner-owned data; discovery precedes review; review precedes sentence practice; the integrated loop precedes launch readiness.

## Acceptance guidance

### Application foundation

A contributor can clone the repository, install frozen dependencies, initialize local D1, run the web and API Workers, generate contracts, and pass the documented validation commands without remote credentials.

### Authentication

Supported sign-in methods work, sessions survive navigation, logout invalidates the session, unauthorized requests fail, cross-user access is impossible, and abuse controls are tested.

### Discover and save

A learner can discover a word, open its detail, save it, see consistent saved state, and remove it.

### Review

Saved words enter the schedule, due words can be reviewed, responses update state exactly once, and completion is accurate.

### Sentence practice

A learner can submit an original sentence and receive focused, encouraging feedback. Provider failures, prompt injection, unsafe output, privacy, cross-user isolation, and cost limits are tested. AI can be disabled without disabling the non-AI learning loop.

### Habit and progress

Missions and progress reflect completed behavior accurately. Duplicate, failed, or unauthorized actions cannot create false progress.

### Integrated loop

The complete journey works across supported layouts with no critical product, security, data-integrity, accessibility, or reliability defect.

### Staging readiness

A release candidate can be deployed to an isolated environment, migrated, smoke-tested, observed, and rolled back using a documented process. Remote delivery is not currently automated in this repository.

### Production readiness

Production configuration, credentials, privacy, legal documents, monitoring, rollback, cost limits, and incident response are ready. A repository merge does not itself authorize a deployment or production-data operation.

### Controlled launch

Begin with a limited cohort. Expand only while authentication, learner isolation, AI safety, data integrity, latency, errors, and cost remain within accepted bounds. Pause or roll back on a material failure.

## Issue readiness

An implementation issue should state:

- the user problem and intended outcome;
- scope and explicit exclusions;
- testable acceptance criteria;
- affected product, API, data, security, privacy, and accessibility boundaries;
- relevant rollout, migration, and rollback concerns.

Routine small fixes may put this information directly in the pull request.

## Definition of done

- Behavior meets the stated acceptance criteria.
- Relevant unit, integration, contract, migration, and end-to-end tests pass.
- Error and authorization paths are covered.
- Generated contracts remain consistent.
- Documentation is current.
- No secrets or private data are committed or logged.
- Required CI passes and review findings are resolved.
- Remote delivery is verified when the issue includes deployment.

## Testing strategy

Use the smallest relevant layers while developing, then run the complete affected gate:

1. formatting, linting, type checking, dependency audit, and secret scanning;
2. unit and component tests;
3. D1 migration, atomicity, authorization, and integration tests;
4. OpenAPI and client-contract tests;
5. end-to-end accessibility and critical-flow tests;
6. credential-free Worker builds and dry runs;
7. protected staging or production checks only when explicitly part of the change.

## MVP exclusions

The MVP excludes native mobile applications, open-ended AI chat, pronunciation and speech features, essay correction, a full grammar curriculum, teacher dashboards, social leaderboards, subscriptions, model fine-tuning, complex microservices, and infrastructure that is not required for the core loop.
