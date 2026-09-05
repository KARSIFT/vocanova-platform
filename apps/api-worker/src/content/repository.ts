import {
  ContentLearningError,
  type DueWord,
  type ReviewAttempt,
  type ReviewSubmission,
  type SavedMeaning,
  type Situation,
  type SituationMeaning,
  type WordDetail,
  type WordMeaning,
  type WordReviewState,
} from "../domain/content-learning.js";
import { MISSION_POLICY_VERSION, localDate } from "../domain/missions.js";
import { D1MissionsRepository } from "../missions/repository.js";

type Row = Record<string, string | number | null>;

interface Cursor<T> {
  value: T;
  id: string;
}

export class D1ContentLearningRepository {
  constructor(
    private readonly database: D1Database,
    private readonly now: () => Date = () => new Date(),
  ) {}

  async listSituations(
    after: string,
    requestedLimit: number,
  ): Promise<{
    items: Situation[];
    nextCursor?: string;
  }> {
    const limit = normalizeLimit(requestedLimit);
    const cursor = decodeCursor<number>(after, "d");
    const result = await this.database
      .prepare(
        `SELECT id, slug, title, short_description, level_band, category, display_order
         FROM journey_situations
         WHERE status = 'active'
           AND (?1 IS NULL OR display_order > ?1 OR (display_order = ?1 AND id > ?2))
         ORDER BY display_order ASC, id ASC LIMIT ?3`,
      )
      .bind(cursor?.value ?? null, cursor?.id ?? "", limit)
      .all<Row>();
    const items = result.results.map(situationFromRow);
    return {
      items,
      ...(items.length === limit && {
        nextCursor: encodeCursor(
          "d",
          items.at(-1)!.displayOrder,
          items.at(-1)!.id,
        ),
      }),
    };
  }

  async getSituation(
    userId: string,
    slug: string,
  ): Promise<{
    situation: Situation;
    meanings: SituationMeaning[];
  }> {
    const row = await this.database
      .prepare(
        `SELECT id, slug, title, short_description, level_band, category, display_order
         FROM journey_situations WHERE status = 'active' AND slug = ?1`,
      )
      .bind(slug)
      .first<Row>();
    if (!row) throw new ContentLearningError("situation_not_found");
    const result = await this.database
      .prepare(
        `SELECT wm.id AS meaning_id, cw.id AS word_id, cw.text AS word_text,
                cw.normalized_text, wm.part_of_speech, wm.short_definition,
                CASE WHEN uw.id IS NULL THEN 0 ELSE 1 END AS saved
         FROM journey_words jw
         JOIN word_meanings wm ON wm.id = jw.meaning_id AND wm.status = 'active'
         JOIN canonical_words cw ON cw.id = wm.word_id AND cw.status = 'active'
         LEFT JOIN user_words uw ON uw.meaning_id = wm.id AND uw.user_id = ?1
                                AND uw.deleted_at IS NULL
         WHERE jw.journey_situation_id = ?2
         ORDER BY jw.display_order ASC, wm.id ASC`,
      )
      .bind(userId, String(row.id))
      .all<Row>();
    return {
      situation: situationFromRow(row),
      meanings: result.results.map((meaning) => ({
        meaningId: String(meaning.meaning_id),
        wordId: String(meaning.word_id),
        wordSlug: wordSlug(String(meaning.normalized_text)),
        wordText: String(meaning.word_text),
        partOfSpeech: String(meaning.part_of_speech),
        shortDefinition: String(meaning.short_definition),
        saved: meaning.saved === 1,
      })),
    };
  }

  async getWord(userId: string, slug: string): Promise<{ word: WordDetail }> {
    const nowIso = this.now().toISOString();
    const word = await this.database
      .prepare(
        `SELECT id, text, normalized_text, word_type, difficulty_level
         FROM canonical_words
         WHERE status = 'active' AND replace(normalized_text, ' ', '-') = ?1`,
      )
      .bind(slug)
      .first<Row>();
    if (!word) throw new ContentLearningError("word_not_found");
    const meaningResult = await this.database
      .prepare(
        `SELECT wm.id, wm.part_of_speech, wm.short_definition,
                wm.learner_definition, wm.meaning_order, uw.id AS user_word_id,
                uw.status AS user_word_status, uw.next_review_at
         FROM word_meanings wm
         LEFT JOIN user_words uw ON uw.meaning_id = wm.id AND uw.user_id = ?1
                                AND uw.deleted_at IS NULL
         WHERE wm.word_id = ?2 AND wm.status = 'active'
         ORDER BY wm.meaning_order ASC, wm.id ASC`,
      )
      .bind(userId, String(word.id))
      .all<Row>();
    const ids = meaningResult.results.map((row) => String(row.id));
    const [examples, notes] = await Promise.all([
      this.examples(ids),
      this.usageNotes(ids),
    ]);
    const meanings: WordMeaning[] = meaningResult.results.map((row) => {
      const id = String(row.id);
      return {
        id,
        partOfSpeech: String(row.part_of_speech),
        shortDefinition: String(row.short_definition),
        ...(row.learner_definition !== null && {
          learnerDefinition: String(row.learner_definition),
        }),
        saved: row.user_word_id !== null,
        ...(row.user_word_id !== null && {
          userWordId: String(row.user_word_id),
        }),
        reviewState: projectWordReviewState(
          row.user_word_status === null ? null : String(row.user_word_status),
          row.next_review_at === null ? null : String(row.next_review_at),
          nowIso,
        ),
        examples: examples.get(id) ?? [],
        usageNotes: notes.get(id) ?? [],
      };
    });
    return {
      word: {
        id: String(word.id),
        text: String(word.text),
        slug: wordSlug(String(word.normalized_text)),
        wordType: String(word.word_type),
        ...(word.difficulty_level !== null && {
          difficultyLevel: String(word.difficulty_level),
        }),
        meanings,
      },
    };
  }

