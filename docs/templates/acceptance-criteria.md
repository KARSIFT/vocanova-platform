# Acceptance Criteria Template

Acceptance criteria describe observable outcomes, not implementation preferences.
Use stable IDs that can be referenced by tasks, tests, pull requests, and release
evidence.

## AC-01 — Outcome title

Given a specific starting state and authorized actor
When a specific action or event occurs
Then an observable result occurs
And relevant persistence, permission, privacy, analytics, or audit effects hold

### Evidence

- Automated test and command:
- Preview/staging observation:
- Screenshot, log, or artifact link (no secrets or personal data):

## Coverage checklist

Include applicable criteria for:

- successful behavior;
- input validation and boundary conditions;
- authorization and forbidden behavior;
- loading, empty, offline, timeout, and error states;
- accessibility and keyboard/screen-reader behavior;
- persistence, retries, duplication, and consistency;
- security, privacy, logging, and data lifecycle;
- compatibility, migration, and rollback; and
- analytics or operational observations.

Avoid subjective words such as “fast,” “intuitive,” or “secure” without a measurable
or reviewable condition.
