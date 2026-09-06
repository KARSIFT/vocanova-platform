import { z } from "@hono/zod-openapi";
import type { OpenAPIHono } from "@hono/zod-openapi";

import { SESSION_COOKIE_SECURITY } from "../http/openapi.js";
import type { IdentityUser } from "../domain/identity.js";
import { IdentityError } from "../domain/identity.js";
import { isValidTimezone } from "../domain/missions.js";
import type { VocaNovaWorkerEnvironment } from "../http/middleware.js";
import { problemResponse } from "../http/problem.js";
import {
  CSRF_COOKIE,
  OAUTH_STATE_COOKIE,
  SESSION_COOKIE,
  clearCookie,
  csrfCookie,
  oauthStateCookie,
  readCookie,
  sessionCookie,
} from "./cookies.js";
import { constantTimeEqual } from "./crypto.js";
import type { IdentityService } from "./service.js";

const EmailSchema = z.email().max(254);
const MagicRequestSchema = z.object({
  email: EmailSchema,
  returnTo: z.string().max(2048).optional(),
});
const MagicConsumeSchema = z.object({
  token: z.string().min(1),
  email: EmailSchema,
});
const OAuthStartSchema = z.object({ redirectUri: z.url() });
const OnboardingSchema = z.object({
  englishLevel: z.enum(["a1", "a2", "b1", "b2", "unknown"]),
  nativeLanguage: z.string().min(1),
  learningGoal: z.enum([
    "general",
    "work",
    "travel",
    "study",
    "conversation",
    "exam",
  ]),
  mainUseCase: z.enum(["daily_life", "work", "travel", "study", "social"]),
  dailyReviewTarget: z.number().int().min(5).max(100),
  timezone: z
    .string()
    .min(1)
    .max(100)
    .refine(isValidTimezone, "invalid IANA timezone")
    .describe("IANA time zone identifier, such as America/Los_Angeles.")
    .optional(),
});
const SettingsUpdateSchema = z
  .object({
    dailyReviewTarget: z.number().int().min(5).max(100).optional(),
    reviewIntervalPreset: z
      .enum(["vocanova_default", "wordup_like", "custom"])
      .optional(),
    appLanguage: z.literal("en").optional(),
    notificationsEnabled: z.boolean().optional(),
    marketingEmailsEnabled: z.boolean().optional(),
    displayName: z.string().max(80).optional(),
    timezone: z
      .string()
      .min(1)
      .max(100)
      .refine(isValidTimezone, "invalid IANA timezone")
      .describe("IANA time zone identifier, such as America/Los_Angeles.")
      .optional(),
  })
  .strict();
const EmailChangeRequestSchema = z.object({ newEmail: EmailSchema });
const EmailChangeConsumeSchema = z.object({ token: z.string().min(1) });

