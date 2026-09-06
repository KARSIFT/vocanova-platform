import { z } from "@hono/zod-openapi";
import type { OpenAPIHono } from "@hono/zod-openapi";

import { SESSION_COOKIE_SECURITY } from "../http/openapi.js";
import {
  ContentLearningError,
  type ReviewSubmission,
} from "../domain/content-learning.js";
import type { VocaNovaWorkerEnvironment } from "../http/middleware.js";
import { problemResponse } from "../http/problem.js";
import {
  authenticated,
  identityProblem,
  requireCsrf,
} from "../identity/routes.js";
import type { IdentityService } from "../identity/service.js";
import { D1ContentLearningRepository } from "./repository.js";

const Uuid = z.uuid();
const Situation = z.object({
  id: Uuid,
  slug: z.string(),
  title: z.string(),
  shortDescription: z.string(),
  levelBand: z.string().optional(),
  category: z.string(),
  displayOrder: z.number().int(),
});
const SituationMeaning = z.object({
  meaningId: Uuid,
  wordId: Uuid,
  wordSlug: z.string(),
  wordText: z.string(),
  partOfSpeech: z.string(),
  shortDefinition: z.string(),
  saved: z.boolean(),
});
const WordExample = z.object({
  id: Uuid,
  exampleText: z.string(),
  situationLabel: z.string().optional(),
});
const UsageNote = z.object({
  id: Uuid,
  noteType: z.string(),
  noteText: z.string(),
});
const WordReviewState = z.enum([
  "due",
  "new",
  "learning",
  "reviewing",
  "mastered",
  "not_reviewing",
]);
const WordMeaning = z.object({
  id: Uuid,
  partOfSpeech: z.string(),
  shortDefinition: z.string(),
  learnerDefinition: z.string().optional(),
  saved: z.boolean(),
  userWordId: Uuid.optional(),
  reviewState: WordReviewState.nullable(),
  nextReviewAt: z.iso.datetime().nullable().optional(),
  examples: z.array(WordExample),
  usageNotes: z.array(UsageNote),
});
const Word = z.object({
  id: Uuid,
  text: z.string(),
  slug: z.string(),
  wordType: z.string(),
  difficultyLevel: z.string().optional(),
  meanings: z.array(WordMeaning),
});
const SavedMeaning = z.object({
  userWordId: Uuid,
  meaningId: Uuid,
  wordId: Uuid,
  wordText: z.string(),
  wordSlug: z.string(),
  partOfSpeech: z.string(),
  shortDefinition: z.string(),
  status: z.string(),
  source: z.string(),
  saved: z.boolean(),
  addedAt: z.iso.datetime(),
  nextReviewAt: z.iso.datetime().nullable().optional(),
});
const DueWord = z.object({
  userWordId: Uuid,
  meaningId: Uuid,
  wordId: Uuid,
  wordText: z.string(),
  wordSlug: z.string(),
  partOfSpeech: z.string(),
  shortDefinition: z.string(),
  status: z.string(),
  reviewStep: z.number().int(),
});
const SaveInput = z.object({
  meaningId: Uuid,
  source: z.enum(["journey", "search", "manual"]),
});
const ReviewInput = z.object({
  userWordId: Uuid,
  meaningId: Uuid,
  attemptType: z.literal("review").default("review"),
  promptType: z.enum(["multiple_choice", "self_check"]),
  result: z.enum(["correct", "incorrect", "skipped"]),
  rating: z.enum(["again", "hard", "good", "easy"]).optional(),
  answeredAt: z.iso.datetime(),
  responseTimeMs: z.number().int().min(0).default(0),
  selectedOptionMeaningId: Uuid.optional(),
  typedAnswer: z.string().optional(),
  wasHintUsed: z.boolean().default(false),
  source: z.enum(["review", "review_session"]).default("review"),
  clientAttemptId: z.string().min(1),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
const ReviewAttempt = z.object({
  attemptId: Uuid,
  userWordId: Uuid,
  meaningId: Uuid,
  attemptType: z.string(),
  promptType: z.enum(["multiple_choice", "self_check"]),
  result: z.enum(["correct", "incorrect", "skipped"]),
  rating: z.enum(["again", "hard", "good", "easy"]).optional(),
  reviewStepBefore: z.number().int(),
  reviewStepAfter: z.number().int(),
  answeredAt: z.iso.datetime(),
  responseTimeMs: z.number().int(),
  selectedOptionMeaningId: Uuid.optional(),
  typedAnswer: z.string().optional(),
  wasHintUsed: z.boolean(),
  source: z.string(),
  clientAttemptId: z.string(),
  nextReviewAt: z.iso.datetime(),
});

export function registerContentLearningRoutes(
  app: OpenAPIHono<VocaNovaWorkerEnvironment>,
  identityFactory: (env: CloudflareEnv) => IdentityService,
  repositoryFactory: (env: CloudflareEnv) => D1ContentLearningRepository,
): void {
  app.get("/api/v1/journey-situations", async (context) => {
    context.set("routeName", "list_journey_situations");
    try {
      await authenticated(context.req.raw, identityFactory(context.env));
      return context.json(
        await repositoryFactory(context.env).listSituations(
          context.req.query("after") ?? "",
          numberQuery(context.req.query("limit")),
        ),
        200,
      );
    } catch (error) {
      return routeProblem(context, error);
    }
  });

  app.get("/api/v1/journey-situations/:slug", async (context) => {
    context.set("routeName", "get_journey_situation");
    try {
      const { user } = await authenticated(
        context.req.raw,
        identityFactory(context.env),
      );
      return context.json(
        await repositoryFactory(context.env).getSituation(
          user.id,
          context.req.param("slug"),
        ),
        200,
      );
    } catch (error) {
      return routeProblem(context, error);
    }
  });

  app.get("/api/v1/canonical-words/:wordSlug", async (context) => {
    context.set("routeName", "get_canonical_word");
    try {
      const { user } = await authenticated(
        context.req.raw,
        identityFactory(context.env),
      );
      return context.json(
        await repositoryFactory(context.env).getWord(
          user.id,
          context.req.param("wordSlug"),
        ),
        200,
      );
    } catch (error) {
      return routeProblem(context, error);
    }
  });

  app.get("/api/v1/user-words", async (context) => {
    context.set("routeName", "list_saved_words");
    try {
      const { user } = await authenticated(
        context.req.raw,
        identityFactory(context.env),
      );
      return context.json(
        await repositoryFactory(context.env).listSavedWords(
          user.id,
          context.req.query("after") ?? "",
          numberQuery(context.req.query("limit")),
          context.req.query("query") ?? "",
        ),
        200,
      );
    } catch (error) {
      return routeProblem(context, error);
    }
  });

  app.post("/api/v1/user-words", async (context) => {
    context.set("routeName", "save_user_word");
    try {
      const { user } = await authenticated(
        context.req.raw,
        identityFactory(context.env),
      );
      requireCsrf(context.req.raw);
      const input = SaveInput.parse(await context.req.json());
      return context.json(
        await repositoryFactory(context.env).saveUserWord(
          user.id,
          input.meaningId,
          input.source,
          context.req.header("idempotency-key") ?? "",
        ),
        200,
      );
    } catch (error) {
      return routeProblem(context, error);
    }
  });

  app.delete("/api/v1/user-words/:meaningId", async (context) => {
    context.set("routeName", "unsave_user_word");
    try {
      const { user } = await authenticated(
        context.req.raw,
        identityFactory(context.env),
      );
      requireCsrf(context.req.raw);
      const meaningId = Uuid.parse(context.req.param("meaningId"));
      await repositoryFactory(context.env).unsaveUserWord(user.id, meaningId);
      return context.body(null, 204);
    } catch (error) {
      return routeProblem(context, error);
    }
  });

  app.get("/api/v1/reviews/due", async (context) => {
    context.set("routeName", "get_reviews_due");
    try {
      const { user } = await authenticated(
        context.req.raw,
        identityFactory(context.env),
      );
      return context.json(
        await repositoryFactory(context.env).listDueWords(
          user.id,
          context.req.query("after") ?? "",
          numberQuery(context.req.query("limit")),
        ),
        200,
      );
    } catch (error) {
      return routeProblem(context, error);
    }
  });

  app.post("/api/v1/reviews/submissions", async (context) => {
    context.set("routeName", "submit_review");
    try {
      const { user } = await authenticated(
        context.req.raw,
        identityFactory(context.env),
      );
      requireCsrf(context.req.raw);
      const input = ReviewInput.parse(
        await context.req.json(),
      ) as ReviewSubmission;
      return context.json(
        await repositoryFactory(context.env).submitReview(
          user.id,
          input,
          context.req.header("idempotency-key") ?? "",
        ),
        200,
      );
    } catch (error) {
      return routeProblem(context, error);
    }
  });

  registerOpenApi(app);
}

function numberQuery(value: string | undefined): number {
  if (value === undefined) return 20;
  if (!value.trim()) throw new ContentLearningError("invalid_input");
  const parsed = Number(value);
  if (!Number.isInteger(parsed))
    throw new ContentLearningError("invalid_input");
  return parsed;
}

function routeProblem(
  context: Parameters<typeof problemResponse>[0],
  error: unknown,
): Response {
  if (error instanceof ContentLearningError) {
    const mapping: Record<
      ContentLearningError["code"],
      [400 | 404 | 409 | 422, string]
    > = {
      invalid_cursor: [400, "invalid cursor"],
      invalid_input: [400, "invalid request"],
      invalid_idempotency: [422, "missing or invalid Idempotency-Key"],
      idempotency_conflict: [409, "idempotency conflict"],
      meaning_not_found: [404, "meaning not found"],
      situation_not_found: [404, "situation not found"],
      user_word_not_found: [404, "saved word not found"],
      word_not_found: [404, "word not found"],
    };
    const [status, detail] = mapping[error.code];
    return problemResponse(context, status, "Request Failed", detail);
  }
  return identityProblem(context, error);
}

function registerOpenApi(app: OpenAPIHono<VocaNovaWorkerEnvironment>): void {
  const json = (schema: z.ZodType) => ({ "application/json": { schema } });
  const pageParameters = [
    {
      name: "after",
      in: "query" as const,
      required: false,
      schema: { type: "string" as const },
    },
    {
      name: "limit",
      in: "query" as const,
      required: false,
      schema: { type: "integer" as const, default: 20 },
    },
  ];
  const savedWordsPageParameters = [
    ...pageParameters,
    {
      name: "query",
      in: "query" as const,
      required: false,
      schema: { type: "string" as const, maxLength: 100 },
      description:
        "Case-insensitive word or short-definition search, trimmed and normalized to single spaces.",
    },
  ];
  const idempotency = [
    {
      name: "Idempotency-Key",
      in: "header" as const,
      required: true,
      schema: { type: "string" as const, minLength: 1, maxLength: 200 },
    },
  ];
  const csrf = {
    name: "X-CSRF-Token",
    in: "header" as const,
    required: true,
    schema: { type: "string" as const },
  };
  const operations = [
    [
      "get",
      "/api/v1/journey-situations",
      "ListJourneySituations",
      undefined,
      z.object({
        items: z.array(Situation),
        nextCursor: z.string().optional(),
      }),
      200,
      pageParameters,
    ],
    [
      "get",
      "/api/v1/journey-situations/{slug}",
      "GetJourneySituation",
      undefined,
      z.object({ situation: Situation, meanings: z.array(SituationMeaning) }),
      200,
      [
        {
          name: "slug",
          in: "path" as const,
          required: true,
          schema: { type: "string" as const },
        },
      ],
    ],
    [
      "get",
      "/api/v1/canonical-words/{wordSlug}",
      "GetCanonicalWord",
      undefined,
      z.object({ word: Word }),
      200,
      [
        {
          name: "wordSlug",
          in: "path" as const,
          required: true,
          schema: { type: "string" as const },
        },
      ],
    ],
    [
      "get",
      "/api/v1/user-words",
      "ListSavedWords",
      undefined,
      z.object({
        items: z.array(SavedMeaning),
        nextCursor: z.string().optional(),
      }),
      200,
      savedWordsPageParameters,
    ],
    [
      "post",
      "/api/v1/user-words",
      "SaveUserWord",
      SaveInput,
      SavedMeaning,
      200,
      idempotency,
    ],
    [
      "delete",
      "/api/v1/user-words/{meaningId}",
      "UnsaveUserWord",
      undefined,
      undefined,
      204,
      [
        {
          name: "meaningId",
          in: "path" as const,
          required: true,
          schema: { type: "string" as const, format: "uuid" },
        },
      ],
    ],
    [
      "get",
      "/api/v1/reviews/due",
      "GetReviewsDue",
      undefined,
      z.object({
        items: z.array(DueWord),
        nextCursor: z.string().optional(),
        totalCount: z.number().int(),
        nextReviewAt: z.iso.datetime().nullable().optional(),
      }),
      200,
      pageParameters,
    ],
    [
      "post",
      "/api/v1/reviews/submissions",
      "SubmitReview",
      ReviewInput,
      ReviewAttempt,
      200,
      idempotency,
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
      tags: ["Content and learning"],
      security: [{ [SESSION_COOKIE_SECURITY]: [] }],
      parameters: [
        ...parameters,
        ...(["post", "delete"].includes(method) ? [csrf] : []),
      ],
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
