#!/usr/bin/env node
// Agent orchestration loop: backlog -> implementer -> reviewer -> merge -> deploy.
// Replaces karsift-ai-infra's multi-vendor role relay with one process that
// holds real context across the whole loop instead of re-deriving it from a
// PR/issue comment at every cold-started step. See orchestrator/RUNBOOK.md.
//
// Requires on PATH: git, gh (authenticated, repo write access), claude
// (Claude Code CLI, authenticated), pnpm. Verify `claude --help` against your
// installed version before trusting the flags below unattended - CLI flags
// for non-interactive/headless runs have changed across versions and this
// was written without a live install to test against.

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";

const CFG = {
  // vocanova-platform splits develop/main (see pipeline.yml's own
  // integration_branch/production_branch comments) - tasks merge into
  // develop, which auto-deploys to staging on push. Set BASE_BRANCH=main
  // instead only for a GitHub-flow-only project with a single long-lived
  // branch and no separate staging tier.
  baseBranch: process.env.BASE_BRANCH || "develop",
  productionBranch: process.env.PRODUCTION_BRANCH || "main",
  maxAttempts: Number(process.env.MAX_ATTEMPTS || 3),
  pollSeconds: Number(process.env.POLL_INTERVAL_SECONDS || 60),
  readyLabel: process.env.READY_LABEL || "agent:ready",
  autoDeployProduction: process.env.AUTO_DEPLOY_PRODUCTION === "true",
  implementerModel: process.env.IMPLEMENTER_MODEL || "", // empty = CLI default
  reviewerModel: process.env.REVIEWER_MODEL || "",
  logDir: process.env.LOG_DIR || "orchestrator/logs",
};

function sh(cmd, args, opts = {}) {
  try {
    const out = execFileSync(cmd, args, {
      encoding: "utf8",
      maxBuffer: 1024 * 1024 * 64,
      ...opts,
    });
    return { ok: true, stdout: out.trim(), stderr: "" };
  } catch (err) {
    return {
      ok: false,
      stdout: (err.stdout || "").toString().trim(),
      stderr: (err.stderr || err.message || "").toString().trim(),
    };
  }
}

function log(taskId, ...parts) {
  const line = `[${new Date().toISOString()}] [${taskId}] ${parts.join(" ")}`;
  console.log(line);
  if (!existsSync(CFG.logDir)) mkdirSync(CFG.logDir, { recursive: true });
  writeFileSync(`${CFG.logDir}/${taskId}.log`, line + "\n", { flag: "a" });
}

function slugify(s) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);
}

// --- GitHub issue helpers (via gh CLI) ---

function getIssue(number) {
  const r = sh("gh", ["issue", "view", String(number), "--json", "title,body,labels"]);
  if (!r.ok) throw new Error(`could not read issue #${number}: ${r.stderr}`);
  return JSON.parse(r.stdout);
}

function listReadyIssues() {
  const r = sh("gh", [
    "issue", "list",
    "--label", CFG.readyLabel,
    "--state", "open",
    "--json", "number,title",
  ]);
  if (!r.ok) throw new Error(`could not list ready issues: ${r.stderr}`);
  return JSON.parse(r.stdout);
}

function commentOnIssue(number, body) {
  sh("gh", ["issue", "comment", String(number), "--body", body]);
}

// --- Claude Code CLI steps ---

function runImplementer(prompt) {
  const args = ["-p", prompt, "--permission-mode", "acceptEdits", "--output-format", "json"];
  if (CFG.implementerModel) args.push("--model", CFG.implementerModel);
  const r = sh("claude", args);
  return r; // caller checks r.ok; local test/build is the real gate, not this alone
}

function runReviewer(prompt) {
  // Read-only: block every write-capable tool so nothing needs a TTY prompt.
  const args = [
    "-p", prompt,
    "--disallowedTools", "Edit,Write,NotebookEdit,Bash(git add:*),Bash(git commit:*),Bash(git push:*)",
    "--output-format", "json",
  ];
  if (CFG.reviewerModel) args.push("--model", CFG.reviewerModel);
  return sh("claude", args);
}

function extractText(claudeResult) {
  try {
    const parsed = JSON.parse(claudeResult.stdout);
    return parsed.result || parsed.text || JSON.stringify(parsed);
  } catch {
    return claudeResult.stdout; // not JSON - use raw text
  }
}

function parseVerdict(text) {
  const m = text.match(/VERDICT:\s*(PASS|FAIL)/i);
  return m ? m[1].toUpperCase() : "FAIL"; // no parseable verdict = fail closed
}

// --- local deterministic checks (the real gate before anything ships) ---

