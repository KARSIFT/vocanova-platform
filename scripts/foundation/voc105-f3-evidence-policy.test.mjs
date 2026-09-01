import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import {
  DESIGNATED_F3_SURFACES,
  F3_RECORD_PATH,
  inspectF3Evidence,
  inspectF3Surface,
} from "./voc105-f3-evidence-policy.mjs";

const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);
const fixturePaths = ["package.json", ...DESIGNATED_F3_SURFACES];

function fixture() {
  const target = fs.mkdtempSync(path.join(os.tmpdir(), "voc105-f3-"));
  for (const relative of fixturePaths) {
    fs.mkdirSync(path.dirname(path.join(target, relative)), {
      recursive: true,
    });
    fs.copyFileSync(path.join(root, relative), path.join(target, relative));
  }
  return target;
}

function snapshot(target) {
  return new Map(
    fixturePaths.map((relative) => [
      relative,
      fs.existsSync(path.join(target, relative))
        ? fs.readFileSync(path.join(target, relative), "utf8")
        : null,
    ]),
  );
}

function changedPaths(target, before) {
  return fixturePaths.filter((relative) => {
    const absolute = path.join(target, relative);
    const after = fs.existsSync(absolute)
      ? fs.readFileSync(absolute, "utf8")
      : null;
    return after !== before.get(relative);
  });
}

