import {
  IdentityError,
  type IdentityUser,
  type SessionIdentity,
} from "../domain/identity.js";

export interface StoredLink {
  id: string;
  userId: string | null;
  email: string;
  environment: string;
  expiresAt: string;
  consumedAt: string | null;
  revokedAt: string | null;
}

export interface StoredOAuthState {
  id: string;
  environment: string;
  appReturnUrl: string;
  expiresAt: string;
  consumedAt: string | null;
}

export interface IdentityRepository {
  getUserById(id: string): Promise<IdentityUser | null>;
  getUserByEmail(email: string): Promise<IdentityUser | null>;
  createUser(email: string, now: string): Promise<IdentityUser>;
  createMagicLink(
    email: string,
    tokenHash: string,
    environment: string,
    now: string,
    expiresAt: string,
  ): Promise<void>;
  getMagicLink(tokenHash: string): Promise<StoredLink | null>;
  consumeMagicLinkAndIssueSession(
    link: StoredLink,
    user: IdentityUser,
    tokenHash: string,
    now: string,
    expiresAt: string,
  ): Promise<SessionIdentity>;
  createOAuthState(
    tokenHash: string,
    environment: string,
    returnUrl: string,
    now: string,
    expiresAt: string,
  ): Promise<void>;
  getOAuthState(tokenHash: string): Promise<StoredOAuthState | null>;
  consumeOAuthState(id: string, now: string): Promise<boolean>;
  resolveOAuthUser(
    identity: {
      subject: string;
      email: string;
      displayName: string;
      avatarUrl: string;
    },
    now: string,
    allowSignup: boolean,
  ): Promise<IdentityUser | null>;
  createSession(
    userId: string,
    tokenHash: string,
    now: string,
    expiresAt: string,
  ): Promise<SessionIdentity>;
  getSession(tokenHash: string): Promise<SessionIdentity | null>;
  revokeSession(tokenHash: string, now: string): Promise<void>;
  getSettings(
    userId: string,
    now: string,
  ): Promise<Record<string, unknown> | null>;
  updateSettings(
    userId: string,
    values: Record<string, unknown>,
    now: string,
  ): Promise<Record<string, unknown> | null>;
  getOnboarding(userId: string): Promise<Record<string, unknown> | null>;
  completeOnboarding(
    userId: string,
    values: Record<string, unknown>,
    now: string,
  ): Promise<Record<string, unknown>>;
  createEmailChangeLink(
    userId: string,
    newEmail: string,
    tokenHash: string,
    environment: string,
    now: string,
    expiresAt: string,
  ): Promise<void>;
  getEmailChangeLink(tokenHash: string): Promise<StoredLink | null>;
  consumeEmailChangeLink(
    link: StoredLink,
    now: string,
  ): Promise<{ oldEmail: string; newEmail: string }>;
  getAccountDeletion(
    userId: string,
  ): Promise<{ idempotencyKey: string; requestedAt: string } | null>;
  deleteAccount(
    userId: string,
    idempotencyKey: string,
    now: string,
    purgeAfter: string,
  ): Promise<{ replayed: boolean; requestedAt: string }>;
  allowRate(
    bucketKey: string,
    nowMs: number,
    windowMs: number,
    limit: number,
  ): Promise<boolean>;
}

interface UserRow {
  id: string;
  email: string | null;
  display_name: string;
  avatar_url: string;
  status: IdentityUser["status"];
  onboarding_status: IdentityUser["onboardingStatus"];
  email_verified_at: string | null;
}

interface LinkRow {
  id: string;
  user_id: string | null;
  email: string;
  environment: string;
  expires_at: string;
  consumed_at: string | null;
  revoked_at: string | null;
}

export class D1IdentityRepository implements IdentityRepository {
  constructor(private readonly database: D1Database) {}

  async getUserById(id: string): Promise<IdentityUser | null> {
    return mapUser(
      await this.database
        .prepare(
          "SELECT id, email, display_name, avatar_url, status, onboarding_status, email_verified_at FROM users WHERE id = ?1",
        )
        .bind(id)
        .first<UserRow>(),
    );
  }

  async getUserByEmail(email: string): Promise<IdentityUser | null> {
    return mapUser(
      await this.database
        .prepare(
          "SELECT id, email, display_name, avatar_url, status, onboarding_status, email_verified_at FROM users WHERE email = ?1 COLLATE NOCASE",
        )
        .bind(email)
        .first<UserRow>(),
    );
  }

