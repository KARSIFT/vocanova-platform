# VOC-037 — Impact Analysis

## Security and privacy

This drafting package itself has no security or privacy effect: it writes only
documentation files under its own `specs/changes/VOC-037-.../` directory, commits no
secret, and touches no application code, infrastructure config, or CI workflow. The
tasks it proposes have real security/privacy consequence once implemented and
adopted:

- `T00` (hosting decision) determines the production network/host boundary; if the
  founder chooses a different target than staging's single-server shape, the
  attack surface, patching responsibility, and blast radius of a host compromise
  change accordingly. Not resolvable by this drafting pass — flagged as an open
  question in specification.md.
- `T01` (secrets) is the task most directly about secret handling; its own
  acceptance criteria (`VOC-037-AC-01`) requires confirming, not merely stating,
  that production secrets stay unreachable from lower environments, consistent
  with DOC-11 §1's existing rule and this repository's `AGENTS.md` safety section
  ("Never commit secrets, credentials, production configuration, or unnecessary
  personal data").
- `T02` (privacy policy/terms) is the task with the clearest personal-data
  boundary: it must accurately state what is collected (account email, saved
  words, review history, sentence submissions, AI feedback, OAuth profile fields)
  and must not overstate or understate real data handling — an inaccurate privacy
  policy is itself a legal/trust risk, which is why this package proposes it as
  `R4` rather than a routine documentation change.
- `T03`/`T04` (kill switches, monitoring) reduce security/privacy risk by giving
  the founder a proven way to disable a feature or detect an incident quickly;
  their absence, not their presence, would be the risk.

No task in this package weakens, removes, or reinterprets any existing security or
privacy control; each either designs a new production-tier control or verifies an
existing staging-tier control also works in production.

## Data and migrations

None from this package's own diff. No task proposed here (`T00`–`T05`) requires a
schema migration; if a future task discovered during `T00`'s or `T01`'s
implementation turns out to need one (for example, a table to record consent to an
updated privacy policy), that would be scoped as its own task with its own
migration/rollback plan at that time, not silently added here.

## Analytics and accessibility

Not applicable to this package's own diff (documentation only, no UI or analytics
event touched). `T02`'s privacy-policy/terms pages, once implemented, will need
their own accessibility review as any other web-app page would (per DOC-12's
cross-milestone testing strategy, §9) — noted here as a forward pointer, not
resolved by this package.

## Risks, dependencies, and evidence

- `VOC-037-R00`: The founder may decide production needs a materially different
  hosting shape than staging (e.g. a managed platform instead of a self-hosted
  server), which would invalidate `T03`/`T04`'s assumption of reusing the existing
  kill-switch/monitoring mechanism largely unchanged. Mitigation: `T00` is
  sequenced first and every dependent task explicitly depends on its outcome
  rather than assuming a specific answer.
- `VOC-037-R01`: A privacy policy or terms of service drafted without careful,
  accurate grounding in what the application actually does could create legal
  exposure if inaccurate, or could be rejected/heavily revised by the founder,
  extending R2's timeline. Mitigation: `T02` is scoped as a draft for review, not
  a self-approving deliverable, and its acceptance criterion requires an explicit
  founder review record before treating it as complete.
- `VOC-037-R02`: This package cannot itself verify whether `docs/legal/` or an
  equivalent path should be a newly protected area once `T02` creates it; that
  determination belongs to whoever adopts this package and to
  `docs/governance/protected-areas.md`'s own maintainers, not to this drafting
  pass.
- `VOC-037-DEP-00`: Open — see `change.yaml`'s `dependencies` list and
  specification.md's "Open questions" for `T00`'s hosting decision and `T02`'s
  privacy-policy/terms drafting-ownership decision, both of which require a
  founder decision this drafting pass cannot make.
- `VOC-037-DEP-01`: Open — `T03` and `T04` cannot be implemented until `T00`'s
  decision is made and, where applicable, implemented.
- `VOC-037-DEP-02`: Informational only — `T01`'s chosen secrets mechanism will
  also apply to however `VOC-032-DEP-07`'s email-provider/Google-OAuth
  credentials eventually get provisioned for production, but `T01` does not
  itself resolve that still-open R1 follow-up.
- `VOC-037-EV-00` through `VOC-037-EV-05`: Not yet produced — each corresponds to
  the acceptance-criteria evidence named in `acceptance-criteria.md` and will be
  recorded by each task's own implementation once adopted and authorized.