  async listSavedWords(
    userId: string,
    after: string,
    requestedLimit: number,
  ): Promise<{
    items: SavedMeaning[];
    nextCursor?: string;
  }> {
    const limit = normalizeLimit(requestedLimit);
    const cursor = decodeCursor<string>(after, "a");
    const result = await this.database
      .prepare(
        `SELECT uw.id AS user_word_id, uw.meaning_id,
                cw.id AS word_id, cw.text AS word_text, cw.normalized_text,
                wm.part_of_speech, wm.short_definition, uw.status, uw.source, uw.added_at
         FROM user_words uw JOIN word_meanings wm ON wm.id = uw.meaning_id
         JOIN canonical_words cw ON cw.id = wm.word_id
         WHERE uw.user_id = ?1 AND uw.deleted_at IS NULL
           AND (?2 IS NULL OR uw.added_at < ?2 OR (uw.added_at = ?2 AND uw.id < ?3))
         ORDER BY uw.added_at DESC, uw.id DESC LIMIT ?4`,
      )
      .bind(userId, cursor?.value ?? null, cursor?.id ?? "", limit)
      .all<Row>();
    const items = result.results.map(savedMeaningFromRow);
    return {
      items,
      ...(items.length === limit && {
        nextCursor: encodeCursor(
          "a",
          items.at(-1)!.addedAt,
          items.at(-1)!.userWordId,
        ),
      }),
    };
  }

  async saveUserWord(
    userId: string,
    meaningId: string,
    source: string,
    key: string,
  ): Promise<SavedMeaning> {
    requireKey(key);
    const fingerprint = await sha256(`${meaningId}:${source}`);
    const replay = await this.idempotency(userId, "user_words:save", key);
    if (replay && replay !== fingerprint)
      throw new ContentLearningError("idempotency_conflict");
    if (replay) return this.savedMeaning(userId, meaningId);

    const meaning = await this.database
      .prepare(
        "SELECT id FROM word_meanings WHERE id = ?1 AND status = 'active'",
      )
      .bind(meaningId)
      .first();
    if (!meaning) throw new ContentLearningError("meaning_not_found");
    const existing = await this.database
      .prepare(
        "SELECT id, deleted_at FROM user_words WHERE user_id = ?1 AND meaning_id = ?2 ORDER BY deleted_at IS NULL DESC, created_at DESC LIMIT 1",
      )
      .bind(userId, meaningId)
      .first<Row>();
    const timestamp = this.now().toISOString();
    const wordId = existing ? String(existing.id) : crypto.randomUUID();
    const mutation = existing
      ? existing.deleted_at === null
        ? this.database.prepare("SELECT ?1 AS id").bind(wordId)
        : this.database
            .prepare(
              `UPDATE user_words SET deleted_at = NULL, status = 'new', source = ?1,
                 review_step = 0, next_review_at = NULL, consecutive_correct_count = 0,
                 consecutive_incorrect_count = 0, mastered_at = NULL, ignored_at = NULL,
                 added_at = ?2, updated_at = ?2 WHERE id = ?3`,
            )
            .bind(source, timestamp, wordId)
      : this.database
          .prepare(
            `INSERT INTO user_words
             (id, user_id, meaning_id, status, source, review_step, added_at, created_at, updated_at)
             VALUES (?1, ?2, ?3, 'new', ?4, 0, ?5, ?5, ?5)`,
          )
          .bind(wordId, userId, meaningId, source, timestamp);
    const statements = [
      mutation,
      this.database
        .prepare(
          `INSERT INTO idempotency_keys (id, user_id, operation, key, fingerprint, created_at)
           VALUES (?1, ?2, 'user_words:save', ?3, ?4, ?5)`,
        )
        .bind(crypto.randomUUID(), userId, key, fingerprint, timestamp),
    ];
    if (!existing) {
      statements.push(
        this.pointLedgerStatement(
          userId,
          2,
          "word_added",
          "user_word",
          wordId,
          `user_word:${wordId}:added`,
          timestamp,
        ),
      );
    }
    try {
      await this.database.batch(statements);
    } catch (error) {
      if (!isActiveUserWordConflict(error)) throw error;
      const saved = await this.savedMeaning(userId, meaningId);
      await this.recordIdempotency(userId, "user_words:save", key, fingerprint);
      return saved;
    }
    return this.savedMeaning(userId, meaningId);
  }

