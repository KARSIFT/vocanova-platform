import type {
  EmailSender,
  IdentityUser,
  OAuthProvider,
} from "../domain/identity.js";
import { IdentityError } from "../domain/identity.js";
import { constantTimeEqual, hashToken, issueOpaqueToken } from "./crypto.js";
import type { IdentityRepository } from "./repository.js";
import {
  supportedAppReturnPath,
  supportedOAuthReturnUrl,
} from "./return-path.js";

export interface IdentityConfig {
  environment: "local" | "staging" | "production";
  baseUrl: string;
  oauthRedirectUri: string;
  oauthReturnAllowlist: string[];
  magicLinkEnabled: boolean;
  oauthEnabled: boolean;
  newSignupsEnabled: boolean;
  signupAllowlist: string[];
  reservedSyntheticEmail: string;
  secureCookies: boolean;
  sessionSeconds: number;
  magicLinkSeconds: number;
  oauthStateSeconds: number;
}

export interface AuthenticatedSession {
  user: IdentityUser;
  token: string;
  expiresAt: string;
  csrfToken: string;
}

export class IdentityService {
  constructor(
    private readonly repository: IdentityRepository,
    private readonly email: EmailSender,
    private readonly oauth: OAuthProvider | null,
    readonly config: IdentityConfig,
    private readonly clock: () => Date = () => new Date(),
  ) {}

  async requestMagicLink(
    emailInput: string,
    clientKey: string,
    returnTo?: string,
  ): Promise<void> {
    if (!this.config.magicLinkEnabled)
      throw new IdentityError("magic_disabled");
    await this.requireRate(`magic.request:${clientKey}`, 60_000, 10);
    const email = normalizeEmail(emailInput);
    if (!validEmail(email)) return;
    if (this.isReservedSyntheticEmail(email)) return;
    const now = this.clock();
    const { token, hash } = await issueOpaqueToken();
    await this.repository.createMagicLink(
      email,
      hash,
      this.config.environment,
      now.toISOString(),
      plusSeconds(now, this.config.magicLinkSeconds),
    );
    const link = new URL("/auth/magic", this.config.baseUrl);
    link.searchParams.set("token", token);
    link.searchParams.set("email", email);
    link.searchParams.set(
      "returnTo",
      supportedAppReturnPath(returnTo) ?? "/home",
    );
    await this.email.send({
      to: email,
      subject: "Sign in to Vocanova",
      text: `Use this single-use link to sign in: ${link.toString()}`,
    });
  }

  async consumeMagicLink(
    token: string,
    emailInput: string,
    clientKey: string,
  ): Promise<AuthenticatedSession> {
    if (!this.config.magicLinkEnabled)
      throw new IdentityError("magic_disabled");
    await this.requireRate(`magic.consume:${clientKey}`, 60_000, 10);
    const email = normalizeEmail(emailInput);
    if (!token || !validEmail(email) || this.isReservedSyntheticEmail(email))
      throw new IdentityError("invalid_link");
    const link = await this.repository.getMagicLink(await hashToken(token));
    const now = this.clock();
    if (
      !link ||
      link.email !== email ||
      link.environment !== this.config.environment ||
      link.consumedAt ||
      link.revokedAt ||
      link.expiresAt <= now.toISOString()
    ) {
      throw new IdentityError("invalid_link");
    }
    let user = await this.repository.getUserByEmail(email);
    if (!user) {
      if (!this.signupAllowed(email))
        throw new IdentityError("signups_disabled");
      user = await this.repository.createUser(email, now.toISOString());
    }
    if (user.status !== "active")
      throw new IdentityError("authentication_required");
    const session = await this.newSessionParts(now);
    const persisted = await this.repository.consumeMagicLinkAndIssueSession(
      link,
      user,
      session.hash,
      now.toISOString(),
      session.expiresAt,
    );
    return {
      user,
      token: session.token,
      expiresAt: persisted.expiresAt,
      csrfToken: session.csrfToken,
    };
  }

  async startOAuth(
    returnUrl: string,
    clientKey: string,
  ): Promise<{ url: string; state: string }> {
    if (!this.config.oauthEnabled) throw new IdentityError("oauth_disabled");
    if (!this.oauth) throw new IdentityError("oauth_not_configured");
    const safeReturnUrl = supportedOAuthReturnUrl(
      returnUrl,
      this.config.baseUrl,
      this.config.oauthReturnAllowlist,
    );
    if (!safeReturnUrl) throw new IdentityError("oauth_invalid");
    await this.requireRate(`oauth.start:${clientKey}`, 60_000, 10);
    const now = this.clock();
    const { token, hash } = await issueOpaqueToken();
    await this.repository.createOAuthState(
      hash,
      this.config.environment,
      safeReturnUrl,
      now.toISOString(),
      plusSeconds(now, this.config.oauthStateSeconds),
    );
    return {
      url: this.oauth.authorizationUrl(token, this.config.oauthRedirectUri),
      state: token,
    };
  }

