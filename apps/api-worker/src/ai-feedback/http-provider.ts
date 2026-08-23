import type {
  FeedbackProvider,
  ModerationOutcome,
  ModerationProvider,
  ProviderTask,
} from "../domain/ai-feedback.js";

export interface HttpAIProviderConfig {
  endpoint: string;
  bearerToken: string;
  model: string;
  timeoutMs?: number;
}

/** Provider-neutral Web Fetch adapter. Retry/repair policy stays in the service. */
export class HttpAIProvider implements FeedbackProvider, ModerationProvider {
  readonly name = "http";
  readonly model: string;
  private readonly endpoint: string;
  private readonly timeoutMs: number;

  constructor(
    private readonly config: HttpAIProviderConfig,
    private readonly fetcher: typeof fetch = fetch,
  ) {
    const endpoint = new URL(config.endpoint);
    if (
      endpoint.protocol !== "https:" &&
      !["localhost", "127.0.0.1"].includes(endpoint.hostname)
    )
      throw new Error("AI endpoint must use HTTPS");
    if (!config.bearerToken.trim()) throw new Error("AI token is required");
    if (!config.model.trim()) throw new Error("AI model is required");
    this.endpoint = endpoint.toString();
    this.model = config.model;
    this.timeoutMs = timeout(config.timeoutMs);
  }

  async generate(task: ProviderTask, signal: AbortSignal): Promise<unknown> {
    return this.call("feedback", task, signal);
  }

  async classify(
    input: { sentenceText: string; targetWord: string; learnerLevel: string },
    signal: AbortSignal,
  ): Promise<ModerationOutcome> {
    const value = await this.call("moderation", input, signal);
    if (
      typeof value !== "object" ||
      value === null ||
      !("outcome" in value) ||
      ![
        "allowed",
        "allowed_sensitive",
        "blocked",
        "self_harm_intervention",
      ].includes(String(value.outcome))
    )
      throw new Error("AI moderation response is invalid");
    return String(value.outcome) as ModerationOutcome;
  }

  private async call(
    kind: "feedback" | "moderation",
    input: unknown,
    parentSignal: AbortSignal,
  ): Promise<unknown> {
    const signal = AbortSignal.any([
      parentSignal,
      AbortSignal.timeout(this.timeoutMs),
    ]);
    let response: Response;
    try {
      response = await this.fetcher(this.endpoint, {
        method: "POST",
        headers: {
          accept: "application/json",
          authorization: `Bearer ${this.config.bearerToken}`,
          "content-type": "application/json",
          "user-agent": "vocanova-api-worker/1.0",
        },
        body: JSON.stringify({ kind, model: this.model, input }),
        signal,
      });
    } catch {
      throw new Error("AI provider request failed");
    }
    if (!response.ok) {
      await response.body?.cancel();
      throw new Error(`AI provider returned status ${response.status}`);
    }
    try {
      return await response.json();
    } catch {
      throw new Error("AI provider returned malformed JSON");
    }
  }
}

function timeout(value: number | undefined): number {
  if (value === undefined) return 8_000;
  if (!Number.isInteger(value) || value < 100 || value > 8_000)
    throw new Error("AI timeout is out of range");
  return value;
}