  async unsaveUserWord(userId: string, meaningId: string): Promise<void> {
    const result = await this.database
      .prepare(
        `UPDATE user_words SET deleted_at = ?1, updated_at = ?1
         WHERE user_id = ?2 AND meaning_id = ?3 AND deleted_at IS NULL`,
      )
      .bind(this.now().toISOString(), userId, meaningId)
      .run();
    if (result.meta.changes === 0)
      throw new ContentLearningError("user_word_not_found");
  }

  async listDueWords(
    userId: string,
    after: string,
    requestedLimit: number,
  ): Promise<{
    items: DueWord[];
    nextCursor?: string;
    totalCount: number;
  }> {
    const limit = normalizeLimit(requestedLimit);
    const cursor = decodeCursor<string>(after, "n");
    const cursorTime =
      cursor?.value === "0001-01-01T00:00:00Z" ? "" : cursor?.value;
    const timestamp = this.now().toISOString();
    const [count, result] = await Promise.all([
      this.database
        .prepare(
          `SELECT COUNT(*) AS count FROM user_words uw
           WHERE uw.user_id = ?1 AND uw.deleted_at IS NULL
             AND uw.status IN ('new', 'learning', 'reviewing')
             AND (uw.next_review_at IS NULL OR uw.next_review_at <= ?2)`,
        )
        .bind(userId, timestamp)
        .first<{ count: number }>(),
      this.database
        .prepare(
          `SELECT uw.id AS user_word_id, uw.meaning_id, cw.id AS word_id,
                  cw.text AS word_text, cw.normalized_text, wm.part_of_speech,
                  wm.short_definition, uw.status, uw.review_step, uw.next_review_at
           FROM user_words uw JOIN word_meanings wm ON wm.id = uw.meaning_id
           JOIN canonical_words cw ON cw.id = wm.word_id
           WHERE uw.user_id = ?1 AND uw.deleted_at IS NULL
             AND uw.status IN ('new', 'learning', 'reviewing')
             AND (uw.next_review_at IS NULL OR uw.next_review_at <= ?2)
             AND (?3 IS NULL OR coalesce(uw.next_review_at, '') > ?3
                  OR (coalesce(uw.next_review_at, '') = ?3 AND uw.id > ?4))
           ORDER BY coalesce(uw.next_review_at, '') ASC, uw.id ASC LIMIT ?5`,
        )
        .bind(userId, timestamp, cursorTime ?? null, cursor?.id ?? "", limit)
        .all<Row>(),
    ]);
    const items = result.results.map((row) => ({
      userWordId: String(row.user_word_id),
      meaningId: String(row.meaning_id),
      wordId: String(row.word_id),
      wordText: String(row.word_text),
      wordSlug: wordSlug(String(row.normalized_text)),
      partOfSpeech: String(row.part_of_speech),
      shortDefinition: String(row.short_definition),
      status: String(row.status),
      reviewStep: Number(row.review_step),
    }));
    const last = result.results.at(-1);
    return {
      items,
      totalCount: Number(count?.count ?? 0),
      ...(items.length === limit &&
        last && {
          nextCursor: encodeCursor(
            "n",
            last.next_review_at === null
              ? "0001-01-01T00:00:00Z"
              : String(last.next_review_at),
            String(last.user_word_id),
          ),
        }),
    };
  }

