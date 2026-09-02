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
  private readonly bearerToken: string;
  private readonly from: string;

  constructor(
    config: HttpEmailSenderConfig,
    private readonly fetcher: typeof fetch = fetch,
  ) {
    this.endpoint = validEndpoint(config.endpoint);
    this.bearerToken = validSecret(config.bearerToken);
    this.from = validMailbox(config.from, "sender");
    this.timeoutMs = normalizeTimeout(config.timeoutMs);
  }

  async send(message: EmailMessage): Promise<void> {
    const to = validMailbox(message.to, "recipient");
    validText(message.subject, 1, 160, "subject", true);
    validText(message.text, 1, 8_192, "body", false);
    const body = JSON.stringify({
      from: this.from,
      to: [to],
      subject: message.subject,
      text: message.text,
      html: "",
    });
    if (byteLength(body) > 16_384) throw new Error("email request is invalid");

    let response: Response;
    try {
      response = await this.fetcher(this.endpoint, {
        method: "POST",
        redirect: "error",
        headers: {
          accept: "application/json",
          authorization: `Bearer ${this.bearerToken}`,
          "content-type": "application/json",
          "user-agent": "vocanova-api-worker/1.0",
        },
        body,
        signal: AbortSignal.timeout(this.timeoutMs),
      });
    } catch {
      throw new Error("email provider request failed");
    }
    try {
      if (!response.ok) throw new Error("email provider request failed");
    } finally {
      try {
        await response.body?.cancel();
      } catch {
        // Cancellation is best-effort cleanup; provider failures remain generic.
      }
    }
  }
}

function validEndpoint(value: string): string {
  validText(value, 1, 2_048, "endpoint", true);
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error("email endpoint is invalid");
  }
  if (
    url.protocol !== "https:" ||
    !url.hostname ||
    url.port ||
    url.username ||
    url.password ||
    url.search ||
    url.hash
  )
    throw new Error("email endpoint is invalid");
  return url.toString();
}

function validSecret(value: string): string {
  validText(value, 1, 4_096, "token", true);
  return value;
}

function validMailbox(value: string, field: string): string {
  const parts = value.split("@");
  const local = parts[0] ?? "";
  const domain = parts[1] ?? "";
  if (
    byteLength(value) < 3 ||
    byteLength(value) > 254 ||
    parts.length !== 2 ||
    !/^[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+)*$/u.test(
      local,
    ) ||
    !domain.split(".").every(validDomainLabel)
  )
    throw new Error(`email ${field} is invalid`);
  return value;
}

function validDomainLabel(value: string): boolean {
  return /^[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?$/u.test(value);
}

function validText(
  value: string,
  minimum: number,
  maximum: number,
  field: string,
  rejectControls: boolean,
): void {
  const length = byteLength(value);
  if (
    length < minimum ||
    length > maximum ||
    (rejectControls && hasControl(value))
  )
    throw new Error(`email ${field} is invalid`);
}

function hasControl(value: string): boolean {
  return [...value].some((character) => {
    const code = character.codePointAt(0)!;
    return code <= 0x1f || (code >= 0x7f && code <= 0x9f);
  });
}

function byteLength(value: string): number {
  return new TextEncoder().encode(value).byteLength;
}

function normalizeTimeout(value: number | undefined): number {
  if (value === undefined) return 8_000;
  if (!Number.isInteger(value) || value < 100 || value > 10_000)
    throw new Error("email timeout is out of range");
  return value;
}
