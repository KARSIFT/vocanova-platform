export interface AnonymizationRun {
  dryRun: boolean;
  due: number;
  processed: number;
  deleted: number;
}

interface DueAccount {
  user_id: string;
}

/**
 * Internal operator use only. This is deliberately not registered as an HTTP
 * route or scheduled by the Worker.
 */
export class AccountAnonymizationProcessor {
  constructor(
    private readonly database: D1Database,
    private readonly now: () => Date = () => new Date(),
  ) {}

  async run({ dryRun = true, limit = 25 } = {}): Promise<AnonymizationRun> {
    if (!Number.isInteger(limit) || limit < 1 || limit > 100)
      throw new Error("anonymization limit must be between 1 and 100");
    const now = this.now().toISOString();
    const due = await this.database
      .prepare(
        `SELECT r.user_id FROM account_deletion_requests r JOIN users u ON u.id = r.user_id
         WHERE r.status IN ('deactivated', 'anonymizing') AND u.status = 'deleted' AND r.purge_after <= ?1
         ORDER BY purge_after, user_id LIMIT ?2`,
      )
      .bind(now, limit)
      .all<DueAccount>();
    if (dryRun)
      return {
        dryRun: true,
        due: due.results.length,
        processed: 0,
        deleted: 0,
      };

    let deleted = 0;
    for (const account of due.results) {
      await this.deleteAccount(account.user_id);
      deleted += 1;
    }
    return {
      dryRun: false,
      due: due.results.length,
      processed: due.results.length,
      deleted,
    };
  }

  private async deleteAccount(userId: string): Promise<void> {
    const deletes = [
      "DELETE FROM ai_feedback_reports WHERE user_id = ?1",
      `DELETE FROM ai_feedback_attempts WHERE learner_sentence_id IN
       (SELECT id FROM learner_sentences WHERE user_id = ?1)`,
      "DELETE FROM learner_sentences WHERE user_id = ?1",
      "DELETE FROM review_attempts WHERE user_id = ?1",
      "DELETE FROM user_words WHERE user_id = ?1",
      "DELETE FROM idempotency_keys WHERE user_id = ?1",
      "DELETE FROM daily_mission_snapshots WHERE user_id = ?1",
      "DELETE FROM daily_activity_summaries WHERE user_id = ?1",
      "DELETE FROM confidence_point_ledger WHERE user_id = ?1",
      "DELETE FROM streak_states WHERE user_id = ?1",
      "DELETE FROM grace_day_ledger WHERE user_id = ?1",
      "DELETE FROM ai_generation_events WHERE user_id = ?1",
      "DELETE FROM ai_generation_leases WHERE user_id = ?1",
      "DELETE FROM ai_usage_counters WHERE scope IN ('user_minute', 'user_day') AND subject = ?1",
      `DELETE FROM auth_rate_limits WHERE EXISTS (
         SELECT 1 FROM sessions WHERE user_id = ?1 AND (
           bucket_key = 'logout:session:' || token_hash OR
           (instr(bucket_key, ':session:') > 0 AND substr(bucket_key, -64) = token_hash)
         )
       )`,
      `DELETE FROM magic_links WHERE user_id = ?1 OR (user_id IS NULL AND email IN (
         SELECT provider_email FROM external_identities WHERE user_id = ?1
         AND provider_email <> ''
       ))`,
      "DELETE FROM external_identities WHERE user_id = ?1",
      "DELETE FROM sessions WHERE user_id = ?1",
      "DELETE FROM email_change_links WHERE user_id = ?1",
      "DELETE FROM user_settings WHERE user_id = ?1",
      "DELETE FROM user_onboarding_profiles WHERE user_id = ?1",
      "DELETE FROM account_deletion_requests WHERE user_id = ?1",
      "DELETE FROM users WHERE id = ?1",
    ];
    const results = await this.database.batch(
      deletes.map((sql) => this.database.prepare(sql).bind(userId)),
    );
    if ((results.at(-1)?.meta.changes ?? 0) !== 1)
      throw new Error("anonymization target disappeared");
  }
}