  async submitReview(
    userId: string,
    input: ReviewSubmission,
    key: string,
  ): Promise<ReviewAttempt> {
    validateReview(input);
    requireKey(key);
    const normalized = normalizeReview(input);
    const fingerprint = await sha256(
      stableJson({
        userWordId: normalized.userWordId,
        meaningId: normalized.meaningId,
        attemptType: normalized.attemptType,
        promptType: normalized.promptType,
        result: normalized.result,
        rating: normalized.rating,
        source: normalized.source,
        clientAttemptId: normalized.clientAttemptId,
        wasHintUsed: normalized.wasHintUsed,
        responseTimeMs: normalized.responseTimeMs,
        answeredAt: normalized.answeredAt,
        selectedOptionMeaningId: normalized.selectedOptionMeaningId,
        typedAnswer: normalized.typedAnswer,
      }),
    );
    const replay = await this.idempotency(userId, "reviews:submit", key);
    if (replay && replay !== fingerprint)
      throw new ContentLearningError("idempotency_conflict");
    const existingAttempt = await this.attemptByClientId(
      userId,
      normalized.clientAttemptId,
    );
    if (replay) {
      if (!existingAttempt || !attemptMatches(existingAttempt, normalized))
        throw new ContentLearningError("idempotency_conflict");
      return existingAttempt;
    }
    if (existingAttempt) {
      if (!attemptMatches(existingAttempt, normalized))
        throw new ContentLearningError("idempotency_conflict");
      await this.recordIdempotency(userId, "reviews:submit", key, fingerprint);
      return existingAttempt;
    }
    if (
      normalized.promptType === "multiple_choice" &&
      normalized.result !== "skipped" &&
      (normalized.result === "correct") !==
        (normalized.selectedOptionMeaningId === normalized.meaningId)
    )
      throw new ContentLearningError("invalid_input");
    for (let retry = 0; retry < 3; retry += 1) {
      const word = await this.database
        .prepare(
          `SELECT review_step, meaning_id, total_review_count, correct_review_count,
                  consecutive_correct_count, consecutive_incorrect_count,
                  coalesce((
                    SELECT max(state_version) + 1
                    FROM review_state_reservations
                    WHERE user_word_id = user_words.id
                  ), 0) AS review_state_version
           FROM user_words WHERE id = ?1 AND user_id = ?2 AND deleted_at IS NULL`,
        )
        .bind(normalized.userWordId, userId)
        .first<Row>();
      if (!word || word.meaning_id !== normalized.meaningId)
        throw new ContentLearningError("user_word_not_found");
      const schedule = applyReview(
        {
          step: Number(word.review_step),
          total: Number(word.total_review_count),
          correct: Number(word.correct_review_count),
          consecutiveCorrect: Number(word.consecutive_correct_count),
          consecutiveIncorrect: Number(word.consecutive_incorrect_count),
        },
        normalized.result,
        normalized.rating,
        normalized.answeredAt,
      );
      const attemptId = crypto.randomUUID();
      const timestamp = this.now().toISOString();
      const missionWiring = await this.reviewMissionStatements(
        userId,
        attemptId,
        normalized.result,
        normalized.rating,
        timestamp,
      );
      const reviewStateVersion = Number(word.review_state_version);
      try {
        await this.database.batch([
          this.database
            .prepare(
              `INSERT INTO review_state_reservations
               (user_word_id, state_version, created_at) VALUES (?1, ?2, ?3)`,
            )
            .bind(normalized.userWordId, reviewStateVersion, timestamp),
          this.database
            .prepare(
              `INSERT INTO review_attempts
           (id, user_id, user_word_id, meaning_id, attempt_type, prompt_type, result,
            rating, review_step_before, review_step_after, answered_at, response_time_ms,
            selected_option_meaning_id, typed_answer, was_hint_used, source,
            client_attempt_id, metadata_json, created_at, updated_at)
           VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12,
                   ?13, ?14, ?15, ?16, ?17, ?18, ?19, ?19)`,
            )
            .bind(
              attemptId,
              userId,
              normalized.userWordId,
              normalized.meaningId,
              normalized.attemptType,
              normalized.promptType,
              normalized.result,
              normalized.rating || null,
              schedule.before,
              schedule.after,
              normalized.answeredAt,
              normalized.responseTimeMs,
              normalized.selectedOptionMeaningId || null,
              normalized.typedAnswer || null,
              normalized.wasHintUsed ? 1 : 0,
              normalized.source,
              normalized.clientAttemptId,
              normalized.metadata ? JSON.stringify(normalized.metadata) : null,
              timestamp,
            ),
          this.database
            .prepare(
              `UPDATE user_words SET review_step = ?1, next_review_at = ?2,
             last_reviewed_at = ?3, last_result = ?4, last_rating = ?5,
             total_review_count = ?6, correct_review_count = ?7,
             consecutive_correct_count = ?8, consecutive_incorrect_count = ?9,
             updated_at = ?10 WHERE id = ?11 AND user_id = ?12`,
            )
            .bind(
              schedule.after,
              schedule.nextReviewAt,
              normalized.answeredAt,
              normalized.result,
              schedule.lastRating || null,
              schedule.total,
              schedule.correct,
              schedule.consecutiveCorrect,
              schedule.consecutiveIncorrect,
              timestamp,
              normalized.userWordId,
              userId,
            ),
          this.database
            .prepare(
              `INSERT INTO idempotency_keys (id, user_id, operation, key, fingerprint, created_at)
           VALUES (?1, ?2, 'reviews:submit', ?3, ?4, ?5)`,
            )
            .bind(crypto.randomUUID(), userId, key, fingerprint, timestamp),
          ...missionWiring.statements,
        ]);
      } catch (error) {
        if (isReviewStateVersionConflict(error) && retry < 2) continue;
        throw error;
      }
      return (await this.attemptByClientId(
        userId,
        normalized.clientAttemptId,
      ))!;
    }
    throw new Error("review scheduler retries exhausted");
  }

