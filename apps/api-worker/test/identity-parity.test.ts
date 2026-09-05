import { env } from "cloudflare:workers";
import { beforeEach, describe, expect, it } from "vitest";

import { createApp } from "../src/app.js";
import type { EmailMessage, OAuthProvider } from "../src/domain/identity.js";
import {
  CSRF_COOKIE,
  OAUTH_STATE_COOKIE,
  readCookie,
  SESSION_COOKIE,
} from "../src/identity/cookies.js";
import { hashToken, issueOpaqueToken } from "../src/identity/crypto.js";
import { D1IdentityRepository } from "../src/identity/repository.js";
import {
  IdentityService,
  type IdentityConfig,
} from "../src/identity/service.js";
import { D1PlatformRepository } from "../src/repositories/d1-platform-repository.js";
import { D1MissionsRepository } from "../src/missions/repository.js";

const now = new Date("2026-08-22T12:00:00.000Z");
const config: IdentityConfig = {
  environment: "local",
  baseUrl: "http://127.0.0.1:3000",
  oauthRedirectUri: "http://127.0.0.1:8080/api/v1/auth/oauth/google/callback",
  oauthReturnAllowlist: ["http://127.0.0.1:3000/home"],
  magicLinkEnabled: true,
  oauthEnabled: true,
  newSignupsEnabled: true,
  signupAllowlist: [],
  reservedSyntheticEmail: "",
  secureCookies: false,
  sessionSeconds: 30 * 24 * 60 * 60,
  magicLinkSeconds: 15 * 60,
  oauthStateSeconds: 10 * 60,
};

let messages: EmailMessage[];

const oauth: OAuthProvider = {
  authorizationUrl: (state, redirectUri) =>
    `https://accounts.example.test/authorize?state=${encodeURIComponent(state)}&redirect_uri=${encodeURIComponent(redirectUri)}`,
  verify: (code) => {
    if (code !== "valid-code")
      return Promise.reject(new Error("provider rejected"));
    return Promise.resolve({
      subject: "google-subject-1",
      email: "oauth@example.test",
      emailVerified: true,
      displayName: "OAuth Learner",
      avatarUrl: "https://images.example.test/avatar.png",
    });
  },
};

beforeEach(async () => {
  messages = [];
  for (const table of [
    "ai_feedback_reports",
    "ai_feedback_attempts",
    "learner_sentences",
    "ai_generation_leases",
    "ai_generation_events",
    "ai_usage_counters",
    "grace_day_ledger",
    "streak_states",
    "confidence_point_ledger",
    "daily_activity_summaries",
    "daily_mission_snapshots",
    "review_attempts",
    "idempotency_keys",
    "user_words",
    "account_deletion_requests",
    "email_change_links",
    "user_onboarding_profiles",
    "user_settings",
    "oauth_states",
    "magic_links",
    "sessions",
    "external_identities",
    "auth_rate_limits",
    "users",
  ]) {
    await env.DB.prepare(`DELETE FROM ${table}`).run();
  }
});

