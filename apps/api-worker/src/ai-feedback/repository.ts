import {
  AIFeedbackError,
  acceptedForms,
  feedbackReportReasons,
  type FeedbackSource,
  type FeedbackReportClassification,
  type FeedbackTarget,
  type ProviderFeedback,
  type SentenceFeedbackResult,
  type SubmitFeedbackInput,
} from "../domain/ai-feedback.js";
import { localDate } from "../domain/missions.js";

type Row = Record<string, string | number | null>;

export interface GenerationLimits {
  enabled: boolean;
  perMinute: number;
  perDay: number;
  globalPerDay: number;
  monthlyCostHardStopCents: number;
  requestCostCents: number;
  leaseSeconds: number;
}

export interface PendingAttempt {
  sentenceId: string;
  attemptId: string;
  leaseId: string;
  requestHash: string;
}

export class D1AIFeedbackRepository {
  constructor(
    private readonly database: D1Database,
    private readonly now: () => Date = () => new Date(),
  ) {}

  async loadTarget(
    userId: string,
    source: FeedbackSource,
    attemptId: string,
  ): Promise<FeedbackTarget> {
    let row: Row | null = null;
    if (source === "word_detail") {
      row = await this.database
        .prepare(
          `SELECT w.id AS word_id, m.id AS meaning_id, uw.id AS user_word_id,
                  w.text AS word_text, w.normalized_text, w.word_type,
                  m.part_of_speech, m.short_definition,
                  COALESCE(m.difficulty_level, w.difficulty_level, 'unknown') AS learner_level
           FROM user_words uw
           JOIN word_meanings m ON m.id = uw.meaning_id
           JOIN canonical_words w ON w.id = m.word_id
           WHERE uw.id = ?1 AND uw.user_id = ?2 AND uw.deleted_at IS NULL
             AND uw.status <> 'archived' AND m.status = 'active' AND w.status = 'active'`,
        )
        .bind(attemptId, userId)
        .first<Row>();
    } else if (source === "review") {
      row = await this.database
        .prepare(
          `SELECT w.id AS word_id, m.id AS meaning_id, uw.id AS user_word_id,
                  ra.id AS review_attempt_id, w.text AS word_text,
                  w.normalized_text, w.word_type, m.part_of_speech,
                  m.short_definition,
                  COALESCE(m.difficulty_level, w.difficulty_level, 'unknown') AS learner_level
           FROM review_attempts ra
           JOIN user_words uw ON uw.id = ra.user_word_id
           JOIN word_meanings m ON m.id = ra.meaning_id
           JOIN canonical_words w ON w.id = m.word_id
           WHERE ra.id = ?1 AND ra.user_id = ?2 AND uw.user_id = ?2
             AND uw.deleted_at IS NULL AND m.status = 'active' AND w.status = 'active'`,
        )
        .bind(attemptId, userId)
        .first<Row>();
    }
    if (!row) throw new AIFeedbackError("target_not_found");
    const wordText = String(row.word_text);
    const wordType = String(row.word_type);
    const partOfSpeech = String(row.part_of_speech);
    return {
      wordId: String(row.word_id),
      meaningId: String(row.meaning_id),
      userWordId: String(row.user_word_id),
      ...(row.review_attempt_id && {
        reviewAttemptId: String(row.review_attempt_id),
      }),
      wordText,
      normalizedWord: String(row.normalized_text),
      wordType,
      partOfSpeech,
      shortDefinition: String(row.short_definition),
      learnerLevel: String(row.learner_level),
      acceptedForms: acceptedForms(wordText, wordType, partOfSpeech),
    };
  }