  private async examples(
    ids: string[],
  ): Promise<Map<string, WordMeaning["examples"]>> {
    const output = new Map<string, WordMeaning["examples"]>();
    if (ids.length === 0) return output;
    const result = await this.database
      .prepare(
        `SELECT id, meaning_id, example_text, situation_label
         FROM word_examples
         WHERE meaning_id IN (SELECT value FROM json_each(?1)) AND status = 'active'
         ORDER BY example_order ASC, id ASC`,
      )
      .bind(JSON.stringify(ids))
      .all<Row>();
    for (const row of result.results) {
      const meaningId = String(row.meaning_id);
      const example = {
        id: String(row.id),
        exampleText: String(row.example_text),
        ...(row.situation_label !== null && {
          situationLabel: String(row.situation_label),
        }),
      };
      output.set(meaningId, [...(output.get(meaningId) ?? []), example]);
    }
    return output;
  }

  private async usageNotes(
    ids: string[],
  ): Promise<Map<string, WordMeaning["usageNotes"]>> {
    const output = new Map<string, WordMeaning["usageNotes"]>();
    if (ids.length === 0) return output;
    const result = await this.database
      .prepare(
        `SELECT id, meaning_id, note_type, note_text
         FROM usage_notes
         WHERE meaning_id IN (SELECT value FROM json_each(?1)) AND status = 'active'
         ORDER BY note_order ASC, id ASC`,
      )
      .bind(JSON.stringify(ids))
      .all<Row>();
    for (const row of result.results) {
      const meaningId = String(row.meaning_id);
      const note = {
        id: String(row.id),
        noteType: String(row.note_type),
        noteText: String(row.note_text),
      };
      output.set(meaningId, [...(output.get(meaningId) ?? []), note]);
    }
    return output;
  }

  private async savedMeaning(
    userId: string,
    meaningId: string,
  ): Promise<SavedMeaning> {
    const row = await this.database
      .prepare(
        `SELECT uw.id AS user_word_id, uw.meaning_id,
                cw.id AS word_id, cw.text AS word_text, cw.normalized_text,
                wm.part_of_speech, wm.short_definition, uw.status, uw.source, uw.added_at
         FROM user_words uw JOIN word_meanings wm ON wm.id = uw.meaning_id
         JOIN canonical_words cw ON cw.id = wm.word_id
         WHERE uw.user_id = ?1 AND uw.meaning_id = ?2 AND uw.deleted_at IS NULL`,
      )
      .bind(userId, meaningId)
      .first<Row>();
    if (!row) throw new ContentLearningError("user_word_not_found");
    return savedMeaningFromRow(row);
  }

  private async idempotency(
    userId: string,
    operation: string,
    key: string,
  ): Promise<string | null> {
    const row = await this.database
      .prepare(
        "SELECT fingerprint FROM idempotency_keys WHERE user_id = ?1 AND operation = ?2 AND key = ?3",
      )
      .bind(userId, operation, key)
      .first<{ fingerprint: string }>();
    return row?.fingerprint ?? null;
  }

  private async recordIdempotency(
    userId: string,
    operation: string,
    key: string,
    fingerprint: string,
  ): Promise<void> {
    await this.database
      .prepare(
        `INSERT INTO idempotency_keys
         (id, user_id, operation, key, fingerprint, created_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6)`,
      )
      .bind(
        crypto.randomUUID(),
        userId,
        operation,
        key,
        fingerprint,
        this.now().toISOString(),
      )
      .run();
  }

  private async attemptByClientId(
    userId: string,
    clientAttemptId: string,
  ): Promise<ReviewAttempt | null> {
    const row = await this.database
      .prepare(
        `SELECT ra.*, uw.next_review_at FROM review_attempts ra
       JOIN user_words uw ON uw.id = ra.user_word_id
       WHERE ra.user_id = ?1 AND ra.client_attempt_id = ?2`,
      )
      .bind(userId, clientAttemptId)
      .first<Row>();
    return row ? attemptFromRow(row) : null;
  }

  private pointLedgerStatement(
    userId: string,
    amount: number,
    reason: string,
    sourceType: string,
    sourceId: string,
    key: string,
    timestamp: string,
    metadataJson: string | null = null,
  ): D1PreparedStatement {
    return this.database
      .prepare(
        `INSERT INTO confidence_point_ledger
         (id, user_id, amount, balance_after, reason, source_type, source_id,
          idempotency_key, metadata_json, occurred_at, created_at, updated_at)
         VALUES (?1, ?2, ?3,
           coalesce((SELECT balance_after FROM confidence_point_ledger
                     WHERE user_id = ?2 ORDER BY occurred_at DESC, rowid DESC LIMIT 1), 0) + ?3,
           ?4, ?5, ?6, ?7, ?8, ?9, ?9, ?9)
         ON CONFLICT(user_id, idempotency_key) WHERE idempotency_key IS NOT NULL DO NOTHING`,
      )
      .bind(
        crypto.randomUUID(),
        userId,
        amount,
        reason,
        sourceType,
        sourceId,
        key,
        metadataJson,
        timestamp,
      );
  }

