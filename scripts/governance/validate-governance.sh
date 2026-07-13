#!/usr/bin/env bash
set -euo pipefail

required_files=(
  AGENTS.md
  CLAUDE.md
  .github/CODEOWNERS
  .github/pull_request_template.md
  docs/governance/16-autonomous-development-operating-model.md
  docs/governance/amendments/A-002-governed-autonomous-releases.md
  docs/governance/approval-matrix.md
  docs/governance/change-risk-classification.md
  docs/governance/protected-areas.md
  docs/governance/post-merge-activation-checklist.md
  docs/governance/repository-settings.md
  docs/templates/change-specification.md
  docs/templates/acceptance-criteria.md
  docs/templates/founder-decision-card.md
  docs/templates/technical-approval-request.md
  docs/templates/verification-report.md
  docs/templates/release-record.md
  docs/templates/rollback-report.md
)

for file in "${required_files[@]}"; do
  [[ -f "$file" ]] || { echo "Missing required governance file: $file" >&2; exit 1; }
  [[ -s "$file" ]] || { echo "Empty governance file: $file" >&2; exit 1; }
done

if [[ -e CODEOWNERS ]]; then
  echo "CODEOWNERS must live only at .github/CODEOWNERS to avoid conflicting policies." >&2
  exit 1
fi

required_pr_fields=(
  "Risk classification:"
  "Affected protected areas"
  "Acceptance-criteria evidence"
  "Commands executed and results"
  "Preview deployment"
  "Security and privacy"
  "Migration/data integrity"
  "Rollback trigger"
  "Analytics/telemetry"
  "Documentation"
  "Independent-verifier report/result"
  "Required approval class"
)

for field in "${required_pr_fields[@]}"; do
  grep -Fq "$field" .github/pull_request_template.md || {
    echo "Pull-request template is missing required field: $field" >&2
    exit 1
  }
done

amendment=docs/governance/amendments/A-002-governed-autonomous-releases.md
grep -Fq "Low-risk, reversible R0-R1 production releases may merge" "$amendment"
grep -Fq "technical steward" "$amendment"
grep -Fq "require founder approval" "$amendment"
grep -Fq "initial public launch" "$amendment"
grep -Fq "Initial governance bootstrap adoption" docs/governance/16-autonomous-development-operating-model.md
grep -Fq "Initial adoption exception" "$amendment"
grep -Fq "Initial DOC-16/A-002 governance adoption" docs/governance/approval-matrix.md
grep -Fq "R3 production changes remain" docs/governance/post-merge-activation-checklist.md

if grep -Eq 'FOUNDER_GITHUB_USERNAME|TECHNICAL_STEWARD_GITHUB_USERNAME' .github/CODEOWNERS; then
  echo "CODEOWNERS contains an unverifiable identity placeholder." >&2
  exit 1
fi

if ! grep -Ev '^[[:space:]]*#' .github/CODEOWNERS | grep -Eq '@[A-Za-z0-9]'; then
  echo "CODEOWNERS contains no configured identity." >&2
  exit 1
fi

if grep -Ev '^[[:space:]]*#' .github/CODEOWNERS | grep -Eqi '@[^[:space:]]*(claude|codex|bot)([[:space:]]|$)'; then
  echo "A bot-looking identity is configured as a CODEOWNER; human role assignment must be verified." >&2
  exit 1
fi

protected_tokens=(auth database billing ai audio voice storage migrations infra backups deploy release rollback)
for token in "${protected_tokens[@]}"; do
  grep -Fiq "$token" .github/CODEOWNERS || {
    echo "CODEOWNERS is missing protected-area token: $token" >&2
    exit 1
  }
  grep -Fiq "$token" scripts/governance/classify-change-risk.sh || {
    echo "Risk classifier is missing protected-area token: $token" >&2
    exit 1
  }
done

r4_ruleset_paths=(
  /.github/CODEOWNERS
  /.github/workflows/governance-policy.yml
  /scripts/governance/
  /docs/operations/15-ai-native-product-and-engineering-operating-model.md
  /docs/governance/approval-matrix.md
  /docs/governance/change-risk-classification.md
  /docs/governance/protected-areas.md
  /docs/governance/post-merge-activation-checklist.md
  /docs/governance/amendments/
  /docs/governance/16-autonomous-development-operating-model.md
)

for path in "${r4_ruleset_paths[@]}"; do
  grep -Fq "$path" docs/governance/repository-settings.md || {
    echo "Repository settings are missing fixed R4 ruleset path: $path" >&2
    exit 1
  }
  grep -Fq "${path#/}" scripts/governance/classify-change-risk.sh || {
    echo "Risk classifier is missing fixed R4 path family: ${path#/}" >&2
    exit 1
  }
done

bash -n scripts/governance/classify-change-risk.sh
echo "Governance structure validation passed."