  async checkIdempotency(
    userId: string,
    key: string,
    requestHash: string,
  ): Promise<"new" | "replay"> {
    if (!key || key.length > 200)
      throw new AIFeedbackError("invalid_idempotency");
    const row = await this.database
      .prepare(
        `SELECT fingerprint FROM idempotency_keys
         WHERE user_id = ?1 AND operation = 'ai_feedback_request' AND key = ?2`,
      )
      .bind(userId, key)
      .first<{ fingerprint: string }>();
    if (!row) return "new";
    if (row.fingerprint !== requestHash)
      throw new AIFeedbackError("idempotency_conflict");
    return "replay";
  }

  async findAttempt(
    requestHash: string,
    originalSentence: string,
  ): Promise<SentenceFeedbackResult | null> {
    const row = await this.database
      .prepare(
        `SELECT a.id, a.learner_sentence_id, a.status, a.feedback_json,
                a.feedback_text, a.error_code, a.error_message,
                EXISTS(SELECT 1 FROM ai_feedback_reports r WHERE r.attempt_id = a.id) AS reported
         FROM ai_feedback_attempts a
         WHERE a.request_hash = ?1 AND a.status IN ('pending', 'succeeded')`,
      )
      .bind(requestHash)
      .first<Row>();
    return row ? resultFromRow(row, originalSentence) : null;
  }

  async recordIdempotency(
    userId: string,
    key: string,
    requestHash: string,
  ): Promise<void> {
    await this.database
      .prepare(
        `INSERT INTO idempotency_keys
         (id, user_id, operation, key, fingerprint, created_at)
         VALUES (?1, ?2, 'ai_feedback_request', ?3, ?4, ?5)`,
      )
      .bind(
        crypto.randomUUID(),
        userId,
        key,
        requestHash,
        this.now().toISOString(),
      )
      .run();
  }