describe("identity and account parity", () => {
  it("treats malformed percent-encoded security cookies as absent", () => {
    const request = new Request("http://worker.test", {
      headers: {
        Cookie: `${SESSION_COOKIE}=%; ${CSRF_COOKIE}=%; ${OAUTH_STATE_COOKIE}=%`,
      },
    });

    expect(readCookie(request, SESSION_COOKIE)).toBe("");
    expect(readCookie(request, CSRF_COOKIE)).toBe("");
    expect(readCookie(request, OAUTH_STATE_COOKIE)).toBe("");
  });

  it("treats malformed session cookie encoding as unauthenticated", async () => {
    const response = await identityApp().request(
      "http://worker.test/api/v1/me",
      {
        headers: { Cookie: "vocanova_session=%" },
      },
      env,
    );
    expect(response.status).toBe(401);
  });

  it("stores only a hash, consumes a magic link once, and issues secure-shape cookies", async () => {
    const app = identityApp();
    const requested = await app.request(
      "http://worker.test/api/v1/auth/magic-links",
      json({ email: "Learner@Example.Test" }),
      env,
    );
    expect(requested.status).toBe(204);
    const token = messageToken(messages[0]!);
    const stored = await env.DB.prepare(
      "SELECT token_hash FROM magic_links",
    ).first<{ token_hash: string }>();
    expect(stored?.token_hash).toMatch(/^[0-9a-f]{64}$/);
    expect(stored?.token_hash).not.toContain(token);

    const consumed = await app.request(
      "http://worker.test/api/v1/auth/magic-links/consume",
      json({ token, email: "learner@example.test" }),
      env,
    );
    expect(consumed.status).toBe(200);
    expect(await consumed.json()).toMatchObject({
      email: "learner@example.test",
      onboardingStatus: "not_started",
    });
    const cookies = cookieHeader(consumed);
    expect(cookies).toContain("vocanova_session=");
    expect(cookies).toContain("HttpOnly");
    expect(cookies).toContain("SameSite=Lax");
    expect(cookies).toContain("vocanova_csrf=");

    const replay = await app.request(
      "http://worker.test/api/v1/auth/magic-links/consume",
      json({ token, email: "learner@example.test" }),
      env,
    );
    expect(replay.status).toBe(401);
    const sessionCount = await env.DB.prepare(
      "SELECT COUNT(*) AS count FROM sessions",
    ).first<{ count: number }>();
    expect(sessionCount?.count).toBe(1);
  });

  it("adds Secure to authentication cookies outside local mode", async () => {
    const app = identityApp({
      ...config,
      environment: "staging",
      secureCookies: true,
    });
    await app.request(
      "http://worker.test/api/v1/auth/magic-links",
      json({ email: "secure@example.test" }),
      env,
    );
    const token = messageToken(messages.at(-1)!);
    const consumed = await app.request(
      "http://worker.test/api/v1/auth/magic-links/consume",
      json({ token, email: "secure@example.test" }),
      env,
    );
    expect(cookieHeader(consumed)).toContain("Secure");
  });

  it("uses production cookie lifetimes, visibility, and clearing semantics", async () => {
    const production = {
      ...config,
      environment: "production" as const,
      secureCookies: true,
    };
    const app = identityApp(production);
    await app.request(
      "http://worker.test/api/v1/auth/magic-links",
      json({ email: "cookie-contract@example.test" }),
      env,
    );
    const token = messageToken(messages.at(-1)!);
    const consumed = await app.request(
      "http://worker.test/api/v1/auth/magic-links/consume",
      json({ token, email: "cookie-contract@example.test" }),
      env,
    );
    const cookies = splitCookies(cookieHeader(consumed));
    const session = cookies.find((cookie) =>
      cookie.startsWith("vocanova_session="),
    );
    const csrf = cookies.find((cookie) => cookie.startsWith("vocanova_csrf="));
    expect(session).toContain(
      "Path=/; Max-Age=2592000; HttpOnly; SameSite=Lax; Secure",
    );
    expect(csrf).toContain("Path=/; Max-Age=2592000; SameSite=Lax; Secure");
    expect(csrf).not.toContain("HttpOnly");

    const loggedOut = await app.request(
      "http://worker.test/api/v1/auth/logout",
      withAuth(
        { method: "POST" },
        cookiePairs(cookieHeader(consumed)),
        namedCookie(cookieHeader(consumed), "vocanova_csrf"),
      ),
      env,
    );
    expect(loggedOut.status).toBe(204);
    const cleared = splitCookies(cookieHeader(loggedOut));
    expect(
      cleared.find((cookie) => cookie.startsWith("vocanova_session=")),
    ).toContain("Path=/; Max-Age=0; HttpOnly; SameSite=Lax; Secure");
    expect(
      cleared.find((cookie) => cookie.startsWith("vocanova_csrf=")),
    ).toContain("Path=/; Max-Age=0; SameSite=Lax; Secure");
  });

  it("authenticates requester scope and enforces double-submit CSRF on settings and onboarding", async () => {
    const { app, cookie, csrf } = await signedIn("settings@example.test");
    const me = await app.request(
      "http://worker.test/api/v1/me",
      { headers: { Cookie: cookie } },
      env,
    );
    expect(me.status).toBe(200);

    const denied = await app.request(
      "http://worker.test/api/v1/settings",
      {
        ...json({ displayName: "Learner" }, "PATCH"),
        headers: { ...headers(json({}).headers), Cookie: cookie },
      },
      env,
    );
    expect(denied.status).toBe(403);

    const updated = await app.request(
      "http://worker.test/api/v1/settings",
      withAuth(
        json({ displayName: "Learner", dailyReviewTarget: 35 }, "PATCH"),
        cookie,
        csrf,
      ),
      env,
    );
    expect(updated.status).toBe(200);
    expect(await updated.json()).toMatchObject({
      displayName: "Learner",
      dailyReviewTarget: 35,
      appLanguage: "en",
    });

    const onboarding = await app.request(
      "http://worker.test/api/v1/onboarding",
      withAuth(
        json({
          englishLevel: "b1",
          nativeLanguage: "Persian",
          learningGoal: "work",
          mainUseCase: "work",
          dailyReviewTarget: 25,
        }),
        cookie,
        csrf,
      ),
      env,
    );
    expect(onboarding.status).toBe(200);
    expect(await onboarding.json()).toMatchObject({
      status: "completed",
      dailyReviewTarget: 25,
    });
    const repeated = await app.request(
      "http://worker.test/api/v1/onboarding",
      withAuth(
        json({
          englishLevel: "b1",
          nativeLanguage: "Persian",
          learningGoal: "work",
          mainUseCase: "work",
          dailyReviewTarget: 25,
        }),
        cookie,
        csrf,
      ),
      env,
    );
    expect(repeated.status).toBe(200);
    const conflicting = await app.request(
      "http://worker.test/api/v1/onboarding",
      withAuth(
        json({
          englishLevel: "b1",
          nativeLanguage: "French",
          learningGoal: "work",
          mainUseCase: "work",
          dailyReviewTarget: 25,
        }),
        cookie,
        csrf,
      ),
      env,
    );
    expect(conflicting.status).toBe(409);
    const preserved = await app.request(
      "http://worker.test/api/v1/settings",
      { headers: { Cookie: cookie } },
      env,
    );
    expect(await preserved.json()).toMatchObject({ dailyReviewTarget: 35 });
  });

  it("does not return settings after deletion wins during a stale update", async () => {
    const { userId } = await signedIn("settings-race@example.test");
    await new D1IdentityRepository(env.DB).getSettings(userId, now.toISOString());
    let reached!: () => void;
    let release!: () => void;
    const read = new Promise<void>((resolve) => {
      reached = resolve;
    });
    const resume = new Promise<void>((resolve) => {
      release = resolve;
    });
    let paused = false;
    const database = new Proxy(env.DB, {
      get(target, property, receiver) {
        if (property !== "prepare")
          return Reflect.get(target, property, receiver);
        return (sql: string) => {
          const statement = target.prepare(sql);
          if (paused || !sql.startsWith("SELECT id, email, display_name"))
            return statement;
          return new Proxy(statement, {
            get(prepared, key, receiver) {
              if (key !== "bind") return Reflect.get(prepared, key, receiver);
              return (...values: unknown[]) => {
                const bound = prepared.bind(...values);
                return new Proxy(bound, {
                  get(value, boundKey, boundReceiver) {
                    if (boundKey !== "first")
                      return Reflect.get(value, boundKey, boundReceiver);
                    return async <T>(): Promise<T | null> => {
                      const row = await value.first<T>();
                      paused = true;
                      reached();
                      await resume;
                      return row;
                    };
                  },
                });
              };
            },
          });
        };
      },
    }) as D1Database;
    const repository = new D1IdentityRepository(database);
    const update = repository.updateSettings(
      userId,
      {
        dailyReviewTarget: 30,
        reviewIntervalPreset: "balanced",
        appLanguage: "en",
        notificationsEnabled: true,
        marketingEmailsEnabled: false,
        displayName: "Stale",
      },
      now.toISOString(),
    );
    await read;
    const settingsBefore = await env.DB.prepare(
      "SELECT daily_review_target FROM user_settings WHERE user_id = ?1",
    )
      .bind(userId)
      .first();
    const userBefore = await env.DB.prepare(
      "SELECT display_name FROM users WHERE id = ?1",
    )
      .bind(userId)
      .first();
    await env.DB.prepare("UPDATE users SET status = 'deleted' WHERE id = ?1")
      .bind(userId)
      .run();
    release();
    await expect(update).resolves.toBeNull();
    await expect(
      env.DB.prepare(
        "SELECT daily_review_target FROM user_settings WHERE user_id = ?1",
      )
        .bind(userId)
        .first(),
    ).resolves.toEqual(settingsBefore);
    await expect(
      env.DB.prepare("SELECT display_name FROM users WHERE id = ?1")
        .bind(userId)
        .first(),
    ).resolves.toEqual(userBefore);
  });

  it("keeps today's mission snapshot when Settings and client timezone change", async () => {
    const app = identityApp(config, oauth, () => now);
    const { cookie, csrf } = await signedIn(
      "mission-snapshot@example.test",
      app,
    );
    const initialSettings = await app.request(
      "http://worker.test/api/v1/settings",
      withAuth(json({ dailyReviewTarget: 5 }, "PATCH"), cookie, csrf),
      env,
    );
    expect(initialSettings.status).toBe(200);

    const initialMission = await app.request(
      "http://worker.test/api/v1/daily-mission?timezone=Asia%2FTehran",
      { headers: { Cookie: cookie } },
      env,
    );
    expect(initialMission.status).toBe(200);
    expect(await initialMission.json()).toMatchObject({
      localDate: "2026-08-22",
      timezone: "Asia/Tehran",
      reviewTarget: 5,
    });

    const changedSettings = await app.request(
      "http://worker.test/api/v1/settings",
      withAuth(json({ dailyReviewTarget: 20 }, "PATCH"), cookie, csrf),
      env,
    );
    expect(changedSettings.status).toBe(200);

    const sameDayMission = await app.request(
      "http://worker.test/api/v1/daily-mission?timezone=America%2FLos_Angeles",
      { headers: { Cookie: cookie } },
      env,
    );
    expect(sameDayMission.status).toBe(200);
    expect(await sameDayMission.json()).toMatchObject({
      localDate: "2026-08-22",
      timezone: "Asia/Tehran",
      reviewTarget: 5,
    });
  });

  it("rejects invalid IANA timezones across mission reads", async () => {
    const { app, cookie } = await signedIn("invalid-timezone@example.test");
    for (const route of ["daily-mission", "progress"]) {
      const response = await app.request(
        `http://worker.test/api/v1/${route}?timezone=Mars%2FOlympus`,
        { headers: { Cookie: cookie } },
        env,
      );
      expect(response.status, route).toBe(400);
      await expect(response.json()).resolves.toMatchObject({
        detail: "invalid IANA timezone",
      });
    }
    await expect(
      env.DB.prepare(
        "SELECT count(*) AS count FROM daily_mission_snapshots",
      ).first<{ count: number }>(),
    ).resolves.toEqual({ count: 0 });
  });

  it("requires CSRF to logout and revokes only the supplied session", async () => {
    const first = await signedIn("logout@example.test");
    const second = await signedIn("logout@example.test");

    const missingCsrf = await first.app.request(
      "http://worker.test/api/v1/auth/logout",
      { method: "POST", headers: { Cookie: first.cookie } },
      env,
    );
    expect(missingCsrf.status).toBe(403);
    await expect(
      first.service.authenticate(first.token),
    ).resolves.toMatchObject({
      id: first.userId,
    });

    const mismatchedCsrf = await first.app.request(
      "http://worker.test/api/v1/auth/logout",
      withAuth({ method: "POST" }, first.cookie, "wrong-csrf"),
      env,
    );
    expect(mismatchedCsrf.status).toBe(403);
    await expect(
      first.service.authenticate(first.token),
    ).resolves.toMatchObject({
      id: first.userId,
    });

    const loggedOut = await first.app.request(
      "http://worker.test/api/v1/auth/logout",
      withAuth({ method: "POST" }, first.cookie, first.csrf),
      env,
    );
    expect(loggedOut.status).toBe(204);
    expect(cookieHeader(loggedOut)).toContain(
      "vocanova_session=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax",
    );
    await expect(first.service.authenticate(first.token)).rejects.toMatchObject(
      {
        code: "authentication_required",
      },
    );
    const revokedMe = await first.app.request(
      "http://worker.test/api/v1/me",
      { headers: { Cookie: first.cookie } },
      env,
    );
    expect(revokedMe.status).toBe(401);
    const survivingMe = await second.app.request(
      "http://worker.test/api/v1/me",
      { headers: { Cookie: second.cookie } },
      env,
    );
    expect(survivingMe.status).toBe(200);
    expect(await survivingMe.json()).toMatchObject({
      email: "logout@example.test",
    });
  });

  it("binds OAuth state to its cookie, rejects replay, and creates a verified session", async () => {
    const app = identityApp();
    const started = await app.request(
      "http://worker.test/api/v1/auth/oauth/google/start",
      json({ redirectUri: "http://127.0.0.1:3000/home" }),
      env,
    );
    expect(started.status).toBe(200);
    const stateCookie = namedCookie(
      cookieHeader(started),
      "vocanova_oauth_state",
    );
    const state = new URL(
      (await started.json<{ url: string }>()).url,
    ).searchParams.get("state")!;
    expect(stateCookie).toBe(state);

    const callback = await app.request(
      `http://worker.test/api/v1/auth/oauth/google/callback?code=valid-code&state=${encodeURIComponent(state)}`,
      {
        headers: { Cookie: `vocanova_oauth_state=${stateCookie}` },
        redirect: "manual",
      },
      env,
    );
    expect(callback.status).toBe(302);
    expect(callback.headers.get("location")).toBe("http://127.0.0.1:3000/home");

    const replay = await app.request(
      `http://worker.test/api/v1/auth/oauth/google/callback?code=valid-code&state=${encodeURIComponent(state)}`,
      {
        headers: { Cookie: `vocanova_oauth_state=${stateCookie}` },
        redirect: "manual",
      },
      env,
    );
    expect(replay.status).toBe(401);
  });

  it("rejects a new OAuth session after its linked account is deactivated", async () => {
    const app = identityApp();
    const firstStart = await app.request(
      "http://worker.test/api/v1/auth/oauth/google/start",
      json({ redirectUri: "http://127.0.0.1:3000/home" }),
      env,
    );
    const firstState = new URL(
      (await firstStart.json<{ url: string }>()).url,
    ).searchParams.get("state")!;
    const firstCallback = await app.request(
      `http://worker.test/api/v1/auth/oauth/google/callback?code=valid-code&state=${encodeURIComponent(firstState)}`,
      {
        headers: {
          Cookie: `vocanova_oauth_state=${namedCookie(cookieHeader(firstStart), "vocanova_oauth_state")}`,
        },
        redirect: "manual",
      },
      env,
    );
    expect(firstCallback.status).toBe(302);
    const user = await env.DB.prepare("SELECT id FROM users WHERE email = ?1")
      .bind("oauth@example.test")
      .first<{ id: string }>();

    const deleted = await app.request(
      "http://worker.test/api/v1/account-deletion-requests",
      withAuth(
        { method: "POST", headers: { "Idempotency-Key": "delete-oauth" } },
        cookiePairs(cookieHeader(firstCallback)),
        namedCookie(cookieHeader(firstCallback), "vocanova_csrf"),
      ),
      env,
    );
    expect(deleted.status).toBe(200);
    const usersBeforeRejectedCallback = await env.DB.prepare(
      "SELECT COUNT(*) AS count FROM users",
    ).first<{ count: number }>();
    const identitiesBeforeRejectedCallback = await env.DB.prepare(
      `SELECT user_id, COUNT(*) AS count FROM external_identities
       WHERE provider = 'google' AND provider_subject = ?1`,
    )
      .bind("google-subject-1")
      .first<{ user_id: string; count: number }>();
    expect(identitiesBeforeRejectedCallback).toEqual({
      user_id: user?.id,
      count: 1,
    });
    const identityRowBeforeRejectedCallback = await env.DB.prepare(
      `SELECT id, user_id, provider, provider_subject, provider_email,
              provider_email_verified, created_at, updated_at
       FROM external_identities
       WHERE provider = 'google' AND provider_subject = ?1`,
    )
      .bind("google-subject-1")
      .first<Record<string, string | number>>();

    const secondStart = await app.request(
      "http://worker.test/api/v1/auth/oauth/google/start",
      json({ redirectUri: "http://127.0.0.1:3000/home" }),
      env,
    );
    const secondState = new URL(
      (await secondStart.json<{ url: string }>()).url,
    ).searchParams.get("state")!;
    const rejected = await app.request(
      `http://worker.test/api/v1/auth/oauth/google/callback?code=valid-code&state=${encodeURIComponent(secondState)}`,
      {
        headers: {
          Cookie: `vocanova_oauth_state=${namedCookie(cookieHeader(secondStart), "vocanova_oauth_state")}`,
        },
        redirect: "manual",
      },
      env,
    );
    expect(rejected.status).toBe(401);
    expect(cookieHeader(rejected)).not.toContain("vocanova_session=");
    const account = await env.DB.prepare(
      "SELECT status, email FROM users WHERE id = ?1",
    )
      .bind(user?.id)
      .first<{ status: string; email: string | null }>();
    const sessionRows = await env.DB.prepare(
      "SELECT COUNT(*) AS count FROM sessions WHERE user_id = ?1",
    )
      .bind(user?.id)
      .first<{ count: number }>();
    const usersAfterRejectedCallback = await env.DB.prepare(
      "SELECT COUNT(*) AS count FROM users",
    ).first<{ count: number }>();
    const identitiesAfterRejectedCallback = await env.DB.prepare(
      `SELECT user_id, COUNT(*) AS count FROM external_identities
       WHERE provider = 'google' AND provider_subject = ?1`,
    )
      .bind("google-subject-1")
      .first<{ user_id: string; count: number }>();
    const identityRowAfterRejectedCallback = await env.DB.prepare(
      `SELECT id, user_id, provider, provider_subject, provider_email,
              provider_email_verified, created_at, updated_at
       FROM external_identities
       WHERE provider = 'google' AND provider_subject = ?1`,
    )
      .bind("google-subject-1")
      .first<Record<string, string | number>>();
    expect(account).toEqual({ status: "deleted", email: null });
    expect(sessionRows?.count).toBe(1);
    expect(usersAfterRejectedCallback).toEqual(usersBeforeRejectedCallback);
    expect(identitiesAfterRejectedCallback).toEqual(
      identitiesBeforeRejectedCallback,
    );
    expect(identityRowAfterRejectedCallback).toEqual(
      identityRowBeforeRejectedCallback,
    );
  });

  it("links verified OAuth to the user created by a magic link", async () => {
    const app = identityApp();
    const email = "OAuth@Example.Test";
    const requested = await app.request(
      "http://worker.test/api/v1/auth/magic-links",
      json({ email }),
      env,
    );
    expect(requested.status).toBe(204);
    const magicToken = messageToken(messages.at(-1)!);
    const magic = await app.request(
      "http://worker.test/api/v1/auth/magic-links/consume",
      json({ token: magicToken, email }),
      env,
    );
    expect(magic.status).toBe(200);
    const originalUser = await env.DB.prepare(
      "SELECT id FROM users WHERE email = ?1",
    )
      .bind("oauth@example.test")
      .first<{ id: string }>();
    expect(originalUser?.id).toBeDefined();
    const updatedSettings = await app.request(
      "http://worker.test/api/v1/settings",
      withAuth(
        json(
          {
            dailyReviewTarget: 12,
            reviewIntervalPreset: "custom",
            notificationsEnabled: false,
            marketingEmailsEnabled: true,
          },
          "PATCH",
        ),
        cookiePairs(cookieHeader(magic)),
        namedCookie(cookieHeader(magic), "vocanova_csrf"),
      ),
      env,
    );
    expect(updatedSettings.status).toBe(200);
    const settingsBefore = await env.DB.prepare(
      `SELECT user_id, timezone, daily_review_target, review_interval_preset,
              notifications_enabled, marketing_emails_enabled, app_language
       FROM user_settings WHERE user_id = ?1`,
    )
      .bind(originalUser?.id)
      .first<Record<string, string | number>>();
    expect(settingsBefore).toMatchObject({
      user_id: originalUser?.id,
      daily_review_target: 12,
      review_interval_preset: "custom",
      notifications_enabled: 0,
      marketing_emails_enabled: 1,
    });

    const started = await app.request(
      "http://worker.test/api/v1/auth/oauth/google/start",
      json({ redirectUri: "http://127.0.0.1:3000/home" }),
      env,
    );
    const state = new URL(
      (await started.json<{ url: string }>()).url,
    ).searchParams.get("state")!;
    const callback = await app.request(
      `http://worker.test/api/v1/auth/oauth/google/callback?code=valid-code&state=${encodeURIComponent(state)}`,
      {
        headers: {
          Cookie: `vocanova_oauth_state=${namedCookie(cookieHeader(started), "vocanova_oauth_state")}`,
        },
        redirect: "manual",
      },
      env,
    );
    expect(callback.status).toBe(302);
    const oauthSession = await app.request(
      "http://worker.test/api/v1/me",
      { headers: { Cookie: cookiePairs(cookieHeader(callback)) } },
      env,
    );
    expect(oauthSession.status).toBe(200);
    expect(await oauthSession.json()).toMatchObject({
      email: "oauth@example.test",
    });

    const users = await env.DB.prepare(
      "SELECT COUNT(*) AS count FROM users WHERE email = ?1",
    )
      .bind("oauth@example.test")
      .first<{ count: number }>();
    const googleIdentityCount = await env.DB.prepare(
      `SELECT COUNT(*) AS count FROM external_identities
       WHERE user_id = ?1 AND provider = 'google'`,
    )
      .bind(originalUser?.id)
      .first<{ count: number }>();
    const sessions = await env.DB.prepare(
      "SELECT COUNT(*) AS count FROM sessions WHERE user_id = ?1",
    )
      .bind(originalUser?.id)
      .first<{ count: number }>();
    const settingsAfter = await env.DB.prepare(
      `SELECT user_id, timezone, daily_review_target, review_interval_preset,
              notifications_enabled, marketing_emails_enabled, app_language
       FROM user_settings WHERE user_id = ?1`,
    )
      .bind(originalUser?.id)
      .first<Record<string, string | number>>();
    expect(users?.count).toBe(1);
    expect(sessions?.count).toBe(2);
    expect(settingsAfter).toEqual(settingsBefore);
    expect(googleIdentityCount?.count).toBe(1);
  });

  it("rejects expired OAuth state without consuming it and scopes its production cookie", async () => {
    const app = identityApp({
      ...config,
      environment: "production",
      secureCookies: true,
    });
    const started = await app.request(
      "http://worker.test/api/v1/auth/oauth/google/start",
      json({ redirectUri: "http://127.0.0.1:3000/home" }),
      env,
    );
    const issued = cookieHeader(started);
    expect(issued).toContain("vocanova_oauth_state=");
    expect(issued).toContain(
      "Path=/; Max-Age=600; HttpOnly; SameSite=Lax; Secure",
    );
    const state = new URL(
      (await started.json<{ url: string }>()).url,
    ).searchParams.get("state")!;
    const tokenHash = await hashToken(state);
    await env.DB.prepare("DELETE FROM oauth_states WHERE token_hash = ?1")
      .bind(tokenHash)
      .run();
    await new D1IdentityRepository(env.DB).createOAuthState(
      tokenHash,
      "production",
      "http://127.0.0.1:3000/home",
      "2026-08-22T11:00:00.000Z",
      "2026-08-22T11:30:00.000Z",
    );

    const expired = await app.request(
      `http://worker.test/api/v1/auth/oauth/google/callback?code=valid-code&state=${encodeURIComponent(state)}`,
      {
        headers: { Cookie: `vocanova_oauth_state=${state}` },
        redirect: "manual",
      },
      env,
    );
    expect(expired.status).toBe(401);
    expect(cookieHeader(expired)).not.toContain("vocanova_session=");
    expect(cookieHeader(expired)).not.toContain("vocanova_csrf=");
    const stateRow = await env.DB.prepare(
      "SELECT consumed_at FROM oauth_states WHERE token_hash = ?1",
    )
      .bind(tokenHash)
      .first<{ consumed_at: string | null }>();
    expect(stateRow?.consumed_at).toBeNull();
    for (const table of ["users", "sessions"]) {
      const row = await env.DB.prepare(
        `SELECT COUNT(*) AS count FROM ${table}`,
      ).first<{ count: number }>();
      expect(row?.count).toBe(0);
    }

    const freshStart = await app.request(
      "http://worker.test/api/v1/auth/oauth/google/start",
      json({ redirectUri: "http://127.0.0.1:3000/home" }),
      env,
    );
    const freshState = new URL(
      (await freshStart.json<{ url: string }>()).url,
    ).searchParams.get("state")!;
    const callback = await app.request(
      `http://worker.test/api/v1/auth/oauth/google/callback?code=valid-code&state=${encodeURIComponent(freshState)}`,
      {
        headers: { Cookie: `vocanova_oauth_state=${freshState}` },
        redirect: "manual",
      },
      env,
    );
    expect(callback.status).toBe(302);
    const callbackCookies = cookieHeader(callback);
    expect(callbackCookies).toContain(
      "vocanova_oauth_state=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax; Secure",
    );
    expect(callbackCookies).toContain("vocanova_session=");
    expect(callbackCookies).toContain("vocanova_csrf=");
  });

  it("round-trips supported local OAuth returns and rejects unsafe destinations", async () => {
    const service = identityService();
    const returnUrl = "http://127.0.0.1:3000/discover/coffee?level=b1";
    const credentialedReturnUrl = new URL(returnUrl);
    credentialedReturnUrl.username = "test-user";
    credentialedReturnUrl.password = "test-password";
    const started = await service.startOAuth(returnUrl, "oauth-local-route");
    const finished = await service.finishOAuth(
      "valid-code",
      started.state,
      started.state,
      "oauth-local-route",
    );
    expect(finished.returnUrl).toBe(returnUrl);
    for (const invalid of [
      "https://evil.example.test/home",
      credentialedReturnUrl.toString(),
      "http://127.0.0.1:3000/unknown",
      "http://127.0.0.1:3000/discover\\escape",
      "http://127.0.0.1:3000/reviews%0Aevil",
    ]) {
      await expect(
        service.startOAuth(invalid, `oauth-${invalid}`),
      ).rejects.toMatchObject({
        code: "oauth_invalid",
      });
    }
  });

  it("carries a supported magic-link return query and falls back for invalid input", async () => {
    const service = identityService();
    await service.requestMagicLink(
      "return@example.test",
      "magic-return",
      "/reviews?mode=due",
    );
    expect(messages.at(-1)?.text).toContain("returnTo=%2Freviews%3Fmode%3Ddue");
    await service.requestMagicLink(
      "fallback@example.test",
      "magic-fallback",
      "https://evil.example.test/home",
    );
    expect(messages.at(-1)?.text).toContain("returnTo=%2Fhome");
  });

  it("wires safe magic-link return targets through the HTTP request DTO", async () => {
    const app = identityApp();
    for (const [returnTo, expected] of [
      [undefined, "/home"],
      ["/settings/account?tab=security", "/settings/account?tab=security"],
      ["//evil.example.test/home", "/home"],
      ["https://evil.example.test/home", "/home"],
      ["/discover\\escape", "/home"],
      ["/unknown", "/home"],
    ] as const) {
      const response = await app.request(
        "http://worker.test/api/v1/auth/magic-links",
        json({ email: `route-${messages.length}@example.test`, returnTo }),
        env,
      );
      expect(response.status).toBe(204);
      expect(messages.at(-1)?.text).toContain(
        `returnTo=${encodeURIComponent(expected)}`,
      );
    }
  });

  it("creates no partial identity or session for provider failure or unverified email", async () => {
    const providers: OAuthProvider[] = [
      {
        ...oauth,
        verify: () => Promise.reject(new Error("synthetic provider failure")),
      },
      {
        ...oauth,
        verify: () =>
          Promise.resolve({
            subject: "unverified-subject",
            email: "unverified@example.test",
            emailVerified: false,
            displayName: "Unverified Synthetic Learner",
            avatarUrl: "",
          }),
      },
    ];
    for (const provider of providers) {
      const app = identityApp(config, provider);
      const started = await app.request(
        "http://worker.test/api/v1/auth/oauth/google/start",
        json({ redirectUri: "http://127.0.0.1:3000/home" }),
        env,
      );
      const stateCookie = namedCookie(
        cookieHeader(started),
        "vocanova_oauth_state",
      );
      const state = new URL(
        (await started.json<{ url: string }>()).url,
      ).searchParams.get("state")!;
      const failed = await app.request(
        `http://worker.test/api/v1/auth/oauth/google/callback?code=valid-code&state=${encodeURIComponent(state)}`,
        {
          headers: { Cookie: `vocanova_oauth_state=${stateCookie}` },
          redirect: "manual",
        },
        env,
      );
      expect(failed.status).toBe(401);
    }
    for (const table of ["users", "external_identities", "sessions"]) {
      const row = await env.DB.prepare(
        `SELECT COUNT(*) AS count FROM ${table}`,
      ).first<{ count: number }>();
      expect(row?.count).toBe(0);
    }
  });

  it("rolls back OAuth user creation when identity linking fails", async () => {
    const app = identityApp();
    const started = await app.request(
      "http://worker.test/api/v1/auth/oauth/google/start",
      json({ redirectUri: "http://127.0.0.1:3000/home" }),
      env,
    );
    const stateCookie = namedCookie(
      cookieHeader(started),
      "vocanova_oauth_state",
    );
    const state = new URL(
      (await started.json<{ url: string }>()).url,
    ).searchParams.get("state")!;
    await env.DB.prepare(
      "CREATE TRIGGER synthetic_identity_failure BEFORE INSERT ON external_identities BEGIN SELECT RAISE(ABORT, 'synthetic identity failure'); END",
    ).run();
    try {
      const failed = await app.request(
        `http://worker.test/api/v1/auth/oauth/google/callback?code=valid-code&state=${encodeURIComponent(state)}`,
        {
          headers: { Cookie: `vocanova_oauth_state=${stateCookie}` },
          redirect: "manual",
        },
        env,
      );
      expect(failed.status).toBe(500);
      const count = await env.DB.prepare(
        "SELECT COUNT(*) AS count FROM users WHERE email = ?1",
      )
        .bind("oauth@example.test")
        .first<{ count: number }>();
      expect(count?.count).toBe(0);
    } finally {
      await env.DB.prepare("DROP TRIGGER synthetic_identity_failure").run();
    }
  });

  it("rolls back a duplicate email confirmation without consuming its token", async () => {
    await signedIn("taken@example.test");
    const { app, cookie, csrf, userId } = await signedIn(
      "changer@example.test",
    );
    await app.request(
      "http://worker.test/api/v1/settings/email-change-links",
      withAuth(json({ newEmail: "taken@example.test" }), cookie, csrf),
      env,
    );
    const token = messageToken(messages.at(-1)!);
    const conflict = await app.request(
      "http://worker.test/api/v1/settings/email-change-links/consume",
      withAuth(json({ token }), cookie, csrf),
      env,
    );
    expect(conflict.status).toBe(409);
    const user = await env.DB.prepare("SELECT email FROM users WHERE id = ?1")
      .bind(userId)
      .first<{ email: string }>();
    expect(user?.email).toBe("changer@example.test");
    const link = await env.DB.prepare(
      "SELECT consumed_at FROM email_change_links WHERE new_email = ?1 ORDER BY created_at DESC",
    )
      .bind("taken@example.test")
      .first<{ consumed_at: string | null }>();
    expect(link?.consumed_at).toBeNull();
  });

  it("rejects missing or empty CSRF pairs without applying a settings write", async () => {
    const { app, token, userId } = await signedIn("csrf-required@example.test");
    const csrfHeaders: Array<Record<string, string>> = [
      { Cookie: `vocanova_session=${token}` },
      {
        Cookie: `vocanova_session=${token}; vocanova_csrf=`,
        "X-CSRF-Token": "",
      },
    ];
    for (const headers of csrfHeaders) {
      const response = await app.request(
        "http://worker.test/api/v1/settings",
        {
          ...json({ displayName: "Rejected CSRF write" }, "PATCH"),
          headers: { "Content-Type": "application/json", ...headers },
        },
        env,
      );
      expect(response.status).toBe(403);
      const user = await env.DB.prepare(
        "SELECT display_name FROM users WHERE id = ?1",
      )
        .bind(userId)
        .first<{ display_name: string }>();
      expect(user?.display_name).toBe("");
    }
  });

  it("rejects an expired email-change token without changing the account or notifying it", async () => {
    const { app, cookie, csrf, userId } = await signedIn(
      "expiry-owner@example.test",
    );
    const requested = await app.request(
      "http://worker.test/api/v1/settings/email-change-links",
      withAuth(json({ newEmail: "expiry-target@example.test" }), cookie, csrf),
      env,
    );
    expect(requested.status).toBe(204);
    const token = messageToken(messages.at(-1)!);
    await env.DB.prepare(
      "UPDATE email_change_links SET created_at = '2026-08-22T11:45:00.000Z', expires_at = ?1 WHERE user_id = ?2",
    )
      .bind(now.toISOString(), userId)
      .run();
    const userBefore = await env.DB.prepare(
      "SELECT email, updated_at FROM users WHERE id = ?1",
    )
      .bind(userId)
      .first();
    const linkBefore = await env.DB.prepare(
      "SELECT * FROM email_change_links WHERE user_id = ?1",
    )
      .bind(userId)
      .first();
    expect(linkBefore).not.toBeNull();
    const messagesBefore = [...messages];

    const expired = await app.request(
      "http://worker.test/api/v1/settings/email-change-links/consume",
      withAuth(json({ token }), cookie, csrf),
      env,
    );
    expect(expired.status).toBe(401);
    await expect(
      env.DB.prepare("SELECT email, updated_at FROM users WHERE id = ?1")
        .bind(userId)
        .first(),
    ).resolves.toEqual(userBefore);
    await expect(
      env.DB.prepare("SELECT * FROM email_change_links WHERE user_id = ?1")
        .bind(userId)
        .first(),
    ).resolves.toEqual(linkBefore);
    expect(messages).toEqual(messagesBefore);
    const stillAuthenticated = await app.request(
      "http://worker.test/api/v1/me",
      { headers: { Cookie: cookie } },
      env,
    );
    expect(stillAuthenticated.status).toBe(200);
  });

  it("does not let another signed-in account consume an owner's email-change link", async () => {
    const owner = await signedIn("email-owner@example.test");
    const other = await signedIn("email-other@example.test");
    const requested = await owner.app.request(
      "http://worker.test/api/v1/settings/email-change-links",
      withAuth(
        json({ newEmail: "owner-new@example.test" }),
        owner.cookie,
        owner.csrf,
      ),
      env,
    );
    expect(requested.status).toBe(204);
    const token = messageToken(messages.at(-1)!);
    const usersBefore = await env.DB.prepare(
      "SELECT id, email, updated_at FROM users ORDER BY id",
    ).all();
    const linkBefore = await env.DB.prepare(
      "SELECT * FROM email_change_links WHERE user_id = ?1",
    )
      .bind(owner.userId)
      .first();
    expect(linkBefore).not.toBeNull();
    const messagesBefore = [...messages];
    const consumed = await other.app.request(
      "http://worker.test/api/v1/settings/email-change-links/consume",
      withAuth(json({ token }), other.cookie, other.csrf),
      env,
    );
    expect(consumed.status).toBe(404);
    expect(await consumed.text()).not.toContain("email-owner@example.test");
    expect(
      await env.DB.prepare(
        "SELECT id, email, updated_at FROM users ORDER BY id",
      ).all(),
    ).toMatchObject({ results: usersBefore.results });
    await expect(
      env.DB.prepare("SELECT * FROM email_change_links WHERE user_id = ?1")
        .bind(owner.userId)
        .first(),
    ).resolves.toEqual(linkBefore);
    expect(messages).toEqual(messagesBefore);

    const ownerConsumed = await owner.app.request(
      "http://worker.test/api/v1/settings/email-change-links/consume",
      withAuth(json({ token }), owner.cookie, owner.csrf),
      env,
    );
    expect(ownerConsumed.status).toBe(200);
    expect(await ownerConsumed.json()).toMatchObject({
      email: "owner-new@example.test",
      previousEmail: "email-owner@example.test",
    });
    expect(messages).toHaveLength(messagesBefore.length + 1);
    expect(messages.at(-1)?.to).toBe("email-owner@example.test");
  });

  it("keeps settings isolated between requester sessions", async () => {
    const first = await signedIn("first@example.test");
    const second = await signedIn("second@example.test");
    await first.app.request(
      "http://worker.test/api/v1/settings",
      withAuth(
        json({ displayName: "First" }, "PATCH"),
        first.cookie,
        first.csrf,
      ),
      env,
    );
    const other = await second.app.request(
      "http://worker.test/api/v1/settings",
      { headers: { Cookie: second.cookie } },
      env,
    );
    expect(await other.json()).toMatchObject({ displayName: "" });
  });

  it("confirms email changes once and sends the old-address notification", async () => {
    const { app, cookie, csrf } = await signedIn("old@example.test");
    const requested = await app.request(
      "http://worker.test/api/v1/settings/email-change-links",
      withAuth(json({ newEmail: "new@example.test" }), cookie, csrf),
      env,
    );
    expect(requested.status).toBe(204);
    const token = messageToken(messages.at(-1)!);
    const consumed = await app.request(
      "http://worker.test/api/v1/settings/email-change-links/consume",
      withAuth(json({ token }), cookie, csrf),
      env,
    );
    expect(consumed.status).toBe(200);
    expect(await consumed.json()).toMatchObject({
      email: "new@example.test",
      previousEmail: "old@example.test",
    });
    expect(messages.at(-1)?.to).toBe("old@example.test");
    const replay = await app.request(
      "http://worker.test/api/v1/settings/email-change-links/consume",
      withAuth(json({ token }), cookie, csrf),
      env,
    );
    expect(replay.status).toBe(401);
  });

  it("deactivates atomically, revokes the session, and preserves an idempotent repository replay", async () => {
    const { app, cookie, csrf, userId, token, service } = await signedIn(
      "delete@example.test",
    );
    const deleted = await app.request(
      "http://worker.test/api/v1/account-deletion-requests",
      withAuth(
        { method: "POST", headers: { "Idempotency-Key": "delete-1" } },
        cookie,
        csrf,
      ),
      env,
    );
    expect(deleted.status).toBe(200);
    expect(await deleted.json()).toMatchObject({
      status: "deactivated",
      userId,
      replayed: false,
    });
    await expect(service.authenticate(token)).rejects.toMatchObject({
      code: "authentication_required",
    });
    const replay = await service.deleteAccount(
      userId,
      "delete-1",
      token,
      "test-ip",
    );
    expect(replay.replayed).toBe(true);
    await expect(
      service.deleteAccount(userId, "different-key", token, "test-ip"),
    ).rejects.toMatchObject({ code: "conflict" });
  });

  it("isolates the same account-deletion idempotency key between users", async () => {
    const first = await signedIn("first-delete@example.test");
    const second = await signedIn("second-delete@example.test");
    const deletion = (account: Awaited<ReturnType<typeof signedIn>>) =>
      account.app.request(
        "http://worker.test/api/v1/account-deletion-requests",
        withAuth(
          { method: "POST", headers: { "Idempotency-Key": "shared-delete" } },
          account.cookie,
          account.csrf,
        ),
        env,
      );

    const firstDeleted = await deletion(first);
    const secondDeleted = await deletion(second);
    expect(firstDeleted.status).toBe(200);
    expect(secondDeleted.status).toBe(200);
    expect(await firstDeleted.json()).toMatchObject({
      userId: first.userId,
      replayed: false,
    });
    expect(await secondDeleted.json()).toMatchObject({
      userId: second.userId,
      replayed: false,
    });

    const requests = await env.DB.prepare(
      `SELECT user_id, idempotency_key FROM account_deletion_requests
       WHERE idempotency_key = ?1 ORDER BY user_id`,
    )
      .bind("shared-delete")
      .all<{ user_id: string; idempotency_key: string }>();
    expect(requests.results).toEqual(
      [first.userId, second.userId]
        .sort()
        .map((user_id) => ({ user_id, idempotency_key: "shared-delete" })),
    );
  });

  it("revokes every session and pending email change when an account is deactivated", async () => {
    const first = await signedIn("all-credentials@example.test");
    const second = await signedIn("all-credentials@example.test");
    const other = await signedIn("unaffected@example.test");
    expect(second.userId).toBe(first.userId);
    expect(second.token).not.toBe(first.token);
    const requested = await first.app.request(
      "http://worker.test/api/v1/settings/email-change-links",
      withAuth(
        json({ newEmail: "replacement@example.test" }),
        first.cookie,
        first.csrf,
      ),
      env,
    );
    expect(requested.status).toBe(204);
    const pendingToken = messageToken(messages.at(-1)!);
    const pending = await env.DB.prepare(
      "SELECT consumed_at, revoked_at FROM email_change_links WHERE user_id = ?1",
    )
      .bind(first.userId)
      .first<{ consumed_at: string | null; revoked_at: string | null }>();
    expect(pending).toEqual({ consumed_at: null, revoked_at: null });
    const notificationCount = messages.length;

    const deleted = await first.app.request(
      "http://worker.test/api/v1/account-deletion-requests",
      withAuth(
        {
          method: "POST",
          headers: { "Idempotency-Key": "revoke-all-credentials" },
        },
        first.cookie,
        first.csrf,
      ),
      env,
    );
    expect(deleted.status).toBe(200);
    const sessions = await env.DB.prepare(
      "SELECT revoked_at FROM sessions WHERE user_id = ?1",
    )
      .bind(first.userId)
      .all<{ revoked_at: string | null }>();
    expect(sessions.results).toHaveLength(2);
    expect(
      sessions.results.every(
        (session) => session.revoked_at === now.toISOString(),
      ),
    ).toBe(true);
    for (const session of [first, second]) {
      const me = await session.app.request(
        "http://worker.test/api/v1/me",
        { headers: { Cookie: session.cookie } },
        env,
      );
      expect(me.status).toBe(401);
    }
    await expect(
      env.DB.prepare(
        "SELECT consumed_at, revoked_at FROM email_change_links WHERE user_id = ?1",
      )
        .bind(first.userId)
        .first(),
    ).resolves.toEqual({ consumed_at: null, revoked_at: now.toISOString() });
    const confirmation = await second.app.request(
      "http://worker.test/api/v1/settings/email-change-links/consume",
      withAuth(json({ token: pendingToken }), second.cookie, second.csrf),
      env,
    );
    expect(confirmation.status).toBe(401);
    expect(messages).toHaveLength(notificationCount);
    await expect(
      env.DB.prepare("SELECT status, email FROM users WHERE id = ?1")
        .bind(first.userId)
        .first(),
    ).resolves.toEqual({ status: "deleted", email: null });
    const unaffected = await other.app.request(
      "http://worker.test/api/v1/me",
      { headers: { Cookie: other.cookie } },
      env,
    );
    expect(unaffected.status).toBe(200);
  });

  it("matches the reference validation status for a missing deletion key", async () => {
    const { app, cookie, csrf } = await signedIn(
      "missing-idempotency@example.test",
    );
    const response = await app.request(
      "http://worker.test/api/v1/account-deletion-requests",
      withAuth({ method: "POST" }, cookie, csrf),
      env,
    );
    expect(response.status).toBe(422);
  });

  it("enforces the account-deletion idempotency key length boundary", async () => {
    const accepted = await signedIn("accepted-key@example.test");
    await expect(
      accepted.service.deleteAccount(
        accepted.userId,
        "a".repeat(200),
        accepted.token,
        "test-ip",
      ),
    ).resolves.toMatchObject({ status: "deactivated" });
    const rejected = await signedIn("rejected-key@example.test");
    await expect(
      rejected.service.deleteAccount(
        rejected.userId,
        "b".repeat(201),
        rejected.token,
        "test-ip",
      ),
    ).rejects.toMatchObject({ code: "invalid_idempotency" });
    await expect(
      env.DB.prepare("SELECT status FROM users WHERE id = ?1")
        .bind(rejected.userId)
        .first<{ status: string }>(),
    ).resolves.toEqual({ status: "active" });
  });

  it("rolls back the deletion record when a later deactivation mutation fails", async () => {
    const { app, cookie, csrf, userId, token, service } = await signedIn(
      "rollback-delete@example.test",
    );
    await env.DB.prepare(
      "CREATE TRIGGER synthetic_deletion_failure BEFORE UPDATE OF status ON users WHEN NEW.status = 'deleted' BEGIN SELECT RAISE(ABORT, 'synthetic deletion failure'); END",
    ).run();
    try {
      const failed = await app.request(
        "http://worker.test/api/v1/account-deletion-requests",
        withAuth(
          { method: "POST", headers: { "Idempotency-Key": "rollback-1" } },
          cookie,
          csrf,
        ),
        env,
      );
      expect(failed.status).toBe(500);
      const user = await env.DB.prepare(
        "SELECT status, email FROM users WHERE id = ?1",
      )
        .bind(userId)
        .first<{ status: string; email: string | null }>();
      expect(user).toEqual({
        status: "active",
        email: "rollback-delete@example.test",
      });
      await expect(service.authenticate(token)).resolves.toMatchObject({
        id: userId,
      });
      const deletionCount = await env.DB.prepare(
        "SELECT COUNT(*) AS count FROM account_deletion_requests",
      ).first<{ count: number }>();
      expect(deletionCount?.count).toBe(0);
    } finally {
      await env.DB.prepare("DROP TRIGGER synthetic_deletion_failure").run();
    }
  });

  it("rejects expired links and sessions without mutating their records", async () => {
    const repository = new D1IdentityRepository(env.DB);
    const createdAt = "2026-08-22T11:00:00.000Z";
    const user = await repository.createUser("expired@example.test", createdAt);
    const linkToken = await issueOpaqueToken();
    await repository.createMagicLink(
      user.email,
      linkToken.hash,
      "local",
      createdAt,
      "2026-08-22T11:15:00.000Z",
    );
    await expect(
      identityService().consumeMagicLink(
        linkToken.token,
        user.email,
        "expiry-fixture",
      ),
    ).rejects.toMatchObject({ code: "invalid_link" });
    const link = await repository.getMagicLink(linkToken.hash);
    expect(link?.consumedAt).toBeNull();

    const sessionToken = await issueOpaqueToken();
    await repository.createSession(
      user.id,
      sessionToken.hash,
      createdAt,
      "2026-08-22T11:30:00.000Z",
    );
    await expect(
      identityService().authenticate(sessionToken.token),
    ).rejects.toMatchObject({ code: "authentication_required" });
  });

  it("links outstanding magic links so account deletion revokes them", async () => {
    const { app, cookie, csrf, userId } = await signedIn(
      "revoke-links@example.test",
    );
    await app.request(
      "http://worker.test/api/v1/auth/magic-links",
      json({ email: "revoke-links@example.test" }),
      env,
    );
    const outstanding = await env.DB.prepare(
      "SELECT user_id FROM magic_links WHERE consumed_at IS NULL ORDER BY created_at DESC",
    ).first<{ user_id: string }>();
    expect(outstanding?.user_id).toBe(userId);
    await app.request(
      "http://worker.test/api/v1/account-deletion-requests",
      withAuth(
        { method: "POST", headers: { "Idempotency-Key": "delete-links" } },
        cookie,
        csrf,
      ),
      env,
    );
    const revoked = await env.DB.prepare(
      "SELECT revoked_at FROM magic_links WHERE user_id = ?1 AND consumed_at IS NULL",
    )
      .bind(userId)
      .first<{ revoked_at: string | null }>();
    expect(revoked?.revoked_at).toBe(now.toISOString());
  });

  it("blocks first-time users when new signups are disabled", async () => {
    const app = identityApp({ ...config, newSignupsEnabled: false });
    await app.request(
      "http://worker.test/api/v1/auth/magic-links",
      json({ email: "new-user@example.test" }),
      env,
    );
    const token = messageToken(messages.at(-1)!);
    const blocked = await app.request(
      "http://worker.test/api/v1/auth/magic-links/consume",
      json({ token, email: "new-user@example.test" }),
      env,
    );
    expect(blocked.status).toBe(503);
    const count = await env.DB.prepare(
      "SELECT COUNT(*) AS count FROM users",
    ).first<{ count: number }>();
    expect(count?.count).toBe(0);
  });

  it("closes both sides of the magic-link flow when its kill switch is off", async () => {
    const service = identityService({ ...config, magicLinkEnabled: false });
    await expect(
      service.requestMagicLink("closed@example.test", "closed-request"),
    ).rejects.toMatchObject({ code: "magic_disabled" });
    await expect(
      service.consumeMagicLink(
        "not-a-token",
        "closed@example.test",
        "closed-consume",
      ),
    ).rejects.toMatchObject({ code: "magic_disabled" });
  });

  it("admits only explicit allowlist members while blanket signup is disabled", async () => {
    const app = identityApp({
      ...config,
      newSignupsEnabled: false,
      signupAllowlist: ["invited@example.test"],
    });
    await app.request(
      "http://worker.test/api/v1/auth/magic-links",
      json({ email: "invited@example.test" }),
      env,
    );
    const token = messageToken(messages.at(-1)!);
    const admitted = await app.request(
      "http://worker.test/api/v1/auth/magic-links/consume",
      json({ token, email: "invited@example.test" }),
      env,
    );
    expect(admitted.status).toBe(200);
  });

  it("keeps the reserved synthetic identity unreachable from real sign-in paths", async () => {
    const app = identityApp({
      ...config,
      reservedSyntheticEmail: "synthetic@example.test",
    });
    const response = await app.request(
      "http://worker.test/api/v1/auth/magic-links",
      json({ email: "synthetic@example.test" }),
      env,
    );
    expect(response.status).toBe(204);
    expect(messages).toHaveLength(0);
    const count = await env.DB.prepare(
      "SELECT COUNT(*) AS count FROM magic_links",
    ).first<{ count: number }>();
    expect(count?.count).toBe(0);
  });

  it("distinguishes disabled OAuth from an unconfigured provider", async () => {
    await expect(
      identityService({ ...config, oauthEnabled: false }).startOAuth(
        "http://127.0.0.1:3000/home",
        "oauth-disabled",
      ),
    ).rejects.toMatchObject({ code: "oauth_disabled" });
    await expect(
      identityService(config, null).startOAuth(
        "http://127.0.0.1:3000/home",
        "oauth-missing",
      ),
    ).rejects.toMatchObject({ code: "oauth_not_configured" });
  });

  it("fails closed when a rate bucket is exhausted", async () => {
    const app = identityApp();
    for (let index = 0; index < 10; index += 1) {
      const response = await app.request(
        "http://worker.test/api/v1/auth/magic-links",
        json({ email: `rate-${index}@example.test` }),
        env,
      );
      expect(response.status).toBe(204);
    }
    const blocked = await app.request(
      "http://worker.test/api/v1/auth/magic-links",
      json({ email: "blocked@example.test" }),
      env,
    );
    expect(blocked.status).toBe(429);
  });

  it("rejects an expired session without renewing it or applying a write", async () => {
    const { app, cookie, csrf, userId } = await signedIn(
      "expired@example.test",
    );
    // Age the original 30-day session so an accidental sliding renewal
    // would change its expiry even though the test clock is deterministic.
    await env.DB.prepare(
      "UPDATE sessions SET created_at = '2026-07-24T12:00:00.000Z', expires_at = '2026-08-23T12:00:00.000Z' WHERE user_id = ?1",
    )
      .bind(userId)
      .run();
    const activeExpiry = await env.DB.prepare(
      "SELECT expires_at FROM sessions WHERE user_id = ?1",
    )
      .bind(userId)
      .first<{ expires_at: string }>();
    expect(
      (
        await app.request(
          "http://worker.test/api/v1/me",
          { headers: { Cookie: cookie } },
          env,
        )
      ).status,
    ).toBe(200);
    expect(
      (
        await app.request(
          "http://worker.test/api/v1/settings",
          withAuth(
            json({ displayName: "Active write" }, "PATCH"),
            cookie,
            csrf,
          ),
          env,
        )
      ).status,
    ).toBe(200);
    await expect(
      env.DB.prepare("SELECT expires_at FROM sessions WHERE user_id = ?1")
        .bind(userId)
        .first<{ expires_at: string }>(),
    ).resolves.toEqual(activeExpiry);
    await env.DB.prepare(
      "UPDATE sessions SET created_at = '2026-08-01T00:00:00.000Z', expires_at = '2026-08-02T00:00:00.000Z' WHERE user_id = ?1",
    )
      .bind(userId)
      .run();
    const me = await app.request(
      "http://worker.test/api/v1/me",
      {
        headers: { Cookie: cookie },
      },
      env,
    );
    expect(me.status).toBe(401);
    const write = await app.request(
      "http://worker.test/api/v1/settings",
      withAuth(
        json({ displayName: "Should not persist" }, "PATCH"),
        cookie,
        csrf,
      ),
      env,
    );
    expect(write.status).toBe(401);
    await expect(
      env.DB.prepare("SELECT expires_at FROM sessions WHERE user_id = ?1")
        .bind(userId)
        .first<{ expires_at: string }>(),
    ).resolves.toEqual({ expires_at: "2026-08-02T00:00:00.000Z" });
    const settings = await env.DB.prepare(
      "SELECT display_name FROM users WHERE id = ?1",
    )
      .bind(userId)
      .first<{ display_name: string }>();
    expect(settings?.display_name).toBe("Active write");
  });

  it("isolates exhausted magic-link rate buckets by connecting client", async () => {
    const app = identityApp();
    const request = (email: string, ip: string) =>
      app.request(
        "http://worker.test/api/v1/auth/magic-links",
        {
          ...json({ email }),
          headers: {
            "content-type": "application/json",
            "cf-connecting-ip": ip,
          },
        },
        env,
      );
    for (let index = 0; index < 10; index += 1)
      expect(
        (await request(`bucket-${index}@example.test`, "203.0.113.10")).status,
      ).toBe(204);
    expect((await request("blocked@example.test", "203.0.113.10")).status).toBe(
      429,
    );
    expect((await request("other@example.test", "203.0.113.11")).status).toBe(
      204,
    );
  });
});

