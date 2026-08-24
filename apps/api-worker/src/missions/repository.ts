import {
  DEFAULT_REVIEW_TARGET,
  DEFAULT_TIMEZONE,
  MISSION_POLICY_VERSION,
  MissionsError,
  addDays,
  daysBetween,
  isValidTimezone,
  localDate,
  type DailyMission,
  type Progress,
  type StreakView,
} from "../domain/missions.js";

type Row = Record<string, string | number | null>;
type MissionStatus = DailyMission["status"];

interface ResolvedSettings {
  timezone: string;
  reviewTarget: number;
}

interface StreakState {
  current: number;
  longest: number;
  lastCompleted: string | null;
  lastActivity: string | null;
  timezone: string;
  status: StreakView["status"];
}

interface Snapshot {
  id: string;
  localDate: string;
  status: MissionStatus;
  graceApplied: boolean;
  graceDayId: string | null;
}

export class D1MissionsRepository {
  constructor(
    private readonly database: D1Database,
    private readonly now: () => Date = () => new Date(),
  ) {}

  async getDailyMission(
    userId: string,
    clientTimezone: string,
  ): Promise<DailyMission> {
    const settings = await this.resolveSettings(userId, clientTimezone);
    const today = localDate(this.now(), settings.timezone);
    const timestamp = this.now().toISOString();
    await this.database.batch([
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
    ]);
    await this.reconcile(userId, settings.timezone, today, false);
    const [mission, streak] = await Promise.all([
      this.database
        .prepare(
          `SELECT * FROM daily_mission_snapshots
           WHERE user_id = ?1 AND local_date = ?2`,
        )
        .bind(userId, today)
        .first<Row>(),
      this.streakView(userId),
    ]);
    if (!mission) throw new Error("daily mission snapshot was not created");
    return missionFromRow(mission, streak);
  }

  async getProgress(userId: string, clientTimezone: string): Promise<Progress> {
    await this.resolveSettings(userId, clientTimezone);
    const [balance, streak, history] = await Promise.all([
      this.database
        .prepare(
          `SELECT balance_after FROM confidence_point_ledger
           WHERE user_id = ?1 ORDER BY occurred_at DESC, rowid DESC LIMIT 1`,
        )
        .bind(userId)
        .first<{ balance_after: number }>(),
      this.streakView(userId),
      this.database
        .prepare(
          `SELECT local_date, status FROM daily_mission_snapshots
           WHERE user_id = ?1 ORDER BY local_date DESC LIMIT 7`,
        )
        .bind(userId)
        .all<{ local_date: string; status: MissionStatus }>(),
    ]);
    return {
      confidencePointsBalance: Number(balance?.balance_after ?? 0),
      streak,
      completionHistory: history.results.map((day) => ({
        localDate: day.local_date,
        completed: day.status === "completed" || day.status === "protected",
      })),
    };
  }

  async resolveSettings(
    userId: string,
    clientTimezone: string,
  ): Promise<ResolvedSettings> {
    const stored = await this.database
      .prepare(
        "SELECT timezone, daily_review_target FROM user_settings WHERE user_id = ?1",
      )
      .bind(userId)
      .first<{ timezone: string; daily_review_target: number }>();
    if (stored && stored.timezone && stored.timezone !== DEFAULT_TIMEZONE) {
      if (!isValidTimezone(stored.timezone))
        throw new MissionsError("invalid_timezone");
      return {
        timezone: stored.timezone,
        reviewTarget: Number(stored.daily_review_target),
      };
    }
    if (clientTimezone) {
      if (!isValidTimezone(clientTimezone))
        throw new MissionsError("invalid_timezone");
      return { timezone: clientTimezone, reviewTarget: DEFAULT_REVIEW_TARGET };
    }
    return { timezone: DEFAULT_TIMEZONE, reviewTarget: DEFAULT_REVIEW_TARGET };
  }

  async reconcile(
    userId: string,
    timezone: string,
    today: string,
    currentCompletion: boolean,
  ): Promise<void> {
    await this.database.batch(
      await this.reconciliationStatements(
        userId,
        timezone,
        today,
        currentCompletion,
      ),
    );
  }

