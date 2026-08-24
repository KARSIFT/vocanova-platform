import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

export const CURRENT_RECORD_PATH =
  "docs/governance/repository-settings-current.yaml";
export const FOUNDATION_COMMAND =
  "node scripts/foundation/voc085-settings-truthfulness-policy.mjs";
const CLI_PATH = fileURLToPath(import.meta.url);

const EXPECTED_CURRENT_RECORD = {
  schema_version: 1,
  repository: "KARSIFT/vocanova-platform",
  repository_identity: {
    owner: "KARSIFT",
    name: "vocanova-platform",
    full_name: "KARSIFT/vocanova-platform",
  },
  observed_at: "2026-08-24",
  observed_at_utc: "2026-08-24T22:06:57Z",
  as_of: "2026-08-24",
  source: "github-rest-api-read-only-after-authorized-voc092-setting-mutation",
  observation_evidence: {
    issue: 151,
    url: "https://github.com/KARSIFT/vocanova-platform/issues/151",
    comment: 5402043002,
    note: "post-mutation read-back of all previously recorded settings surfaces",
  },
  source_endpoints: [
    "GET /repos/KARSIFT/vocanova-platform",
    "GET /repos/KARSIFT/vocanova-platform/actions/permissions",
    "GET /repos/KARSIFT/vocanova-platform/actions/permissions/workflow",
    "GET /repos/KARSIFT/vocanova-platform/rulesets",
    "GET /repos/KARSIFT/vocanova-platform/branches/develop/protection",
    "GET /repos/KARSIFT/vocanova-platform/branches/main/protection",
    "GET /repos/KARSIFT/vocanova-platform/vulnerability-alerts",
    "GET /repos/KARSIFT/vocanova-platform/automated-security-fixes",
    "GitHub repository security-settings API fields for secret scanning",
  ],
  source_schema_surface: {
    repository: {
      endpoint: "GET /repos/KARSIFT/vocanova-platform",
      raw_response_fields: [
        "visibility",
        "default_branch",
        "allow_merge_commit",
        "allow_squash_merge",
        "allow_rebase_merge",
        "delete_branch_on_merge",
        "security_and_analysis.dependabot_security_updates.status",
        "security_and_analysis.secret_scanning.status",
        "security_and_analysis.secret_scanning_push_protection.status",
        "security_and_analysis.secret_scanning_validity_checks.status",
      ],
      normalized_record_fields: [
        "visibility",
        "default_branch",
        "allow_merge_commit",
        "allow_squash_merge",
        "allow_rebase_merge",
        "delete_branch_on_merge",
        "dependabot_security_updates",
        "secret_scanning.enabled",
        "secret_scanning.push_protection",
        "secret_scanning.validity_checks",
      ],
    },
    actions_permissions: {
      endpoint: "GET /repos/KARSIFT/vocanova-platform/actions/permissions",
      raw_response_fields: [
        "enabled",
        "allowed_actions",
        "sha_pinning_required",
      ],
      normalized_record_fields: [
        "actions.enabled",
        "actions.allowed_actions",
        "actions.sha_pinning_required",
      ],
    },
    workflow_permissions: {
      endpoint:
        "GET /repos/KARSIFT/vocanova-platform/actions/permissions/workflow",
      raw_response_fields: [
        "default_workflow_permissions",
        "can_approve_pull_request_reviews",
      ],
      normalized_record_fields: [
        "actions.default_workflow_permissions",
        "actions.can_approve_pull_request_reviews",
      ],
    },
    rulesets: {
      endpoint: "GET /repos/KARSIFT/vocanova-platform/rulesets",
      raw_response_semantics: {
        http_status: 200,
        response_shape: "top-level-array",
      },
      normalized_record_fields: ["rulesets"],
    },
    branch_protection: {
      develop: {
        endpoint:
          "GET /repos/KARSIFT/vocanova-platform/branches/develop/protection",
        raw_response_semantics: {
          http_status: 404,
          message: "Branch not protected",
        },
        normalized_record_fields: ["branch_protection.develop"],
      },
      main: {
        endpoint:
          "GET /repos/KARSIFT/vocanova-platform/branches/main/protection",
        raw_response_semantics: {
          http_status: 404,
          message: "Branch not protected",
        },
        normalized_record_fields: ["branch_protection.main"],
      },
    },
    dependency_vulnerability_alerts: {
      endpoint: "GET /repos/KARSIFT/vocanova-platform/vulnerability-alerts",
      raw_response_semantics: {
        http_status: 204,
        response_body: "no-content",
      },
      normalized_record_fields: [
        "dependency_vulnerability_alerts.enabled",
        "dependency_vulnerability_alerts.endpoint_status",
      ],
    },
    dependabot_security_updates: {
      raw_sources: {
        automated_security_fixes: {
          endpoint:
            "GET /repos/KARSIFT/vocanova-platform/automated-security-fixes",
          http_status: 200,
          body_fields: ["enabled", "paused"],
        },
        repository_security_and_analysis: {
          endpoint: "GET /repos/KARSIFT/vocanova-platform",
          field_paths: [
            "security_and_analysis.dependabot_security_updates.status",
          ],
        },
      },
      normalized_record_fields: ["dependabot_security_updates"],
    },
    secret_scanning: {
      raw_sources: {
        repository_security_and_analysis: {
          endpoint: "GET /repos/KARSIFT/vocanova-platform",
          field_paths: [
            "security_and_analysis.secret_scanning.status",
            "security_and_analysis.secret_scanning_push_protection.status",
            "security_and_analysis.secret_scanning_validity_checks.status",
          ],
        },
      },
      normalized_record_fields: [
        "secret_scanning.enabled",
        "secret_scanning.push_protection",
        "secret_scanning.validity_checks",
      ],
    },
  },
  freshness: {
    semantics: "point-in-time-observation-not-live-state",
    network_free_guard_scope: "internal-consistency-only-not-live-freshness",
    live_freshness_proven: false,
    stale_when: [
      "any later repository-settings mutation is authorized or observed",
      "the observation can no longer be independently reverified",
    ],
    required_follow_up:
      "immediate-governed-doc-only-reconciliation-after-future-mutation",
  },
  settings_mutation: {
    status: "completed",
    field: "delete_branch_on_merge",
    prior_value: false,
    current_value: true,
    pre_state_utc: "2026-08-24T22:06:14Z",
    post_state_utc: "2026-08-24T22:06:18Z",
    exact_payload: "delete_branch_on_merge-true",
    rollback_payload: "delete_branch_on_merge-false",
    authority: "https://github.com/KARSIFT/vocanova-platform/pull/152",
    authority_comment: 5401902952,
    pre_state_evidence:
      "https://github.com/KARSIFT/vocanova-platform/issues/151",
    pre_state_comment: 5402030322,
    post_state_evidence:
      "https://github.com/KARSIFT/vocanova-platform/issues/151",
    post_state_comment: 5402032905,
  },
  visibility: "public",
  default_branch: "main",
  allow_merge_commit: true,
  allow_squash_merge: true,
  allow_rebase_merge: false,
  delete_branch_on_merge: true,
  actions: {
    enabled: true,
    allowed_actions: "selected",
    sha_pinning_required: true,
    default_workflow_permissions: "read",
    can_approve_pull_request_reviews: false,
  },
  rulesets: [],
  branch_protection: {
    develop: "http-404-not-protected",
    main: "http-404-not-protected",
  },
  dependency_vulnerability_alerts: {
    enabled: true,
    endpoint_status: 204,
  },
  dependabot_security_updates: "disabled",
  secret_scanning: {
    enabled: false,
    push_protection: false,
    validity_checks: false,
  },
  follow_up_boundary: {
    future_settings_mutation_requires_immediate_governed_doc_only_follow_up: true,
    this_record_does_not_authorize_or_perform_mutation: true,
  },
  specialist_review: {
    required: true,
    status: "pending-exact-final-revision-review",
    scope: [
      "source-api-schema-and-endpoint-interpretation",
      "availability-versus-enabled-distinction",
      "dependency-vulnerability-alert-versus-dependabot-security-update-distinction",
      "point-in-time-freshness-and-staleness-semantics",
      "exact-authorized-mutation-and-rollback-evidence",
    ],
    note: "specialist exact-revision review remains pending for this implementation revision",
  },
};

