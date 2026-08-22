import type { EmailMessage, EmailSender } from "../domain/identity.js";

export interface HttpEmailSenderConfig {
  endpoint: string;
  bearerToken: string;
  from: string;
  timeoutMs?: number;
}

/** Provider-neutral parity adapter for the existing transactional-email HTTP boundary. */
export class HttpEmailSender implements EmailSender {
  private readonly endpoint: string;
  private readonly timeoutMs: number;

  constructor(
    private readonly config: HttpEmailSenderConfig,
    private readonly fetcher: typeof fetch = fetch,
  ) {
    this.endpoint = validEndpoint(config.endpoint);
    if (!config.bearerToken.trim()) throw new Error("email token is required");
    if (!config.from.trim()) throw new Error("email sender is required");
    this.timeoutMs = normalizeTimeout(config.timeoutMs);
  }

  async send(message: EmailMessage): Promise<void> {
    if (!message.to.trim()) throw new Error("email recipient is required");
    if (!message.subject.trim()) throw new Error("email subject is required");
    if (!message.text.trim()) throw new Error("email body is required");
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
        body: JSON.stringify({
          from: this.config.from,
          to: [message.to],
          subject: message.subject,
          text: message.text,
          html: "",
        }),
        signal: AbortSignal.timeout(this.timeoutMs),
      });
    } catch {
      throw new Error("email provider request failed");
    }
    if (!response.ok)
      throw new Error(`email provider returned status ${response.status}`);
    await response.body?.cancel();
  }
}

function validEndpoint(value: string): string {
  const url = new URL(value);
  if (
    url.protocol !== "https:" &&
    !["localhost", "127.0.0.1"].includes(url.hostname)
  )
    throw new Error("email endpoint must use HTTPS");
  return url.toString();
}

function normalizeTimeout(value: number | undefined): number {
  if (value === undefined) return 8_000;
  if (!Number.isInteger(value) || value < 100 || value > 10_000)
    throw new Error("email timeout is out of range");
  return value;
}