  async reconciliationStatements(
    userId: string,
    timezone: string,
    today: string,
    currentCompletion: boolean,
    completionGuardKey?: string,
  ): Promise<D1PreparedStatement[]> {
    const [stateRow, graceRow, snapshotsResult] = await Promise.all([
      this.database
        .prepare("SELECT * FROM streak_states WHERE user_id = ?1")
        .bind(userId)
        .first<Row>(),
      this.database
        .prepare(
          `SELECT balance_after FROM grace_day_ledger WHERE user_id = ?1
           ORDER BY created_at DESC, rowid DESC LIMIT 1`,
        )
        .bind(userId)
        .first<{ balance_after: number }>(),
      this.database
        .prepare(
          `SELECT id, local_date, status, grace_applied, grace_day_id
           FROM daily_mission_snapshots WHERE user_id = ?1
           ORDER BY local_date DESC LIMIT 14`,
        )
        .bind(userId)
        .all<Row>(),
    ]);
    const state: StreakState = stateRow
      ? {
          current: Number(stateRow.current_streak_count),
          longest: Number(stateRow.longest_streak_count),
          lastCompleted:
            stateRow.last_completed_local_date === null
              ? null
              : String(stateRow.last_completed_local_date),
          lastActivity:
            stateRow.last_activity_local_date === null
              ? null
              : String(stateRow.last_activity_local_date),
          timezone: String(stateRow.timezone),
          status: String(stateRow.status) as StreakView["status"],
        }
      : {
          current: 0,
          longest: 0,
          lastCompleted: null,
          lastActivity: null,
          timezone,
          status: "active",
        };
    const snapshots = snapshotsResult.results.map(snapshotFromRow);
    const result = reconcileStreak(
      userId,
      today,
      state,
      Number(graceRow?.balance_after ?? 0),
      snapshots,
      currentCompletion,
    );
    const timestamp = this.now().toISOString();
    const statements: D1PreparedStatement[] = [
      this.database
        .prepare(
          `INSERT INTO streak_states
           (id, user_id, current_streak_count, longest_streak_count,
            last_completed_local_date, last_activity_local_date, timezone, status,
            created_at, updated_at)
           SELECT ?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?9
           WHERE ?10 IS NULL OR EXISTS (
             SELECT 1 FROM confidence_point_ledger
             WHERE user_id = ?2 AND idempotency_key = ?10
           )
           ON CONFLICT(user_id) DO UPDATE SET
             current_streak_count = excluded.current_streak_count,
             longest_streak_count = excluded.longest_streak_count,
             last_completed_local_date = excluded.last_completed_local_date,
             last_activity_local_date = excluded.last_activity_local_date,
             timezone = excluded.timezone, status = excluded.status, updated_at = excluded.updated_at`,
        )
        .bind(
          crypto.randomUUID(),
          userId,
          result.state.current,
          result.state.longest,
          result.state.lastCompleted,
          result.state.lastActivity,
          result.state.timezone,
          result.state.status,
          timestamp,
          completionGuardKey ?? null,
        ),
    ];
    let balance = Number(graceRow?.balance_after ?? 0);
    if (result.protected) {
      balance -= 1;
      const graceId = crypto.randomUUID();
      statements.push(
        graceStatement(
          this.database,
          graceId,
          userId,
          -1,
          balance,
          "used_for_missed_day",
          result.protected,
          timezone,
          `streak:${userId}:${result.protected}:grace_day_used`,
          timestamp,
          completionGuardKey,
        ),
        this.database
          .prepare(
            `UPDATE daily_mission_snapshots SET status = 'protected', grace_applied = 1,
             grace_day_id = ?1, updated_at = ?2
             WHERE user_id = ?3 AND local_date = ?4 AND status = 'missed'
               AND (?5 IS NULL OR EXISTS (
                 SELECT 1 FROM confidence_point_ledger
                 WHERE user_id = ?3 AND idempotency_key = ?5
               ))`,
          )
          .bind(
            graceId,
            timestamp,
            userId,
            result.protected,
            completionGuardKey ?? null,
          ),
      );
    }
    if (result.earned) {
      balance += 1;
      statements.push(
        graceStatement(
          this.database,
          crypto.randomUUID(),
          userId,
          1,
          balance,
          "earned_by_streak",
          today,
          timezone,
          `streak:${userId}:${today}:grace_day_earned`,
          timestamp,
          completionGuardKey,
        ),
      );
    }
    return statements;
  }

  private async streakView(userId: string): Promise<StreakView> {
    const [state, grace] = await Promise.all([
      this.database
        .prepare("SELECT * FROM streak_states WHERE user_id = ?1")
        .bind(userId)
        .first<Row>(),
      this.database
        .prepare(
          `SELECT balance_after FROM grace_day_ledger WHERE user_id = ?1
           ORDER BY created_at DESC, rowid DESC LIMIT 1`,
        )
        .bind(userId)
        .first<{ balance_after: number }>(),
    ]);
    return {
      currentStreakCount: Number(state?.current_streak_count ?? 0),
      longestStreakCount: Number(state?.longest_streak_count ?? 0),
      status: (state?.status ?? "active") as StreakView["status"],
      graceDayBalance: Number(grace?.balance_after ?? 0),
    };
  }
}

