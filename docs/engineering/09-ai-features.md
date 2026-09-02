# 09 — VocaNova AI Features

## 1. Current capability

VocaNova evaluates one learner-written sentence against a selected vocabulary item. The Hono API
Worker validates the request, runs safety checks, calls a provider through a narrow interface,
validates the structured response, persists the result in D1, updates daily activity and rewards,
and returns concise feedback. The web application never receives provider credentials or constructs
provider prompts. Normal CI uses deterministic fakes and makes no paid provider calls.

This feature is not a chatbot, essay corrector, pronunciation tool, or general tutor.

## 2. Public flow

The client submits an authenticated, CSRF-protected request with an idempotency key:

```text
POST /api/v1/sentence-feedback
POST /api/v1/sentence-feedback/{attemptId}/reports
```

Submission includes `sentenceText`, its product `source`, and an eligible `attemptId`. The backend
loads the authoritative word and learner level. Input must contain at least 3 words, be at most 300
characters, pass the current Latin-script guard, contain the target word or an accepted form, and
belong to the authenticated learner.

Feedback uses one of three learning statuses:

- `correct`: the target word and sentence are acceptable.
- `needs_improvement`: the meaning is understandable but a focused correction helps.
- `incorrect`: the word meaning or sentence use is substantially wrong or unclear.

A successful result increments `daily_activity_summaries.sentences_submitted` and awards the
sentence and feedback rewards. It does not currently complete a daily mission; the response always has
`missionCompleted: false`.

## 3. Validation and safety

Deterministic validation happens before a provider call. Learner text is untrusted data, including
text that looks like an instruction. Local checks and the moderation boundary distinguish allowed,
allowed-sensitive, blocked, self-harm-intervention, and moderation-unavailable outcomes. Raw
provider refusals and internal safety labels are not shown to learners. Crisis outcomes return the
configured public resource message.

Learner text, corrected sentences, prompt contents, credentials, and raw provider output must not
appear in normal logs or metric labels.

## 4. Provider boundary

`FeedbackProvider.generate` accepts a provider-neutral task containing versioned system/developer
instructions, a structured learner payload, output schema, token/temperature limits, and explicit
no-web/no-tools/no-memory settings. A separate `ModerationProvider` handles classification. Provider
SDK types stay inside adapters.

The current structured provider result contains:

```ts
type ProviderFeedback = {
  status: "correct" | "needs_improvement" | "incorrect";
  targetWordUsedCorrectly: boolean;
  correctedSentence?: string;
  explanation: string;
  improvementTip?: string;
};
```

Explanation and improvement tip are each limited to 200 characters. The backend checks required
fields, enum values, lengths, and status/target-use consistency. Provider output cannot control IDs,
ownership, rewards, persistence, or public retry behavior.

## 5. Teaching behavior

Feedback prioritizes target-word meaning and use, then grammar tied to that word, problems that
block understanding, and major unnatural phrasing. It preserves the learner's intended meaning and
normally explains one central issue. Correct sentences are not rewritten merely to sound more
advanced, and standard regional variants are accepted.

The saved A2/B1 level changes explanation style, not correctness. Feedback must be concise,
supportive, and honest; it must not shame the learner, reveal hidden instructions, claim formal CEFR
assessment, or present AI guidance as infallible.

## 6. Processing and persistence

The request lifecycle is synchronous: authenticate and authorize → load target → normalize and
validate → enforce rate/idempotency controls → moderate → call provider → validate output →
finalize the attempt, learner sentence, activity count, and rewards → emit privacy-safe telemetry →
return the result.

D1 records pending/succeeded/failed/cancelled attempt state internally. An idempotency key and
fingerprint deduplicate requests; a per-user lease prevents concurrent generation. Stored feedback
is reused for a matching completed request. Failures preserve a retryable public outcome where
appropriate and do not award successful-feedback activity or rewards.

## 7. Runtime controls

The Worker enforces configurable per-user minute and daily request limits, a global daily limit, a
monthly hard stop, one active generation lease per user, idempotency, and an AI enable switch. The
provider call is bounded by `AI_PROVIDER_TIMEOUT_MS`; current environment configurations set it to
10 seconds. Structured output gets at most one constrained repair attempt.

Before enabling a paid provider, operators must separately verify privacy/retention terms, secret
configuration, cost ceilings, quality evaluation, logging, and rollback. Those operational actions
are not performed by repository CI.

## 8. Reporting

The current web UI exposes a generic report action. The API stores a bounded `reason` and optional
bounded `classification` for the owned attempt, then returns `204`. Reports do not replace or alter
the learning result, and the current schema has no report lifecycle enum.

## 9. Public feedback result contract

The API client and OpenAPI schema define this result:

```ts
type SentenceFeedbackResult = {
  sentenceId?: string;
  attemptId?: string;
  status?: "correct" | "needs_improvement" | "incorrect";
  originalSentence: string;
  correctedSentence?: string;
  explanation?: string;
  improvementTip?: string;
  missionCompleted: boolean;
  canRetry: boolean;
  reported: boolean;
  errorCode?: string;
  errorMessage?: string;
  crisisResourceMessage?: string;
};
```

IDs and learning status are present when a corresponding stored result exists. Validation,
moderation, provider, disabled/rate-limit, and crisis outcomes can instead use the business-level
error fields in the same HTTP-success envelope. Callers must also handle ordinary HTTP problem
responses for authentication, ownership, malformed idempotency, and report errors.

## 10. Contract and test sources

The exact source files are:

- `apps/api-worker/src/domain/ai-feedback.ts` for domain and provider types
- `apps/api-worker/src/ai-feedback/service.ts` for orchestration and public outcomes
- `apps/api-worker/src/ai-feedback/repository.ts` for D1 persistence and rewards
- `apps/api-worker/src/ai-feedback/routes.ts` for Zod/OpenAPI routes
- `packages/api-client/src/index.ts` for the public TypeScript client

Tests cover deterministic validation, moderation outcomes, prompt injection, structured-output
repair, idempotency, rate/lease controls, persistence, reporting, privacy-safe telemetry, and API
contract behavior.
