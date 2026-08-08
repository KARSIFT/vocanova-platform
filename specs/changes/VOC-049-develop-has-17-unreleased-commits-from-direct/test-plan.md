# VOC-049 — Test Plan

## VOC-049-TEST-00 — Re-verified compare output is complete and matches the recorded evidence

- Covers: `VOC-049-AC-00`, `VOC-049-AC-03`
- Preconditions: package adopted; repository access to `origin/main` and
  `origin/develop`.
- Procedure: run `git fetch origin main develop` then
  `git log --format='%H %ad %s' --date=short origin/main..origin/develop`;
  independently cross-check the count and SHAs against `VOC-049-T00`'s
  recorded evidence.
- Expected result: the command's output matches `VOC-049-T00`'s recorded
  commit list and SHAs exactly, with no undocumented discrepancy. If the
  count is zero, `VOC-049-AC-03`'s closing-without-promotion path applies.
- Evidence: `VOC-049-EV-00`

## VOC-049-TEST-01 — Promoted `main` content is exactly the re-verified commit set, no more and no less

- Covers: `VOC-049-AC-01`
- Preconditions: `VOC-049-T00` found a non-zero gap; `VOC-049-T01` completed.
- Procedure: after promotion, run
  `git log --format='%H %s' <last-known-good-sha>..origin/main` and diff the
  resulting commit list against `VOC-049-T00`'s recorded evidence list.
- Expected result: the two lists are identical (same SHAs, same order,
  same count). Any extra or missing commit fails this test.
- Evidence: `VOC-049-EV-01`

## VOC-049-TEST-02 — Promotion used an explicit, governed mechanism, not an ungoverned direct push

- Covers: `VOC-049-AC-02`
- Preconditions: `VOC-049-T01` completed.
- Procedure: inspect the promotion evidence for either (a) a merge/PR record
  showing `release.yml`'s `check-and-open`/`auto-promote` jobs fired off this
  package's own adopted task issue closing, or (b) an explicit, human-
  authorized manual promotion PR with reviewer approval recorded, per
  whichever mechanism `specification.md`'s open question 1 was resolved to
  at adoption time.
- Expected result: a governed record exists for the chosen mechanism; a bare
  `git push` to `main` with no PR, review, or workflow trail fails this test
  regardless of content correctness.
- Evidence: `VOC-049-EV-01`

## VOC-049-TEST-03 — Independent verification binds to the exact promoted SHA and confirms no self-approval

- Covers: `VOC-049-AC-04`
- Preconditions: `VOC-049-T01` completed; independent verifier assigned.
- Procedure: independent verifier (Claude Code, per `CLAUDE.md`) inspects the
  exact final `main` revision SHA after promotion, cross-checks it against
  `VOC-049-T00`'s recorded snapshot, and confirms the implementer of `T01`
  did not also approve/merge their own promotion PR.
- Expected result: SHA match confirmed; no self-approval found; verifier
  report explicitly names the active authority model and any remaining
  required R3/R4/EHR gate.
- Evidence: `VOC-049-EV-02`

Positive coverage: `TEST-00` through `TEST-03` above. Negative/failure
coverage: `TEST-01`/`TEST-02` explicitly fail on extra/missing commits or an
ungoverned push. No migration, accessibility, or authorization-boundary
change is introduced by this package's own tasks, so no dedicated coverage
for those dimensions is added here beyond what already exists for the
promoted content's own original PRs. No test in this plan uses secrets or
production data.