  async finishOAuth(
    code: string,
    state: string,
    cookieState: string,
    clientKey: string,
  ): Promise<AuthenticatedSession & { returnUrl: string }> {
    if (!this.config.oauthEnabled) throw new IdentityError("oauth_disabled");
    if (!this.oauth) throw new IdentityError("oauth_not_configured");
    await this.requireRate(`oauth.callback:${clientKey}`, 60_000, 10);
    if (!code || !state || !constantTimeEqual(state, cookieState))
      throw new IdentityError("oauth_invalid");
    const stored = await this.repository.getOAuthState(await hashToken(state));
    const now = this.clock();
    if (
      !stored ||
      stored.environment !== this.config.environment ||
      stored.consumedAt ||
      stored.expiresAt <= now.toISOString()
    ) {
      throw new IdentityError("oauth_invalid");
    }
    if (
      !(await this.repository.consumeOAuthState(stored.id, now.toISOString()))
    )
      throw new IdentityError("oauth_invalid");
    let identity;
    try {
      identity = await this.oauth.verify(
        code,
        state,
        this.config.oauthRedirectUri,
      );
    } catch {
      throw new IdentityError("oauth_invalid");
    }
    const email = normalizeEmail(identity.email);
    if (
      !identity.subject ||
      !identity.emailVerified ||
      !validEmail(email) ||
      this.isReservedSyntheticEmail(email)
    )
      throw new IdentityError("oauth_invalid");
    const user = await this.repository.resolveOAuthUser(
      { ...identity, email },
      now.toISOString(),
      this.signupAllowed(email),
    );
    if (!user) throw new IdentityError("signups_disabled");
    if (user.status !== "active")
      throw new IdentityError("authentication_required");
    const session = await this.newSessionParts(now);
    const persisted = await this.repository.createSession(
      user.id,
      session.hash,
      now.toISOString(),
      session.expiresAt,
    );
    return {
      user,
      token: session.token,
      expiresAt: persisted.expiresAt,
      csrfToken: session.csrfToken,
      returnUrl: stored.appReturnUrl,
    };
  }

  async authenticate(token: string): Promise<IdentityUser> {
    if (!token) throw new IdentityError("authentication_required");
    const session = await this.repository.getSession(await hashToken(token));
    if (!session || session.expiresAt <= this.clock().toISOString())
      throw new IdentityError("authentication_required");
    const user = await this.repository.getUserById(session.userId);
    if (!user || user.status !== "active")
      throw new IdentityError("authentication_required");
    return user;
  }

  async logout(token: string): Promise<void> {
    if (token) {
      await this.requireRate(
        `logout:session:${await hashToken(token)}`,
        60_000,
        10,
      );
      await this.repository.revokeSession(
        await hashToken(token),
        this.clock().toISOString(),
      );
    }
  }

  async getSettings(userId: string): Promise<Record<string, unknown>> {
    const settings = await this.repository.getSettings(
      userId,
      this.clock().toISOString(),
    );
    if (!settings) throw new IdentityError("not_found");
    return settings;
  }

  async updateSettings(
    userId: string,
    values: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    const current = await this.getSettings(userId);
    const merged = { ...current, ...values };
    const updated = await this.repository.updateSettings(
      userId,
      merged,
      this.clock().toISOString(),
    );
    if (!updated) throw new IdentityError("not_found");
    return updated;
  }

  async getOnboarding(userId: string): Promise<Record<string, unknown>> {
    const profile = await this.repository.getOnboarding(userId);
    if (!profile) throw new IdentityError("not_found");
    return profile;
  }

  completeOnboarding(
    userId: string,
    values: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    return this.repository.completeOnboarding(
      userId,
      values,
      this.clock().toISOString(),
    );
  }

  async requestEmailChange(
    userId: string,
    newEmailInput: string,
    sessionToken: string,
    clientKey: string,
  ): Promise<void> {
    await this.requireDualRate("email.request", clientKey, sessionToken);
    const newEmail = normalizeEmail(newEmailInput);
    if (!validEmail(newEmail) || this.isReservedSyntheticEmail(newEmail))
      throw new IdentityError("invalid_input");
    const now = this.clock();
    const { token, hash } = await issueOpaqueToken();
    await this.repository.createEmailChangeLink(
      userId,
      newEmail,
      hash,
      this.config.environment,
      now.toISOString(),
      plusSeconds(now, this.config.magicLinkSeconds),
    );
    const link = new URL("/auth/email-change", this.config.baseUrl);
    link.searchParams.set("token", token);
    await this.email.send({
      to: newEmail,
      subject: "Confirm your new Vocanova sign-in email",
      text: `Confirm the change: ${link.toString()}`,
    });
  }