const ACTIVE_DOCUMENT_REQUIREMENTS = [
  {
    path: "README.md",
    requirements: [
      {
        label: "public point-in-time repository claim",
        snippet:
          "The repository is public on GitHub, current as observed at 2026-08-24.",
      },
      {
        label: "observed-versus-disabled hosted controls split",
        snippet:
          "dependency/vulnerability alerts and automatic deletion of merged branches are enabled as observed, while rulesets and branch protection are absent and Dependabot security updates and GitHub-hosted secret scanning/push protection are disabled.",
      },
      {
        label: "public-availability warning",
        snippet: "Public availability does not mean a control is configured.",
      },
    ],
  },
  {
    path: ".github/README.md",
    requirements: [
      {
        label: "current public settings guidance",
        snippet:
          "The repository is public, current as observed at 2026-08-24, but public availability does not mean a ruleset, branch protection, security feature, or other hosted enforcement control is configured.",
      },
      {
        label: "automatic merged-branch deletion distinction",
        snippet:
          "Automatic deletion of merged branches is enabled as the one VOC-092 setting change; it is not branch protection or merge automation.",
      },
    ],
  },
  {
    path: "docs/governance/repository-settings.md",
    requirements: [
      {
        label: "point-in-time hosted record warning",
        snippet:
          "which is current as observed at 2026-08-24 and is point-in-time evidence, not a live settings feed.",
      },
      {
        label: "enabled alerts versus disabled automation split",
        snippet:
          "The same read-only observation records dependency/vulnerability alerts enabled. This is distinct from the disabled Dependabot security-update automation.",
      },
      {
        label: "internal-consistency-only freshness boundary",
        snippet:
          "The record is point-in-time only. Its network-free guard proves internal consistency with the committed observation; it cannot prove live freshness.",
      },
      {
        label: "historical VOC-080 boundary",
        snippet:
          "They are not the current hosted state and are not rewritten to resemble the public observation above.",
      },
      {
        label: "prospective controls remain unconfigured",
        snippet:
          "The following are desired mature controls, not configured current state",
      },
      {
        label: "non-blocking settings hold",
        snippet:
          "It does not block repository-only planning, implementation, review, or merge.",
      },
      {
        label: "alerts are current evidence, not prospective",
        snippet:
          "The currently enabled dependency/vulnerability alerts are observed evidence, not a prospective held target.",
      },
      {
        label: "package does not activate prospective controls",
        snippet:
          "None of the other prospective controls is enabled by this documentation package; any later activation remains under `VOC-085-HOLD-00`.",
      },
      {
        label: "record-versus-mutation boundary",
        snippet:
          "This guide records but does not itself perform VOC-092's completed one-field settings mutation.",
      },
      {
        label: "automatic deletion current setting",
        snippet: "rebase merges and automatic branch deletion enabled",
      },
      {
        label: "exact mutation evidence boundary",
        snippet:
          "VOC-092 changed only `delete_branch_on_merge` from `false` to `true`",
      },
    ],
  },
  {
    path: "docs/governance/16-autonomous-development-operating-model.md",
    requirements: [
      {
        label: "DOC-16 hosted settings observation boundary",
        snippet:
          "for the hosted settings posture current as observed at 2026-08-24, including VOC-092's enabled automatic deletion of merged branches. Neither record is a live settings feed, and automatic branch deletion is not automatic merge or deployment.",
      },
      {
        label: "DOC-16 dependency audit distinction",
        snippet:
          "vulnerability alerts as observed; Dependabot security updates disabled",
      },
      {
        label: "DOC-16 secret scanning distinction",
        snippet:
          "GitHub-hosted secret scanning, push protection, and validity checks disabled as observed at 2026-08-24",
      },
    ],
  },
  {
    path: "docs/operations/cloudflare-delivery.md",
    requirements: [
      {
        label: "delivery guide public observation boundary",
        snippet: "The repository is public, current as observed at 2026-08-24.",
      },
      {
        label: "delivery guide no live inspection claim",
        snippet:
          "covers public visibility and absent branch restrictions; it does not inspect environments or secrets.",
      },
      {
        label: "delivery guide no hosted-config claim",
        snippet:
          "The repository therefore makes no claim that hosted environment approvals, secrets, or branch restrictions are configured.",
      },
      {
        label: "delivery guide held future settings mutation boundary",
        snippet:
          "Any later GitHub settings mutation remains held by `VOC-085-HOLD-00` and requires an immediate governed documentation-only follow-up; Cloudflare delivery activation remains separately held by the VOC-080 holds above.",
      },
      {
        label: "delivery guide automatic deletion distinction",
        snippet:
          "It also records VOC-092's enabled automatic deletion of merged branches, which is neither branch protection nor deployment.",
      },
    ],
  },
];