export function registerIdentityRoutes(
  app: OpenAPIHono<VocaNovaWorkerEnvironment>,
  serviceFactory: (env: CloudflareEnv) => IdentityService,
): void {
  app.get("/api/v1/me", async (context) => {
    context.set("routeName", "get_current_user");
    try {
      const { user } = await authenticated(
        context.req.raw,
        serviceFactory(context.env),
      );
      return context.json(currentUser(user), 200);
    } catch (error) {
      return identityProblem(context, error);
    }
  });

  app.post("/api/v1/auth/magic-links", async (context) => {
    context.set("routeName", "request_magic_link");
    try {
      const input = MagicRequestSchema.parse(await context.req.json());
      await serviceFactory(context.env).requestMagicLink(
        input.email,
        clientKey(context.req.raw),
        input.returnTo,
      );
      return context.body(null, 204);
    } catch (error) {
      return identityProblem(context, error);
    }
  });

  app.post("/api/v1/auth/magic-links/consume", async (context) => {
    context.set("routeName", "consume_magic_link");
    try {
      const input = MagicConsumeSchema.parse(await context.req.json());
      const service = serviceFactory(context.env);
      const result = await service.consumeMagicLink(
        input.token,
        input.email,
        clientKey(context.req.raw),
      );
      appendSessionCookies(context, service, result.token, result.csrfToken);
      return context.json(currentUser(result.user), 200);
    } catch (error) {
      return identityProblem(context, error);
    }
  });

  app.post("/api/v1/auth/oauth/google/start", async (context) => {
    context.set("routeName", "oauth_start");
    try {
      const input = OAuthStartSchema.parse(await context.req.json());
      const service = serviceFactory(context.env);
      const result = await service.startOAuth(
        input.redirectUri,
        clientKey(context.req.raw),
      );
      context.header(
        "set-cookie",
        oauthStateCookie(
          result.state,
          service.config.oauthStateSeconds,
          service.config.secureCookies,
        ),
        { append: true },
      );
      return context.json({ url: result.url }, 200);
    } catch (error) {
      return identityProblem(context, error);
    }
  });

  app.get("/api/v1/auth/oauth/google/callback", async (context) => {
    context.set("routeName", "oauth_callback");
    try {
      const service = serviceFactory(context.env);
      const result = await service.finishOAuth(
        context.req.query("code") ?? "",
        context.req.query("state") ?? "",
        readCookie(context.req.raw, OAUTH_STATE_COOKIE),
        clientKey(context.req.raw),
      );
      appendSessionCookies(context, service, result.token, result.csrfToken);
      context.header(
        "set-cookie",
        clearCookie(OAUTH_STATE_COOKIE, true, service.config.secureCookies),
        { append: true },
      );
      return context.redirect(result.returnUrl, 302);
    } catch (error) {
      return identityProblem(context, error);
    }
  });

  app.post("/api/v1/auth/logout", async (context) => {
    context.set("routeName", "logout");
    try {
      const service = serviceFactory(context.env);
      const { token } = await authenticated(context.req.raw, service);
      requireCsrf(context.req.raw);
      await service.logout(token);
      context.header(
        "set-cookie",
        clearCookie(SESSION_COOKIE, true, service.config.secureCookies),
        { append: true },
      );
      context.header(
        "set-cookie",
        clearCookie(CSRF_COOKIE, false, service.config.secureCookies),
        { append: true },
      );
      return context.body(null, 204);
    } catch (error) {
      return identityProblem(context, error);
    }
  });

  app.get("/api/v1/onboarding", async (context) => {
    context.set("routeName", "get_onboarding");
    try {
      const service = serviceFactory(context.env);
      const { user } = await authenticated(context.req.raw, service);
      return context.json(await service.getOnboarding(user.id), 200);
    } catch (error) {
      return identityProblem(context, error);
    }
  });

  app.post("/api/v1/onboarding", async (context) => {
    context.set("routeName", "complete_onboarding");
    try {
      const service = serviceFactory(context.env);
      const { user } = await authenticated(context.req.raw, service);
      requireCsrf(context.req.raw);
      const input = OnboardingSchema.parse(await context.req.json());
      return context.json(
        await service.completeOnboarding(user.id, input),
        200,
      );
    } catch (error) {
      return identityProblem(context, error);
    }
  });

  app.get("/api/v1/settings", async (context) => {
    context.set("routeName", "get_settings");
    try {
      const service = serviceFactory(context.env);
      const { user } = await authenticated(context.req.raw, service);
      return context.json(await service.getSettings(user.id), 200);
    } catch (error) {
      return identityProblem(context, error);
    }
  });

  app.patch("/api/v1/settings", async (context) => {
    context.set("routeName", "update_settings");
    try {
      const service = serviceFactory(context.env);
      const { user } = await authenticated(context.req.raw, service);
      requireCsrf(context.req.raw);
      const input = SettingsUpdateSchema.parse(await context.req.json());
      return context.json(await service.updateSettings(user.id, input), 200);
    } catch (error) {
      return identityProblem(context, error);
    }
  });

  app.post("/api/v1/settings/email-change-links", async (context) => {
    context.set("routeName", "request_email_change");
    try {
      const service = serviceFactory(context.env);
      const { user, token } = await authenticated(context.req.raw, service);
      requireCsrf(context.req.raw);
      const input = EmailChangeRequestSchema.parse(await context.req.json());
      await service.requestEmailChange(
        user.id,
        input.newEmail,
        token,
        clientKey(context.req.raw),
      );
      return context.body(null, 204);
    } catch (error) {
      return identityProblem(context, error);
    }
  });

  app.post("/api/v1/settings/email-change-links/consume", async (context) => {
    context.set("routeName", "consume_email_change");
    try {
      const service = serviceFactory(context.env);
      const { user, token } = await authenticated(context.req.raw, service);
      requireCsrf(context.req.raw);
      const input = EmailChangeConsumeSchema.parse(await context.req.json());
      return context.json(
        await service.consumeEmailChange(
          user.id,
          input.token,
          token,
          clientKey(context.req.raw),
        ),
        200,
      );
    } catch (error) {
      return identityProblem(context, error);
    }
  });

  app.post("/api/v1/account-deletion-requests", async (context) => {
    context.set("routeName", "delete_account");
    try {
      const service = serviceFactory(context.env);
      const { user, token } = await authenticated(context.req.raw, service);
      requireCsrf(context.req.raw);
      const key = context.req.header("idempotency-key") ?? "";
      return context.json(
        await service.deleteAccount(
          user.id,
          key,
          token,
          clientKey(context.req.raw),
        ),
        200,
      );
    } catch (error) {
      return identityProblem(context, error);
    }
  });

  registerIdentityOpenApi(app);
}