  async reserve(
    userId: string,
    limits: GenerationLimits,
  ): Promise<
    | { ok: true; leaseId: string }
    | { ok: false; reason: "disabled" | "limited" }
  > {
    if (!limits.enabled) return { ok: false, reason: "disabled" };
    const now = this.now();
    const timestamp = now.toISOString();
    const leaseId = crypto.randomUUID();
    const minuteAgo = new Date(now.getTime() - 60_000).toISOString();
    const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1_000).toISOString();
    const month = timestamp.slice(0, 7);
    if (limits.monthlyCostHardStopCents > 0 && limits.requestCostCents > 0) {
      const current = await this.database
        .prepare(
          `SELECT estimated_cost_cents FROM ai_usage_counters
           WHERE scope = 'global_month' AND subject = 'global' AND period = ?1`,
        )
        .bind(month)
        .first<{ estimated_cost_cents: number }>();
      if (
        Number(current?.estimated_cost_cents ?? 0) + limits.requestCostCents >=
        limits.monthlyCostHardStopCents
      )
        return { ok: false, reason: "disabled" };
    }
    const expiresAt = new Date(
      now.getTime() + limits.leaseSeconds * 1_000,
    ).toISOString();
    try {
      await this.database.batch([
        this.database
          .prepare("DELETE FROM ai_generation_leases WHERE expires_at <= ?1")
          .bind(timestamp),
        this.database
          .prepare("DELETE FROM ai_generation_events WHERE occurred_at < ?1")
          .bind(dayAgo),
        rollingUserLimitStatement(
          this.database,
          userId,
          minuteAgo,
          limits.perMinute,
        ),
        rollingUserLimitStatement(this.database, userId, dayAgo, limits.perDay),
        rollingGlobalLimitStatement(this.database, dayAgo, limits.globalPerDay),
        this.database
          .prepare(
            `SELECT CASE WHEN ?2 > 0 AND COALESCE((
               SELECT estimated_cost_cents FROM ai_usage_counters
               WHERE scope = 'global_month' AND subject = 'global' AND period = ?1
             ), 0) + ?3 >= ?2 THEN json('') ELSE 1 END`,
          )
          .bind(
            month,
            limits.monthlyCostHardStopCents,
            limits.requestCostCents,
          ),
        this.database
          .prepare(
            `INSERT INTO ai_generation_leases (user_id, lease_id, expires_at, created_at)
             VALUES (?1, ?2, ?3, ?4)`,
          )
          .bind(userId, leaseId, expiresAt, timestamp),
        this.database
          .prepare(
            `INSERT INTO ai_generation_events
             (id, user_id, occurred_at, estimated_cost_cents)
             VALUES (?1, ?2, ?3, ?4)`,
          )
          .bind(
            crypto.randomUUID(),
            userId,
            timestamp,
            limits.requestCostCents,
          ),
        this.database
          .prepare(
            `INSERT INTO ai_usage_counters
             (scope, subject, period, request_count, estimated_cost_cents, updated_at)
             VALUES ('global_month', 'global', ?1, 1, ?2, ?3)
             ON CONFLICT(scope, subject, period) DO UPDATE SET
               request_count = request_count + 1,
               estimated_cost_cents = estimated_cost_cents + excluded.estimated_cost_cents,
               updated_at = excluded.updated_at`,
          )
          .bind(month, limits.requestCostCents, timestamp),
      ]);
      return { ok: true, leaseId };
    } catch {
      return { ok: false, reason: "limited" };
    }
  }

  async createPending(
    userId: string,
    input: SubmitFeedbackInput,
    target: FeedbackTarget,
    normalizedSentence: string,
    idempotencyKey: string,
    requestHash: string,
    provider: string,
    model: string,
    leaseId: string,
  ): Promise<PendingAttempt> {
    const sentenceId = crypto.randomUUID();
    const feedbackAttemptId = crypto.randomUUID();
    const timestamp = this.now().toISOString();
    await this.database.batch([
      this.database
        .prepare(
          `INSERT INTO learner_sentences
           (id, user_id, meaning_id, user_word_id, sentence_text,
            normalized_sentence_text, source, status, submitted_at, created_at, updated_at)
           VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, 'submitted', ?8, ?8, ?8)`,
        )
        .bind(
          sentenceId,
          userId,
          target.meaningId,
          target.userWordId,
          input.sentenceText,
          normalizedSentence,
          input.source,
          timestamp,
        ),
      this.database
        .prepare(
          `INSERT INTO ai_feedback_attempts
           (id, learner_sentence_id, status, provider, model, prompt_version,
            request_hash, started_at, created_at, updated_at)
           VALUES (?1, ?2, 'pending', ?3, ?4, 'sentence-feedback-v1', ?5, ?6, ?6, ?6)`,
        )
        .bind(
          feedbackAttemptId,
          sentenceId,
          provider,
          model,
          requestHash,
          timestamp,
        ),
      this.database
        .prepare(
          `INSERT INTO idempotency_keys
           (id, user_id, operation, key, fingerprint, created_at)
           VALUES (?1, ?2, 'ai_feedback_request', ?3, ?4, ?5)`,
        )
        .bind(
          crypto.randomUUID(),
          userId,
          idempotencyKey,
          requestHash,
          timestamp,
        ),
    ]);
    return { sentenceId, attemptId: feedbackAttemptId, leaseId, requestHash };
  }

  async finalize(
    userId: string,
    pending: PendingAttempt,
    feedback: ProviderFeedback | null,
    errorCode = "",
    errorMessage = "",
    failedRequestHash?: string,
  ): Promise<void> {
    const timestamp = this.now().toISOString();
    const statements: D1PreparedStatement[] = [
      this.database
        .prepare(
          `UPDATE ai_feedback_attempts SET status = ?1, feedback_json = ?2,
             feedback_text = ?3, error_code = ?4, error_message = ?5,
             request_hash = COALESCE(?6, request_hash),
             completed_at = ?7, updated_at = ?7 WHERE id = ?8 AND status = 'pending'`,
        )
        .bind(
          feedback ? "succeeded" : "failed",
          feedback ? JSON.stringify(toStoredFeedback(feedback)) : null,
          feedback?.explanation ?? null,
          errorCode || null,
          errorMessage || null,
          failedRequestHash ?? null,
          timestamp,
          pending.attemptId,
        ),
      this.database
        .prepare(
          "UPDATE learner_sentences SET status = ?1, updated_at = ?2 WHERE id = ?3",
        )
        .bind(
          feedback ? "feedback_ready" : "feedback_failed",
          timestamp,
          pending.sentenceId,
        ),
      this.database
        .prepare(
          "DELETE FROM ai_generation_leases WHERE user_id = ?1 AND lease_id = ?2",
        )
        .bind(userId, pending.leaseId),
    ];
    if (feedback)
      statements.push(
        ...(await this.rewardStatements(userId, pending, timestamp)),
      );
    await this.database.batch(statements);
  }

  async release(userId: string, leaseId: string): Promise<void> {
    await this.database
      .prepare(
        "DELETE FROM ai_generation_leases WHERE user_id = ?1 AND lease_id = ?2",
      )
      .bind(userId, leaseId)
      .run();
  }

  async report(
    userId: string,
    attemptId: string,
    classification: FeedbackReportClassification,
  ): Promise<void> {
    const owner = await this.database
      .prepare(
        `SELECT s.user_id FROM ai_feedback_attempts a
         JOIN learner_sentences s ON s.id = a.learner_sentence_id
         WHERE a.id = ?1 AND s.user_id = ?2 AND a.status = 'succeeded'`,
      )
      .bind(attemptId, userId)
      .first<{ user_id: string }>();
    if (!owner) throw new AIFeedbackError("attempt_not_found");
    await this.database
      .prepare(
        `INSERT INTO ai_feedback_reports
         (id, attempt_id, user_id, reason, classification, created_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6)
         ON CONFLICT(attempt_id, user_id) DO NOTHING`,
      )
      .bind(
        crypto.randomUUID(),
        attemptId,
        userId,
        feedbackReportReasons[classification],
        classification,
        this.now().toISOString(),
      )
      .run();
  }

  private async rewardStatements(
    userId: string,
    pending: PendingAttempt,
    timestamp: string,
  ): Promise<D1PreparedStatement[]> {
    const timezone =
      (
        await this.database
          .prepare("SELECT timezone FROM user_settings WHERE user_id = ?1")
          .bind(userId)
          .first<{ timezone: string }>()
      )?.timezone || "UTC";
    const day = localDate(this.now(), timezone);
    const sentenceKey = `learner_sentence:${pending.sentenceId}:submitted`;
    const feedbackKey = `ai_feedback_attempt:${pending.attemptId}:received`;
    return [
      pointStatement(
        this.database,
        userId,
        3,
        "sentence_submitted",
        "learner_sentence",
        pending.sentenceId,
        sentenceKey,
        timestamp,
      ),
      pointStatement(
        this.database,
        userId,
        2,
        "ai_feedback_received",
        "ai_feedback_attempt",
        pending.attemptId,
        feedbackKey,
        timestamp,
      ),
      this.database
        .prepare(
          `INSERT INTO daily_activity_summaries
           (id, user_id, local_date, timezone, sentences_submitted,
            ai_feedback_received, confidence_points_earned, created_at, updated_at)
           SELECT ?1, ?2, ?3, ?4, 1, 1, 5, ?5, ?5
           WHERE EXISTS (SELECT 1 FROM confidence_point_ledger WHERE user_id = ?2 AND idempotency_key = ?6)
             AND EXISTS (SELECT 1 FROM confidence_point_ledger WHERE user_id = ?2 AND idempotency_key = ?7)
           ON CONFLICT(user_id, local_date) DO UPDATE SET
             sentences_submitted = sentences_submitted + 1,
             ai_feedback_received = ai_feedback_received + 1,
             confidence_points_earned = confidence_points_earned + 5,
             updated_at = excluded.updated_at`,
        )
        .bind(
          crypto.randomUUID(),
          userId,
          day,
          timezone,
          timestamp,
          sentenceKey,
          feedbackKey,
        ),
    ];
  }
}