const ACTIVE_SECTION_CONTRADICTIONS = [
  {
    path: "README.md",
    anchor: "The repository is public on GitHub,",
    label: "active README repository-summary section",
    forbidden: [
      {
        label: "private-current repository claim",
        pattern:
          /(?:^|[.!?]\s+)The repository is private(?: on GitHub)?(?:,\s*current as observed at 2026-08-24)?\b/i,
      },
    ],
  },
  {
    path: ".github/README.md",
    anchor:
      "The repository is public, current as observed at 2026-08-24, but public availability does not mean a ruleset, branch protection, security feature, or other hosted enforcement control is configured.",
    label: "active .github current-settings section",
    forbidden: [
      {
        label: "private-current repository claim",
        pattern:
          /(?:^|[.!?]\s+)The repository is private(?: on GitHub)?(?:,\s*current as observed at 2026-08-24)?\b/i,
      },
    ],
  },
  {
    path: "docs/governance/repository-settings.md",
    heading: "## Current hosted posture (observed 2026-08-24)",
    label: "active current hosted-posture section",
    forbidden: [
      {
        label: "private-current repository claim",
        pattern:
          /(?:^|[.!?]\s+)(?:The repository|this repository)\b[^.]*\b(?:is|remains)\s+private\b/i,
      },
      {
        label: "settings-mutation claim",
        pattern: /\bthis package and this guide perform settings mutation\b/i,
      },
      {
        label: "live deployment or settings-activation claim",
        pattern:
          /\bthis package and this guide\b[^.]*\b(?:deploy|deploys|create|creates|configure|configures|activate|activates)\b[^.]*\b(?:current hosted posture|github environment|cloudflare resource|secret|delivery)\b/i,
      },
    ],
  },
  {
    path: "docs/governance/repository-settings.md",
    heading: "## Prospective settings held by VOC-085-HOLD-00",
    label: "active held-controls section",
    forbidden: [
      {
        label: "held controls promoted to configured current state",
        pattern:
          /\bdesired mature controls,\s*configured current state\b|\b(?:rulesets|protected `develop`\/`main` branches|pull-request-only changes and required checks|conversation, code-owner, bypass, and release protections|dependabot security updates|secret scanning and push protection|hosted enforcement|environment approval settings)\b[^.]*\b(?:are configured|is configured|are enabled|is enabled|are active|is active)\b/i,
      },
      {
        label: "settings hold blocks repository-only merge",
        pattern:
          /\b(?:VOC-085-HOLD-00|It)\b[^.]*\b(?:blocks|prevents)\b[^.]*\brepository-only\b[^.]*\b(?:planning|implementation|review|merge)\b/i,
      },
    ],
  },
  {
    path: "docs/governance/repository-settings.md",
    heading: "## VOC-080 historical transition snapshot",
    label: "active VOC-080 historical-boundary section",
    forbidden: [
      {
        label: "VOC-080 private snapshot claimed current",
        pattern:
          /(?:^|[.!?]\s+)(?:The VOC-080 private(?:-repository)? snapshot|VOC-080(?:'s)? private(?:-repository)? snapshot|The private-repository snapshot|The VOC-080 transition record|The JSON source)\b[^.]*\b(?:is|are|remains)\s+(?:now\s+|still\s+)?(?:the\s+)?(?:current hosted state|source for the current(?:-as-observed-at-2026-08-24)? repository settings)\b/i,
      },
    ],
  },
  {
    path: "docs/governance/16-autonomous-development-operating-model.md",
    heading: "## Release classes and production release authority",
    label: "active DOC-16 release-authority section",
    forbidden: [
      {
        label: "private-current repository claim",
        pattern:
          /(?:^|[.!?]\s+)(?:The repository|this repository)\b[^.]*\b(?:is|remains)\s+private\b/i,
      },
      {
        label: "private-plan-as-current repository claim",
        pattern:
          /(?:^|[.!?]\s+)(?:the private plan|private-plan limitations|the VOC-080 private-repository snapshot)\b[^.]*\b(?:is|are|remains)\s+(?:the\s+)?current\b[^.]*\brepository state\b/i,
      },
    ],
  },
  {
    path: "docs/operations/cloudflare-delivery.md",
    anchor: "The repository is public, current as observed at 2026-08-24.",
    label: "active delivery-settings section",
    forbidden: [
      {
        label: "private-current repository claim",
        pattern:
          /(?:^|[.!?]\s+)(?:The repository|this repository)\b[^.]*\b(?:is|remains)\s+private\b/i,
      },
      {
        label: "hosted environment or branch restrictions claimed configured",
        pattern:
          /(?:^|[.!?]\s+)(?:the repository therefore claims that\s+[^.]*\b(?:hosted environment approvals|secrets|branch restrictions)\b[^.]*\b(?:are configured|is configured|are active|is active)\b|hosted environment approvals\b[^.]*\b(?:are configured|is configured|are active|is active)\b)/i,
      },
      {
        label: "settings observation claims live inspection",
        pattern:
          /\b(?:settings record|record)\b[^.]*\b(?:inspects|queries|queried|reads live)\b[^.]*\b(?:environments|secrets)\b/i,
      },
    ],
  },
];

function normalizeWhitespace(value) {
  return value
    .replace(/\s+/g, " ")
    .replace(/\s*\/\s*/g, "/")
    .trim();
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function whitespaceTolerantPattern(value) {
  return new RegExp(
    value
      .trim()
      .split(/\s+/)
      .map((part) => escapeRegExp(part))
      .join("\\s+"),
    "m",
  );
}

function sectionText(text, heading) {
  const headingPattern = new RegExp(`^${escapeRegExp(heading)}\\s*$`, "m");
  const match = headingPattern.exec(text);
  if (match === null) return null;

  const start = match.index + match[0].length;
  const remainder = text.slice(start);
  const nextHeading = /^\n## .+$/m.exec(remainder);
  const end =
    nextHeading === null ? text.length : start + nextHeading.index + 1;
  return text.slice(start, end);
}

function anchoredSectionText(text, anchor) {
  const match = whitespaceTolerantPattern(anchor).exec(text);
  if (match === null) return null;
  const index = match.index;

  const remainder = text.slice(index);
  const nextHeading = /^\n## .+$/m.exec(remainder);
  const end =
    nextHeading === null ? text.length : index + nextHeading.index + 1;
  return text.slice(index, end);
}

function parseScalarValue(rawValue, relativePath, lineNumber, errors) {
  if (rawValue === "[]") return [];
  if (rawValue === "true") return true;
  if (rawValue === "false") return false;
  if (/^-?\d+$/.test(rawValue)) return Number(rawValue);
  if (rawValue.startsWith("[") || rawValue.startsWith("{")) {
    errors.push(
      `${relativePath}:${lineNumber}: unsupported inline collection '${rawValue}'`,
    );
    return null;
  }
  return rawValue;
}

function parseStrictYamlSubset(text, relativePath) {
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  const errors = [];

  for (const [index, line] of lines.entries()) {
    const trimmed = line.trim();
    if (trimmed === "") continue;
    if (line.includes("\t")) {
      errors.push(`${relativePath}:${index + 1}: tabs are not allowed`);
    }
    if (trimmed.includes("#")) {
      errors.push(
        `${relativePath}:${index + 1}: comments are not allowed in this strict YAML subset`,
      );
    }
  }

  const state = { index: 0 };

  function skipBlankLines() {
    while (state.index < lines.length && lines[state.index].trim() === "") {
      state.index += 1;
    }
  }

  function indentation(line) {
    return line.match(/^ */)[0].length;
  }

  function parseList(expectedIndent) {
    const items = [];

    while (true) {
      skipBlankLines();
      if (state.index >= lines.length) break;

      const line = lines[state.index];
      const lineIndent = indentation(line);
      if (lineIndent < expectedIndent) break;
      if (lineIndent !== expectedIndent) {
        errors.push(
          `${relativePath}:${state.index + 1}: malformed indentation in list item`,
        );
        state.index += 1;
        continue;
      }

      const trimmed = line.slice(expectedIndent);
      if (!trimmed.startsWith("- ")) break;

      const valueText = trimmed.slice(2).trim();
      if (valueText === "") {
        errors.push(
          `${relativePath}:${state.index + 1}: nested list or map items are unsupported`,
        );
        state.index += 1;
        continue;
      }

      items.push(
        parseScalarValue(valueText, relativePath, state.index + 1, errors),
      );
      state.index += 1;
    }

    return items;
  }

  function parseMap(expectedIndent) {
    const object = {};

    while (true) {
      skipBlankLines();
      if (state.index >= lines.length) break;

      const line = lines[state.index];
      const lineIndent = indentation(line);
      if (lineIndent < expectedIndent) break;
      if (lineIndent !== expectedIndent) {
        errors.push(
          `${relativePath}:${state.index + 1}: malformed indentation in mapping`,
        );
        state.index += 1;
        continue;
      }

      const trimmed = line.slice(expectedIndent);
      if (trimmed.startsWith("- ")) {
        errors.push(
          `${relativePath}:${state.index + 1}: unexpected list item at mapping level`,
        );
        state.index += 1;
        continue;
      }

      const separatorIndex = trimmed.indexOf(":");
      if (separatorIndex <= 0) {
        errors.push(
          `${relativePath}:${state.index + 1}: invalid mapping entry '${trimmed}'`,
        );
        state.index += 1;
        continue;
      }

      const key = trimmed.slice(0, separatorIndex).trim();
      const valueText = trimmed.slice(separatorIndex + 1).trim();
      if (Object.hasOwn(object, key)) {
        errors.push(
          `${relativePath}:${state.index + 1}: duplicate key '${key}'`,
        );
      }

      state.index += 1;

      if (valueText !== "") {
        object[key] = parseScalarValue(
          valueText,
          relativePath,
          state.index,
          errors,
        );
        continue;
      }

      skipBlankLines();
      if (state.index >= lines.length) {
        errors.push(
          `${relativePath}:${state.index}: key '${key}' is missing a nested block`,
        );
        object[key] = null;
        break;
      }

      const nextLine = lines[state.index];
      const nextIndent = indentation(nextLine);
      if (nextIndent <= expectedIndent) {
        errors.push(
          `${relativePath}:${state.index + 1}: key '${key}' is missing a nested block`,
        );
        object[key] = null;
        continue;
      }
      if (nextIndent !== expectedIndent + 2) {
        errors.push(
          `${relativePath}:${state.index + 1}: malformed indentation under key '${key}'`,
        );
      }

      object[key] = nextLine.slice(nextIndent).startsWith("- ")
        ? parseList(nextIndent)
        : parseMap(nextIndent);
    }

    return object;
  }

  skipBlankLines();
  const data = parseMap(0);
  skipBlankLines();

  return { data, errors };
}

function describeValue(value) {
  if (Array.isArray(value))
    return `[${value.map((item) => describeValue(item)).join(", ")}]`;
  if (value !== null && typeof value === "object") return "object";
  return JSON.stringify(value);
}

function compareCurrentRecord(expected, actual, path, errors, relativePath) {
  if (Array.isArray(expected)) {
    if (!Array.isArray(actual)) {
      errors.push(
        `${relativePath}: ${path} must be an array, found ${describeValue(actual)}`,
      );
      return;
    }
    if (actual.length !== expected.length) {
      errors.push(
        `${relativePath}: ${path} must contain ${expected.length} item(s), found ${actual.length}`,
      );
      return;
    }
    for (const [index, expectedValue] of expected.entries()) {
      compareCurrentRecord(
        expectedValue,
        actual[index],
        `${path}[${index}]`,
        errors,
        relativePath,
      );
    }
    return;
  }

  if (expected !== null && typeof expected === "object") {
    if (
      actual === null ||
      typeof actual !== "object" ||
      Array.isArray(actual)
    ) {
      errors.push(
        `${relativePath}: ${path} must be an object, found ${describeValue(actual)}`,
      );
      return;
    }

    for (const key of Object.keys(expected)) {
      if (!Object.hasOwn(actual, key)) {
        errors.push(`${relativePath}: missing ${path}.${key}`);
      }
    }

    for (const key of Object.keys(actual)) {
      if (!Object.hasOwn(expected, key)) {
        errors.push(`${relativePath}: unexpected ${path}.${key}`);
      }
    }

    for (const [key, expectedValue] of Object.entries(expected)) {
      if (!Object.hasOwn(actual, key)) continue;
      compareCurrentRecord(
        expectedValue,
        actual[key],
        `${path}.${key}`,
        errors,
        relativePath,
      );
    }
    return;
  }

  if (actual !== expected) {
    errors.push(
      `${relativePath}: ${path} must equal ${describeValue(expected)}, found ${describeValue(actual)}`,
    );
  }
}

function readRequiredText(repositoryRoot, relativePath, errors) {
  const absolutePath = path.join(repositoryRoot, relativePath);
  if (!existsSync(absolutePath)) {
    errors.push(`${relativePath}: required file is missing`);
    return null;
  }
  return readFileSync(absolutePath, "utf8");
}

function requireSnippet(errors, relativePath, text, label, snippet) {
  if (!normalizeWhitespace(text).includes(normalizeWhitespace(snippet))) {
    errors.push(`${relativePath}: missing ${label}`);
  }
}

function inspectCurrentRecord(repositoryRoot) {
  const errors = [];
  const text = readRequiredText(repositoryRoot, CURRENT_RECORD_PATH, errors);
  if (text === null) return errors;

  const parsed = parseStrictYamlSubset(text, CURRENT_RECORD_PATH);
  errors.push(...parsed.errors);
  if (parsed.errors.length > 0) return errors;

  compareCurrentRecord(
    EXPECTED_CURRENT_RECORD,
    parsed.data,
    "current_record",
    errors,
    CURRENT_RECORD_PATH,
  );

  return errors;
}

function inspectActiveDocuments(repositoryRoot) {
  const errors = [];

  for (const {
    path: relativePath,
    requirements,
  } of ACTIVE_DOCUMENT_REQUIREMENTS) {
    const text = readRequiredText(repositoryRoot, relativePath, errors);
    if (text === null) continue;
    for (const { label, snippet } of requirements) {
      requireSnippet(errors, relativePath, text, label, snippet);
    }
  }

  return errors;
}

function inspectActiveSectionContradictions(repositoryRoot) {
  const errors = [];

  for (const rule of ACTIVE_SECTION_CONTRADICTIONS) {
    const text = readRequiredText(repositoryRoot, rule.path, errors);
    if (text === null) continue;

    const section =
      "heading" in rule
        ? sectionText(text, rule.heading)
        : anchoredSectionText(text, rule.anchor);
    if (section === null) {
      errors.push(`${rule.path}: missing ${rule.label}`);
      continue;
    }

    for (const forbidden of rule.forbidden) {
      if (forbidden.pattern.test(section)) {
        errors.push(
          `${rule.path}: contradictory ${forbidden.label} in ${rule.label}`,
        );
      }
    }
  }

  return errors;
}

export function inspectFoundationScripts(packageJsonText) {
  const errors = [];
  let packageJson;

  try {
    packageJson = JSON.parse(packageJsonText);
  } catch {
    return ["package.json: invalid JSON"];
  }

  if (packageJson?.scripts?.["ci:settings-truth"] !== FOUNDATION_COMMAND) {
    errors.push(
      "package.json: ci:settings-truth must run the VOC-085 settings truthfulness validator",
    );
  }

  if (
    !packageJson?.scripts?.["ci:foundation"]?.includes(
      "pnpm run ci:settings-truth",
    )
  ) {
    errors.push(
      "package.json: ci:foundation omits settings truthfulness validation",
    );
  }

  return errors;
}

export function validateSettingsTruth(repositoryRoot) {
  const errors = [];
  const packageJsonText = readRequiredText(
    repositoryRoot,
    "package.json",
    errors,
  );
  if (packageJsonText !== null) {
    errors.push(...inspectFoundationScripts(packageJsonText));
  }
  errors.push(...inspectCurrentRecord(repositoryRoot));
  errors.push(...inspectActiveDocuments(repositoryRoot));
  errors.push(...inspectActiveSectionContradictions(repositoryRoot));
  return errors;
}

function main() {
  const scriptRoot = path.dirname(CLI_PATH);
  const repositoryRoot = path.resolve(scriptRoot, "../..");
  const errors = validateSettingsTruth(repositoryRoot);
  if (errors.length > 0) {
    console.error(
      `VOC-085 settings truthfulness validation failed with ${errors.length} error(s).`,
    );
    for (const error of errors) {
      console.error(`- ${error}`);
    }
    process.exitCode = 1;
    return;
  }

  process.stdout.write(
    "VOC-085 settings truthfulness validation passed. Internal consistency only; live freshness is not proven.\n",
  );
}

if (process.argv[1] === CLI_PATH) {
  main();
}