  async createUser(email: string, now: string): Promise<IdentityUser> {
    const id = crypto.randomUUID();
    try {
      await this.database
        .prepare(
          "INSERT INTO users (id, email, email_verified_at, created_at, updated_at) VALUES (?1, ?2, ?3, ?3, ?3)",
        )
        .bind(id, email, now)
        .run();
      return (await this.getUserById(id))!;
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes("UNIQUE constraint failed")
      ) {
        const existing = await this.getUserByEmail(email);
        if (existing) return existing;
      }
      throw error;
    }
  }

  async createMagicLink(
    email: string,
    tokenHash: string,
    environment: string,
    now: string,
    expiresAt: string,
  ): Promise<void> {
    await this.database
      .prepare(
        "INSERT INTO magic_links (id, user_id, email, token_hash, environment, created_at, expires_at) VALUES (?1, (SELECT id FROM users WHERE email = ?2 COLLATE NOCASE AND status = 'active'), ?2, ?3, ?4, ?5, ?6)",
      )
      .bind(crypto.randomUUID(), email, tokenHash, environment, now, expiresAt)
      .run();
  }

  async getMagicLink(tokenHash: string): Promise<StoredLink | null> {
    const row = await this.database
      .prepare(
        "SELECT id, user_id, email, environment, expires_at, consumed_at, revoked_at FROM magic_links WHERE token_hash = ?1",
      )
      .bind(tokenHash)
      .first<LinkRow>();
    return mapLink(row);
  }

  async consumeMagicLinkAndIssueSession(
    link: StoredLink,
    user: IdentityUser,
    tokenHash: string,
    now: string,
    expiresAt: string,
  ): Promise<SessionIdentity> {
    const sessionId = crypto.randomUUID();
    const results = await this.database.batch([
      this.database
        .prepare(
          "INSERT INTO sessions (id, user_id, token_hash, created_at, expires_at) SELECT ?1, ?2, ?3, ?4, ?5 WHERE EXISTS (SELECT 1 FROM magic_links WHERE id = ?6 AND consumed_at IS NULL AND revoked_at IS NULL AND expires_at > ?4) AND EXISTS (SELECT 1 FROM users WHERE id = ?2 AND status = 'active')",
        )
        .bind(sessionId, user.id, tokenHash, now, expiresAt, link.id),
      this.database
        .prepare(
          "UPDATE users SET last_login_at = ?1, updated_at = ?1 WHERE id = ?2 AND status = 'active' AND EXISTS (SELECT 1 FROM magic_links WHERE id = ?3 AND consumed_at IS NULL AND revoked_at IS NULL AND expires_at > ?1)",
        )
        .bind(now, user.id, link.id),
      this.database
        .prepare(
          "UPDATE magic_links SET user_id = ?1, consumed_at = ?2 WHERE id = ?3 AND consumed_at IS NULL AND revoked_at IS NULL AND expires_at > ?2 AND EXISTS (SELECT 1 FROM users WHERE id = ?1 AND status = 'active')",
        )
        .bind(user.id, now, link.id),
    ]);
    if (
      (results[0]!.meta.changes ?? 0) !== 1 ||
      (results[1]!.meta.changes ?? 0) !== 1 ||
      (results[2]!.meta.changes ?? 0) !== 1
    ) {
      throw new IdentityError("invalid_link");
    }
    return { id: sessionId, userId: user.id, expiresAt };
  }

  async createOAuthState(
    tokenHash: string,
    environment: string,
    returnUrl: string,
    now: string,
    expiresAt: string,
  ): Promise<void> {
    await this.database
      .prepare(
        "INSERT INTO oauth_states (id, token_hash, environment, provider, app_return_url, created_at, expires_at) VALUES (?1, ?2, ?3, 'google', ?4, ?5, ?6)",
      )
      .bind(
        crypto.randomUUID(),
        tokenHash,
        environment,
        returnUrl,
        now,
        expiresAt,
      )
      .run();
  }

  async getOAuthState(tokenHash: string): Promise<StoredOAuthState | null> {
    const row = await this.database
      .prepare(
        "SELECT id, environment, app_return_url, expires_at, consumed_at FROM oauth_states WHERE token_hash = ?1",
      )
      .bind(tokenHash)
      .first<{
        id: string;
        environment: string;
        app_return_url: string;
        expires_at: string;
        consumed_at: string | null;
      }>();
    return (
      row && {
        id: row.id,
        environment: row.environment,
        appReturnUrl: row.app_return_url,
        expiresAt: row.expires_at,
        consumedAt: row.consumed_at,
      }
    );
  }

  async consumeOAuthState(id: string, now: string): Promise<boolean> {
    const result = await this.database
      .prepare(
        "UPDATE oauth_states SET consumed_at = ?1 WHERE id = ?2 AND consumed_at IS NULL AND expires_at > ?1",
      )
      .bind(now, id)
      .run();
    return (result.meta.changes ?? 0) === 1;
  }

  async resolveOAuthUser(
    identity: {
      subject: string;
      email: string;
      displayName: string;
      avatarUrl: string;
    },
    now: string,
    allowSignup: boolean,
  ): Promise<IdentityUser | null> {
    const linked = await this.database
      .prepare(
        "SELECT u.id, u.email, u.display_name, u.avatar_url, u.status, u.onboarding_status, u.email_verified_at FROM users u JOIN external_identities e ON e.user_id = u.id WHERE e.provider = 'google' AND e.provider_subject = ?1",
      )
      .bind(identity.subject)
      .first<UserRow>();
    if (linked) return mapUser(linked);
    let user = await this.getUserByEmail(identity.email);
    if (!user && !allowSignup) return null;
    const userId = user?.id ?? crypto.randomUUID();
    const statements = [];
    if (!user) {
      statements.push(
        this.database
          .prepare(
            "INSERT INTO users (id, email, email_verified_at, created_at, updated_at) VALUES (?1, ?2, ?3, ?3, ?3)",
          )
          .bind(userId, identity.email, now),
      );
    }
    statements.push(
      this.database
        .prepare(
          "INSERT INTO external_identities (id, user_id, provider, provider_subject, provider_email, provider_email_verified, created_at, updated_at) VALUES (?1, ?2, 'google', ?3, ?4, 1, ?5, ?5)",
        )
        .bind(
          crypto.randomUUID(),
          userId,
          identity.subject,
          identity.email,
          now,
        ),
      this.database
        .prepare(
          "UPDATE users SET display_name = CASE WHEN display_name = '' THEN ?1 ELSE display_name END, avatar_url = CASE WHEN avatar_url = '' THEN ?2 ELSE avatar_url END, updated_at = ?3 WHERE id = ?4",
        )
        .bind(identity.displayName, identity.avatarUrl, now, userId),
    );
    try {
      await this.database.batch(statements);
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes("UNIQUE constraint failed")
      ) {
        const raced = await this.database
          .prepare(
            "SELECT u.id, u.email, u.display_name, u.avatar_url, u.status, u.onboarding_status, u.email_verified_at FROM users u JOIN external_identities e ON e.user_id = u.id WHERE e.provider = 'google' AND e.provider_subject = ?1",
          )
          .bind(identity.subject)
          .first<UserRow>();
        if (raced) return mapUser(raced);
      }
      throw error;
    }
    user = await this.getUserById(userId);
    return user;
  }

  async createSession(
    userId: string,
    tokenHash: string,
    now: string,
    expiresAt: string,
  ): Promise<SessionIdentity> {
    const id = crypto.randomUUID();
    const results = await this.database.batch([
      this.database
        .prepare(
          "INSERT INTO sessions (id, user_id, token_hash, created_at, expires_at) SELECT ?1, ?2, ?3, ?4, ?5 FROM users WHERE id = ?2 AND status = 'active'",
        )
        .bind(id, userId, tokenHash, now, expiresAt),
      this.database
        .prepare(
          "UPDATE users SET last_login_at = ?1, updated_at = ?1 WHERE id = ?2 AND status = 'active'",
        )
        .bind(now, userId),
    ]);
    if (
      (results[0]!.meta.changes ?? 0) !== 1 ||
      (results[1]!.meta.changes ?? 0) !== 1
    ) {
      throw new IdentityError("authentication_required");
    }
    return { id, userId, expiresAt };
  }

  async getSession(tokenHash: string): Promise<SessionIdentity | null> {
    const row = await this.database
      .prepare(
        "SELECT id, user_id, expires_at FROM sessions WHERE token_hash = ?1 AND revoked_at IS NULL",
      )
      .bind(tokenHash)
      .first<{ id: string; user_id: string; expires_at: string }>();
    return (
      row && { id: row.id, userId: row.user_id, expiresAt: row.expires_at }
    );
  }

  async revokeSession(tokenHash: string, now: string): Promise<void> {
    await this.database
      .prepare(
        "UPDATE sessions SET revoked_at = ?1 WHERE token_hash = ?2 AND revoked_at IS NULL",
      )
      .bind(now, tokenHash)
      .run();
  }

  async getSettings(
    userId: string,
    now: string,
  ): Promise<Record<string, unknown> | null> {
    const user = await this.getUserById(userId);
    if (!user || user.status !== "active") return null;
    await this.database
      .prepare(
        "INSERT INTO user_settings (id, user_id, created_at, updated_at) VALUES (?1, ?2, ?3, ?3) ON CONFLICT(user_id) DO NOTHING",
      )
      .bind(crypto.randomUUID(), userId, now)
      .run();
    return this.readSettings(userId);
  }

  async updateSettings(
    userId: string,
    values: Record<string, unknown>,
    now: string,
  ): Promise<Record<string, unknown> | null> {
    if (!(await this.getSettings(userId, now))) return null;
    const user = await this.getUserById(userId);
    await this.database.batch([
      this.database
        .prepare(
          "UPDATE user_settings SET daily_review_target = ?1, review_interval_preset = ?2, app_language = ?3, notifications_enabled = ?4, marketing_emails_enabled = ?5, updated_at = ?6 WHERE user_id = ?7 AND EXISTS (SELECT 1 FROM users WHERE id = ?7 AND status = 'active')",
        )
        .bind(
          values.dailyReviewTarget,
          values.reviewIntervalPreset,
          values.appLanguage,
          values.notificationsEnabled ? 1 : 0,
          values.marketingEmailsEnabled ? 1 : 0,
          now,
          userId,
        ),
      this.database
        .prepare(
          "UPDATE users SET display_name = ?1, updated_at = ?2 WHERE id = ?3 AND status = 'active'",
        )
        .bind(values.displayName ?? user!.displayName, now, userId),
    ]);
    return this.readSettings(userId);
  }

  async getOnboarding(userId: string): Promise<Record<string, unknown> | null> {
    const user = await this.getUserById(userId);
    if (!user) return null;
    const row = await this.database
      .prepare(
        "SELECT english_level, native_language, learning_goal, main_use_case, daily_review_target, completed_at FROM user_onboarding_profiles WHERE user_id = ?1",
      )
      .bind(userId)
      .first<Record<string, unknown>>();
    return row
      ? mapOnboarding(row, "completed")
      : { status: user.onboardingStatus };
  }

  async completeOnboarding(
    userId: string,
    values: Record<string, unknown>,
    now: string,
  ): Promise<Record<string, unknown>> {
    const existing = await this.getOnboarding(userId);
    if (existing?.status === "completed") {
      if (!sameOnboardingAnswers(existing, values)) {
        throw new IdentityError("conflict");
      }
      return existing;
    }
    const id = crypto.randomUUID();
    try {
      const results = await this.database.batch([
        this.database
          .prepare(
            "INSERT INTO user_onboarding_profiles (id, user_id, english_level, native_language, learning_goal, main_use_case, daily_review_target, completed_at, created_at, updated_at) SELECT ?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?8, ?8 FROM users WHERE id = ?2 AND status = 'active'",
          )
          .bind(
            id,
            userId,
            values.englishLevel,
            values.nativeLanguage,
            values.learningGoal,
            values.mainUseCase,
            values.dailyReviewTarget,
            now,
          ),
        this.database
          .prepare(
            "UPDATE users SET onboarding_status = 'completed', updated_at = ?1 WHERE id = ?2 AND status = 'active'",
          )
          .bind(now, userId),
        this.database
          .prepare(
            "INSERT INTO user_settings (id, user_id, daily_review_target, created_at, updated_at) SELECT ?1, ?2, ?3, ?4, ?4 FROM users WHERE id = ?2 AND status = 'active' ON CONFLICT(user_id) DO UPDATE SET daily_review_target = excluded.daily_review_target, updated_at = excluded.updated_at WHERE user_settings.daily_review_target = 20",
          )
          .bind(crypto.randomUUID(), userId, values.dailyReviewTarget, now),
      ]);
      if (
        (results[0]!.meta.changes ?? 0) !== 1 ||
        (results[1]!.meta.changes ?? 0) !== 1
      ) {
        throw new IdentityError("not_found");
      }
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes("UNIQUE constraint failed")
      ) {
        const raced = await this.getOnboarding(userId);
        if (raced?.status === "completed") {
          if (sameOnboardingAnswers(raced, values)) return raced;
          throw new IdentityError("conflict");
        }
      }
      throw error;
    }
    return (await this.getOnboarding(userId))!;
  }

  async createEmailChangeLink(
    userId: string,
    newEmail: string,
    tokenHash: string,
    environment: string,
    now: string,
    expiresAt: string,
  ): Promise<void> {
    await this.database
      .prepare(
        "INSERT INTO email_change_links (id, user_id, new_email, token_hash, environment, created_at, expires_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
      )
      .bind(
        crypto.randomUUID(),
        userId,
        newEmail,
        tokenHash,
        environment,
        now,
        expiresAt,
      )
      .run();
  }

  async getEmailChangeLink(tokenHash: string): Promise<StoredLink | null> {
    const row = await this.database
      .prepare(
        "SELECT id, user_id, new_email AS email, environment, expires_at, consumed_at, revoked_at FROM email_change_links WHERE token_hash = ?1",
      )
      .bind(tokenHash)
      .first<LinkRow>();
    return mapLink(row);
  }

  async consumeEmailChangeLink(
    link: StoredLink,
    now: string,
  ): Promise<{ oldEmail: string; newEmail: string }> {
    const user = await this.getUserById(link.userId!);
    if (!user) throw new Error("user missing");
    try {
      const results = await this.database.batch([
        this.database
          .prepare(
            "UPDATE users SET email = ?1, updated_at = ?2 WHERE id = ?3 AND status = 'active' AND EXISTS (SELECT 1 FROM email_change_links WHERE id = ?4 AND user_id = ?3 AND consumed_at IS NULL AND revoked_at IS NULL AND expires_at > ?2)",
          )
          .bind(link.email, now, link.userId, link.id),
        this.database
          .prepare(
            "UPDATE email_change_links SET consumed_at = ?1 WHERE id = ?2 AND user_id = ?3 AND consumed_at IS NULL AND revoked_at IS NULL AND expires_at > ?1 AND EXISTS (SELECT 1 FROM users WHERE id = ?3 AND status = 'active')",
          )
          .bind(now, link.id, link.userId),
      ]);
      if (
        (results[0]!.meta.changes ?? 0) !== 1 ||
        (results[1]!.meta.changes ?? 0) !== 1
      ) {
        throw new IdentityError("invalid_link");
      }
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes("UNIQUE constraint failed")
      ) {
        throw new IdentityError("conflict");
      }
      throw error;
    }
    return { oldEmail: user.email, newEmail: link.email };
  }

  async deleteAccount(
    userId: string,
    idempotencyKey: string,
    now: string,
    purgeAfter: string,
  ): Promise<{ replayed: boolean; requestedAt: string }> {
    const existing = await this.getAccountDeletion(userId);
    if (existing) {
      if (existing.idempotencyKey !== idempotencyKey)
        throw new IdentityError("conflict");
      return { replayed: true, requestedAt: existing.requestedAt };
    }
    try {
      const results = await this.database.batch([
        this.database
          .prepare(
            "INSERT INTO account_deletion_requests (id, user_id, requested_at, purge_after, idempotency_key, created_at, updated_at) SELECT ?1, ?2, ?3, ?4, ?5, ?3, ?3 FROM users WHERE id = ?2 AND status = 'active'",
          )
          .bind(crypto.randomUUID(), userId, now, purgeAfter, idempotencyKey),
        this.database
          .prepare(
            "UPDATE users SET status = 'deleted', email = NULL, deleted_at = ?1, updated_at = ?1 WHERE id = ?2 AND status = 'active'",
          )
          .bind(now, userId),
        this.database
          .prepare(
            "UPDATE sessions SET revoked_at = ?1 WHERE user_id = ?2 AND revoked_at IS NULL",
          )
          .bind(now, userId),
        this.database
          .prepare(
            "UPDATE magic_links SET revoked_at = ?1 WHERE user_id = ?2 AND consumed_at IS NULL AND revoked_at IS NULL",
          )
          .bind(now, userId),
        this.database
          .prepare(
            "UPDATE email_change_links SET revoked_at = ?1 WHERE user_id = ?2 AND consumed_at IS NULL AND revoked_at IS NULL",
          )
          .bind(now, userId),
      ]);
      if (
        (results[0]!.meta.changes ?? 0) !== 1 ||
        (results[1]!.meta.changes ?? 0) !== 1
      ) {
        return this.resolveDeletionRace(userId, idempotencyKey);
      }
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes("UNIQUE constraint failed")
      ) {
        return this.resolveDeletionRace(userId, idempotencyKey);
      }
      throw error;
    }
    return { replayed: false, requestedAt: now };
  }

  async allowRate(
    bucketKey: string,
    nowMs: number,
    windowMs: number,
    limit: number,
  ): Promise<boolean> {
    const result = await this.database
      .prepare(
        "INSERT INTO auth_rate_limits (bucket_key, window_started_at, attempts) VALUES (?1, ?2, 1) ON CONFLICT(bucket_key) DO UPDATE SET window_started_at = CASE WHEN ?2 - window_started_at >= ?3 THEN ?2 ELSE window_started_at END, attempts = CASE WHEN ?2 - window_started_at >= ?3 THEN 1 ELSE attempts + 1 END WHERE ?2 - window_started_at >= ?3 OR attempts < ?4",
      )
      .bind(bucketKey, nowMs, windowMs, limit)
      .run();
    return (result.meta.changes ?? 0) === 1;
  }

  async getAccountDeletion(
    userId: string,
  ): Promise<{ idempotencyKey: string; requestedAt: string } | null> {
    const existing = await this.database
      .prepare(
        "SELECT idempotency_key, requested_at FROM account_deletion_requests WHERE user_id = ?1",
      )
      .bind(userId)
      .first<{ idempotency_key: string; requested_at: string }>();
    return (
      existing && {
        idempotencyKey: existing.idempotency_key,
        requestedAt: existing.requested_at,
      }
    );
  }

  private async readSettings(userId: string): Promise<Record<string, unknown>> {
    const row = await this.database
      .prepare(
        "SELECT s.daily_review_target, s.review_interval_preset, s.app_language, s.notifications_enabled, s.marketing_emails_enabled, u.display_name FROM user_settings s JOIN users u ON u.id = s.user_id WHERE s.user_id = ?1",
      )
      .bind(userId)
      .first<Record<string, unknown>>();
    return {
      dailyReviewTarget: row!.daily_review_target,
      reviewIntervalPreset: row!.review_interval_preset,
      appLanguage: row!.app_language,
      notificationsEnabled: row!.notifications_enabled === 1,
      marketingEmailsEnabled: row!.marketing_emails_enabled === 1,
      displayName: row!.display_name,
    };
  }

  private async resolveDeletionRace(
    userId: string,
    idempotencyKey: string,
  ): Promise<{ replayed: boolean; requestedAt: string }> {
    const existing = await this.database
      .prepare(
        "SELECT idempotency_key, requested_at FROM account_deletion_requests WHERE user_id = ?1",
      )
      .bind(userId)
      .first<{ idempotency_key: string; requested_at: string }>();
    if (!existing || existing.idempotency_key !== idempotencyKey) {
      throw new IdentityError("conflict");
    }
    return { replayed: true, requestedAt: existing.requested_at };
  }
}