  private async reviewMissionStatements(
    userId: string,
    attemptId: string,
    result: string,
    rating: string,
    timestamp: string,
  ): Promise<{
    statements: D1PreparedStatement[];
  }> {
    const missions = new D1MissionsRepository(this.database, this.now);
    const settings = await missions.resolveSettings(userId, "");
    const today = localDate(this.now(), settings.timezone);
    const correct = result === "correct" ? 1 : 0;
    const skipped = result === "skipped" ? 1 : 0;
    const reward = skipped
      ? 0
      : rating === "again"
        ? 1
        : rating === "hard"
          ? 2
          : rating === "easy"
            ? 6
            : 5;
    const ledgerMetadata = JSON.stringify({
      localDate: today,
      timezone: settings.timezone,
    });
    const completionKey = `daily_mission:${userId}:${today}:completed`;
    const statements: D1PreparedStatement[] = [
      this.database
        .prepare(
          `UPDATE daily_mission_snapshots SET status = 'missed', updated_at = ?1
           WHERE user_id = ?2 AND local_date < ?3 AND status = 'open'`,
        )
        .bind(timestamp, userId, today),
      this.database
        .prepare(
          `INSERT INTO daily_mission_snapshots
           (id, user_id, local_date, timezone, review_target, reviews_completed,
            policy_version, status, grace_applied, created_at, updated_at)
           VALUES (?1, ?2, ?3, ?4, ?5, 0, ?6, 'open', 0, ?7, ?7)
           ON CONFLICT(user_id, local_date) DO NOTHING`,
        )
        .bind(
          crypto.randomUUID(),
          userId,
          today,
          settings.timezone,
          settings.reviewTarget,
          MISSION_POLICY_VERSION,
          timestamp,
        ),
      this.database
        .prepare(
          `UPDATE daily_mission_snapshots
           SET reviews_completed = min(reviews_completed + 1, review_target), updated_at = ?1
           WHERE user_id = ?2 AND local_date = ?3`,
        )
        .bind(timestamp, userId, today),
      this.database
        .prepare(
          `INSERT INTO daily_activity_summaries
           (id, user_id, local_date, timezone, reviews_attempted, reviews_correct,
            reviews_skipped, created_at, updated_at)
           VALUES (?1, ?2, ?3, ?4, 1, ?5, ?6, ?7, ?7)
           ON CONFLICT(user_id, local_date) DO UPDATE SET
             reviews_attempted = reviews_attempted + 1,
             reviews_correct = reviews_correct + excluded.reviews_correct,
             reviews_skipped = reviews_skipped + excluded.reviews_skipped,
             updated_at = excluded.updated_at`,
        )
        .bind(
          crypto.randomUUID(),
          userId,
          today,
          settings.timezone,
          correct,
          skipped,
          timestamp,
        ),
    ];
    if (reward > 0) {
      statements.push(
        this.pointLedgerStatement(
          userId,
          reward,
          "review_correct",
          "review_attempt",
          attemptId,
          `review_attempt:${attemptId}:rated`,
          timestamp,
          ledgerMetadata,
        ),
      );
    }
    statements.push(
      this.database
        .prepare(
          `INSERT INTO confidence_point_ledger
           (id, user_id, amount, balance_after, reason, source_type, source_id,
            idempotency_key, metadata_json, occurred_at, created_at, updated_at)
           SELECT ?1, ?2, 10,
             coalesce((SELECT balance_after FROM confidence_point_ledger
                       WHERE user_id = ?2 ORDER BY occurred_at DESC, rowid DESC LIMIT 1), 0) + 10,
             'daily_mission_completed', 'daily_mission', id,
             ?3, ?4, ?5, ?5, ?5
           FROM daily_mission_snapshots
           WHERE user_id = ?2 AND local_date = ?6 AND status = 'open'
             AND reviews_completed >= review_target
           ON CONFLICT(user_id, idempotency_key) WHERE idempotency_key IS NOT NULL DO NOTHING`,
        )
        .bind(
          crypto.randomUUID(),
          userId,
          completionKey,
          ledgerMetadata,
          timestamp,
          today,
        ),
      this.database
        .prepare(
          `UPDATE daily_mission_snapshots SET status = 'completed', completed_at = ?1, updated_at = ?1
           WHERE user_id = ?2 AND local_date = ?3 AND status = 'open'
             AND reviews_completed >= review_target`,
        )
        .bind(timestamp, userId, today),
      this.database
        .prepare(
          `UPDATE daily_activity_summaries
           SET confidence_points_earned = coalesce((
             SELECT sum(amount) FROM confidence_point_ledger
             WHERE user_id = ?1
               AND json_extract(metadata_json, '$.localDate') = ?2
           ), 0), updated_at = ?3
           WHERE user_id = ?1 AND local_date = ?2`,
        )
        .bind(userId, today, timestamp),
    );
    statements.push(
      ...(await missions.reconciliationStatements(
        userId,
        settings.timezone,
        today,
        true,
        completionKey,
      )),
    );
    return {
      statements,
    };
  }
}