function runChecks() {
  const steps = [
    ["pnpm", ["install", "--frozen-lockfile"]],
    ["pnpm", ["run", "lint"]],
    ["pnpm", ["run", "typecheck"]],
    ["pnpm", ["run", "test"]],
    ["pnpm", ["run", "build"]],
  ];
  for (const [cmd, args] of steps) {
    const r = sh(cmd, args);
    if (!r.ok) return { ok: false, step: `${cmd} ${args.join(" ")}`, output: r.stderr || r.stdout };
  }
  return { ok: true };
}

// --- deploy ---
//
// Both deploy-staging.yml (on push to develop) and deploy-production.yml
// (on push to main) fire on their own push trigger - a merge is enough to
// start them, nothing here needs to `gh workflow run` them directly (that
// would dispatch against the wrong ref/content and, for deploy-production
// specifically, a different set of inputs than its push trigger uses).
// This just watches for the run that push already started.

function waitForWorkflowRunAfter(file, afterSha, timeoutMs = 15 * 60 * 1000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const r = sh("gh", [
      "run", "list", "--workflow", file, "--limit", "5",
      "--json", "status,conclusion,headSha,createdAt",
    ]);
    if (r.ok) {
      const runs = JSON.parse(r.stdout || "[]");
      const match = runs.find((run) => run.headSha === afterSha);
      if (match) {
        if (match.status === "completed") return match.conclusion; // "success" | "failure" | ...
      } else if (runs.length === 0) {
        // nothing queued yet - the push webhook can lag a few seconds
      }
    }
    execFileSync("sleep", ["15"]);
  }
  return "timed_out";
}

function currentSha(branch) {
  sh("git", ["fetch", "origin", branch]);
  return sh("git", ["rev-parse", `origin/${branch}`]).stdout;
}

// --- the loop ---

function processTask(number) {
  const issue = getIssue(number);
  const branch = `agent/issue-${number}-${slugify(issue.title)}`;
  log(number, `starting task: ${issue.title}`);

  sh("git", ["fetch", "origin", CFG.baseBranch]);
  sh("git", ["checkout", "-B", branch, `origin/${CFG.baseBranch}`]);

  let findings = "";
  for (let attempt = 1; attempt <= CFG.maxAttempts; attempt++) {
    log(number, `implementer attempt ${attempt}/${CFG.maxAttempts}`);

    const implPrompt = [
      `Implement GitHub issue #${number} on the current branch.`,
      `Title: ${issue.title}`,
      `Body:\n${issue.body || "(no body)"}`,
      findings && `Previous review findings to address:\n${findings}`,
    ].filter(Boolean).join("\n\n");

    const implResult = runImplementer(implPrompt);
    if (!implResult.ok) {
      log(number, "implementer step errored:", implResult.stderr.slice(0, 500));
      findings = `Implementer run failed to complete: ${implResult.stderr.slice(0, 1000)}`;
      continue;
    }

    const checks = runChecks();
    if (!checks.ok) {
      log(number, `local checks failed at: ${checks.step}`);
      findings = `Local checks failed at \`${checks.step}\`:\n${checks.output.slice(0, 2000)}`;
      continue; // don't waste a reviewer call on code that doesn't even build
    }

    sh("git", ["add", "-A"]);
    sh("git", ["commit", "-m", `Implement #${number}: ${issue.title}\n\nAttempt ${attempt}/${CFG.maxAttempts}.`]);
    sh("git", ["push", "-u", "origin", branch, "--force-with-lease"]);

    log(number, "running reviewer");
    const diff = sh("git", ["diff", `origin/${CFG.baseBranch}...${branch}`]);
    const reviewPrompt = [
      `Independently review this diff against GitHub issue #${number}. Read-only - do not edit anything.`,
      `Issue title: ${issue.title}`,
      `Issue body:\n${issue.body || "(no body)"}`,
      `Diff:\n${diff.stdout.slice(0, 40000)}`,
      `End your review with a line reading exactly "VERDICT: PASS" or "VERDICT: FAIL".`,
    ].join("\n\n");

    const reviewResult = runReviewer(reviewPrompt);
    const reviewText = extractText(reviewResult);
    const verdict = parseVerdict(reviewText);
    log(number, `review verdict: ${verdict}`);

    if (verdict === "PASS") {
      return mergeAndDeploy(number, branch, issue, reviewText);
    }
    findings = reviewText;
  }

  log(number, `exhausted ${CFG.maxAttempts} attempts - escalating to a human`);
  commentOnIssue(
    number,
    [
      `**Orchestrator:** ${CFG.maxAttempts} implement/review attempts on \`${branch}\` did not pass.`,
      `Last review findings:\n\n${findings.slice(0, 3000)}`,
      `A human needs to look at this one.`,
    ].join("\n\n"),
  );
  return { ok: false, escalated: true };
}

