export interface IdentityUser {
  id: string;
  email: string;
  displayName: string;
  avatarUrl: string;
  status: "active" | "disabled" | "deleted";
  onboardingStatus: "not_started" | "in_progress" | "completed";
  emailVerifiedAt: string | null;
}

export interface SessionIdentity {
  id: string;
  userId: string;
  expiresAt: string;
}

export interface EmailMessage {
  to: string;
  subject: string;
  text: string;
}

export interface EmailSender {
  send(message: EmailMessage): Promise<void>;
}

export interface OAuthIdentity {
  subject: string;
  email: string;
  emailVerified: boolean;
  displayName: string;
  avatarUrl: string;
}

export interface OAuthProvider {
  authorizationUrl(state: string, redirectUri: string): string;
  verify(
    code: string,
    state: string,
    redirectUri: string,
  ): Promise<OAuthIdentity>;
}

export class IdentityError extends Error {
  constructor(
    readonly code:
      | "authentication_required"
      | "csrf_invalid"
      | "invalid_link"
      | "magic_disabled"
      | "oauth_disabled"
      | "oauth_not_configured"
      | "oauth_invalid"
      | "rate_limited"
      | "signups_disabled"
      | "conflict"
      | "invalid_input"
      | "invalid_idempotency"
      | "not_found",
  ) {
    super(code);
    this.name = "IdentityError";
  }
}