function rollingUserLimitStatement(
  database: D1Database,
  userId: string,
  start: string,
  limit: number,
): D1PreparedStatement {
  return database
    .prepare(
      `SELECT CASE WHEN ?3 > 0 AND
         (SELECT COUNT(*) FROM ai_generation_events
          WHERE user_id = ?1 AND occurred_at >= ?2) >= ?3
       THEN json('') ELSE 1 END`,
    )
    .bind(userId, start, limit);
}

function rollingGlobalLimitStatement(
  database: D1Database,
  start: string,
  limit: number,
): D1PreparedStatement {
  return database
    .prepare(
      `SELECT CASE WHEN ?2 > 0 AND
         (SELECT COUNT(*) FROM ai_generation_events WHERE occurred_at >= ?1) >= ?2
       THEN json('') ELSE 1 END`,
    )
    .bind(start, limit);
}

function pointStatement(
  database: D1Database,
  userId: string,
  amount: number,
  reason: string,
  sourceType: string,
  sourceId: string,
  idempotencyKey: string,
  timestamp: string,
): D1PreparedStatement {
  return database
    .prepare(
      `INSERT INTO confidence_point_ledger
       (id, user_id, amount, balance_after, reason, source_type, source_id,
        idempotency_key, occurred_at, created_at, updated_at)
       SELECT ?1, ?2, ?3,
         COALESCE((SELECT balance_after FROM confidence_point_ledger
           WHERE user_id = ?2 ORDER BY occurred_at DESC, rowid DESC LIMIT 1), 0) + ?3,
         ?4, ?5, ?6, ?7, ?8, ?8, ?8
       WHERE NOT EXISTS (SELECT 1 FROM confidence_point_ledger
         WHERE user_id = ?2 AND idempotency_key = ?7)`,
    )
    .bind(
      crypto.randomUUID(),
      userId,
      amount,
      reason,
      sourceType,
      sourceId,
      idempotencyKey,
      timestamp,
    );
}