  async consumeEmailChange(
    userId: string,
    token: string,
    sessionToken: string,
    clientKey: string,
  ): Promise<{ email: string; previousEmail: string; changedAt: string }> {
    await this.requireDualRate("email.consume", clientKey, sessionToken);
    if (!token) throw new IdentityError("invalid_link");
    const link = await this.repository.getEmailChangeLink(
      await hashToken(token),
    );
    const now = this.clock();
    if (
      !link ||
      !link.userId ||
      link.environment !== this.config.environment ||
      link.consumedAt ||
      link.revokedAt ||
      link.expiresAt <= now.toISOString()
    ) {
      throw new IdentityError("invalid_link");
    }
    if (link.userId !== userId) throw new IdentityError("not_found");
    const changed = await this.repository.consumeEmailChangeLink(
      link,
      now.toISOString(),
    );
    await this.email
      .send({
        to: changed.oldEmail,
        subject: "Your Vocanova sign-in email changed",
        text: "Your sign-in email was changed. Contact support if this was not you.",
      })
      .catch(() => undefined);
    return {
      email: changed.newEmail,
      previousEmail: changed.oldEmail,
      changedAt: now.toISOString(),
    };
  }

  async deleteAccount(
    userId: string,
    idempotencyKey: string,
    sessionToken: string,
    clientKey: string,
  ): Promise<Record<string, unknown>> {
    if (!idempotencyKey || idempotencyKey.length > 200)
      throw new IdentityError("invalid_idempotency");
    const existing = await this.repository.getAccountDeletion(userId);
    if (existing) {
      if (existing.idempotencyKey !== idempotencyKey)
        throw new IdentityError("conflict");
      return deletionResponse(
        userId,
        idempotencyKey,
        existing.requestedAt,
        true,
      );
    }
    await this.requireDualRate("account.delete", clientKey, sessionToken);
    const now = this.clock();
    const result = await this.repository.deleteAccount(
      userId,
      idempotencyKey,
      now.toISOString(),
      plusSeconds(now, 30 * 24 * 60 * 60),
    );
    return deletionResponse(
      userId,
      idempotencyKey,
      result.requestedAt,
      result.replayed,
    );
  }

  private async newSessionParts(now: Date): Promise<{
    token: string;
    hash: string;
    csrfToken: string;
    expiresAt: string;
  }> {
    const session = await issueOpaqueToken();
    const csrf = await issueOpaqueToken();
    return {
      token: session.token,
      hash: session.hash,
      csrfToken: csrf.token,
      expiresAt: plusSeconds(now, this.config.sessionSeconds),
    };
  }

  private async requireDualRate(
    operation: string,
    clientKey: string,
    sessionToken: string,
  ): Promise<void> {
    const sessionKey = sessionToken ? await hashToken(sessionToken) : "missing";
    await this.requireRate(`${operation}:ip:${clientKey}`, 60_000, 10);
    await this.requireRate(`${operation}:session:${sessionKey}`, 60_000, 10);
  }

  private async requireRate(
    key: string,
    windowMs: number,
    limit: number,
  ): Promise<void> {
    if (
      !(await this.repository.allowRate(
        key,
        this.clock().getTime(),
        windowMs,
        limit,
      ))
    )
      throw new IdentityError("rate_limited");
  }

  private signupAllowed(email: string): boolean {
    return (
      !this.isReservedSyntheticEmail(email) &&
      (this.config.newSignupsEnabled ||
        this.config.signupAllowlist.includes(email))
    );
  }

  private isReservedSyntheticEmail(email: string): boolean {
    return (
      this.config.reservedSyntheticEmail !== "" &&
      email === this.config.reservedSyntheticEmail
    );
  }
}

export function identityConfig(env: CloudflareEnv): IdentityConfig {
  return {
    environment: env.ENVIRONMENT,
    baseUrl: env.AUTH_BASE_URL,
    oauthRedirectUri: env.OAUTH_REDIRECT_URI,
    oauthReturnAllowlist: env.OAUTH_RETURN_ALLOWLIST.split(",").map((value) =>
      new URL(value.trim()).toString(),
    ),
    magicLinkEnabled: parseBoolean(env.MAGIC_LINK_ENABLED),
    oauthEnabled: parseBoolean(env.GOOGLE_OAUTH_ENABLED),
    newSignupsEnabled: parseBoolean(env.NEW_USER_SIGNUP_ENABLED),
    signupAllowlist: env.NEW_USER_SIGNUP_ALLOWLIST.split(",")
      .map(normalizeEmail)
      .filter(Boolean),
    reservedSyntheticEmail: normalizeEmail(env.RESERVED_SYNTHETIC_EMAIL),
    secureCookies: env.ENVIRONMENT !== "local",
    sessionSeconds: 30 * 24 * 60 * 60,
    magicLinkSeconds: 15 * 60,
    oauthStateSeconds: 10 * 60,
  };
}

function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

function validEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 254;
}

function plusSeconds(date: Date, seconds: number): string {
  return new Date(date.getTime() + seconds * 1000).toISOString();
}

function parseBoolean(value: string): boolean {
  return value === "true";
}

function deletionResponse(
  userId: string,
  idempotencyKey: string,
  requestedAt: string,
  replayed: boolean,
): Record<string, unknown> {
  return {
    status: "deactivated",
    userId,
    requestedAt,
    purgeAfter: plusSeconds(new Date(requestedAt), 30 * 24 * 60 * 60),
    idempotencyKey,
    replayed,
  };
}
