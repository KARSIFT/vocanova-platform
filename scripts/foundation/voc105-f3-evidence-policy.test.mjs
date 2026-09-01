import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { inspectF3Evidence } from "./voc105-f3-evidence-policy.mjs";

const root = path.resolve(
  path.dirname(new URL(import.meta.url).pathname),
  "../..",
);
const fixturePaths = [
  "package.json",
  "docs/README.md",
  "docs/product/README.md",
  "docs/product/12-mvp-implementation-plan.md",
  "docs/operations/README.md",
  "docs/operations/voc-081-f2-evidence.md",
  "docs/operations/voc-081-f2-evidence.json",
  "docs/operations/cloudflare-delivery.md",
  "docs/operations/voc-105-f3-evidence.md",
  "docs/operations/voc-105-f3-evidence.json",
];

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

function mutateJson(target, mutate) {
  const file = path.join(target, "docs/operations/voc-105-f3-evidence.json");
  const value = JSON.parse(fs.readFileSync(file, "utf8"));
  mutate(value);
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function rejects(name, mutate, pattern) {
  test(name, () => {
    const target = fixture();
    try {
      mutate(target);
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
      mutateJson(target, (r) => {
        r.delivery_event[field] = value;
      }),
    /delivery/,
  );

for (const step of ["migration", "exact_promotion", "bounded_smoke"])
  rejects(
    `rejects failed ${step}`,
    (target) =>
      mutateJson(target, (r) => {
        r.delivery_event.steps[step] = "failed";
      }),
    /delivery step/,
  );

rejects(
  "rejects wrong rollback outcome",
  (target) =>
    mutateJson(target, (r) => {
      r.delivery_event.steps.rollback_after_promotion_failure = "success";
    }),
  /rollback outcome/,
);
rejects(
  "rejects missing resource proof",
  (target) =>
    mutateJson(target, (r) => {
      r.milestone_gate.items = r.milestone_gate.items.filter(
        (i) => i.id !== "isolated-staging-resources",
      );
    }),
  /isolated-staging-resources/,
);
rejects(
  "rejects missing observability proof",
  (target) =>
    mutateJson(target, (r) => {
      r.milestone_gate.items = r.milestone_gate.items.filter(
        (i) => i.id !== "privacy-safe-observability",
      );
    }),
  /privacy-safe-observability/,
);
rejects(
  "rejects missing settings proof",
  (target) =>
    mutateJson(target, (r) => {
      r.milestone_gate.items = r.milestone_gate.items.filter(
        (i) => i.id !== "standard-environment-protection",
      );
    }),
  /standard-environment-protection/,
);
rejects(
  "rejects a wrong resource evidence link",
  (target) =>
    mutateJson(target, (r) => {
      r.milestone_gate.items.find(
        (i) => i.id === "isolated-staging-resources",
      ).evidence = "https://github.com/KARSIFT/vocanova-platform/issues/158";
    }),
  /isolated-staging-resources evidence/,
);
rejects(
  "rejects a wrong settings contract link",
  (target) =>
    mutateJson(target, (r) => {
      r.settings_contract.settings_truth_pull_request =
        "https://github.com/KARSIFT/vocanova-platform/pull/175";
    }),
  /settings contract settings_truth_pull_request/,
);
rejects(
  "rejects wrong F2 dependency",
  (target) =>
    mutateJson(target, (r) => {
      r.milestone_gate.f2_dependency.merge_sha = "0".repeat(40);
    }),
  /F2 merge SHA/,
);
rejects(
  "rejects a missing hold",
  (target) =>
    mutateJson(target, (r) => {
      r.later_boundaries.inherited_holds.pop();
    }),
  /inherited holds/,
);
rejects(
  "rejects a history-boundary drift",
  (target) =>
    mutateJson(target, (r) => {
      r.historical_boundary.packages = "rewritten";
    }),
  /historical package boundary/,
);
rejects(
  "rejects an external-effect claim",
  (target) =>
    mutateJson(target, (r) => {
      r.external_effects_by_voc105 = "deployment-performed";
    }),
  /VOC-105 external effects/,
);
rejects(
  "rejects a token value",
  (target) =>
    mutateJson(target, (r) => {
      r.api_token = "this-is-a-prohibited-value";
    }),
  /token or secret/,
);
rejects(
  "rejects an immutable Worker UUID",
  (target) =>
    mutateJson(target, (r) => {
      r.worker_version = "123e4567-e89b-42d3-a456-426614174000";
    }),
  /Worker-version UUID/,
);
rejects(
  "rejects malformed JSON",
  (target) =>
    fs.writeFileSync(
      path.join(target, "docs/operations/voc-105-f3-evidence.json"),
      "{",
    ),
  /invalid JSON/,
);
rejects(
  "rejects stale active F3 wording",
  (target) =>
    fs.appendFileSync(
      path.join(target, "docs/README.md"),
      "\nF3/staging remains unresolved.\n",
    ),
  /stale current F3/,
);
rejects(
  "rejects later milestone acceptance",
  (target) =>
    fs.appendFileSync(
      path.join(target, "docs/product/README.md"),
      "\nA1 is accepted.\n",
    ),
  /later milestone/,
);
rejects(
  "rejects hold release",
  (target) =>
    fs.appendFileSync(
      path.join(target, "docs/operations/README.md"),
      "\nVOC-080-HOLD-01 is released.\n",
    ),
  /hold release/,
);
rejects(
  "rejects direct live instruction",
  (target) =>
    fs.appendFileSync(
      path.join(target, "docs/operations/voc-105-f3-evidence.md"),
      "\nDeploy now.\n",
    ),
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
  /ci:f3-evidence segment/,
);