function mapUser(row: UserRow | null): IdentityUser | null {
  return (
    row && {
      id: row.id,
      email: row.email ?? "",
      displayName: row.display_name,
      avatarUrl: row.avatar_url,
      status: row.status,
      onboardingStatus: row.onboarding_status,
      emailVerifiedAt: row.email_verified_at,
    }
  );
}

function mapLink(row: LinkRow | null): StoredLink | null {
  return (
    row && {
      id: row.id,
      userId: row.user_id,
      email: row.email,
      environment: row.environment,
      expiresAt: row.expires_at,
      consumedAt: row.consumed_at,
      revokedAt: row.revoked_at,
    }
  );
}

function mapOnboarding(
  row: Record<string, unknown>,
  status: string,
): Record<string, unknown> {
  return {
    status,
    englishLevel: row.english_level,
    nativeLanguage: row.native_language,
    learningGoal: row.learning_goal,
    mainUseCase: row.main_use_case,
    dailyReviewTarget: row.daily_review_target,
    completedAt: row.completed_at,
  };
}

function sameOnboardingAnswers(
  existing: Record<string, unknown>,
  values: Record<string, unknown>,
): boolean {
  return [
    "englishLevel",
    "nativeLanguage",
    "learningGoal",
    "mainUseCase",
    "dailyReviewTarget",
  ].every((field) => existing[field] === values[field]);
}