export async function authenticated(
  request: Request,
  service: IdentityService,
): Promise<{ user: IdentityUser; token: string }> {
  const token = readCookie(request, SESSION_COOKIE);
  return { user: await service.authenticate(token), token };
}

export function requireCsrf(request: Request): void {
  const cookieToken = readCookie(request, CSRF_COOKIE);
  const headerToken = request.headers.get("x-csrf-token") ?? "";
  if (
    !cookieToken ||
    !headerToken ||
    !constantTimeEqual(cookieToken, headerToken)
  ) {
    throw new IdentityError("csrf_invalid");
  }
}

function appendSessionCookies(
  context: Parameters<typeof problemResponse>[0],
  service: IdentityService,
  token: string,
  csrf: string,
): void {
  context.header(
    "set-cookie",
    sessionCookie(
      token,
      service.config.sessionSeconds,
      service.config.secureCookies,
    ),
    { append: true },
  );
  context.header(
    "set-cookie",
    csrfCookie(
      csrf,
      service.config.sessionSeconds,
      service.config.secureCookies,
    ),
    { append: true },
  );
}

function currentUser(user: IdentityUser): Record<string, unknown> {
  return {
    userId: user.id,
    email: user.email,
    ...(user.displayName && { displayName: user.displayName }),
    ...(user.avatarUrl && { avatarUrl: user.avatarUrl }),
    ...(user.emailVerifiedAt && { emailVerifiedAt: user.emailVerifiedAt }),
    onboardingStatus: user.onboardingStatus,
  };
}

