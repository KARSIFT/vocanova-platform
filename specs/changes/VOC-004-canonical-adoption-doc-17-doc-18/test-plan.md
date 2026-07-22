# VOC-004 Test Plan

## VOC-004-TEST-01 — Unit regression suite

Run `python3 -m unittest discover -s tooling/governance/tests -p 'test_*.py' -v`.

Expected result: all positive and negative repository-governance cases pass.

## VOC-004-TEST-02 — Repository validator

Run `python3 tooling/governance/validate_repository_foundation.py --repository-root .`.

Expected result: the complete post-VOC-004 candidate passes.

## VOC-004-TEST-03 — Shell syntax

Run `bash -n scripts/governance/validate-governance.sh` and
`bash -n scripts/governance/classify-change-risk.sh`.

Expected result: both scripts parse successfully.

## VOC-004-TEST-04 — Governance wrapper

Run `bash scripts/governance/validate-governance.sh`.

Expected result: required files, governance markers, R4 paths, and repository validator
all pass.

## VOC-004-TEST-05 — Declared risk

Run the classifier against the exact base/candidate and PR body with declaration
required.

Expected result: detected floor R4, establishing paths listed, declared R4 accepted.

## VOC-004-TEST-06 — Frozen-body mutation

Mutate either canonical substantive body in an isolated test copy.

Expected result: validation fails with the corresponding frozen-body checksum error.

## VOC-004-TEST-07 — Atomic-adoption regression

Remove either canonical file or set either adoption flag false in an isolated copy.

Expected result: validation fails; one-document adoption is impossible.

## VOC-004-TEST-08 — False-autonomy regressions

Individually claim Control Plane implementation, RL1/RL2 activation, automatic or
autonomous merge, production deployment, autonomous production release, or active
technical status in an isolated copy.

Expected result: every mutation fails validation.

## VOC-004-TEST-09 — Historical-evidence regression

Run existing A-003 exact evidence, exhausted migration approval, EHR, and historical
technical-steward mutation tests.

Expected result: all remain fail-closed.

## VOC-004-TEST-10 — Diff integrity

Run `git diff --check origin/develop...HEAD` for the publish candidate and independently
compare canonical bodies to the frozen sources after stripping frontmatter.

Expected result: no whitespace errors and both body hashes exactly match.
