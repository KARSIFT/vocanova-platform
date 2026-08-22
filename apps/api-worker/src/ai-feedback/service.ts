import {
  CRISIS_RESOURCE_TEXT,
  DeterministicMockAIProvider,
  ERROR,
  AIFeedbackError,
  SCHEMA_VERSION,
  PROMPT_VERSION,
  buildProviderTask,
  localSafety,
  parseProviderFeedback,
  validateSentence,
  type FeedbackProvider,
  type ModerationProvider,
  type ProviderFeedback,
  type SentenceFeedbackResult,
  type SubmitFeedbackInput,
} from "../domain/ai-feedback.js";
import { D1AIFeedbackRepository, type GenerationLimits } from "./repository.js";

export interface AIFeedbackServiceConfig {
  limits: GenerationLimits;
  providerTimeoutMs: number;
  release: string;
}

export interface AIFeedbackTelemetry {
  record(event: {
    outcome: string;
    provider: string;
    model: string;
    promptVersion: string;
    schemaVersion: string;
    release: string;
    durationMs: number;
    learningStatus?: string;
  }): Promise<void>;
}

export class PrivacySafeWorkerTelemetry implements AIFeedbackTelemetry {
  record(event: Parameters<AIFeedbackTelemetry["record"]>[0]): Promise<void> {
    console.log(JSON.stringify({ event: "ai_feedback", ...event }));
    return Promise.resolve();
  }
}

export class AIFeedbackService {
  constructor(
    private readonly repository: D1AIFeedbackRepository,
    private readonly provider: FeedbackProvider = new DeterministicMockAIProvider(),
    private readonly moderation: ModerationProvider = new DeterministicMockAIProvider(),
    private readonly telemetry: AIFeedbackTelemetry = new PrivacySafeWorkerTelemetry(),
    private readonly config: AIFeedbackServiceConfig = defaultAIFeedbackConfig(),
    private readonly now: () => Date = () => new Date(),
  ) {}

  async submit(
    userId: string,
    input: SubmitFeedbackInput,
    idempotencyKey: string,
  ): Promise<{ result: SentenceFeedbackResult; telemetry: Promise<void> }> {
    const startedAt = this.now().getTime();
    const failure = (
      errorCode: string,
      canRetry: boolean,
      crisis?: string,
    ) => ({
      result: {
        originalSentence: input.sentenceText,
        missionCompleted: false,
        canRetry,
        reported: false,
        errorCode,
        ...(crisis && { crisisResourceMessage: crisis }),
      },
      telemetry: this.record(errorCode.toLowerCase(), startedAt),
    });
    if (!input.sentenceText) return failure("invalid_input", true);
    if (
      this.config.limits.leaseSeconds * 1_000 <=
      this.config.providerTimeoutMs
    )
      return failure(ERROR.generationDisabled, true);
    let target;
    try {
      target = await this.repository.loadTarget(
        userId,
        input.source,
        input.attemptId,
      );
    } catch (error) {
      if (error instanceof AIFeedbackError && error.code === "target_not_found")
        throw error;
      throw error;
    }
    const validation = validateSentence(input.sentenceText, target);
    if (!validation.ok) return failure(validation.code, true);
    const requestHash = await sha256(
      `${userId}:${input.attemptId}:${target.normalizedWord}:${validation.normalized}:${PROMPT_VERSION}`,
    );
    const idempotency = await this.repository.checkIdempotency(
      userId,
      idempotencyKey,
      requestHash,
    );
    const stored = await this.repository.findAttempt(
      requestHash,
      input.sentenceText,
    );
    if (stored)
      return {
        result: stored,
        telemetry: this.record("replay", startedAt, stored.status),
      };
    if (idempotency === "replay") return failure(ERROR.temporaryFailure, true);

    const reservation = await this.repository.reserve(
      userId,
      this.config.limits,
    );
    if (!reservation.ok)
      return failure(
        reservation.reason === "disabled"
          ? ERROR.generationDisabled
          : ERROR.rateLimited,
        true,
      );

    const totalSignal = AbortSignal.timeout(this.config.providerTimeoutMs);
    const localOutcome = localSafety(validation.normalized);
    let moderationOutcome = localOutcome;
    try {
      moderationOutcome ??= await this.moderation.classify(
        {
          sentenceText: validation.normalized,
          targetWord: target.normalizedWord,
          learnerLevel: target.learnerLevel,
        },
        totalSignal,
      );
    } catch {
      moderationOutcome = "moderation_unavailable";
    }
    if (
      moderationOutcome !== "allowed" &&
      moderationOutcome !== "allowed_sensitive"
    ) {
      await this.repository.release(userId, reservation.leaseId);
      if (moderationOutcome === "self_harm_intervention")
        return failure(ERROR.selfHarm, false, CRISIS_RESOURCE_TEXT);
      if (moderationOutcome === "moderation_unavailable")
        return failure(ERROR.moderationUnavailable, true);
      return failure(ERROR.safetyBlocked, false);
    }

    let pending;
    try {
      pending = await this.repository.createPending(
        userId,
        input,
        target,
        validation.normalized,
        idempotencyKey,
        requestHash,
        this.provider.name,
        this.provider.model,
        reservation.leaseId,
      );
    } catch (error) {
      await this.repository.release(userId, reservation.leaseId);
      throw error;
    }

    let feedback: ProviderFeedback;
    try {
      const initialTask = buildProviderTask(target, validation.normalized);
      const initial = await this.provider.generate(initialTask, totalSignal);
      try {
        feedback = parseProviderFeedback(initial);
      } catch (validationError) {
        const repaired = await this.provider.generate(
          buildProviderTask(target, validation.normalized, {
            validationError:
              validationError instanceof Error
                ? validationError.message
                : "invalid output",
            priorOutput: initial,
          }),
          totalSignal,
        );
        feedback = parseProviderFeedback(repaired);
      }
    } catch {
      await this.repository.finalize(
        userId,
        pending,
        null,
        ERROR.temporaryFailure,
        "AI feedback is temporarily unavailable",
      );
      return {
        result: {
          sentenceId: pending.sentenceId,
          attemptId: pending.attemptId,
          originalSentence: input.sentenceText,
          missionCompleted: false,
          canRetry: true,
          reported: false,
          errorCode: ERROR.temporaryFailure,
        },
        telemetry: this.record("provider_error", startedAt),
      };
    }

    await this.repository.finalize(userId, pending, feedback);
    return {
      result: {
        sentenceId: pending.sentenceId,
        attemptId: pending.attemptId,
        status: feedback.status,
        originalSentence: input.sentenceText,
        ...(feedback.correctedSentence && {
          correctedSentence: feedback.correctedSentence,
        }),
        explanation: feedback.explanation,
        ...(feedback.improvementTip && {
          improvementTip: feedback.improvementTip,
        }),
        missionCompleted: false,
        canRetry: false,
        reported: false,
      },
      telemetry: this.record("success", startedAt, feedback.status),
    };
  }