function mergeAndDeploy(number, branch, issue, reviewText) {
  log(number, "opening PR");
  const pr = sh("gh", [
    "pr", "create",
    "--base", CFG.baseBranch,
    "--head", branch,
    "--title", `${issue.title} (closes #${number})`,
    "--body", `Automated implementation of #${number}.\n\n${reviewText.slice(0, 2000)}`,
  ]);
  if (!pr.ok) {
    log(number, "PR creation failed:", pr.stderr);
    return { ok: false };
  }

  log(number, "merging");
  const merge = sh("gh", ["pr", "merge", branch, "--squash", "--delete-branch"]);
  if (!merge.ok) {
    log(number, "merge failed - leaving PR open for a human:", merge.stderr);
    commentOnIssue(number, `**Orchestrator:** review passed but merge failed:\n\`\`\`\n${merge.stderr.slice(0, 1000)}\n\`\`\``);
    return { ok: false };
  }

  log(number, `waiting for the deploy-staging.yml run that push triggered`);
  const developSha = currentSha(CFG.baseBranch);
  const stagingResult = waitForWorkflowRunAfter("deploy-staging.yml", developSha);
  log(number, `staging deploy: ${stagingResult}`);

  if (stagingResult !== "success") {
    commentOnIssue(number, `**Orchestrator:** merged to \`${CFG.baseBranch}\`, but staging deploy came back \`${stagingResult}\` - not promoting to production. Check the deploy-staging.yml run.`);
    return { ok: true, staging: stagingResult, production: "skipped" };
  }

  if (!CFG.autoDeployProduction) {
    commentOnIssue(number, `**Orchestrator:** merged to \`${CFG.baseBranch}\` and staging is healthy. Production promotion is off (AUTO_DEPLOY_PRODUCTION=false) - this repo normally promotes ${CFG.baseBranch} -> ${CFG.productionBranch} at the package level (karsift-ai-infra's release.yml), not per task. Promote manually when ready.`);
    return { ok: true, staging: "success", production: "manual" };
  }

  // NOTE: this promotes on every single task merge, which bypasses this
  // repo's existing package-level release gate (release.yml normally waits
  // for a whole change package's task roster to close first). Only turn
  // AUTO_DEPLOY_PRODUCTION on if you've deliberately decided this loop
  // should replace that gate, not by default.
  log(number, `promoting ${CFG.baseBranch} -> ${CFG.productionBranch}`);
  const promo = sh("gh", [
    "pr", "create",
    "--base", CFG.productionBranch,
    "--head", CFG.baseBranch,
    "--title", `Promote ${CFG.baseBranch} -> ${CFG.productionBranch}: #${number}`,
    "--body", `Automated promotion after #${number} merged and staging passed.`,
  ]);
  if (!promo.ok) {
    log(number, "promotion PR failed (likely nothing to promote, or a conflict):", promo.stderr);
    commentOnIssue(number, `**Orchestrator:** staging healthy, but opening the ${CFG.baseBranch}->${CFG.productionBranch} promotion PR failed:\n\`\`\`\n${promo.stderr.slice(0, 1000)}\n\`\`\``);
    return { ok: true, staging: "success", production: "promotion_failed" };
  }
  sh("gh", ["pr", "merge", CFG.baseBranch, "--merge"]);

  const mainSha = currentSha(CFG.productionBranch);
  const prodResult = waitForWorkflowRunAfter("deploy-production.yml", mainSha);
  log(number, `production deploy: ${prodResult}`);
  commentOnIssue(number, `**Orchestrator:** shipped. Staging: success. Production: \`${prodResult}\`.`);
  return { ok: true, staging: "success", production: prodResult };
}

// --- entry point ---

const args = process.argv.slice(2);
const issueFlagIdx = args.indexOf("--issue");
const watch = args.includes("--watch");

if (issueFlagIdx !== -1) {
  const number = Number(args[issueFlagIdx + 1]);
  processTask(number);
} else if (watch) {
  console.log(`watching for issues labeled "${CFG.readyLabel}" every ${CFG.pollSeconds}s`);
  const seen = new Set();
  for (;;) {
    try {
      for (const issue of listReadyIssues()) {
        if (seen.has(issue.number)) continue;
        seen.add(issue.number);
        processTask(issue.number);
      }
    } catch (err) {
      console.error("poll error:", err.message);
    }
    execFileSync("sleep", [String(CFG.pollSeconds)]);
  }
} else {
  console.error("usage: node orchestrator/run.mjs --issue <number>   |   node orchestrator/run.mjs --watch");
  process.exit(1);
}