function identityApp(
  identityConfiguration: IdentityConfig = config,
  provider: OAuthProvider | null = oauth,
  missionsClock: () => Date = () => new Date(),
) {
  return createApp({
    createPlatformRepository: (database) => new D1PlatformRepository(database),
    createIdentityService: () =>
      identityService(identityConfiguration, provider),
    createMissionsRepository: () =>
      new D1MissionsRepository(env.DB, missionsClock),
  });
}

function identityService(
  identityConfiguration: IdentityConfig = config,
  provider: OAuthProvider | null = oauth,
): IdentityService {
  return new IdentityService(
    new D1IdentityRepository(env.DB),
    {
      send: (message) => {
        messages.push(message);
        return Promise.resolve();
      },
    },
    provider,
    identityConfiguration,
    () => new Date(now),
  );
}

async function signedIn(email: string, app = identityApp()) {
  await app.request(
    "http://worker.test/api/v1/auth/magic-links",
    json({ email }),
    env,
  );
  const token = messageToken(messages.at(-1)!);
  const response = await app.request(
    "http://worker.test/api/v1/auth/magic-links/consume",
    json({ token, email }),
    env,
  );
  const cookie = cookieHeader(response);
  const sessionToken = namedCookie(cookie, "vocanova_session");
  const csrf = namedCookie(cookie, "vocanova_csrf");
  const row = await env.DB.prepare("SELECT id FROM users WHERE email = ?1")
    .bind(email)
    .first<{ id: string }>();
  return {
    app,
    cookie: cookiePairs(cookie),
    csrf,
    userId: row!.id,
    token: sessionToken,
    service: identityService(),
  };
}

function json(body: unknown, method = "POST"): RequestInit {
  return {
    method,
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  };
}

function withAuth(
  init: RequestInit,
  cookie: string,
  csrf: string,
): RequestInit {
  return {
    ...init,
    headers: { ...headers(init.headers), Cookie: cookie, "X-CSRF-Token": csrf },
  };
}

function headers(value: HeadersInit | undefined): Record<string, string> {
  return Object.fromEntries(new Headers(value).entries());
}

function cookieHeader(response: Response): string {
  return response.headers.get("set-cookie") ?? "";
}

function splitCookies(header: string): string[] {
  return header.split(", ").filter(Boolean);
}

function cookiePairs(header: string): string {
  return ["vocanova_session", "vocanova_csrf"]
    .map((name) => `${name}=${namedCookie(header, name)}`)
    .join("; ");
}

function namedCookie(header: string, name: string): string {
  return new RegExp(`${name}=([^;,]+)`).exec(header)?.[1] ?? "";
}

function messageToken(message: EmailMessage): string {
  const url = message.text.match(/https?:\/\/\S+/)?.[0];
  return new URL(url!).searchParams.get("token")!;
}