function clientKey(request: Request): string {
  return (
    request.headers.get("cf-connecting-ip") ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}

export function identityProblem(
  context: Parameters<typeof problemResponse>[0],
  error: unknown,
): Response {
  if (error instanceof IdentityError) {
    const mapping: Record<
      IdentityError["code"],
      [400 | 401 | 403 | 404 | 409 | 422 | 429 | 503, string]
    > = {
      authentication_required: [401, "authentication required"],
      csrf_invalid: [403, "invalid CSRF token"],
      invalid_link: [401, "invalid or expired link"],
      magic_disabled: [503, "magic link sign-in is disabled"],
      oauth_disabled: [503, "google oauth sign-in is disabled"],
      oauth_not_configured: [404, "oauth provider not configured"],
      oauth_invalid: [401, "invalid or expired oauth state"],
      rate_limited: [429, "rate limited"],
      signups_disabled: [503, "new sign-ups are disabled"],
      conflict: [409, "request conflicts with current account state"],
      invalid_input: [400, "invalid request"],
      invalid_idempotency: [422, "missing or invalid Idempotency-Key"],
      not_found: [404, "resource not found"],
    };
    const [status, detail] = mapping[error.code];
    return problemResponse(
      context,
      status,
      status === 401 ? "Unauthorized" : "Request Failed",
      detail,
    );
  }
  if (error instanceof z.ZodError) {
    return problemResponse(
      context,
      422,
      "Unprocessable Entity",
      "request body is invalid",
    );
  }
  if (error instanceof SyntaxError) {
    return problemResponse(
      context,
      400,
      "Bad Request",
      "request body is invalid",
    );
  }
  throw error;
}

function registerIdentityOpenApi(
  app: OpenAPIHono<VocaNovaWorkerEnvironment>,
): void {
  const CurrentUser = z.object({
    userId: z.string(),
    email: EmailSchema.optional(),
    displayName: z.string().optional(),
    avatarUrl: z.url().optional(),
    emailVerifiedAt: z.iso.datetime().optional(),
    onboardingStatus: z.enum(["not_started", "in_progress", "completed"]),
  });
  const OnboardingProfile = OnboardingSchema.partial().extend({
    status: z.enum(["not_started", "in_progress", "completed"]),
    completedAt: z.iso.datetime().optional(),
  });
  const Settings = SettingsUpdateSchema.required();
  const json = (schema: z.ZodType) => ({ "application/json": { schema } });
  const oauthCallbackParameters = ["code", "state", "error"].map((name) => ({
    name,
    in: "query" as const,
    required: false,
    schema: { type: "string" as const },
  }));
  const logoutParameters = [
    {
      name: "X-CSRF-Token",
      in: "header" as const,
      required: true,
      schema: { type: "string" as const },
    },
  ];
  const csrfParameter = logoutParameters[0]!;
  const authenticatedOperations = new Set([
    "GetCurrentUser",
    "Logout",
    "GetOnboarding",
    "CompleteOnboarding",
    "GetSettings",
    "UpdateSettings",
    "RequestEmailChangeLink",
    "ConsumeEmailChangeLink",
    "CreateAccountDeletionRequest",
  ]);
  const csrfOperations = new Set([
    "Logout",
    "CompleteOnboarding",
    "UpdateSettings",
    "RequestEmailChangeLink",
    "ConsumeEmailChangeLink",
    "CreateAccountDeletionRequest",
  ]);
  const deletionParameters = [
    {
      name: "Idempotency-Key",
      in: "header" as const,
      required: true,
      schema: { type: "string" as const, minLength: 1, maxLength: 200 },
    },
  ];
  const operations = [
    [
      "get",
      "/api/v1/me",
      "GetCurrentUser",
      undefined,
      CurrentUser,
      200,
      undefined,
    ],
    [
      "post",
      "/api/v1/auth/magic-links",
      "RequestMagicLink",
      MagicRequestSchema,
      undefined,
      204,
      undefined,
    ],
    [
      "post",
      "/api/v1/auth/magic-links/consume",
      "ConsumeMagicLink",
      MagicConsumeSchema,
      CurrentUser,
      200,
      undefined,
    ],
    [
      "post",
      "/api/v1/auth/oauth/google/start",
      "OAuthStart",
      OAuthStartSchema,
      z.object({ url: z.url() }),
      200,
      undefined,
    ],
    [
      "get",
      "/api/v1/auth/oauth/google/callback",
      "OAuthCallback",
      undefined,
      undefined,
      302,
      oauthCallbackParameters,
    ],
    [
      "post",
      "/api/v1/auth/logout",
      "Logout",
      undefined,
      undefined,
      204,
      logoutParameters,
    ],
    [
      "get",
      "/api/v1/onboarding",
      "GetOnboarding",
      undefined,
      OnboardingProfile,
      200,
      undefined,
    ],
    [
      "post",
      "/api/v1/onboarding",
      "CompleteOnboarding",
      OnboardingSchema,
      OnboardingProfile,
      200,
      undefined,
    ],
    [
      "get",
      "/api/v1/settings",
      "GetSettings",
      undefined,
      Settings,
      200,
      undefined,
    ],
    [
      "patch",
      "/api/v1/settings",
      "UpdateSettings",
      SettingsUpdateSchema,
      Settings,
      200,
      undefined,
    ],
    [
      "post",
      "/api/v1/settings/email-change-links",
      "RequestEmailChangeLink",
      EmailChangeRequestSchema,
      undefined,
      204,
      undefined,
    ],
    [
      "post",
      "/api/v1/settings/email-change-links/consume",
      "ConsumeEmailChangeLink",
      EmailChangeConsumeSchema,
      z.object({
        email: EmailSchema,
        previousEmail: EmailSchema,
        changedAt: z.iso.datetime(),
      }),
      200,
      undefined,
    ],
    [
      "post",
      "/api/v1/account-deletion-requests",
      "CreateAccountDeletionRequest",
      undefined,
      z.object({
        status: z.literal("deactivated"),
        userId: z.uuid(),
        requestedAt: z.iso.datetime(),
        purgeAfter: z.iso.datetime(),
        idempotencyKey: z.string(),
        replayed: z.boolean(),
      }),
      200,
      deletionParameters,
    ],
  ] as const;
  for (const [
    method,
    path,
    operationId,
    request,
    response,
    status,
    parameters,
  ] of operations) {
    app.openAPIRegistry.registerPath({
      method,
      path,
      operationId,
      tags: ["Identity and account"],
      ...(authenticatedOperations.has(operationId) && {
        security: [{ [SESSION_COOKIE_SECURITY]: [] }],
      }),
      ...(parameters || csrfOperations.has(operationId)
        ? {
            parameters: [
              ...(parameters ?? []),
              ...(csrfOperations.has(operationId) && operationId !== "Logout"
                ? [csrfParameter]
                : []),
            ],
          }
        : {}),
      ...(request && { request: { body: { content: json(request) } } }),
      responses: {
        [status]: {
          description: "Successful response",
          ...(response && { content: json(response) }),
        },
      },
    });
  }
}