  async report(
    userId: string,
    attemptId: string,
    reason: string,
    classification?: string,
  ): Promise<void> {
    await this.repository.report(userId, attemptId, reason, classification);
    await this.record("report", this.now().getTime());
  }

  private record(
    outcome: string,
    startedAt: number,
    learningStatus?: string,
  ): Promise<void> {
    return this.telemetry.record({
      outcome,
      provider: this.provider.name,
      model: this.provider.model,
      promptVersion: PROMPT_VERSION,
      schemaVersion: SCHEMA_VERSION,
      release: this.config.release,
      durationMs: Math.max(0, this.now().getTime() - startedAt),
      ...(learningStatus && { learningStatus }),
    });
  }
}

export function defaultAIFeedbackConfig(): AIFeedbackServiceConfig {
  return {
    limits: {
      enabled: true,
      perMinute: 5,
      perDay: 30,
      globalPerDay: 1_000,
      monthlyCostHardStopCents: 0,
      requestCostCents: 0,
      leaseSeconds: 15,
    },
    providerTimeoutMs: 10_000,
    release: "unknown",
  };
}

export function runtimeAIFeedbackConfig(
  env: CloudflareEnv,
): AIFeedbackServiceConfig {
  const disabled = defaultAIFeedbackConfig();
  disabled.limits.enabled = false;
  disabled.release = env.RELEASE;
  try {
    const enabled = String(env.AI_GENERATION_ENABLED);
    if (!["true", "false"].includes(enabled)) return disabled;
    const leaseSeconds = integer(env.AI_GENERATION_LEASE_SECONDS, 5, 60);
    const providerTimeoutMs = integer(env.AI_PROVIDER_TIMEOUT_MS, 100, 10_000);
    if (leaseSeconds * 1_000 <= providerTimeoutMs) return disabled;
    return {
      limits: {
        enabled: enabled === "true",
        perMinute: integer(env.AI_PER_MINUTE, 1, 100),
        perDay: integer(env.AI_PER_DAY, 1, 10_000),
        globalPerDay: integer(env.AI_GLOBAL_PER_DAY, 1, 1_000_000),
        monthlyCostHardStopCents: integer(
          env.AI_MONTHLY_COST_HARD_STOP_CENTS,
          0,
          100_000_000,
        ),
        requestCostCents: integer(env.AI_REQUEST_COST_CENTS, 0, 1_000_000),
        leaseSeconds,
      },
      providerTimeoutMs,
      release: env.RELEASE,
    };
  } catch {
    return disabled;
  }
}

function integer(value: string, minimum: number, maximum: number): number {
  if (!/^\d+$/u.test(value)) throw new Error("invalid integer");
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < minimum || parsed > maximum)
    throw new Error("integer outside allowed range");
  return parsed;
}

async function sha256(value: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(value),
  );
  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}