export function projectWordReviewState(
  status: string | null,
  nextReviewAt: string | null,
  nowIso: string,
): WordReviewState | null {
  if (status === null) return null;
  if (
    ["new", "learning", "reviewing"].includes(status) &&
    (nextReviewAt === null || nextReviewAt <= nowIso)
  ) {
    return "due";
  }
  switch (status) {
    case "new":
    case "learning":
    case "reviewing":
    case "mastered":
      return status;
    case "ignored":
    case "archived":
      return "not_reviewing";
    default:
      throw new Error("unsupported user_words status");
  }
}

function situationFromRow(row: Row): Situation {
  return {
    id: String(row.id),
    slug: String(row.slug),
    title: String(row.title),
    shortDescription: String(row.short_description),
    ...(row.level_band !== null && { levelBand: String(row.level_band) }),
    category: String(row.category),
    displayOrder: Number(row.display_order),
  };
}

function savedMeaningFromRow(row: Row): SavedMeaning {
  return {
    userWordId: String(row.user_word_id),
    meaningId: String(row.meaning_id),
    wordId: String(row.word_id),
    wordText: String(row.word_text),
    wordSlug: wordSlug(String(row.normalized_text)),
    partOfSpeech: String(row.part_of_speech),
    shortDefinition: String(row.short_definition),
    status: String(row.status),
    source: String(row.source),
    saved: true,
    addedAt: String(row.added_at),
  };
}

function attemptFromRow(row: Row): ReviewAttempt {
  return {
    attemptId: String(row.id),
    userWordId: String(row.user_word_id),
    meaningId: String(row.meaning_id),
    attemptType: String(row.attempt_type),
    promptType: String(row.prompt_type),
    result: String(row.result),
    ...(row.rating !== null && { rating: String(row.rating) }),
    reviewStepBefore: Number(row.review_step_before),
    reviewStepAfter: Number(row.review_step_after),
    answeredAt: String(row.answered_at),
    responseTimeMs: Number(row.response_time_ms),
    ...(row.selected_option_meaning_id !== null && {
      selectedOptionMeaningId: String(row.selected_option_meaning_id),
    }),
    ...(row.typed_answer !== null && { typedAnswer: String(row.typed_answer) }),
    wasHintUsed: row.was_hint_used === 1,
    source: String(row.source),
    clientAttemptId: String(row.client_attempt_id),
    nextReviewAt: String(row.next_review_at),
  };
}

function normalizeLimit(limit: number): number {
  if (!Number.isInteger(limit) || limit <= 0) return 20;
  return Math.min(limit, 100);
}

function encodeCursor(
  key: "a" | "d" | "n",
  value: number | string,
  id: string,
): string {
  const json = JSON.stringify({ [key]: value, i: id });
  return btoa(json).replace(/\+/g, "-").replace(/\//g, "_");
}

function decodeCursor<T>(
  input: string,
  key: "a" | "d" | "n",
): Cursor<T> | null {
  if (!input) return null;
  try {
    const parsed = JSON.parse(
      atob(input.replace(/-/g, "+").replace(/_/g, "/")),
    ) as Record<string, unknown>;
    const value = parsed[key];
    if (
      !(key in parsed) ||
      typeof parsed.i !== "string" ||
      !zUuid(parsed.i) ||
      (key === "d"
        ? !Number.isInteger(value)
        : typeof value !== "string" || !Number.isFinite(Date.parse(value)))
    )
      throw new Error();
    return { value: value as T, id: parsed.i };
  } catch {
    throw new ContentLearningError("invalid_cursor");
  }
}

function wordSlug(normalized: string): string {
  return normalized.replaceAll(" ", "-");
}
function zUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(
    value,
  );
}
function requireKey(key: string): void {
  if (!key || key.length > 200)
    throw new ContentLearningError("invalid_idempotency");
}

function isActiveUserWordConflict(error: unknown): boolean {
  return (
    error instanceof Error &&
    error.message.includes("user_words.user_id, user_words.meaning_id")
  );
}