function toStoredFeedback(feedback: ProviderFeedback): Record<string, unknown> {
  return {
    status: feedback.status,
    target_word_used_correctly: feedback.targetWordUsedCorrectly,
    corrected_sentence: feedback.correctedSentence ?? null,
    explanation: feedback.explanation,
    improvement_tip: feedback.improvementTip ?? null,
  };
}

function resultFromRow(
  row: Row,
  originalSentence: string,
): SentenceFeedbackResult {
  const result: SentenceFeedbackResult = {
    sentenceId: String(row.learner_sentence_id),
    attemptId: String(row.id),
    originalSentence,
    missionCompleted: false,
    canRetry: false,
    reported: Boolean(row.reported),
  };
  if (row.status === "pending")
    return {
      ...result,
      errorCode: "AI_FEEDBACK_TEMPORARY_FAILURE",
      canRetry: true,
    };
  if (row.status === "failed")
    return {
      ...result,
      errorCode: String(row.error_code || "AI_FEEDBACK_TEMPORARY_FAILURE"),
      ...(row.error_message && { errorMessage: String(row.error_message) }),
      canRetry: true,
    };
  const feedback = JSON.parse(String(row.feedback_json)) as Record<
    string,
    unknown
  >;
  return {
    ...result,
    status: String(feedback.status) as SentenceFeedbackResult["status"],
    ...(typeof feedback.corrected_sentence === "string" && {
      correctedSentence: String(feedback.corrected_sentence),
    }),
    explanation: String(feedback.explanation || row.feedback_text || ""),
    ...(typeof feedback.improvement_tip === "string" && {
      improvementTip: String(feedback.improvement_tip),
    }),
  };
}
