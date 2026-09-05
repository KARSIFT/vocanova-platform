import { spawnSync } from "node:child_process";
import process from "node:process";

import {
  LOCAL_D1_PATHS,
  localOnlyEnvironment,
  runLocalD1Migrations,
} from "./local-d1-init.mjs";

const args = process.argv.slice(2);
const apply = args.length === 1 && args[0] === "--apply";
if (!(args.length === 0 || apply)) {
  throw new Error("Usage: node scripts/account-anonymization-local.mjs [--apply]");
}

const migration = runLocalD1Migrations({ stdio: "pipe" });
if (migration.status !== 0) throw new Error("local D1 migrations failed");
const execute = (command) => {
  const result = spawnSync(
    process.execPath,
    [LOCAL_D1_PATHS.wranglerBin, "d1", "execute", "DB", "--local", "--config", LOCAL_D1_PATHS.canonicalConfigPath, "--persist-to", LOCAL_D1_PATHS.canonicalStateDirectory, "--command", command],
    { cwd: LOCAL_D1_PATHS.apiRoot, env: localOnlyEnvironment(), encoding: "utf8" },
  );
  if (result.status !== 0) throw new Error(result.stderr || "local D1 command failed");
  return result.stdout;
};

const due = execute("SELECT count(*) AS due FROM account_deletion_requests WHERE status IN ('deactivated', 'anonymizing') AND purge_after <= strftime('%Y-%m-%dT%H:%M:%fZ', 'now')");
if (!apply) process.stdout.write(`Dry run only. ${due}`);
else
  process.stdout.write(
    execute(`BEGIN;
CREATE TEMP TABLE purge_target AS SELECT user_id FROM account_deletion_requests WHERE status IN ('deactivated', 'anonymizing') AND purge_after <= strftime('%Y-%m-%dT%H:%M:%fZ', 'now') ORDER BY purge_after, user_id LIMIT 1;
DELETE FROM ai_feedback_reports WHERE user_id IN (SELECT user_id FROM purge_target);
DELETE FROM ai_feedback_attempts WHERE learner_sentence_id IN (SELECT id FROM learner_sentences WHERE user_id IN (SELECT user_id FROM purge_target));
DELETE FROM learner_sentences WHERE user_id IN (SELECT user_id FROM purge_target);
DELETE FROM review_attempts WHERE user_id IN (SELECT user_id FROM purge_target);
DELETE FROM user_words WHERE user_id IN (SELECT user_id FROM purge_target);
DELETE FROM idempotency_keys WHERE user_id IN (SELECT user_id FROM purge_target);
DELETE FROM daily_mission_snapshots WHERE user_id IN (SELECT user_id FROM purge_target);
DELETE FROM daily_activity_summaries WHERE user_id IN (SELECT user_id FROM purge_target);
DELETE FROM confidence_point_ledger WHERE user_id IN (SELECT user_id FROM purge_target);
DELETE FROM streak_states WHERE user_id IN (SELECT user_id FROM purge_target);
DELETE FROM grace_day_ledger WHERE user_id IN (SELECT user_id FROM purge_target);
DELETE FROM ai_generation_events WHERE user_id IN (SELECT user_id FROM purge_target);
DELETE FROM ai_generation_leases WHERE user_id IN (SELECT user_id FROM purge_target);
DELETE FROM ai_usage_counters WHERE scope IN ('user_minute', 'user_day') AND subject IN (SELECT user_id FROM purge_target);
DELETE FROM auth_rate_limits WHERE EXISTS (SELECT 1 FROM sessions JOIN purge_target ON sessions.user_id = purge_target.user_id WHERE bucket_key = 'logout:session:' || token_hash OR (instr(bucket_key, ':session:') > 0 AND substr(bucket_key, -64) = token_hash));
DELETE FROM magic_links WHERE user_id IN (SELECT user_id FROM purge_target) OR email IN (SELECT provider_email FROM external_identities WHERE user_id IN (SELECT user_id FROM purge_target) AND provider_email <> '');
DELETE FROM email_change_links WHERE user_id IN (SELECT user_id FROM purge_target);
DELETE FROM external_identities WHERE user_id IN (SELECT user_id FROM purge_target);
DELETE FROM sessions WHERE user_id IN (SELECT user_id FROM purge_target);
DELETE FROM user_settings WHERE user_id IN (SELECT user_id FROM purge_target);
DELETE FROM user_onboarding_profiles WHERE user_id IN (SELECT user_id FROM purge_target);
DELETE FROM account_deletion_requests WHERE user_id IN (SELECT user_id FROM purge_target);
DELETE FROM users WHERE id IN (SELECT user_id FROM purge_target);
COMMIT;`),
  );