function mutateJson(target, mutate) {
  const file = path.join(target, F3_RECORD_PATH);
  const value = JSON.parse(fs.readFileSync(file, "utf8"));
  mutate(value);
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function append(target, relative, text) {
  fs.appendFileSync(path.join(target, relative), `\n${text}\n`);
}

function jsonWithDuplicate(value, targetPath, duplicateKey, currentPath = "$") {
  if (Array.isArray(value))
    return `[${value
      .map((entry, index) =>
        jsonWithDuplicate(
          entry,
          targetPath,
          duplicateKey,
          `${currentPath}[${index}]`,
        ),
      )
      .join(",")}]`;
  if (value && typeof value === "object") {
    const entries = Object.entries(value).map(
      ([key, entry]) =>
        `${JSON.stringify(key)}:${jsonWithDuplicate(
          entry,
          targetPath,
          duplicateKey,
          `${currentPath}.${key}`,
        )}`,
    );
    if (currentPath === targetPath) {
      assert.ok(Object.hasOwn(value, duplicateKey));
      entries.push(
        `${JSON.stringify(duplicateKey)}:${JSON.stringify("duplicate")}`,
      );
    }
    return `{${entries.join(",")}}`;
  }
  return JSON.stringify(value);
}

function assertMutation(relative, mutate, pattern) {
  const target = fixture();
  try {
    const before = snapshot(target);
    mutate(target);
    assert.deepEqual(
      changedPaths(target, before),
      [relative],
      `fixture must mutate only ${relative}`,
    );
    const diagnostic = inspectF3Evidence(target).join("\n");
    assert.ok(
      diagnostic.includes(`${relative}:`),
      `${relative} diagnostic missing: ${diagnostic}`,
    );
    assert.match(diagnostic, pattern);
  } finally {
    fs.rmSync(target, { recursive: true, force: true });
  }
}

function rejects(name, mutate, pattern) {
  test(name, () => {
    const target = fixture();
    try {
      const before = snapshot(target);
      mutate(target);
      assert.equal(
        changedPaths(target, before).length,
        1,
        "fixture must mutate exactly one file",
      );
      assert.match(inspectF3Evidence(target).join("\n"), pattern);
    } finally {
      fs.rmSync(target, { recursive: true, force: true });
    }
  });
}

test("accepts the canonical complete-effective record", () =>
  assert.deepEqual(inspectF3Evidence(root), []));

for (const [name, field, value] of [
  ["wrong SHA", "event_sha", "0000000000000000000000000000000000000000"],
  ["wrong run", "run_id", 1],
  ["wrong attempt", "attempt", 2],
])
  rejects(
    name,
    (target) =>
      mutateJson(
        target,
        (record) => void (record.delivery_event[field] = value),
      ),
    /delivery/,
  );

for (const step of ["migration", "exact_promotion", "bounded_smoke"])
  rejects(
    `rejects failed ${step}`,
    (target) =>
      mutateJson(
        target,
        (record) => void (record.delivery_event.steps[step] = "failed"),
      ),
    /delivery step/,
  );

rejects(
  "rejects wrong rollback outcome",
  (target) =>
    mutateJson(target, (record) => {
      record.delivery_event.steps.rollback_after_promotion_failure = "success";
    }),
  /rollback outcome/,
);
rejects(
  "rejects missing resource proof",
  (target) =>
    mutateJson(target, (record) => {
      record.milestone_gate.items = record.milestone_gate.items.filter(
        (item) => item.id !== "isolated-staging-resources",
      );
    }),
  /isolated-staging-resources/,
);
rejects(
  "rejects missing observability proof",
  (target) =>
    mutateJson(target, (record) => {
      record.milestone_gate.items = record.milestone_gate.items.filter(
        (item) => item.id !== "privacy-safe-observability",
      );
    }),
  /privacy-safe-observability/,
);
rejects(
  "rejects missing settings proof",
  (target) =>
    mutateJson(target, (record) => {
      record.milestone_gate.items = record.milestone_gate.items.filter(
        (item) => item.id !== "standard-environment-protection",
      );
    }),
  /standard-environment-protection/,
);
rejects(
  "rejects a wrong resource evidence link",
  (target) =>
    mutateJson(target, (record) => {
      record.milestone_gate.items.find(
        (item) => item.id === "isolated-staging-resources",
      ).evidence = "https://github.com/KARSIFT/vocanova-platform/issues/158";
    }),
  /isolated-staging-resources evidence/,
);
rejects(
  "rejects a wrong settings contract link",
  (target) =>
    mutateJson(target, (record) => {
      record.settings_contract.settings_truth_pull_request =
        "https://github.com/KARSIFT/vocanova-platform/pull/175";
    }),
  /settings contract settings_truth_pull_request/,
);
rejects(
  "rejects wrong F2 dependency",
  (target) =>
    mutateJson(target, (record) => {
      record.milestone_gate.f2_dependency.merge_sha = "0".repeat(40);
    }),
  /F2 merge SHA/,
);
rejects(
  "rejects a missing hold",
  (target) =>
    mutateJson(
      target,
      (record) => void record.later_boundaries.inherited_holds.pop(),
    ),
  /inherited_holds/,
);
rejects(
  "rejects a history-boundary drift",
  (target) =>
    mutateJson(
      target,
      (record) => void (record.historical_boundary.packages = "rewritten"),
    ),
  /historical package boundary/,
);
rejects(
  "rejects an external-effect claim",
  (target) =>
    mutateJson(
      target,
      (record) =>
        void (record.external_effects_by_voc105 = "deployment-performed"),
    ),
  /VOC-105 external effects/,
);
rejects(
  "rejects a token value",
  (target) =>
    mutateJson(
      target,
      (record) => void (record.api_token = "this-is-a-prohibited-value"),
    ),
  /token, secret, password, key, or credential value/,
);
rejects(
  "rejects an immutable Worker UUID",
  (target) =>
    mutateJson(
      target,
      (record) =>
        void (record.worker_version = "123e4567-e89b-42d3-a456-426614174000"),
    ),
  /protected or unknown resource identifier/,
);
rejects(
  "rejects malformed JSON",
  (target) => fs.writeFileSync(path.join(target, F3_RECORD_PATH), "{"),
  /invalid JSON/,
);
rejects(
  "rejects stale active F3 wording",
  (target) =>
    append(target, "docs/README.md", "F3/staging remains unresolved."),
  /stale current F3/,
);
rejects(
  "rejects later milestone acceptance",
  (target) => append(target, "docs/product/README.md", "A1 is accepted."),
  /prohibited positive later product milestone/,
);
rejects(
  "rejects hold release",
  (target) =>
    append(target, "docs/operations/README.md", "VOC-080-HOLD-01 is released."),
  /hold release/,
);
rejects(
  "rejects direct live instruction",
  (target) =>
    append(target, "docs/operations/voc-105-f3-evidence.md", "Deploy now."),
  /live-action instruction/,
);
rejects(
  "rejects an alias script",
  (target) => {
    const file = path.join(target, "package.json");
    const value = JSON.parse(fs.readFileSync(file));
    value.scripts["ci:f3-evidence"] = "pnpm run ci:f2-evidence";
    fs.writeFileSync(file, JSON.stringify(value));
  },
  /ci:f3-evidence script/,
);
rejects(
  "rejects omission from the governed slot",
  (target) => {
    const file = path.join(target, "package.json");
    const value = JSON.parse(fs.readFileSync(file));
    value.scripts["ci:foundation"] = value.scripts["ci:foundation"].replace(
      " && pnpm run ci:f3-evidence",
      "",
    );
    fs.writeFileSync(file, JSON.stringify(value));
  },
  /ci:foundation must contain exact ci:f3-evidence segment/,
);

test("all nine designated surfaces are independently required", () => {
  for (const relative of DESIGNATED_F3_SURFACES)
    assertMutation(
      relative,
      (target) => fs.unlinkSync(path.join(target, relative)),
      /missing or unreadable/,
    );
});

test("public resource identifiers pass only at exact canonical labels and locations", () => {
  const delivery = fs.readFileSync(
    path.join(root, "docs/operations/cloudflare-delivery.md"),
    "utf8",
  );
  assert.deepEqual(
    inspectF3Surface(delivery, "docs/operations/cloudflare-delivery.md"),
    [],
  );
  const identifiers = [
    "0a9eda28b96d77c24dcde74f3e074d47",
    "63286d93b5f32925ac7366b4e97908be",
    "22ae386f-e3f5-4d98-a3ad-18b39d3b8556",
  ];
  for (const relative of DESIGNATED_F3_SURFACES.filter(
    (entry) => entry !== "docs/operations/cloudflare-delivery.md",
  ))
    for (const identifier of identifiers)
      assertMutation(
        relative,
        (target) =>
          append(target, relative, `Moved public resource ${identifier}.`),
        /protected or unknown resource identifier/,
      );
  assertMutation(
    "docs/operations/cloudflare-delivery.md",
    (target) => {
      const file = path.join(target, "docs/operations/cloudflare-delivery.md");
      fs.writeFileSync(
        file,
        fs
          .readFileSync(file, "utf8")
          .replace(
            "tuple binds account `0a9eda28b96d77c24dcde74f3e074d47`",
            "tuple binds zone `0a9eda28b96d77c24dcde74f3e074d47`",
          ),
      );
    },
    /canonical public resource context/,
  );
  for (const identifier of identifiers)
    assertMutation(
      "docs/operations/cloudflare-delivery.md",
      (target) =>
        append(
          target,
          "docs/operations/cloudflare-delivery.md",
          `Relocated canonical identifier ${identifier}.`,
        ),
      /canonical public resource .* occur exactly/,
    );
  for (const identifier of [
    "11111111111111111111111111111111",
    "123e4567-e89b-42d3-a456-426614174000",
  ])
    assertMutation(
      "docs/operations/cloudflare-delivery.md",
      (target) =>
        append(
          target,
          "docs/operations/cloudflare-delivery.md",
          `Unknown resource ${identifier}.`,
        ),
      /protected or unknown resource identifier/,
    );
});

test("credential vocabulary and values fail closed on every surface", () => {
  const unknownNames = [
    "THIRD_PARTY_SECRET",
    "SENTRY_AUTH_TOKEN",
    "OPENAI_API_KEY",
    "CF_ACCOUNT_ID",
    "DATABASE_PASSWORD",
  ];
  for (const relative of DESIGNATED_F3_SURFACES) {
    for (const name of unknownNames)
      assertMutation(
        relative,
        (target) => append(target, relative, `${name} is value-free.`),
        /unknown credential interface name/,
      );
    for (const allowed of ["CLOUDFLARE_ACCOUNT_ID", "CLOUDFLARE_API_TOKEN"])
      assertMutation(
        relative,
        (target) =>
          append(target, relative, `${allowed}=synthetic-inert-value`),
        /prohibited value/,
      );
    for (const [labelled, diagnostic] of [
      ["token: synthetic-inert-value", /value is prohibited/],
      ["secret=synthetic-inert-value", /value is prohibited/],
      ["password: synthetic-inert-value", /value is prohibited/],
      ["private-key=synthetic-inert-value", /value is prohibited/],
      ["api-key: synthetic-inert-value", /value is prohibited/],
      ["access-token=synthetic-inert-value", /value is prohibited/],
      ["The API token value is synthetic-inert-value.", /value is prohibited/],
      [
        "CLOUDFLARE_API_TOKEN is synthetic-inert-value.",
        /allowed credential interface name has a prohibited value/,
      ],
      [
        "CLOUDFLARE_ACCOUNT_ID value is synthetic-inert-value.",
        /allowed credential interface name has a prohibited value/,
      ],
      [
        "CLOUDFLARE_API_TOKEN has value synthetic-inert-value.",
        /allowed credential interface name has a prohibited value/,
      ],
      ["Password is synthetic-inert-value.", /value is prohibited/],
      ["Password was synthetic-inert-value.", /value is prohibited/],
      ["Token value is synthetic-inert-value.", /value is prohibited/],
      [
        "CLOUDFLARE_API_TOKEN's value is synthetic-inert-value.",
        /credential value is prohibited|prohibited value/,
      ],
      [
        "CLOUDFLARE_API_TOKEN value: synthetic-inert-value.",
        /credential value is prohibited|prohibited value/,
      ],
      [
        "CLOUDFLARE_API_TOKEN remains synthetic-inert-value.",
        /credential value is prohibited/,
      ],
      [
        "CLOUDFLARE_API_TOKEN maps to synthetic-inert-value.",
        /credential value is prohibited/,
      ],
      [
        "CLOUDFLARE_API_TOKEN -> synthetic-inert-value.",
        /credential value is prohibited/,
      ],
      [
        "CLOUDFLARE_API_TOKEN is redacted-looking-value.",
        /credential value is prohibited|prohibited value/,
      ],
    ])
      assertMutation(
        relative,
        (target) => append(target, relative, labelled),
        diagnostic,
      );
    assertMutation(
      relative,
      (target) =>
        append(
          target,
          relative,
          "Protected 123e4567-e89b-42d3-a456-426614174000.",
        ),
      /protected or unknown resource identifier/,
    );
  }
});

test("canonical guarded runbook regions pass and every guard drift or command fails", () => {
  const relative = "docs/operations/cloudflare-delivery.md";
  const canonical = fs.readFileSync(path.join(root, relative), "utf8");
  const compactCanonical = canonical.replace(/\s+/g, " ");
  for (const marker of [
    "remove the environment API-token secret",
    "cancel in-flight staging runs",
    "retry revocation",
    "verify the affected token is inactive",
    "run the exact ordered D1 migration ledger",
    "upload immutable SHA-prefix/run-ID/attempt-tagged Worker versions",
    "promote the exact UUIDs",
    "run bounded staging smoke",
    "both API and web restoration independently",
  ])
    assert.ok(
      compactCanonical.includes(marker),
      `canonical bounded procedure lacks ${marker}`,
    );
  for (const [needle, replacement, region] of [
    [
      "If required revocation cannot be confirmed",
      "Required revocation cannot be confirmed",
      "credential-policy",
    ],
    [
      "Only then do bounded credential steps",
      "Bounded credential steps",
      "manual-staging",
    ],
    [
      "Failures before promotion leave traffic unchanged",
      "Promote despite failure",
      "cancellation-rollback",
    ],
  ])
    assertMutation(
      relative,
      (target) => {
        const file = path.join(target, relative);
        fs.writeFileSync(
          file,
          fs.readFileSync(file, "utf8").replace(needle, replacement),
        );
      },
      new RegExp(`bounded procedure ${region}`),
    );
  assertMutation(
    relative,
    (target) => {
      const file = path.join(target, relative);
      const clause =
        "Only then do bounded credential steps check the exact account";
      const source = fs.readFileSync(file, "utf8");
      assert.ok(source.includes(clause));
      fs.writeFileSync(
        file,
        `${source.replace(clause, "The sequence is defined below")}\n${clause}.\n`,
      );
    },
    /bounded procedure manual-staging/,
  );
  assertMutation(
    relative,
    (target) => {
      const file = path.join(target, relative);
      fs.writeFileSync(
        file,
        fs
          .readFileSync(file, "utf8")
          .replace(
            "<!-- VOC-101-STAGING-CREDENTIAL-POLICY-END -->",
            "Deploy now.\n<!-- VOC-101-STAGING-CREDENTIAL-POLICY-END -->",
          ),
      );
    },
    /bounded procedure credential-policy/,
  );
  const commands = [
    "Deploy now.",
    "Operator: Deploy now.",
    "Kindly deploy now.",
    "Please, deploy now.",
    "Deploy it now.",
    "Deploy immediately.",
    "Please deploy now.",
    "Immediately deploy staging.",
    "Please immediately deploy staging.",
    "Dispatch the workflow.",
    "Migrate staging now.",
    "Promote to production.",
    "Retry the deployment.",
    "Upload the version.",
    "Publish the release.",
    "Configure settings now.",
    "Change DNS now.",
    "Route traffic now.",
    "Access learner data.",
    "Launch now.",
  ];
  for (const surface of DESIGNATED_F3_SURFACES)
    for (const command of commands)
      assertMutation(
        surface,
        (target) => append(target, surface, command),
        /live-action instruction|bounded procedure/,
      );
  for (const surface of DESIGNATED_F3_SURFACES) {
    const source = fs.readFileSync(path.join(root, surface), "utf8");
    for (const description of [
      "The command “Deploy now” is prohibited.",
      "The sanitized past delivery description records that retry was not required.",
      "No deployment occurred.",
      "No staging deployment took place.",
      "Deployment is prohibited.",
      "The previous staging deployment succeeded.",
      "The build was not deployed.",
      "The sanitized delivery deployed the API Worker successfully in the past.",
    ])
      assert.deepEqual(
        inspectF3Surface(`${source}\n${description}`, surface),
        [],
        `${surface} must accept exact safe operational description: ${description}`,
      );
  }
  for (const surface of DESIGNATED_F3_SURFACES)
    for (const prefix of ["", "Operator: ", "Kindly ", "Please, "])
      for (const [verb, object] of [
        ["Deploy", "it now"],
        ["Dispatch", "the workflow"],
        ["Promote", "immediately"],
        ["Migrate", "staging now"],
      ])
        assertMutation(
          surface,
          (target) => append(target, surface, `${prefix}${verb} ${object}.`),
          /live-action instruction|bounded procedure/,
        );
  const boundedClauses = [
    "remove the environment API-token secret",
    "cancel in-flight staging runs",
    "retry revocation",
    "verify the affected token is inactive",
    "run the exact ordered D1 migration ledger",
    "upload immutable SHA-prefix/run-ID/attempt-tagged Worker versions",
    "promote the exact UUIDs",
    "run bounded staging smoke",
    "both API and web restoration independently",
  ];
  for (const surface of DESIGNATED_F3_SURFACES)
    for (const clause of boundedClauses)
      assertMutation(
        surface,
        (target) => append(target, surface, `Relocated procedure: ${clause}.`),
        /outside its guarded runbook region|bounded procedure/,
      );
  for (const surface of DESIGNATED_F3_SURFACES)
    for (const verb of [
      "Publish",
      "Upload",
      "Retry",
      "Rotate",
      "Revoke",
      "Remove",
      "Delete",
      "Cancel",
      "Configure",
      "Change",
      "Create",
      "Enable",
      "Disable",
      "Restore",
      "Install",
      "Route",
      "Access",
      "Export",
      "Import",
      "Transform",
      "Set",
      "Use",
      "Dispatch",
      "Deploy",
      "Migrate",
      "Promote",
      "Switch",
      "Stop",
      "Run",
      "Execute",
      "Provision",
      "Edit",
      "Trigger",
      "Ship",
      "Move",
      "Restart",
      "Verify",
      "Start",
      "Destroy",
      "Drop",
      "Purge",
      "Submit",
    ])
      assertMutation(
        surface,
        (target) => append(target, surface, `${verb} now.`),
        /live-action instruction|bounded procedure/,
      );
  for (const surface of DESIGNATED_F3_SURFACES)
    assertMutation(
      surface,
      (target) => append(target, surface, "Restart the Cloudflare Worker now."),
      /live-action instruction|bounded procedure/,
    );
  for (const surface of DESIGNATED_F3_SURFACES)
    for (const inflected of [
      "Publishing now.",
      "Uploaded now.",
      "Retrying now.",
      "Rotated now.",
      "Revoking now.",
      "Removed now.",
      "Deleting now.",
      "Cancelled now.",
      "Configuring now.",
      "Changed now.",
      "Creating now.",
      "Enabled now.",
      "Disabled now.",
      "Restoring now.",
      "Installed now.",
      "Routing now.",
      "Accessing now.",
      "Exported now.",
      "Importing now.",
      "Transformed now.",
      "Dispatched now.",
      "Deployed now.",
      "Migrating now.",
      "Promoted now.",
      "Switching now.",
      "Stopped now.",
      "Running now.",
      "Executed now.",
      "Provisioning now.",
      "Edited now.",
      "Triggered now.",
      "Shipping now.",
      "Moved now.",
      "Restarting now.",
      "Verifying now.",
      "Started now.",
      "Destroying now.",
      "Dropped now.",
      "Purging now.",
      "Submitted now.",
      "Releasing now.",
      "Launched now.",
      "Uses staging now.",
      "Used staging now.",
      "Using staging now.",
      "Rollback now.",
      "Roll back now.",
      "Rolled back now.",
      "Moving now.",
      "Runs now.",
      "Ran now.",
      "Sets now.",
    ])
      assertMutation(
        surface,
        (target) => append(target, surface, inflected),
        /live-action instruction|bounded procedure/,
      );
  for (const surface of DESIGNATED_F3_SURFACES)
    for (const command of [
      "Configure credentials now.",
      "Create resources now.",
      "Release production now.",
      "Move staging.",
      "Provision resources.",
      "Edit deployment.",
      "Trigger workflow.",
      "Ship build.",
      "Execute workflow.",
      "Set DNS.",
      "Run CI.",
      "Stop staging.",
      "Roll out staging.",
      "Switch DNS.",
      "Turn on traffic.",
      "Go live.",
      "Verify the governed result now.",
      "Start the workflow now.",
      "Destroy resources now.",
      "Drop the database now.",
      "Purge the cache now.",
      "Submit the deployment now.",
      "Activate the site now.",
      "Initialize the database now.",
      "Wipe the database now.",
      "Query the account now.",
      "Push the artifact now.",
      "Turn it on now.",
      "Erase the database now.",
      "Truncate the database now.",
      "Boot the service now.",
      "Proceed now.",
      "Invoke the job now.",
      "Send it now.",
      "Spin it up now.",
      "Shut it down now.",
      "Flush the cache now.",
      "Clear the queue now.",
      "Open the gate now.",
      "Issue the request now.",
      "Approve it now.",
      "Authorize it now.",
      "Write the record now.",
      "Terminate the job now.",
    ])
      assertMutation(
        surface,
        (target) => append(target, surface, command),
        /live-action instruction|bounded procedure/,
      );
  for (const surface of DESIGNATED_F3_SURFACES)
    for (const inflected of [
      "Flushing the cache now.",
      "Flushed the cache now.",
      "Clears the queue now.",
      "Cleared the queue now.",
      "Opening the gate now.",
      "Opened the gate now.",
      "Issues the request now.",
      "Issued the request now.",
      "Approving it now.",
      "Approved it now.",
      "Authorizes it now.",
      "Authorized it now.",
      "Writing the record now.",
      "Written into the record now.",
      "Terminates the job now.",
      "Terminated the job now.",
    ])
      assertMutation(
        surface,
        (target) => append(target, surface, inflected),
        /live-action instruction|bounded procedure/,
      );
});

test("protected credential and F3 occurrences fail closed on every surface", () => {
  for (const surface of DESIGNATED_F3_SURFACES) {
    const source = fs.readFileSync(path.join(root, surface), "utf8");
    for (const disclosure of [
      "Authorization: Bearer synthetic-inert-value",
      "Bearer synthetic-inert-value",
      "Authorization = Bearer redacted-looking-value",
      "Basic auth synthetic-inert-value",
      "Authentication key synthetic-inert-value",
      "Auth header synthetic-inert-value",
      "JWT synthetic-inert-value",
      "Session cookie synthetic-inert-value",
      "Signing key synthetic-inert-value",
      "Private token synthetic-inert-value",
      "API key synthetic-inert-value",
      "Access key synthetic-inert-value",
      "Basic dXNlcjpwYXNzd29yZA==",
      "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjMifQ.signature",
      "Cookie: session=synthetic-inert-value",
      "Passphrase synthetic-inert-value",
      "TOTP seed synthetic-inert-value",
      "Authentication cookie synthetic-inert-value",
      "Encryption key synthetic-inert-value",
      "Recovery code: synthetic-inert-value",
      "Authentication code: synthetic-inert-value",
      "OTP: synthetic-inert-value",
      "Passcode: synthetic-inert-value",
      "Session ID: synthetic-inert-value",
      "Client certificate: synthetic-inert-value",
      "Recovery PIN: synthetic-inert-value",
      "Login code: synthetic-inert-value",
      "Session identifier: synthetic-inert-value",
      "Client cert: synthetic-inert-value",
      "mTLS certificate: synthetic-inert-value",
      "Authenticator seed: synthetic-inert-value",
      "Backup code: synthetic-inert-value",
      "Reset code: synthetic-inert-value",
      "Emergency code: synthetic-inert-value",
      "Device code: synthetic-inert-value",
      "Security code: synthetic-inert-value",
      "Recovery phrase: synthetic-inert-value",
      "Client assertion: synthetic-inert-value",
      "Signing certificate: synthetic-inert-value",
      "SSH key: synthetic-inert-value",
    ])
      assertMutation(
        surface,
        (target) => append(target, surface, disclosure),
        /credential value is prohibited|credential context is not canonical/,
      );
    for (const valueFree of [
      "Recovery code is unavailable.",
      "Authentication code remains value-free.",
      "OTP is absent.",
      "Passcode is prohibited.",
      "Session ID is redacted.",
      "Client certificate is unavailable.",
      "Credentials remain unavailable.",
      "Token is redacted.",
      "Password is absent.",
      "Private key is prohibited.",
      "JWT is unavailable.",
      "Basic authentication is prohibited.",
      "Reset code is unavailable.",
      "Emergency code remains value-free.",
      "Device code is absent.",
      "Security code is redacted.",
      "Recovery phrase is prohibited.",
      "Client assertion is unavailable.",
      "Signing certificate is redacted.",
      "SSH key remains value-free.",
    ])
      assert.deepEqual(
        inspectF3Surface(`${source}\n${valueFree}`, surface),
        [],
        `${surface} must retain value-free private-auth prose: ${valueFree}`,
      );
    for (const continuation of [
      "Recovery code is absent. Its value is synthetic-inert-value.",
      "OTP is unavailable. It equals synthetic-inert-value.",
      "Session ID is redacted. The value is synthetic-inert-value.",
      "Client certificate is value-free. Actual value: synthetic-inert-value.",
      "Recovery code is absent. Its replacement is synthetic-inert-value.",
      "OTP is unavailable. That value is synthetic-inert-value.",
      "Session ID is redacted. It contains synthetic-inert-value.",
      "Client certificate is value-free. The replacement = synthetic-inert-value.",
      "Recovery phrase is absent. Its replacement: synthetic-inert-value.",
      "Client assertion is redacted. That value: synthetic-inert-value.",
      "Signing certificate is value-free. Replacement: synthetic-inert-value.",
      "SSH key is prohibited. Its value = synthetic-inert-value.",
    ])
      assertMutation(
        surface,
        (target) => append(target, surface, continuation),
        /credential value continuation|credential value is prohibited|credential context is not canonical/,
      );
    for (const stale of [
      "F3 pending.",
      "F3 remains pending.",
      "F3 is unresolved.",
      "F3 staging unresolved.",
      "F3 staging is unresolved.",
      "F3 is not delivered.",
      "F3 has not been delivered.",
      "F3 delivery remains pending.",
    ])
      assertMutation(
        surface,
        (target) => append(target, surface, stale),
        /stale current F3|noncanonical F3 history context|stale subjectless F3 status/,
      );
  }
});

test("exact unresolved and held contexts produce zero errors on every surface", () => {
  for (const surface of DESIGNATED_F3_SURFACES) {
    const source = fs.readFileSync(path.join(root, surface), "utf8");
    for (const safe of [
      "A1 remains unresolved.",
      "Authenticated A1 remains unresolved.",
      "P1+ remains unresolved.",
      "P1+ is unresolved.",
      "Public launch remains unresolved.",
      "P2 remains unresolved.",
      "P3 is unresolved.",
      "P4 remains unresolved.",
      "P5 is unresolved.",
      "R1 remains unresolved.",
      "R2 is unresolved.",
      "L1 remains unresolved.",
      "Product acceptance remains unresolved.",
      "Live activation remains unresolved.",
      "Live service is unresolved.",
      "Live verification remains unresolved.",
      "Live system is unresolved.",
      "Production remains held.",
      "Production readiness remains held.",
      "Production traffic is held.",
      "Production deployment remains held.",
      "Learner data remains held.",
      "Learner-data remains held.",
      "P1 acceptance remains unresolved.",
      "P2 acceptance remains unresolved.",
      "A1 product acceptance remains unresolved.",
      "Authenticated A1 acceptance remains unresolved.",
      "R1 acceptance remains unresolved.",
      "R2 acceptance remains unresolved.",
      "L1 acceptance remains unresolved.",
      "P1 product acceptance remains unresolved.",
      "P2 product acceptance remains unresolved.",
      "Learner data access remains held.",
      "Learner-data deletion remains held.",
      "Learner data use remains held.",
      "Learner-data import remains held.",
      "Learner data export remains held.",
      "Learner-data transform remains held.",
      "Learner data transformation remains held.",
      "Learner-data delete remains held.",
      "Production learner data remains held.",
      "Production learner-data access remains held.",
      "Production learner data export remains held.",
      "Production learner-data transform remains held.",
      "Production learner data delete remains held.",
      "VOC-080-HOLD-01 remains held.",
      "VOC-080-HOLD-02 is held.",
    ])
      assert.deepEqual(
        inspectF3Surface(`${source}\n${safe}`, surface),
        [],
        `${surface} must accept exact safe later-boundary context: ${safe}`,
      );
    for (let number = 94; number <= 104; number += 1) {
      const packageId = `VOC-${String(number).padStart(3, "0")}`;
      const held = `${packageId} is immutable history. Production remains held; learner data remains held; VOC-080-HOLD-01 remains held; VOC-080-HOLD-02 remains held.`;
      assert.deepEqual(
        inspectF3Surface(`${source}\n${held}`, surface),
        [],
        `${surface} must accept exact historical held context for ${packageId}`,
      );
    }
    assert.deepEqual(
      inspectF3Surface(
        `${source}\nNo staging deployment took place. Authenticated A1 remains unresolved.`,
        surface,
      ),
      [],
      `${surface} must accept two independently safe clauses`,
    );
    for (const safeOperational of [
      "No dispatch occurred.",
      "No workflow dispatch took place.",
      "Dispatch is prohibited.",
      "The prior delivery completed successfully.",
      "The previous delivery succeeded.",
      "No migration occurred.",
      "Deployment did not occur.",
      "The deploy command was not executed.",
      "The database was not migrated.",
      "The staging delivery was completed in the past.",
      "No upload occurred.",
      "No promotion took place.",
      "No promotion occurred.",
      "Upload did not occur.",
      "The publish command was not executed.",
      "No staging migration occurred.",
      "The system was not deployed.",
      "No deployment was performed.",
      "The documentation was published in the past.",
      "The prior upload succeeded.",
      "No activation occurred.",
      "Upload was not performed.",
      "Promotion was not performed.",
      "No upload was performed.",
      "No promotion was performed.",
      "No migration was performed.",
      "No dispatch was performed.",
      "No activation was performed.",
      "Migration was not performed.",
      "Dispatch was not performed.",
      "Activation was not performed.",
      "No query was issued.",
      "The job was not invoked.",
      "Nothing was deployed.",
      "The system never deployed.",
      "The prior migration succeeded.",
      "The unit test initialized an in-memory fixture.",
      "The parser queried a local object.",
      "The historical note verified the checksum.",
    ])
      assert.deepEqual(
        inspectF3Surface(`${source}\n${safeOperational}`, surface),
        [],
        `${surface} must accept safe operational grammar: ${safeOperational}`,
      );
  }
});

test("unrelated completion and status prose remains outside protected domains", () => {
  const harmless = [
    "This review is complete.",
    "The documentation is ready.",
    "The proposal is approved.",
    "The unrelated decision remains pending.",
    "The unrelated issue remains pending.",
    "The ticket remains unresolved.",
    "The request remains unresolved.",
    "The dependency continues unresolved.",
    "The historical documentation task completed successfully.",
    "The reviewer verified the sanitized evidence.",
    "The issue was resolved without external action.",
    "The local parser is ready for review.",
    "The historical check was not completed.",
    "The sanitized result is not verified.",
    "Production remains held. The proposal is approved.",
    "P2 remains unresolved. This review is complete.",
    "Production remains held. It is not ready.",
    "The local worker initialized an in-memory fixture.",
    "The historical parser queried a local object.",
    "The local note verified a checksum.",
  ];
  for (const surface of DESIGNATED_F3_SURFACES) {
    const source = fs.readFileSync(path.join(root, surface), "utf8");
    for (const prose of harmless)
      assert.deepEqual(
        inspectF3Surface(`${source}\n${prose}`, surface),
        [],
        `${surface} must ignore unrelated protected-word prose: ${prose}`,
      );
  }
});

test("protected safe subjects bind generated positive continuation grammar", () => {
  const safeSubjects = [
    "Production remains held.",
    "P2 remains unresolved.",
    "Learner data remains held.",
  ];
  const positiveFragments = [
    ...["Clearly", "Actually", "Already", "Nevertheless"].flatMap((adverb) => [
      `${adverb} active.`,
      `${adverb} ready.`,
    ]),
    ...["It", "This", "That"].flatMap((pronoun) => [
      `${pronoun} is ready.`,
      `${pronoun} is active.`,
      `${pronoun} has been authorized.`,
      `${pronoun} passed.`,
    ]),
    "The result is effective.",
    "Now effective.",
  ];
  for (const surface of DESIGNATED_F3_SURFACES) {
    const source = fs.readFileSync(path.join(root, surface), "utf8");
    for (const [safe, positive] of safeSubjects.flatMap((safe) =>
      positiveFragments.map((positive) => [safe, positive]),
    ))
      for (const candidate of [
        `${safe} ${positive}`,
        `${positive} ${safe}`,
        `${safe}\n\n${positive}`,
        `${positive}\n\n${safe}`,
      ])
        assert.match(
          inspectF3Surface(`${source}\n${candidate}`, surface).join("\n"),
          /prohibited positive|noncanonical later\/hold context|subjectless positive boundary/,
          `${surface} must reject protected continuation: ${candidate}`,
        );
    for (const [safe, positive] of safeSubjects.flatMap((safe) =>
      positiveFragments.map((positive) => [safe, positive]),
    ))
      assert.match(
        inspectF3Surface(
          `${source}\n${safe} The unrelated note remains descriptive. ${positive}`,
          surface,
        ).join("\n"),
        /prohibited positive continuation|prohibited positive|noncanonical later\/hold context|subjectless positive boundary/,
        `${surface} must reject a separated protected continuation: ${safe} ${positive}`,
      );
  }
});

test("safe clauses cannot launder an operational or later positive claim", () => {
  for (const surface of DESIGNATED_F3_SURFACES)
    for (const unsafe of [
      "No deployment occurred; deploy now.",
      "The previous staging deployment succeeded and promote to production.",
      "Production remains held but is active.",
      "A1 remains unresolved and has been accepted.",
      "Production remains held; is active.",
      "Production remains held. Active now.",
      "A1 remains unresolved; has been accepted.",
      "P1+ remains unresolved. Approved now.",
      "Ready now. P2 remains unresolved.",
      "Active now. Production remains held.",
      "Accepted now. Public launch remains unresolved.",
      "Authorized now. Learner data remains held.",
      "Production remains held.\n\nActive now.",
      "P2 remains unresolved.\n\nReady now.",
      "P2 remains unresolved.\n\nPassed now.",
      "Production remains held.\n\nEffective now.",
      "Future work is separate and production is active.",
      "The gate remains unresolved while production is active.",
      "A1 is not merely planned and is accepted.",
      "A1 cannot remain pending and is accepted.",
      "Production is active if true.",
      "Production is active when this sentence is read.",
      "Report: no deployment occurred and everything is active.",
      "Upload was performed.",
      "Promotion was performed.",
    ])
      assertMutation(
        surface,
        (target) => append(target, surface, unsafe),
        /live-action instruction|prohibited positive|noncanonical later\/hold context|subjectless positive boundary/,
      );
});

test("protected-domain paragraphs reject adjacent noncanonical rewrites", () => {
  const protectedLine =
    /^.*(?:staging|delivery|deployment|workflow|CI|DNS|traffic|resources?|D1|API Worker|build|live|credential|token|secret|A1|production|launch|learner data|VOC-080-HOLD-0[12]|F3).*$/im;
  for (const surface of DESIGNATED_F3_SURFACES) {
    const source = fs.readFileSync(path.join(root, surface), "utf8");
    assert.match(
      source,
      protectedLine,
      `${surface} needs a protected fixture line`,
    );
    const rewritten = source.replace(
      protectedLine,
      (line) => `${line}\nThis adjacent sentence was rewritten.`,
    );
    assert.match(
      inspectF3Surface(rewritten, surface).join("\n"),
      /protected operational domain|credential context is not canonical|noncanonical later\/hold context|noncanonical F3 history context/,
      `${surface} must reject a rewrite in a protected paragraph`,
    );
  }
});

test("later authority claim grammar fails across every surface", () => {
  const subjects = [
    ["A1 product acceptance", "later product milestone"],
    ["authenticated A1", "later product milestone"],
    ["P1+ acceptance", "later product milestone"],
    ["P2 acceptance", "later product milestone"],
    ["P3 acceptance", "later product milestone"],
    ["P4 acceptance", "later product milestone"],
    ["P5 acceptance", "later product milestone"],
    ["R1 acceptance", "later product milestone"],
    ["R2 acceptance", "later product milestone"],
    ["L1 acceptance", "later product milestone"],
    ["product acceptance", "aggregate product acceptance"],
    ["production readiness", "production"],
    ["production traffic", "production"],
    ["live activation", "live activation"],
    ["public launch", "public launch"],
    ["learner-data access", "learner data"],
  ];
  const copulas = ["", "is ", "has been "];
  const verbs = [
    "complete",
    "complete-effective",
    "completed",
    "passed",
    "accepted",
    "effective",
    "ready",
    "active",
    "enabled",
    "released",
    "resolved",
    "verified",
    "approved",
    "authorized",
  ];
  for (const relative of DESIGNATED_F3_SURFACES)
    for (const [subject, diagnostic] of subjects)
      for (const copula of copulas)
        for (const verb of verbs)
          assertMutation(
            relative,
            (target) =>
              append(target, relative, `${subject} ${copula}${verb}.`),
            new RegExp(`prohibited positive ${diagnostic}`),
          );
  for (const relative of DESIGNATED_F3_SURFACES)
    for (const [claim, diagnostic] of [
      ["p1+\tACCEPTANCE has been AUTHORIZED", "later product milestone"],
      ["Production-complete effective", "production"],
      ["PUBLIC-LAUNCH accepted", "public launch"],
      ["Learner\tData access authorized", "learner data"],
    ])
      assertMutation(
        relative,
        (target) => append(target, relative, `${claim}.`),
        new RegExp(`prohibited positive ${diagnostic}`),
      );
  for (const relative of DESIGNATED_F3_SURFACES)
    for (const [claim, diagnostic] of [
      ["Future planning is separate; Production is active.", "production"],
      ["A1 is accepted; future work remains.", "later product milestone"],
      ["A1 is accepted, not merely planned.", "later product milestone"],
      [
        "Future work is separate, but A1 is accepted.",
        "later product milestone",
      ],
      ["The gate is unchanged, but production is active.", "production"],
      ["A1 remains unresolved; A1 is accepted.", "later product milestone"],
      [
        "Future A1 remains gated. A1 has been approved.",
        "later product milestone",
      ],
    ])
      assertMutation(
        relative,
        (target) => append(target, relative, claim),
        new RegExp(`prohibited positive ${diagnostic}`),
      );
  for (const relative of DESIGNATED_F3_SURFACES)
    for (const hold of ["VOC-080-HOLD-01", "VOC-080-HOLD-02"])
      for (const verb of verbs)
        assertMutation(
          relative,
          (target) => append(target, relative, `${hold} is ${verb}.`),
          /hold release/,
        );
  for (const relative of DESIGNATED_F3_SURFACES)
    assertMutation(
      relative,
      (target) => append(target, relative, "VOC-080-HOLD-01 has been lifted."),
      /hold release/,
    );
  for (const relative of DESIGNATED_F3_SURFACES)
    for (const [punctuation, release] of [
      [". ", "has been lifted"],
      [": ", "no longer applies"],
      [" — ", "is released"],
      [", ", "is removed"],
      ["; ", "has ceased"],
      [". ", "is no longer in force"],
    ])
      assertMutation(
        relative,
        (target) =>
          append(
            target,
            relative,
            `Hold status${punctuation}VOC-080-HOLD-01 ${release}.`,
          ),
        /hold release/,
      );
});

test("history checks reject only superseded F3 current claims", () => {
  for (const relative of DESIGNATED_F3_SURFACES) {
    assertMutation(
      relative,
      (target) => append(target, relative, "F3 continues to be unresolved."),
      /stale current F3 unresolved\/held wording/,
    );
    assertMutation(
      relative,
      (target) => append(target, relative, "F3 is not yet delivered."),
      /stale current F3 unresolved\/held wording/,
    );
    const source = fs.readFileSync(path.join(root, relative), "utf8");
    for (const immutablePositive of [
      "VOC-094 is immutable history: F3 is pending. Later exact VOC-105 evidence supersedes that prospective F3 status.",
      "VOC-094 is immutable history: F3 is unresolved. Later exact VOC-105 evidence supersedes that prospective F3 status.",
      "Later exact VOC-105 evidence supersedes VOC-094 prospective F3 pending status. VOC-094 is immutable history: F3 is pending.",
    ])
      assert.deepEqual(
        inspectF3Surface(`${source}\n${immutablePositive}`, relative),
        [],
      );
    assert.match(
      inspectF3Surface(
        `${source}\nVOC-094 is immutable history: F3 is pending.\n\nLater exact VOC-105 evidence supersedes that prospective F3 status.`,
        relative,
      ).join("\n"),
      /stale current F3 unresolved\/held wording/,
    );
    for (let number = 94; number <= 104; number += 1) {
      const packageId = `VOC-${String(number).padStart(3, "0")}`;
      for (const historical of [
        `${packageId} is immutable history: F3 is pending. Later exact VOC-105 evidence supersedes that prospective F3 status.`,
        `${packageId} is immutable history: F3 remains pending. Later exact VOC-105 evidence supersedes ${packageId} prospective F3 pending status.`,
        `${packageId} is immutable history: F3 was pending. Later exact VOC-105 evidence supersedes ${packageId} prospective F3 pending status.`,
        `${packageId} is immutable history: F3 staging is unresolved. Later exact VOC-105 evidence supersedes ${packageId} prospective F3 unresolved status.`,
        `${packageId} is immutable history: F3 is not yet delivered. Later exact VOC-105 evidence supersedes ${packageId} prospective F3 not-delivered status.`,
        `In immutable ${packageId} history, F3 remains pending. Later exact VOC-105 evidence supersedes ${packageId} prospective F3 pending status.`,
        `In immutable ${packageId} history, F3 was pending. Later exact VOC-105 evidence supersedes ${packageId} prospective F3 pending status.`,
        `${packageId} immutable historical snapshot records F3 as unresolved. Later exact VOC-105 evidence supersedes ${packageId} prospective F3 unresolved status.`,
        `In immutable ${packageId} history, the historical snapshot records F3 as unresolved. Later exact VOC-105 evidence supersedes ${packageId} prospective F3 unresolved status.`,
        `Later exact VOC-105 evidence supersedes ${packageId} prospective F3 pending status. ${packageId} immutable history records F3 as pending.`,
        `Later exact VOC-105 evidence supersedes the prospective F3 status from ${packageId}. F3 staging is unresolved in ${packageId} immutable history.`,
      ])
        assert.deepEqual(
          inspectF3Surface(`${source}\n${historical}`, relative),
          [],
          `${relative} must accept bounded ${packageId} F3 history: ${historical}`,
        );
      for (const noncanonical of [
        `${packageId} is immutable history: F3 remains pending.`,
        `F3 remains pending. Later exact VOC-105 evidence supersedes ${packageId} prospective F3 pending status.`,
        `${packageId} is immutable history: F3 is pending. Later exact VOC-105 evidence supersedes VOC-${String(number === 104 ? 94 : number + 1).padStart(3, "0")} prospective F3 pending status.`,
      ])
        assertMutation(
          relative,
          (target) => append(target, relative, noncanonical),
          /stale current F3|noncanonical F3 history context/,
        );
      for (const currentWord of [
        "current",
        "now",
        "still",
        "remains",
        "active",
      ])
        for (const staleState of ["pending", "unresolved", "not-yet-delivered"])
          assertMutation(
            relative,
            (target) =>
              append(
                target,
                relative,
                `${packageId} ${currentWord} F3 staging remains ${staleState}.`,
              ),
            new RegExp(`${packageId} superseded F3 history`),
          );
      assertMutation(
        relative,
        (target) =>
          append(
            target,
            relative,
            `${packageId} F3 staging is now unresolved.`,
          ),
        new RegExp(`${packageId} superseded F3 history`),
      );
      const positive = `${source}\n${packageId} is immutable history. Production remains held; learner data remains held; VOC-080-HOLD-01 remains held; VOC-080-HOLD-02 remains held.`;
      assert.deepEqual(inspectF3Surface(positive, relative), []);
    }
  }
  for (const marker of [
    "VOC-094 through VOC-104 remain immutable historical snapshots.",
    "This later exact\nrecord supersedes their prospective pending language only for current F3 status",
  ])
    assertMutation(
      "docs/operations/voc-105-f3-evidence.md",
      (target) => {
        const file = path.join(
          target,
          "docs/operations/voc-105-f3-evidence.md",
        );
        fs.writeFileSync(
          file,
          fs.readFileSync(file, "utf8").replace(marker, ""),
        );
      },
      /immutable-history and later-VOC-105 supersession boundary/,
    );
});

test("multiple immutable F3 history pairs are consumed independently", () => {
  for (const surface of DESIGNATED_F3_SURFACES) {
    const source = fs.readFileSync(path.join(root, surface), "utf8");
    for (const valid of [
      "VOC-094 is immutable history: F3 is pending. Later exact VOC-105 evidence supersedes VOC-094 prospective F3 pending status. In immutable VOC-096 history, F3 staging is unresolved. Later exact VOC-105 evidence supersedes VOC-096 prospective F3 unresolved status. Production remains held; Learner data remains held; VOC-080-HOLD-01 remains held; VOC-080-HOLD-02 remains held.",
      "Later exact VOC-105 evidence supersedes VOC-094 prospective F3 pending status. VOC-094 immutable history records F3 as pending. Later exact VOC-105 evidence supersedes the prospective F3 status from VOC-096. F3 staging is unresolved in VOC-096 immutable history.",
      "VOC-094 is immutable history: F3 is pending. Later exact VOC-105 evidence supersedes that prospective F3 status. VOC-094 is immutable history: F3 is unresolved. Later exact VOC-105 evidence supersedes that prospective F3 status.",
      "VOC-094 is immutable history: F3 was pending. Later exact VOC-105 evidence supersedes VOC-094 prospective F3 pending status. The unrelated decision remains pending.",
      "VOC-094 immutable historical snapshot records F3 as unresolved. Later exact VOC-105 evidence supersedes VOC-094 prospective F3 unresolved status. The ticket remains unresolved.",
    ])
      assert.deepEqual(
        inspectF3Surface(`${source}\n${valid}`, surface),
        [],
        `${surface} must accept independently paired history`,
      );
    for (const invalid of [
      "VOC-094 is immutable history: F3 is pending. VOC-094 is immutable history: F3 is unresolved. Later exact VOC-105 evidence supersedes VOC-094 prospective F3 pending status. Later exact VOC-105 evidence supersedes VOC-094 prospective F3 unresolved status.",
      "VOC-094 is immutable history: F3 is pending. Later exact VOC-105 evidence supersedes VOC-095 prospective F3 pending status.",
      "VOC-094 is immutable history: F3 is pending. Later exact VOC-105 evidence supersedes VOC-094 prospective F3 unresolved status.",
      "VOC-094 is immutable history: F3 is pending. Later exact VOC-105 evidence supersedes VOC-094 prospective F3 pending status. Later exact VOC-105 evidence supersedes VOC-094 prospective F3 pending status.",
      "VOC-094 is immutable history: F3 is pending. Later exact VOC-105 evidence supersedes VOC-094 prospective F3 pending status. VOC-094 is immutable history: F3 remains pending.",
      "VOC-094 is immutable history: F3 is pending.\n\nLater exact VOC-105 evidence supersedes VOC-094 prospective F3 pending status.",
      "VOC-094 is immutable history: F3 is pending. Later exact VOC-105 evidence supersedes VOC-094 prospective F3 pending status. F3 remains pending.",
      "VOC-094 is immutable history: F3 was pending. Later exact VOC-105 evidence supersedes VOC-094 prospective F3 pending status. It remains pending.",
      "VOC-094 immutable historical snapshot records F3 as unresolved. Later exact VOC-105 evidence supersedes VOC-094 prospective F3 unresolved status. Still unresolved.",
      "VOC-094 is immutable history: F3 was pending. Later exact VOC-105 evidence supersedes VOC-094 prospective F3 pending status. Remains pending.",
      "VOC-094 is immutable history: F3 was pending. Later exact VOC-105 evidence supersedes VOC-094 prospective F3 pending status. Pending.",
      "VOC-094 immutable historical snapshot records F3 as unresolved. Later exact VOC-105 evidence supersedes VOC-094 prospective F3 unresolved status. Unresolved now.",
      "VOC-094 immutable historical snapshot records F3 as unresolved. Later exact VOC-105 evidence supersedes VOC-094 prospective F3 unresolved status. Continues unresolved.",
      "VOC-094 is immutable history: F3 was pending. Later exact VOC-105 evidence supersedes VOC-094 prospective F3 pending status. Clearly pending.",
      "VOC-094 immutable historical snapshot records F3 as unresolved. Later exact VOC-105 evidence supersedes VOC-094 prospective F3 unresolved status. Apparently unresolved now.",
      "VOC-094 is immutable history: F3 was pending. Later exact VOC-105 evidence supersedes VOC-094 prospective F3 pending status. The status remains pending.",
      "VOC-094 immutable historical snapshot records F3 as unresolved. Later exact VOC-105 evidence supersedes VOC-094 prospective F3 unresolved status. Current status: unresolved.",
      "VOC-094 is immutable history: F3 was pending. Later exact VOC-105 evidence supersedes VOC-094 prospective F3 pending status. It is still pending.",
      "VOC-094 immutable historical snapshot records F3 as unresolved. Later exact VOC-105 evidence supersedes VOC-094 prospective F3 unresolved status. This remains unresolved.",
      "VOC-094 is immutable history: F3 was pending. Later exact VOC-105 evidence supersedes VOC-094 prospective F3 pending status.\n\nProspective status remains pending.",
    ])
      assert.match(
        inspectF3Surface(`${source}\n${invalid}`, surface).join("\n"),
        /stale current F3|noncanonical F3 history context|stale subjectless F3 status/,
      );
  }
});

test("structured record exact keys, duplicates, gate inventory, and status matrices fail closed", () => {
  const jsonMutation = (mutate, pattern) =>
    assertMutation(
      F3_RECORD_PATH,
      (target) => mutateJson(target, mutate),
      pattern,
    );
  const keyObjects = [
    ["record", "$", (record) => record],
    ["milestone_gate", "$.milestone_gate", (record) => record.milestone_gate],
    [
      "milestone_gate.f2_dependency",
      "$.milestone_gate.f2_dependency",
      (record) => record.milestone_gate.f2_dependency,
    ],
    ["delivery_event", "$.delivery_event", (record) => record.delivery_event],
    [
      "delivery_event.steps",
      "$.delivery_event.steps",
      (record) => record.delivery_event.steps,
    ],
    [
      "settings_contract",
      "$.settings_contract",
      (record) => record.settings_contract,
    ],
    [
      "later_boundaries",
      "$.later_boundaries",
      (record) => record.later_boundaries,
    ],
    [
      "historical_boundary",
      "$.historical_boundary",
      (record) => record.historical_boundary,
    ],
  ];
  const canonicalRecord = JSON.parse(
    fs.readFileSync(path.join(root, F3_RECORD_PATH), "utf8"),
  );
  for (const [label, objectPath, select] of keyObjects) {
    jsonMutation(
      (record) => void (select(record).unknown_key = "unknown"),
      new RegExp(`${label}.*exact keys`),
    );
    for (const key of Object.keys(select(canonicalRecord))) {
      jsonMutation(
        (record) => {
          delete select(record)[key];
        },
        new RegExp(`${label}.*exact keys`),
      );
      jsonMutation(
        (record) => {
          const object = select(record);
          object[`${key}_renamed`] = object[key];
          delete object[key];
        },
        new RegExp(`${label}.*exact keys`),
      );
      assertMutation(
        F3_RECORD_PATH,
        (target) => {
          const file = path.join(target, F3_RECORD_PATH);
          fs.writeFileSync(
            file,
            `${jsonWithDuplicate(canonicalRecord, objectPath, key)}\n`,
          );
        },
        new RegExp(`duplicate raw key ${key}`),
      );
    }
  }
  for (const [mutate, diagnostic] of [
    [(record) => void (record.schema_version = 1), /schema_version/],
    [(record) => void (record.status = "unknown"), /status/],
    [(record) => void (record.package = null), /package/],
    [
      (record) => void (record.milestone_gate = []),
      /milestone_gate.*expected object/,
    ],
    [
      (record) => void (record.milestone_gate.missing_evidence = {}),
      /missing_evidence.*expected empty array/,
    ],
    [
      (record) => void record.milestone_gate.missing_evidence.push("missing"),
      /missing_evidence.*expected empty array/,
    ],
    [
      (record) => void (record.milestone_gate.items = {}),
      /items.*expected array/,
    ],
    [
      (record) => void (record.delivery_event.workflow = 1),
      /delivery workflow/,
    ],
    [
      (record) => void (record.delivery_event.run_id = "33386240492"),
      /delivery run/,
    ],
    [
      (record) => void (record.delivery_event.attempt = "1"),
      /delivery attempt/,
    ],
    [(record) => void (record.delivery_event.event_sha = null), /delivery SHA/],
    [(record) => void (record.delivery_event.url = 1), /delivery URL/],
    [
      (record) => void (record.delivery_event.steps = []),
      /delivery_event.steps.*expected object/,
    ],
    [
      (record) => void (record.settings_contract.sanitized_readback = null),
      /settings contract sanitized_readback/,
    ],
    [
      (record) => void (record.later_boundaries.production_readiness = true),
      /production_readiness/,
    ],
    [
      (record) => void (record.later_boundaries.inherited_holds = "held"),
      /inherited_holds.*ordered array/,
    ],
    [
      (record) => void record.later_boundaries.inherited_holds.reverse(),
      /inherited_holds.*ordered array/,
    ],
    [
      (record) =>
        void record.later_boundaries.inherited_holds.push("VOC-080-HOLD-02"),
      /inherited_holds.*ordered array/,
    ],
    [
      (record) =>
        void (record.historical_boundary.later_evidence_supersedes_prospective_pending_language =
          "true"),
      /historical supersession boundary/,
    ],
    [
      (record) => void (record.external_effects_by_voc105 = true),
      /VOC-105 external effects/,
    ],
  ])
    jsonMutation(mutate, diagnostic);
  for (const [field, value, diagnostic] of [
    ["status", "wrong", /F2 status/],
    ["pull_request", "https://example.invalid", /F2 PR/],
    ["merge_sha", 1, /F2 merge SHA/],
  ])
    jsonMutation(
      (record) => void (record.milestone_gate.f2_dependency[field] = value),
      diagnostic,
    );
  jsonMutation(
    (record) => void (record.milestone_gate.decision = "pending"),
    /milestone_gate.decision/,
  );
  for (const field of [
    "delivery_controls_pull_request",
    "settings_truth_pull_request",
    "credential_policy_pull_request",
    "sanitized_readback",
  ])
    jsonMutation(
      (record) =>
        void (record.settings_contract[field] = "https://example.invalid"),
      new RegExp(`settings contract ${field}`),
    );
  for (const field of [
    "a1_authenticated_product_acceptance",
    "p1_plus_product_acceptance",
    "production_readiness",
    "production_traffic",
    "public_launch",
    "learner_data",
  ])
    jsonMutation(
      (record) => void (record.later_boundaries[field] = "complete"),
      new RegExp(field),
    );
  for (const field of ["required", "delivery_gate", "staging_job"])
    for (const value of ["failed", "skipped", "unknown", 1, null])
      jsonMutation(
        (record) => void (record.delivery_event[field] = value),
        new RegExp(`delivery_event.${field}`),
      );
  for (const step of [
    "migration",
    "immutable_upload",
    "exact_promotion",
    "bounded_smoke",
    "sanitized_outcome",
  ])
    for (const value of ["failed", "skipped", "unknown", 1, null])
      jsonMutation(
        (record) => void (record.delivery_event.steps[step] = value),
        new RegExp(`delivery step ${step}`),
      );
  for (const value of ["failed", "skipped", "unknown", 1, null])
    jsonMutation(
      (record) =>
        void (record.delivery_event.steps.rollback_after_promotion_failure =
          value),
      /rollback outcome/,
    );
  for (const value of ["success", "failed", "skipped", "unknown", 1, null])
    jsonMutation(
      (record) => void (record.delivery_event.production_job = value),
      /production outcome/,
    );

  for (let index = 0; index < 9; index += 1) {
    for (const key of ["id", "status", "evidence"]) {
      jsonMutation(
        (record) => {
          delete record.milestone_gate.items[index][key];
        },
        new RegExp(`milestone_gate.items\\[${index}\\].*exact keys`),
      );
      jsonMutation(
        (record) => {
          const item = record.milestone_gate.items[index];
          item[`${key}_renamed`] = item[key];
          delete item[key];
        },
        new RegExp(`milestone_gate.items\\[${index}\\].*exact keys`),
      );
      assertMutation(
        F3_RECORD_PATH,
        (target) => {
          const file = path.join(target, F3_RECORD_PATH);
          fs.writeFileSync(
            file,
            `${jsonWithDuplicate(
              canonicalRecord,
              `$.milestone_gate.items[${index}]`,
              key,
            )}\n`,
          );
        },
        new RegExp(`duplicate raw key ${key}`),
      );
    }
    for (const status of ["failed", "skipped", "unknown", 1, null])
      jsonMutation(
        (record) => void (record.milestone_gate.items[index].status = status),
        /gate item .* status/,
      );
    jsonMutation(
      (record) =>
        void (record.milestone_gate.items[index].evidence =
          "https://example.invalid"),
      /gate item .* evidence/,
    );
    jsonMutation(
      (record) => void (record.milestone_gate.items[index].id = "unknown-item"),
      /gate item .* id|unknown id/,
    );
    jsonMutation(
      (record) => void (record.milestone_gate.items[index].extra = true),
      new RegExp(`milestone_gate.items\\[${index}\\].*exact keys`),
    );
    jsonMutation(
      (record) => void record.milestone_gate.items.splice(index, 1),
      /expected 9 ordered items|gate item .* id|expected exactly once/,
    );
    jsonMutation(
      (record) =>
        void record.milestone_gate.items.splice(
          index,
          0,
          structuredClone(record.milestone_gate.items[index]),
        ),
      /expected 9 ordered items|expected exactly once/,
    );
  }
  jsonMutation(
    (record) =>
      record.milestone_gate.items.push(
        structuredClone(record.milestone_gate.items[0]),
      ),
    /expected 9 ordered items|expected exactly once/,
  );
  jsonMutation(
    (record) =>
      record.milestone_gate.items.push({
        id: "unknown-item",
        status: "unknown",
        evidence: "https://example.invalid",
      }),
    /expected 9 ordered items|unknown id/,
  );
  jsonMutation(
    (record) => void record.milestone_gate.items.reverse(),
    /gate item 0 id/,
  );

  const duplicateCases = [
    [
      '"schema_version": "vocanova-voc105-f3-v1",',
      '"schema_version": "vocanova-voc105-f3-v1",\n  "schema_version": "duplicate",',
      /\$: duplicate raw key schema_version/,
    ],
    [
      '"decision": "f3-staging-foundation-complete-effective",',
      '"decision": "f3-staging-foundation-complete-effective",\n    "decision": "duplicate",',
      /milestone_gate: duplicate raw key decision/,
    ],
    [
      '"workflow": "CI",',
      '"workflow": "CI",\n    "workflow": "duplicate",',
      /delivery_event: duplicate raw key workflow/,
    ],
    [
      '"migration": "success",',
      '"migration": "success",\n      "migration": "duplicate",',
      /steps: duplicate raw key migration/,
    ],
    [
      '"delivery_controls_pull_request":',
      '"delivery_controls_pull_request": "duplicate",\n    "delivery_controls_pull_request":',
      /settings_contract: duplicate raw key delivery_controls_pull_request/,
    ],
    [
      '"production_readiness": "held",',
      '"production_readiness": "held",\n    "production_readiness": "duplicate",',
      /later_boundaries: duplicate raw key production_readiness/,
    ],
    [
      '"packages": "VOC-094-through-VOC-104-immutable",',
      '"packages": "VOC-094-through-VOC-104-immutable",\n    "packages": "duplicate",',
      /historical_boundary: duplicate raw key packages/,
    ],
  ];
  for (const [needle, replacement, diagnostic] of duplicateCases)
    assertMutation(
      F3_RECORD_PATH,
      (target) => {
        const file = path.join(target, F3_RECORD_PATH);
        fs.writeFileSync(
          file,
          fs.readFileSync(file, "utf8").replace(needle, replacement),
        );
      },
      diagnostic,
    );
});