function reconcileStreak(
  _userId: string,
  today: string,
  state: StreakState,
  graceBalance: number,
  snapshots: Snapshot[],
  currentCompletion: boolean,
): { state: StreakState; protected?: string; earned?: true } {
  const output = {
    ...state,
    timezone: state.timezone || DEFAULT_TIMEZONE,
    lastActivity: today,
  };
  if (currentCompletion && state.lastCompleted === today)
    return { state: { ...output, status: "active" } };
  const byDate = new Map(
    snapshots.map((snapshot) => [snapshot.localDate, snapshot]),
  );
  const todaySnapshot = byDate.get(today);
  if (todaySnapshot?.status === "completed" && !currentCompletion) {
    return {
      state: {
        ...output,
        lastCompleted: output.lastCompleted ?? today,
        status: "active",
      },
    };
  }
  const lastGood =
    snapshots
      .filter(
        (snapshot) =>
          (snapshot.status === "completed" ||
            snapshot.status === "protected") &&
          !(currentCompletion && snapshot.localDate === today),
      )
      .map((snapshot) => snapshot.localDate)
      .sort()
      .at(-1) ?? state.lastCompleted;
  if (!lastGood) {
    if (!currentCompletion) return { state: output };
    return {
      state: {
        ...output,
        current: 1,
        longest: Math.max(state.longest, 1),
        lastCompleted: today,
        status: "active",
      },
    };
  }
  const gap = daysBetween(today, lastGood);
  if (gap <= 0) {
    if (gap < 0) throw new Error("last completion is after current local date");
    return { state: output };
  }
  if (gap === 1) {
    if (!currentCompletion) {
      return {
        state: {
          ...output,
          status: byDate.has(addDays(today, -1)) ? "at_risk" : "active",
        },
      };
    }
    const current = state.current + 1;
    return {
      state: {
        ...output,
        current,
        longest: Math.max(state.longest, current),
        lastCompleted: today,
        status: "active",
      },
      ...(current > 0 &&
        current % 7 === 0 &&
        graceBalance < 2 && { earned: true as const }),
    };
  }
  const yesterday = addDays(today, -1);
  if (
    gap === 2 &&
    byDate.get(yesterday)?.status === "missed" &&
    graceBalance > 0
  ) {
    if (!currentCompletion) return { state: { ...output, status: "at_risk" } };
    const current = state.current + 1;
    return {
      state: {
        ...output,
        current,
        longest: Math.max(state.longest, current),
        lastCompleted: today,
        status: "active",
      },
      protected: yesterday,
      ...(current > 0 &&
        current % 7 === 0 &&
        graceBalance - 1 < 2 && { earned: true as const }),
    };
  }
  if (currentCompletion) {
    return {
      state: {
        ...output,
        current: 1,
        longest: Math.max(state.longest, 1),
        lastCompleted: today,
        status: "active",
      },
    };
  }
  return { state: { ...output, current: 0, status: "broken" } };
}

function snapshotFromRow(row: Row): Snapshot {
  return {
    id: String(row.id),
    localDate: String(row.local_date),
    status: String(row.status) as MissionStatus,
    graceApplied: row.grace_applied === 1,
    graceDayId: row.grace_day_id === null ? null : String(row.grace_day_id),
  };
}

function missionFromRow(row: Row, streak: StreakView): DailyMission {
  return {
    localDate: String(row.local_date),
    timezone: String(row.timezone),
    reviewTarget: Number(row.review_target),
    reviewsCompleted: Number(row.reviews_completed),
    ...(row.new_word_target !== null && {
      newWordTarget: Number(row.new_word_target),
    }),
    ...(row.new_words_completed !== null && {
      newWordsCompleted: Number(row.new_words_completed),
    }),
    ...(row.sentence_practice_target !== null && {
      sentencePracticeTarget: Number(row.sentence_practice_target),
    }),
    ...(row.sentence_practices_completed !== null && {
      sentencePracticesCompleted: Number(row.sentence_practices_completed),
    }),
    policyVersion: String(row.policy_version),
    status: String(row.status) as MissionStatus,
    ...(row.completed_at !== null && { completedAt: String(row.completed_at) }),
    graceApplied: row.grace_applied === 1,
    streak,
  };
}

function graceStatement(
  database: D1Database,
  id: string,
  userId: string,
  amount: number,
  balance: number,
  reason: string,
  localDateValue: string,
  timezone: string,
  key: string,
  timestamp: string,
  completionGuardKey?: string,
): D1PreparedStatement {
  return database
    .prepare(
      `INSERT INTO grace_day_ledger
       (id, user_id, amount, balance_after, reason, source_type,
        applied_to_local_date, timezone, idempotency_key, created_at, updated_at)
       SELECT ?1, ?2, ?3, ?4, ?5, 'streak', ?6, ?7, ?8, ?9, ?9
       WHERE ?10 IS NULL OR EXISTS (
         SELECT 1 FROM confidence_point_ledger
         WHERE user_id = ?2 AND idempotency_key = ?10
       )
       ON CONFLICT(user_id, idempotency_key) WHERE idempotency_key IS NOT NULL DO NOTHING`,
    )
    .bind(
      id,
      userId,
      amount,
      balance,
      reason,
      localDateValue,
      timezone,
      key,
      timestamp,
      completionGuardKey ?? null,
    );
}