function isReviewStateVersionConflict(error: unknown): boolean {
  return (
    error instanceof Error &&
    error.message.includes(
      "review_state_reservations.user_word_id, review_state_reservations.state_version",
    )
  );
}
async function sha256(value: string): Promise<string> {
  const bytes = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(value),
  );
  return [...new Uint8Array(bytes)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function stableJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(",")}]`;
  if (value !== null && typeof value === "object") {
    return `{${Object.entries(value)
      .filter(([, child]) => child !== undefined)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, child]) => `${JSON.stringify(key)}:${stableJson(child)}`)
      .join(",")}}`;
  }
  return JSON.stringify(value) ?? "null";
}

function normalizeReview(
  input: ReviewSubmission,
): Required<
  Omit<ReviewSubmission, "metadata" | "selectedOptionMeaningId" | "typedAnswer">
> &
  Pick<
    ReviewSubmission,
    "metadata" | "selectedOptionMeaningId" | "typedAnswer"
  > {
  return {
    ...input,
    attemptType: input.attemptType || "review",
    rating: input.rating || "",
    responseTimeMs: input.responseTimeMs ?? 0,
    wasHintUsed: input.wasHintUsed ?? false,
    source: input.source || "review",
    answeredAt: new Date(input.answeredAt).toISOString(),
    typedAnswer: input.typedAnswer || undefined,
  };
}

function validateReview(input: ReviewSubmission): void {
  if (
    !zUuid(input.userWordId) ||
    !zUuid(input.meaningId) ||
    !input.clientAttemptId ||
    !["multiple_choice", "self_check"].includes(input.promptType) ||
    !["correct", "incorrect", "skipped"].includes(input.result) ||
    (input.attemptType && input.attemptType !== "review") ||
    (input.source && !["review", "review_session"].includes(input.source)) ||
    !Number.isFinite(Date.parse(input.answeredAt)) ||
    (input.responseTimeMs !== undefined &&
      (!Number.isInteger(input.responseTimeMs) || input.responseTimeMs < 0))
  )
    throw new ContentLearningError("invalid_input");
  const rating = input.rating ?? "";
  if (
    !["", "again", "hard", "good", "easy"].includes(rating) ||
    (input.result === "incorrect" && rating !== "again") ||
    (input.result === "correct" &&
      !["hard", "good", "easy"].includes(rating)) ||
    (input.result === "skipped" && rating !== "")
  )
    throw new ContentLearningError("invalid_input");
  if (
    (input.promptType === "multiple_choice" &&
      input.result !== "skipped" &&
      !input.selectedOptionMeaningId) ||
    (input.selectedOptionMeaningId && !zUuid(input.selectedOptionMeaningId))
  )
    throw new ContentLearningError("invalid_input");
}

function attemptMatches(
  attempt: ReviewAttempt,
  input: ReturnType<typeof normalizeReview>,
): boolean {
  return (
    attempt.userWordId === input.userWordId &&
    attempt.meaningId === input.meaningId &&
    attempt.attemptType === input.attemptType &&
    attempt.promptType === input.promptType &&
    attempt.result === input.result &&
    (attempt.rating ?? "") === input.rating &&
    attempt.answeredAt === input.answeredAt &&
    attempt.responseTimeMs === input.responseTimeMs &&
    (attempt.selectedOptionMeaningId ?? "") ===
      (input.selectedOptionMeaningId ?? "") &&
    (attempt.typedAnswer ?? "") === (input.typedAnswer ?? "") &&
    attempt.wasHintUsed === input.wasHintUsed &&
    attempt.source === input.source
  );
}

function applyReview(
  prior: {
    step: number;
    total: number;
    correct: number;
    consecutiveCorrect: number;
    consecutiveIncorrect: number;
  },
  result: string,
  rating: string,
  answeredAt: string,
) {
  let after = prior.step;
  let correct = prior.correct;
  let consecutiveCorrect = prior.consecutiveCorrect;
  let consecutiveIncorrect = prior.consecutiveIncorrect;
  let lastRating = rating;
  if (result === "skipped") {
    consecutiveCorrect = 0;
    consecutiveIncorrect = 0;
  } else if (result === "incorrect" || rating === "again") {
    consecutiveCorrect = 0;
    consecutiveIncorrect++;
    after = consecutiveIncorrect >= 2 ? 0 : Math.max(0, prior.step - 1);
  } else {
    correct++;
    consecutiveIncorrect = 0;
    consecutiveCorrect++;
    if (!lastRating) lastRating = "good";
    if (lastRating === "good" || lastRating === "easy")
      after = Math.min(7, prior.step + 1);
  }
  const intervals = [
    600_000, 3_600_000, 86_400_000, 259_200_000, 604_800_000, 1_209_600_000,
    2_592_000_000, 5_184_000_000,
  ];
  return {
    before: prior.step,
    after,
    total: prior.total + 1,
    correct,
    consecutiveCorrect,
    consecutiveIncorrect,
    lastRating,
    nextReviewAt: new Date(
      Date.parse(answeredAt) + intervals[after]!,
    ).toISOString(),
  };
}
