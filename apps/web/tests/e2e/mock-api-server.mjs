// mock API server for the
// e2e harness.
//
// The server supplies deterministic JSON fixtures for every browser-tested
// core-loop page: Discover, Word Detail, Reviews, Progress, Onboarding,
// Settings, and Account Settings. Accessibility scans use the read paths;
// unsupported writes return 404.
//
// The full-flow suite extends the server with the mutation
// surface the end-to-end flow needs against the same
// Playwright install: magic-link request/consume (issuing a
// session cookie + double-submit CSRF cookie), onboarding
// completion, save / unsave, review submission, deterministic
// AI sentence feedback, settings PATCH, and logout. The session
// cookie is `vocanova_session`; the CSRF cookie is
// `vocanova_csrf`. Mutations (POST/PATCH/DELETE) require the
// `X-CSRF-Token` header to match the `vocanova_csrf` cookie
// value, matching the active API Worker's CSRF contract. The
// /api/v1/auth/* routes are exempt because they predate /
// establish the session.
//
// State (saved words, completed onboarding, per-session
// settings, per-session progress) is tracked in memory keyed by
// the session cookie value. The server is single-process and
// the full-flow suite runs as a single worker (`workers: 1` in
// playwright.config.ts), so the in-memory state is consistent
// across the test run and is reset on server restart. The
// accessibility scan specs do not mutate state, so the
// per-session default fixtures continue to apply to them.
//
// AI feedback is deterministic: a fixed rule table based on the
// input sentence (length, presence of the target word, blank).
// This is a deterministic AI adapter, not a paid or
// nondeterministic provider call.
//
// Endpoints:
//
//   GET    /healthz                                 -> 200 { status: "ok" }
//
//   GET    /api/v1/me                                -> 200 CurrentUser
//             401 if ?fail=me (auth-gate test path)
//             onboardingStatus overridden by the
//             `e2e_onboarding_status` cookie when present
//
//   GET    /api/v1/onboarding                        -> 200 OnboardingProfile
//   POST   /api/v1/onboarding                        -> 200 OnboardingProfile
//                                                       (sets onboardingStatus
//                                                        = "completed" in /me)
//
//   POST   /api/v1/auth/magic-links                  -> 200 (no CSRF check)
//   POST   /api/v1/auth/magic-links/consume          -> 200 CurrentUser
//                                                       (sets session + CSRF
//                                                        cookies; exempt from
//                                                        CSRF check)
//   POST   /api/v1/auth/oauth/google/start          -> 200 { url: ... }
//   POST   /api/v1/auth/logout                       -> 204
//                                                       (clears session cookie)
//
//   GET    /api/v1/user-words                        -> 200 { items, nextCursor }
//   POST   /api/v1/user-words                        -> 200 SavedMeaning
//   DELETE /api/v1/user-words/:meaningId             -> 204
//
//   GET    /api/v1/reviews/due                       -> 200 { items, nextCursor, totalCount }
//   POST   /api/v1/reviews/submissions               -> 200 ReviewAttempt
//
//   POST   /api/v1/sentence-feedback                 -> 200 SentenceFeedbackResult
//                                                       (deterministic rule table)
//   POST   /api/v1/sentence-feedback/:attemptId/reports -> 204
//
//   GET    /api/v1/daily-mission                     -> 200 DailyMission
//   GET    /api/v1/progress                          -> 200 Progress
//             `e2e_progress_fixture=first-mission` returns authoritative
//             zero totals and no completion history for first-time progress
//
//   GET    /api/v1/journey-situations                -> 200 { items: [...] }
//             `e2e_journey_fixture=empty` returns an empty catalog
//   GET    /api/v1/journey-situations/:slug          -> 200 SituationResponse
//             `e2e_situation_fixture=empty` returns an empty word list
//   GET    /api/v1/canonical-words/:slug             -> 200 WordDetailResponse
//             `e2e_word_detail_fixture=empty-meanings` returns a valid word
//             with no meanings
//             one 500 per session for discovery or reviews when the
//             `e2e_read_failure` cookie names that fixture; used to prove
//             route-boundary retry behavior against a real recovered request
//             holds one discovery or review read per session when the
//             `e2e_read_hold` cookie names that fixture; the E2E-only
//             release endpoint makes loading-state assertions deterministic
//
//   GET    /api/v1/settings                          -> 200 Settings
//   PATCH  /api/v1/settings                          -> 200 Settings
//             `e2e_settings_patch_failure=retry` fails the first settings
//             write per session; `e2e_settings_patch_hold=1` holds it until
//             the E2E-only release endpoint is called
//
//   POST   /api/v1/settings/email-change-links       -> 204
//   POST   /api/v1/settings/email-change-links/consume -> 200 ConsumeEmailChangeLinkResult
//             the `e2e_email_change_failure=retry` fixture fails each write
//             once per session; `e2e_email_change_hold=request` holds the
//             first request until the E2E-only release endpoint is called
//
//   POST   /api/v1/account-deletion-requests         -> 200 CreateAccountDeletionRequestResult
//             `e2e_account_deletion_failure=retry` fails the first deletion
//             write per session; `e2e_account_deletion_hold=1` holds it until
//             the E2E-only release endpoint is called
//
// Anything else returns 404. Mutations without a matching
// X-CSRF-Token return 403 (matches the Worker API contract).
// Mutations on /api/v1/auth/* are exempt.
// The server logs each request to stderr so a CI failure's
// log can be matched against the harness's expectations
// without enabling extra debug output.

import { createServer } from "node:http";

const PORT = Number(process.env.MOCK_API_PORT ?? 8080);
const HOST = process.env.MOCK_API_HOST ?? "127.0.0.1";

const ONBOARDING_STATUSES = new Set([
  "not_started",
  "in_progress",
  "completed",
]);
const WORD_DETAIL_REVIEW_STATES = new Map([
  ["unsaved", null],
  ["due", "due"],
  ["new", "new"],
  ["learning", "learning"],
  ["reviewing", "reviewing"],
  ["mastered", "mastered"],
  ["not-reviewing", "not_reviewing"],
]);

const SESSION_COOKIE_NAME = "vocanova_session";
const CSRF_COOKIE_NAME = "vocanova_csrf";
const SESSION_DEFAULT_VALUE = "test-session-default";

const DEFAULT_USER = {
  email: "core-loop-fixture@example.test",
  displayName: "Core Loop Fixture",
  emailVerifiedAt: "2026-01-01T00:00:00Z",
};

const LONG_CONTENT_TOKEN = "a".repeat(300);

const LONG_WORD_DETAIL_TARGET = `word-${"a".repeat(289)}`;
const LONG_REVIEW_CONTENT = "a".repeat(300);
const LONG_ACCOUNT_EMAIL = `${"a".repeat(64)}@example.test`;

const LONG_SAVED_CONTENT = "a".repeat(300);

const DEFAULT_SETTINGS = {
  dailyReviewTarget: 20,
  reviewIntervalPreset: "vocanova_default",
  appLanguage: "en",
  notificationsEnabled: true,
  marketingEmailsEnabled: false,
  displayName: DEFAULT_USER.displayName,
};

const DEFAULT_PROGRESS = {
  confidencePointsBalance: 120,
  streak: {
    currentStreakCount: 3,
    longestStreakCount: 7,
    status: "active",
    graceDayBalance: 1,
  },
  completionHistory: [
    { localDate: "2026-01-01", completed: true },
    { localDate: "2026-01-02", completed: true },
    { localDate: "2026-01-03", completed: true },
    { localDate: "2026-01-04", completed: false },
    { localDate: "2026-01-05", completed: false },
    { localDate: "2026-01-06", completed: false },
    { localDate: "2026-01-07", completed: false },
  ],
};

const FIRST_MISSION_PROGRESS = {
  confidencePointsBalance: 0,
  streak: {
    currentStreakCount: 0,
    longestStreakCount: 0,
    status: "broken",
    graceDayBalance: 0,
  },
  completionHistory: [],
};

const DEFAULT_DAILY_MISSION = {
  localDate: "2026-01-01",
  timezone: "UTC",
  reviewTarget: 20,
  reviewsCompleted: 0,
  newWordTarget: 5,
  newWordsCompleted: 0,
  sentencePracticeTarget: 3,
  sentencePracticesCompleted: 0,
  policyVersion: "core-loop-fixture-v1",
  status: "open",
  graceApplied: false,
  streak: DEFAULT_PROGRESS.streak,
};

const TRUNCATED_SAVED_WORDS_RESPONSE = {
  items: [
    {
      userWordId: "e2e-preview-user-word-01",
      meaningId: "e2e-preview-meaning-01",
      wordId: "e2e-preview-word-01",
      wordSlug: "arrival",
      wordText: "arrival",
      partOfSpeech: "noun",
      shortDefinition: "the act of reaching a place",
      status: "saved",
      source: "journey",
      saved: true,
      addedAt: "2026-01-10T00:00:00.000Z",
    },
    {
      userWordId: "e2e-preview-user-word-02",
      meaningId: "e2e-preview-meaning-02",
      wordId: "e2e-preview-word-02",
      wordSlug: "baggage",
      wordText: "baggage",
      partOfSpeech: "noun",
      shortDefinition: "bags carried while travelling",
      status: "saved",
      source: "journey",
      saved: true,
      addedAt: "2026-01-09T00:00:00.000Z",
    },
    {
      userWordId: "e2e-preview-user-word-03",
      meaningId: "e2e-preview-meaning-03",
      wordId: "e2e-preview-word-03",
      wordSlug: "counter",
      wordText: "counter",
      partOfSpeech: "noun",
      shortDefinition: "a long flat surface for service",
      status: "saved",
      source: "journey",
      saved: true,
      addedAt: "2026-01-08T00:00:00.000Z",
    },
    {
      userWordId: "e2e-preview-user-word-04",
      meaningId: "e2e-preview-meaning-04",
      wordId: "e2e-preview-word-04",
      wordSlug: "departure",
      wordText: "departure",
      partOfSpeech: "noun",
      shortDefinition: "the act of leaving a place",
      status: "saved",
      source: "journey",
      saved: true,
      addedAt: "2026-01-07T00:00:00.000Z",
    },
    {
      userWordId: "e2e-preview-user-word-05",
      meaningId: "e2e-preview-meaning-05",
      wordId: "e2e-preview-word-05",
      wordSlug: "gate",
      wordText: "gate",
      partOfSpeech: "noun",
      shortDefinition: "the place where passengers board",
      status: "saved",
      source: "journey",
      saved: true,
      addedAt: "2026-01-06T00:00:00.000Z",
    },
    {
      userWordId: "e2e-preview-user-word-06",
      meaningId: "e2e-preview-meaning-06",
      wordId: "e2e-preview-word-06",
      wordSlug: "luggage",
      wordText: "luggage",
      partOfSpeech: "noun",
      shortDefinition: "bags used for travelling",
      status: "saved",
      source: "journey",
      saved: true,
      addedAt: "2026-01-05T00:00:00.000Z",
    },
    {
      userWordId: "e2e-preview-user-word-07",
      meaningId: "e2e-preview-meaning-07",
      wordId: "e2e-preview-word-07",
      wordSlug: "passport",
      wordText: "passport",
      partOfSpeech: "noun",
      shortDefinition: "an official document for international travel",
      status: "saved",
      source: "journey",
      saved: true,
      addedAt: "2026-01-04T00:00:00.000Z",
    },
    {
      userWordId: "e2e-preview-user-word-08",
      meaningId: "e2e-preview-meaning-08",
      wordId: "e2e-preview-word-08",
      wordSlug: "queue",
      wordText: "queue",
      partOfSpeech: "noun",
      shortDefinition: "a line of people waiting",
      status: "saved",
      source: "journey",
      saved: true,
      addedAt: "2026-01-03T00:00:00.000Z",
    },
    {
      userWordId: "e2e-preview-user-word-09",
      meaningId: "e2e-preview-meaning-09",
      wordId: "e2e-preview-word-09",
      wordSlug: "reservation",
      wordText: "reservation",
      partOfSpeech: "noun",
      shortDefinition: "an arrangement to keep a place",
      status: "saved",
      source: "journey",
      saved: true,
      addedAt: "2026-01-02T00:00:00.000Z",
    },
    {
      userWordId: "e2e-preview-user-word-10",
      meaningId: "e2e-preview-meaning-10",
      wordId: "e2e-preview-word-10",
      wordSlug: "terminal",
      wordText: "terminal",
      partOfSpeech: "noun",
      shortDefinition: "an airport building for passengers",
      status: "saved",
      source: "journey",
      saved: true,
      addedAt: "2026-01-01T00:00:00.000Z",
    },
  ],
  nextCursor: "e2e-saved-words-after-10",
};

const LONG_SAVED_WORDS_RESPONSE = {
  items: [
    {
      ...TRUNCATED_SAVED_WORDS_RESPONSE.items[0],
      wordText: `word-${LONG_SAVED_CONTENT}`,
      partOfSpeech: `part-${LONG_SAVED_CONTENT}`,
      shortDefinition: `A definition containing ${LONG_SAVED_CONTENT}.`,
    },
  ],
};

const SAVED_LIBRARY_PAGE_TWO = [
  {
    ...TRUNCATED_SAVED_WORDS_RESPONSE.items[0],
    userWordId: "e2e-library-user-word-11",
    meaningId: "mean-pour",
    wordId: "word-pour",
    wordSlug: "pour",
    wordText: "pour",
    partOfSpeech: "verb",
    shortDefinition: "to make liquid flow into a container",
  },
  {
    ...TRUNCATED_SAVED_WORDS_RESPONSE.items[1],
    userWordId: "e2e-library-user-word-12",
    meaningId: "e2e-library-meaning-12",
    wordSlug: "later-word",
    wordText: "later word",
    shortDefinition: "a saved word from a later page",
  },
  {
    ...TRUNCATED_SAVED_WORDS_RESPONSE.items[0],
    userWordId: "e2e-library-bank-river",
    meaningId: "mean-bank-river",
    wordId: "word-bank",
    wordSlug: "bank",
    wordText: "bank",
    shortDefinition: "land beside a river",
  },
  {
    ...TRUNCATED_SAVED_WORDS_RESPONSE.items[1],
    userWordId: "e2e-library-bank-money",
    meaningId: "mean-bank-money",
    wordId: "word-bank",
    wordSlug: "bank",
    wordText: "bank",
    shortDefinition: "a financial institution",
  },
];

const MULTIPLE_CHOICE_DUE_WORDS = [
  {
    userWordId: "e2e-review-user-word-arrival",
    meaningId: "e2e-review-meaning-arrival",
    wordId: "e2e-review-word-arrival",
    wordSlug: "arrival",
    wordText: "arrival",
    partOfSpeech: "noun",
    shortDefinition: "the act of reaching a place",
    status: "due",
    reviewStep: 0,
  },
  {
    userWordId: "e2e-review-user-word-baggage",
    meaningId: "e2e-review-meaning-baggage",
    wordId: "e2e-review-word-baggage",
    wordSlug: "baggage",
    wordText: "baggage",
    partOfSpeech: "noun",
    shortDefinition: "bags carried while travelling",
    status: "due",
    reviewStep: 0,
  },
  {
    userWordId: "e2e-review-user-word-counter",
    meaningId: "e2e-review-meaning-counter",
    wordId: "e2e-review-word-counter",
    wordSlug: "counter",
    wordText: "counter",
    partOfSpeech: "noun",
    shortDefinition: "a long flat surface for service",
    status: "due",
    reviewStep: 0,
  },
  {
    userWordId: "e2e-review-user-word-departure",
    meaningId: "e2e-review-meaning-departure",
    wordId: "e2e-review-word-departure",
    wordSlug: "departure",
    wordText: "departure",
    partOfSpeech: "noun",
    shortDefinition: "the act of leaving a place",
    status: "due",
    reviewStep: 0,
  },
];

const CANONICAL_WORDS = {
  bank: {
    id: "word-bank",
    text: "bank",
    slug: "bank",
    wordType: "noun",
    meanings: [
      { id: "mean-bank-river", partOfSpeech: "noun", shortDefinition: "land beside a river", saved: false, examples: [], usageNotes: [] },
      { id: "mean-bank-money", partOfSpeech: "noun", shortDefinition: "a financial institution", saved: false, examples: [], usageNotes: [] },
    ],
  },
  pour: {
    id: "word-pour",
    text: "pour",
    slug: "pour",
    wordType: "verb",
    difficultyLevel: "A2",
    meanings: [
      {
        id: "mean-pour",
        partOfSpeech: "verb",
        shortDefinition: "to make liquid flow into a container",
        saved: false,
        examples: [
          {
            id: "ex-pour-1",
            exampleText: "Could you pour me a cup of coffee?",
          },
        ],
        usageNotes: [
          {
            id: "note-pour-1",
            noteType: "register",
            noteText: "Common in everyday service contexts.",
          },
        ],
      },
    ],
  },
};

const JOURNEY_SITUATIONS = [
  {
    id: "sit-cafe",
    slug: "ordering-at-a-cafe",
    title: "Ordering at a cafe",
    shortDescription: "Polite everyday phrases for your morning coffee.",
    levelBand: "A1",
    category: "daily_life",
    displayOrder: 1,
  },
  {
    id: "sit-airport",
    slug: "navigating-an-airport",
    title: "Navigating an airport",
    shortDescription: "Check-in, security, and boarding conversations.",
    levelBand: "A2",
    category: "travel",
    displayOrder: 2,
  },
];

const SITUATIONS_BY_SLUG = {
  "ordering-at-a-cafe": {
    situation: JOURNEY_SITUATIONS[0],
    meanings: [
      {
        meaningId: "mean-pour",
        wordId: CANONICAL_WORDS.pour.id,
        wordSlug: CANONICAL_WORDS.pour.slug,
        wordText: CANONICAL_WORDS.pour.text,
        partOfSpeech: "verb",
        shortDefinition: "to make liquid flow into a container",
        saved: false,
      },
      {
        meaningId: "mean-counter",
        wordId: "word-counter",
        wordSlug: "counter",
        wordText: "counter",
        partOfSpeech: "noun",
        shortDefinition: "a long flat surface for service",
        saved: false,
      },
    ],
  },
  "navigating-an-airport": {
    situation: JOURNEY_SITUATIONS[1],
    meanings: [],
  },
};

function parseCookies(header) {
  const cookies = {};
  if (!header) {
    return cookies;
  }
  for (const part of header.split(";")) {
    const idx = part.indexOf("=");
    if (idx === -1) {
      continue;
    }
    const key = part.slice(0, idx).trim();
    const value = part.slice(idx + 1).trim();
    if (key) {
      cookies[key] = decodeURIComponent(value);
    }
  }
  return cookies;
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => {
      const raw = Buffer.concat(chunks).toString("utf8");
      if (!raw) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(raw));
      } catch (error) {
        reject(error);
      }
    });
    req.on("error", reject);
  });
}

function jsonResponse(res, status, body, extraHeaders) {
  const payload = body === undefined ? "" : JSON.stringify(body);
  const headers = {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  };
  if (body !== undefined) {
    headers["Content-Length"] = Buffer.byteLength(payload);
  }
  if (extraHeaders) {
    for (const [key, value] of Object.entries(extraHeaders)) {
      headers[key] = value;
    }
  }
  res.writeHead(status, headers);
  res.end(payload);
}

function emptyResponse(res, status, extraHeaders) {
  const headers = {
    "Cache-Control": "no-store",
  };
  if (extraHeaders) {
    for (const [key, value] of Object.entries(extraHeaders)) {
      headers[key] = value;
    }
  }
  res.writeHead(status, headers);
  res.end();
}

function buildSessionCookie(value) {
  // `HttpOnly` is intentionally omitted because the frontend's
  // `getCookieValue("vocanova_session")` is never called - the
  // frontend only reads the CSRF cookie. Session stays server-side
  // only. The active API Worker's session cookie is HttpOnly; mirroring
  // that here would force the mock to track an extra auth
  // relationship for the same security guarantee.
  return `${SESSION_COOKIE_NAME}=${value}; Path=/; SameSite=Lax`;
}

function buildCsrfCookie(value) {
  // CSRF cookie is intentionally NOT HttpOnly so the frontend can
  // read it via document.cookie and echo it back as X-CSRF-Token.
  return `${CSRF_COOKIE_NAME}=${value}; Path=/; SameSite=Lax`;
}

function buildClearSessionCookie() {
  return `${SESSION_COOKIE_NAME}=; Path=/; Max-Age=0; SameSite=Lax`;
}

// --- per-session mutable state ---------------------------------

const sessions = new Map();

function getSessionState(cookies) {
  const sessionId = cookies[SESSION_COOKIE_NAME] ?? SESSION_DEFAULT_VALUE;
  let state = sessions.get(sessionId);
  if (!state) {
    state = createInitialState();
    sessions.set(sessionId, state);
  }
  return state;
}

function createInitialState() {
  return {
    onboardingCompleted: true,
    savedMeaningIds: new Set(),
    libraryRemovedMeaningIds: new Set(),
    // A meaning enters reviewedMeaningIds after a successful
    // review submission. The /api/v1/reviews/due response is
    // `savedMeaningIds - reviewedMeaningIds` so the review
    // session's "advance" refetch (which fires when the last
    // card is rated) returns an empty list and the page
    // transitions to the "all caught up" state, mirroring the
    // API contract's review-step advance.
    reviewedMeaningIds: new Set(),
    settings: { ...DEFAULT_SETTINGS },
    progress: cloneProgress(DEFAULT_PROGRESS),
    dailyMission: { ...DEFAULT_DAILY_MISSION },
    reviewAttempts: [],
    reviewAttemptsByClientAttemptId: new Map(),
    sentenceAttempts: [],
    feedbackTargets: new Map(),
    lastReviewAttemptId: null,
    sentenceCount: 0,
    reviewedCount: 0,
    consumedReadFailureFixtures: new Set(),
    readFailureFixtureAttempts: new Map(),
    readHolds: new Map(),
    readHoldAttempts: new Map(),
    consumedSettingsPatchFailure: false,
    settingsPatchHold: null,
    consumedAccountDeletionFailure: false,
    accountDeletionHold: null,
    consumedEmailChangeFailures: new Set(),
    emailChangeHolds: new Map(),
    completionSummaryDueFetches: 0,
  };
}

function consumeReadFailureFixture(state, cookies, fixture, after = 0) {
  if (
    cookies.e2e_read_failure !== fixture ||
    state.consumedReadFailureFixtures.has(fixture)
  )
    return false;
  const attempts = (state.readFailureFixtureAttempts.get(fixture) ?? 0) + 1;
  state.readFailureFixtureAttempts.set(fixture, attempts);
  if (attempts <= after) return false;
  state.consumedReadFailureFixtures.add(fixture);
  return true;
}

function waitForReadHold(state, cookies, fixture) {
  if (cookies.e2e_read_hold !== fixture) {
    return null;
  }

  let hold = state.readHolds.get(fixture);
  if (!hold) {
    let release;
    const promise = new Promise((resolve) => {
      release = resolve;
    });
    hold = { promise, release, released: false };
    state.readHolds.set(fixture, hold);
  }

  return hold.released ? null : hold.promise;
}

function waitForReadHoldAfter(state, cookies, fixture, after) {
  const attempts = (state.readHoldAttempts.get(fixture) ?? 0) + 1;
  state.readHoldAttempts.set(fixture, attempts);
  return attempts > after ? waitForReadHold(state, cookies, fixture) : null;
}

function releaseReadHold(state, fixture) {
  const hold = state.readHolds.get(fixture);
  if (!hold || hold.released) {
    return false;
  }

  hold.released = true;
  hold.release();
  return true;
}

function waitForSettingsPatchHold(state, cookies) {
  if (cookies.e2e_settings_patch_hold !== "1") {
    return null;
  }

  if (!state.settingsPatchHold) {
    let release;
    const promise = new Promise((resolve) => {
      release = resolve;
    });
    state.settingsPatchHold = { promise, release, released: false };
  }

  return state.settingsPatchHold.released
    ? null
    : state.settingsPatchHold.promise;
}

function releaseSettingsPatchHold(state) {
  const hold = state.settingsPatchHold;
  if (!hold || hold.released) {
    return false;
  }
  hold.released = true;
  hold.release();
  return true;
}

function waitForAccountDeletionHold(state, cookies) {
  if (cookies.e2e_account_deletion_hold !== "1") {
    return null;
  }

  if (!state.accountDeletionHold) {
    let release;
    const promise = new Promise((resolve) => {
      release = resolve;
    });
    state.accountDeletionHold = { promise, release, released: false };
  }

  return state.accountDeletionHold.released
    ? null
    : state.accountDeletionHold.promise;
}

function releaseAccountDeletionHold(state) {
  const hold = state.accountDeletionHold;
  if (!hold || hold.released) {
    return false;
  }

  hold.released = true;
  hold.release();
  return true;
}

function consumeEmailChangeFailure(state, cookies, phase) {
  if (
    cookies.e2e_email_change_failure !== "retry" ||
    state.consumedEmailChangeFailures.has(phase)
  ) {
    return false;
  }

  state.consumedEmailChangeFailures.add(phase);
  return true;
}

function waitForEmailChangeHold(state, cookies, phase) {
  if (cookies.e2e_email_change_hold !== phase) {
    return null;
  }

  let hold = state.emailChangeHolds.get(phase);
  if (!hold) {
    let release;
    const promise = new Promise((resolve) => {
      release = resolve;
    });
    hold = { promise, release, released: false };
    state.emailChangeHolds.set(phase, hold);
  }

  return hold.released ? null : hold.promise;
}

function releaseEmailChangeHold(state, phase) {
  const hold = state.emailChangeHolds.get(phase);
  if (!hold || hold.released) {
    return false;
  }

  hold.released = true;
  hold.release();
  return true;
}

function cloneProgress(progress) {
  return {
    confidencePointsBalance: progress.confidencePointsBalance,
    streak: { ...progress.streak },
    completionHistory: progress.completionHistory.map((day) => ({ ...day })),
  };
}

function buildCurrentUser(state, cookies = {}) {
  return {
    email:
      cookies.e2e_account_email_fixture === "long"
        ? LONG_ACCOUNT_EMAIL
        : DEFAULT_USER.email,
    displayName: state.settings.displayName,
    emailVerifiedAt: DEFAULT_USER.emailVerifiedAt,
    onboardingStatus: state.onboardingCompleted ? "completed" : "not_started",
  };
}

function buildSettings(state) {
  return { ...state.settings };
}

function buildProgress(state) {
  return cloneProgress(state.progress);
}

function buildDailyMission(state) {
  const streak = { ...state.progress.streak };
  return {
    ...state.dailyMission,
    reviewsCompleted: state.reviewedCount,
    streak,
  };
}

function buildSavedWords(state) {
  const items = [];
  for (const meaningId of state.savedMeaningIds) {
    const word = CANONICAL_WORDS.pour;
    const meaning = word.meanings.find((m) => m.id === meaningId);
    if (!meaning) {
      continue;
    }
    items.push({
      userWordId: `uw-${meaningId}`,
      meaningId: meaning.id,
      wordId: word.id,
      wordSlug: word.slug,
      wordText: word.text,
      partOfSpeech: meaning.partOfSpeech,
      shortDefinition: meaning.shortDefinition,
      status: "saved",
      source: "journey",
      saved: true,
      addedAt: new Date().toISOString(),
    });
  }
  return { items, nextCursor: undefined };
}

function buildDueWords(state, fixture) {
  if (fixture === "long-content") {
    const items = MULTIPLE_CHOICE_DUE_WORDS.map((word, index) => ({
      ...word,
      wordText: `word-${LONG_REVIEW_CONTENT}`,
      partOfSpeech: `part-${LONG_REVIEW_CONTENT}`,
      shortDefinition: `${index === 0 ? "correct" : `option-${index}`}-${LONG_REVIEW_CONTENT}`,
    }));
    return { items, nextCursor: undefined, totalCount: items.length };
  }
  if (fixture === "completion-summary") {
    const page = state.completionSummaryDueFetches;
    state.completionSummaryDueFetches += 1;
    const start = page * 2;
    const items = MULTIPLE_CHOICE_DUE_WORDS.slice(start, start + 2);
    return {
      items,
      nextCursor:
        start + items.length < MULTIPLE_CHOICE_DUE_WORDS.length
          ? `completion-summary-${page + 1}`
          : undefined,
      totalCount: Math.max(0, MULTIPLE_CHOICE_DUE_WORDS.length - start),
    };
  }
  if (fixture === "multiple-choice") {
    return {
      items: MULTIPLE_CHOICE_DUE_WORDS,
      nextCursor: undefined,
      totalCount: MULTIPLE_CHOICE_DUE_WORDS.length,
    };
  }
  const items = [];
  for (const meaningId of state.savedMeaningIds) {
    if (state.reviewedMeaningIds.has(meaningId)) {
      continue;
    }
    const word = CANONICAL_WORDS.pour;
    const meaning = word.meanings.find((m) => m.id === meaningId);
    if (!meaning) {
      continue;
    }
    items.push({
      userWordId: `uw-${meaningId}`,
      meaningId: meaning.id,
      wordId: word.id,
      wordSlug: word.slug,
      wordText: word.text,
      partOfSpeech: meaning.partOfSpeech,
      shortDefinition: meaning.shortDefinition,
      status: "due",
      reviewStep: 0,
    });
  }
  return {
    items,
    nextCursor: undefined,
    totalCount: items.length,
  };
}

function buildWordDetailResponse(state, slug, selectedFixture, wordFixture) {
  const word = CANONICAL_WORDS[slug];
  if (!word) {
    return null;
  }
  const hasSelectedFixture = WORD_DETAIL_REVIEW_STATES.has(selectedFixture);
  const selectedReviewState = hasSelectedFixture
    ? WORD_DETAIL_REVIEW_STATES.get(selectedFixture)
    : undefined;
  const contentWord =
    wordFixture === "long-content"
      ? {
          ...word,
          text: LONG_WORD_DETAIL_TARGET,
          meanings: word.meanings.map((meaning) => ({
            ...meaning,
            shortDefinition: `definition-${LONG_CONTENT_TOKEN}`,
            learnerDefinition: `learner-${LONG_CONTENT_TOKEN}`,
            examples: meaning.examples.map((example) => ({
              ...example,
              exampleText: `example-${LONG_CONTENT_TOKEN}`,
            })),
            usageNotes: meaning.usageNotes.map((note) => ({
              ...note,
              noteText: `note-${LONG_CONTENT_TOKEN}`,
            })),
          })),
        }
      : word;
  const meanings =
    wordFixture === "empty-meanings"
      ? []
      : contentWord.meanings.map((meaning) => {
          const statefulSaved = state.savedMeaningIds.has(meaning.id);
          const saved = hasSelectedFixture
            ? selectedReviewState !== null
            : statefulSaved;
          return {
            ...meaning,
            saved,
            userWordId: saved ? `uw-${meaning.id}` : undefined,
            reviewState: hasSelectedFixture
              ? selectedReviewState
              : statefulSaved
                ? "due"
                : null,
          };
        });
  for (const meaning of meanings) {
    if (meaning.userWordId) {
      state.feedbackTargets.set(meaning.userWordId, contentWord.text);
    }
  }
  return {
    word: {
      ...contentWord,
      meanings,
    },
  };
}

function buildSituationResponse(state, slug, selectedFixture) {
  const situationFixture = SITUATIONS_BY_SLUG[slug];
  if (!situationFixture) {
    return null;
  }
  return {
    situation: situationFixture.situation,
    meanings:
      selectedFixture === "empty"
        ? []
        : situationFixture.meanings.map((meaning) => ({
            ...meaning,
            saved: state.savedMeaningIds.has(meaning.meaningId),
          })),
  };
}

function buildJourneySituations(fixture, after) {
  if (fixture === "empty") {
    return { items: [] };
  }
  if (fixture === "paginated") {
    if (after === "e2e-journey-page-2") {
      return { items: [JOURNEY_SITUATIONS[1]] };
    }
    return { items: [JOURNEY_SITUATIONS[0]], nextCursor: "e2e-journey-page-2" };
  }
  return { items: JOURNEY_SITUATIONS.map((s) => ({ ...s })) };
}

function generateId(prefix) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}-${Date.now().toString(36)}`;
}

function reviewRewardForRating(rating) {
  return { again: 1, hard: 2, good: 5, easy: 6 }[rating] ?? 0;
}

// --- deterministic AI feedback --------------------------------

function evaluateSentenceFeedback({ sentence, targetWord }) {
  const trimmed = (sentence ?? "").trim();
  if (trimmed.length === 0) {
    return {
      status: "incorrect",
      errorCode: "too_short",
      errorMessage: "Your sentence is too short. Write at least 3 words.",
    };
  }
  const words = trimmed.split(/\s+/).filter(Boolean);
  if (words.length < 3) {
    return {
      status: "incorrect",
      errorCode: "too_short",
      errorMessage: "Your sentence is too short. Write at least 3 words.",
    };
  }
  if (trimmed.length > 300) {
    return {
      status: "needs_improvement",
      errorCode: "too_long",
      errorMessage: "Your sentence is too long. Keep it under 300 characters.",
    };
  }
  if (/unsafe feedback fixture/i.test(trimmed)) {
    return {
      status: "incorrect",
      errorCode: "SAFETY_BLOCKED",
      errorMessage:
        "This sentence cannot be checked. Please try a different sentence.",
    };
  }
  const containsTarget = targetWord
    ? new RegExp(`\\b${targetWord}\\b`, "i").test(trimmed)
    : true;
  if (!containsTarget) {
    return {
      status: "needs_improvement",
      errorCode: "missing_target",
      errorMessage: `Your sentence is missing the target word "${targetWord}".`,
    };
  }
  return {
    status: "correct",
    explanation: "Your sentence uses the target word naturally.",
  };
}

function applySettingsPatch(settings, patch) {
  const allowedKeys = new Set([
    "dailyReviewTarget",
    "reviewIntervalPreset",
    "appLanguage",
    "notificationsEnabled",
    "marketingEmailsEnabled",
    "displayName",
  ]);
  const result = { ...settings };
  for (const [key, value] of Object.entries(patch ?? {})) {
    if (allowedKeys.has(key)) {
      result[key] = value;
    }
  }
  if (result.dailyReviewTarget !== undefined) {
    if (
      typeof result.dailyReviewTarget !== "number" ||
      result.dailyReviewTarget < 5 ||
      result.dailyReviewTarget > 100
    ) {
      const error = new Error("dailyReviewTarget out of range");
      error.code = 400;
      throw error;
    }
  }
  if (
    result.reviewIntervalPreset !== undefined &&
    !["vocanova_default", "wordup_like", "custom"].includes(
      result.reviewIntervalPreset,
    )
  ) {
    const error = new Error("invalid reviewIntervalPreset");
    error.code = 400;
    throw error;
  }
  if (result.appLanguage !== undefined && result.appLanguage !== "en") {
    const error = new Error("appLanguage not supported");
    error.code = 400;
    throw error;
  }
  return result;
}

function logLine(req, status, extra) {
  const tag = extra ? ` ${JSON.stringify(extra)}` : "";
  process.stderr.write(
    `[mock-api] ${req.method} ${req.url} -> ${status}${tag}\n`,
  );
}

const server = createServer(async (req, res) => {
  if (!req.url) {
    res.writeHead(400);
    res.end();
    return;
  }

  // CORS: the web app (127.0.0.1:3000/3100) and this mock API
  // (127.0.0.1:8080) are different origins by browser same-origin
  // rules (different port = different origin), even though both are
  // loopback. Server-side fetches (Next.js server components/route
  // handlers reading data for SSR) aren't subject to CORS at all -
  // only browser-initiated fetches are - which is why GETs kept
  // working throughout while every client-side mutation failed:
  // credentials: "include" + a custom X-CSRF-Token header force the
  // browser to send a preflight OPTIONS request, and this server
  // had no CORS handling at all, so the preflight failed with no
  // Access-Control-Allow-Origin header and the browser blocked the
  // real request before it ever reached here (net::ERR_FAILED,
  // visible only in the browser console, not as an HTTP response -
  // which is why it looked like a hang rather than a clean error).
  // Access-Control-Allow-Origin must echo the specific request
  // origin (not "*") because credentialed requests forbid a
  // wildcard origin per the CORS spec.
  const requestOrigin = req.headers.origin;
  if (requestOrigin) {
    res.setHeader("Access-Control-Allow-Origin", requestOrigin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Vary", "Origin");
  }
  if (req.method === "OPTIONS") {
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, PATCH, DELETE, OPTIONS",
    );
    // Every custom header @vocanova/api-client ever sets
    // (packages/api-client/src/index.ts) - Idempotency-Key was
    // missing here initially and only surfaced once a mutation that
    // actually uses it (save word) ran in CI, the same silent
    // "blocked by CORS policy" failure pattern as the first gap.
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, X-CSRF-Token, Idempotency-Key",
    );
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(
    req.url,
    `http://${req.headers.host ?? `${HOST}:${PORT}`}`,
  );
  const cookies = parseCookies(req.headers.cookie);

  if (req.method === "GET" && url.pathname === "/healthz") {
    logLine(req, 200);
    jsonResponse(res, 200, { status: "ok" });
    return;
  }

  if (req.method === "POST" && url.pathname === "/__e2e/release-read") {
    const fixture = url.searchParams.get("fixture");
    if (
      !["discover", "reviews", "home", "progress", "settings", "account"].includes(
        fixture,
      )
    ) {
      logLine(req, 400, { reason: "invalid-read-hold-fixture" });
      jsonResponse(res, 400, { error: "invalid_fixture" });
      return;
    }

    const released = releaseReadHold(getSessionState(cookies), fixture);
    logLine(req, released ? 204 : 409, { fixture, action: "release-read" });
    if (released) {
      emptyResponse(res, 204);
    } else {
      jsonResponse(res, 409, { error: "read_not_held" });
    }
    return;
  }

  if (
    req.method === "POST" &&
    url.pathname === "/__e2e/release-settings-patch"
  ) {
    const released = releaseSettingsPatchHold(getSessionState(cookies));
    logLine(req, released ? 204 : 409, { action: "release-settings-patch" });
    if (released) {
      emptyResponse(res, 204);
    } else {
      jsonResponse(res, 409, { error: "settings_patch_not_held" });
    }
    return;
  }

  if (
    req.method === "POST" &&
    url.pathname === "/__e2e/release-account-deletion"
  ) {
    const released = releaseAccountDeletionHold(getSessionState(cookies));
    logLine(req, released ? 204 : 409, { action: "release-account-deletion" });
    if (released) {
      emptyResponse(res, 204);
    } else {
      jsonResponse(res, 409, { error: "account_deletion_not_held" });
    }
    return;
  }

  if (
    req.method === "POST" &&
    url.pathname === "/__e2e/release-email-change-request"
  ) {
    const released = releaseEmailChangeHold(
      getSessionState(cookies),
      "request",
    );
    logLine(req, released ? 204 : 409, {
      action: "release-email-change-request",
    });
    if (released) {
      emptyResponse(res, 204);
    } else {
      jsonResponse(res, 409, { error: "email_change_request_not_held" });
    }
    return;
  }

  // ----- auth (CSRF-exempt) ----------------------------------

  if (req.method === "POST" && url.pathname === "/api/v1/auth/magic-links") {
    logLine(req, 200);
    jsonResponse(res, 200, {});
    return;
  }

  if (
    req.method === "POST" &&
    url.pathname === "/api/v1/auth/magic-links/consume"
  ) {
    const sessionValue = generateId("session");
    const csrfValue = generateId("csrf");
    sessions.set(sessionValue, createInitialState());
    logLine(req, 200, { session: "issued" });
    jsonResponse(
      res,
      200,
      {
        ...DEFAULT_USER,
        onboardingStatus: "completed",
      },
      {
        "Set-Cookie": [
          buildSessionCookie(sessionValue),
          buildCsrfCookie(csrfValue),
        ].join(", "),
      },
    );
    return;
  }

  if (
    req.method === "POST" &&
    url.pathname === "/api/v1/auth/oauth/google/start"
  ) {
    logLine(req, 200);
    jsonResponse(res, 200, {
      url: "https://accounts.google.com/o/oauth2/v2/auth?redirected=true",
    });
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/v1/auth/logout") {
    const sessionId = cookies[SESSION_COOKIE_NAME];
    if (sessionId) {
      sessions.delete(sessionId);
    }
    logLine(req, 204, { action: "logout" });
    emptyResponse(res, 204, { "Set-Cookie": buildClearSessionCookie() });
    return;
  }

  // ----- authenticated routes (CSRF enforced for mutations) --

  if (req.method === "GET" && url.pathname === "/api/v1/me") {
    if (url.searchParams.get("fail") === "me") {
      logLine(req, 401, { reason: "fixture-forced-401" });
      jsonResponse(res, 401, { error: "unauthorized" });
      return;
    }
    if (cookies.e2e_unauthenticated === "1") {
      // The unauthenticated-access rejection step sets this
      // cookie after logout to make /api/v1/me return 401, so the
      // Next.js auth-gate middleware (apps/web/src/middleware.ts)
      // routes the learner to /signin. The cookie is unset by the
      // test before the next test that needs an authenticated
      // session, so the accessibility scans continue to see
      // a 200 here without changing their own setup.
      logLine(req, 401, { reason: "e2e-unauthenticated-override" });
      jsonResponse(res, 401, { error: "unauthorized" });
      return;
    }
    const state = getSessionState(cookies);
    if (consumeReadFailureFixture(state, cookies, "onboarding", 1)) {
      logLine(req, 500, {
        reason: "fixture-read-failure",
        fixture: "onboarding",
      });
      jsonResponse(res, 500, { error: "fixture_read_failure" });
      return;
    }
    const onboardingStatusOverride = cookies.e2e_onboarding_status;
    if (ONBOARDING_STATUSES.has(onboardingStatusOverride)) {
      logLine(req, 200, { onboardingStatus: onboardingStatusOverride });
      jsonResponse(res, 200, {
        ...DEFAULT_USER,
        onboardingStatus: onboardingStatusOverride,
      });
      return;
    }
    if (consumeReadFailureFixture(state, cookies, "account", 1)) {
      logLine(req, 500, { reason: "fixture-read-failure", fixture: "account" });
      jsonResponse(res, 500, { error: "fixture_read_failure" });
      return;
    }
    const accountHold = waitForReadHoldAfter(state, cookies, "account", 1);
    if (accountHold) await accountHold;
    const user = buildCurrentUser(state, cookies);
    logLine(req, 200, { onboardingStatus: user.onboardingStatus });
    jsonResponse(res, 200, user);
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/v1/onboarding") {
    const state = getSessionState(cookies);
    logLine(req, 200, { completed: state.onboardingCompleted });
    jsonResponse(res, 200, {
      status: state.onboardingCompleted ? "completed" : "not_started",
      englishLevel: "a2",
      nativeLanguage: "es",
      learningGoal: "general",
      mainUseCase: "daily_life",
      dailyReviewTarget: state.settings.dailyReviewTarget,
      completedAt: state.onboardingCompleted
        ? new Date().toISOString()
        : undefined,
    });
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/v1/onboarding") {
    if (!checkCsrf(req, cookies, res, logLine)) {
      return;
    }
    const state = getSessionState(cookies);
    let body = {};
    try {
      body = await readJsonBody(req);
    } catch {
      logLine(req, 400, { reason: "malformed-json" });
      jsonResponse(res, 400, { error: "invalid_json" });
      return;
    }
    state.onboardingCompleted = true;
    if (typeof body.dailyReviewTarget === "number") {
      // seed rule: only seed dailyReviewTarget when no
      // customized value exists yet. The mock starts with the
      // schema default (20) for every fresh session, so the seed
      // fires for the very first onboarding write.
      if (
        state.settings.dailyReviewTarget === DEFAULT_SETTINGS.dailyReviewTarget
      ) {
        state.settings.dailyReviewTarget = body.dailyReviewTarget;
      }
    }
    logLine(req, 200, { action: "complete-onboarding" });
    jsonResponse(res, 200, {
      status: "completed",
      englishLevel: body.englishLevel,
      nativeLanguage: body.nativeLanguage,
      learningGoal: body.learningGoal,
      mainUseCase: body.mainUseCase,
      dailyReviewTarget: state.settings.dailyReviewTarget,
      completedAt: new Date().toISOString(),
    });
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/v1/user-words") {
    const state = getSessionState(cookies);
    // The canonical saved-detail route must authorize from its canonical
    // response, rather than depending on a (possibly truncated) saved list.
    if (cookies.e2e_saved_words_fixture === "canonical-without-list") {
      logLine(req, 500, { reason: "saved-list-unavailable" });
      jsonResponse(res, 500, { error: "saved_list_unavailable" });
      return;
    }
    if (consumeReadFailureFixture(state, cookies, "home")) {
      logLine(req, 500, { reason: "fixture-read-failure", fixture: "home" });
      jsonResponse(res, 500, { error: "fixture_read_failure" });
      return;
    }
    const data =
      cookies.e2e_saved_words_fixture === "truncated-page"
        ? TRUNCATED_SAVED_WORDS_RESPONSE
        : cookies.e2e_saved_words_fixture === "long-content"
          ? LONG_SAVED_WORDS_RESPONSE
          : cookies.e2e_saved_words_fixture === "library"
            ? url.searchParams.get("limit") === "100"
              ? {
                  items: [
                    ...TRUNCATED_SAVED_WORDS_RESPONSE.items,
                    ...SAVED_LIBRARY_PAGE_TWO,
                  ].filter((item) => !state.libraryRemovedMeaningIds.has(item.meaningId)),
                  nextCursor: undefined,
                }
              : url.searchParams.get("after")
              ? { items: SAVED_LIBRARY_PAGE_TWO.filter((item) => !state.libraryRemovedMeaningIds.has(item.meaningId)), nextCursor: undefined }
              : { items: TRUNCATED_SAVED_WORDS_RESPONSE.items, nextCursor: "e2e-library-page-2" }
          : buildSavedWords(state);
    logLine(req, 200, { count: data.items.length });
    jsonResponse(res, 200, data);
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/v1/user-words") {
    if (!checkCsrf(req, cookies, res, logLine)) {
      return;
    }
    if (cookies.e2e_word_detail_save_failure === "1") {
      logLine(req, 500, { reason: "fixture-forced-save-failure" });
      jsonResponse(
        res,
        500,
        {
          type: "about:blank",
          title: "Test save failure",
          status: 500,
          detail: "Unable to update saved state. Please try again.",
        },
        { "Content-Type": "application/problem+json; charset=utf-8" },
      );
      return;
    }
    let body = {};
    try {
      body = await readJsonBody(req);
    } catch {
      logLine(req, 400, { reason: "malformed-json" });
      jsonResponse(res, 400, { error: "invalid_json" });
      return;
    }
    const state = getSessionState(cookies);
    const meaningId = body.meaningId;
    if (!meaningId) {
      logLine(req, 400, { reason: "missing-meaning-id" });
      jsonResponse(res, 400, { error: "missing_meaning_id" });
      return;
    }
    state.savedMeaningIds.add(meaningId);
    logLine(req, 200, { action: "save", meaningId });
    const word = CANONICAL_WORDS.pour;
    const meaning = word.meanings.find((m) => m.id === meaningId);
    jsonResponse(res, 200, {
      userWordId: `uw-${meaningId}`,
      meaningId: meaning.id,
      wordId: word.id,
      wordSlug: word.slug,
      wordText: word.text,
      partOfSpeech: meaning.partOfSpeech,
      shortDefinition: meaning.shortDefinition,
      status: "saved",
      source: body.source ?? "journey",
      saved: true,
      addedAt: new Date().toISOString(),
    });
    return;
  }

  if (
    req.method === "DELETE" &&
    url.pathname.startsWith("/api/v1/user-words/")
  ) {
    if (!checkCsrf(req, cookies, res, logLine)) {
      return;
    }
    const meaningId = decodeURIComponent(
      url.pathname.slice("/api/v1/user-words/".length),
    );
    const state = getSessionState(cookies);
    state.savedMeaningIds.delete(meaningId);
    state.libraryRemovedMeaningIds.add(meaningId);
    logLine(req, 204, { action: "unsave", meaningId });
    emptyResponse(res, 204);
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/v1/reviews/due") {
    const state = getSessionState(cookies);
    const readHold = waitForReadHold(state, cookies, "reviews");
    if (readHold) {
      await readHold;
    }
    if (consumeReadFailureFixture(state, cookies, "reviews")) {
      logLine(req, 500, { reason: "fixture-read-failure", fixture: "reviews" });
      jsonResponse(res, 500, { error: "fixture_read_failure" });
      return;
    }
    const data = buildDueWords(state, cookies.e2e_review_fixture);
    logLine(req, 200, { count: data.items.length });
    jsonResponse(res, 200, data);
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/v1/reviews/submissions") {
    if (!checkCsrf(req, cookies, res, logLine)) {
      return;
    }
    let body = {};
    try {
      body = await readJsonBody(req);
    } catch {
      logLine(req, 400, { reason: "malformed-json" });
      jsonResponse(res, 400, { error: "invalid_json" });
      return;
    }
    const state = getSessionState(cookies);
    const priorAttempt = state.reviewAttemptsByClientAttemptId.get(
      body.clientAttemptId,
    );
    if (priorAttempt) {
      logLine(req, 200, {
        action: "replay-review",
        meaningId: priorAttempt.meaningId,
      });
      jsonResponse(res, 200, priorAttempt.response);
      return;
    }
    const attemptId = generateId("att");
    const reviewedMeaningId = body.meaningId;
    if (reviewedMeaningId) {
      state.reviewedMeaningIds.add(reviewedMeaningId);
    }
    state.reviewedCount += 1;
    state.progress.confidencePointsBalance += reviewRewardForRating(
      body.rating,
    );
    state.lastReviewAttemptId = attemptId;
    state.reviewAttempts.push({
      attemptId,
      meaningId: reviewedMeaningId,
      result: body.result,
      rating: body.rating,
      answeredAt: new Date().toISOString(),
    });
    // The API contract advances the word's review schedule but
    // keeps it in the saved set; the full-flow "review -> sentence"
    // step relies on the word remaining in savedMeaningIds after
    // the review submission so the sentence-feedback widget on
    // /discover/.../[word] still renders the saved meaning.
    logLine(req, 200, {
      action: "submit-review",
      meaningId: reviewedMeaningId,
      reviewedCount: state.reviewedCount,
    });
    const response = {
      attemptId,
      userWordId: body.userWordId,
      meaningId: body.meaningId,
      attemptType: "review",
      promptType: body.promptType,
      result: body.result,
      rating: body.rating,
      reviewStepBefore: 0,
      reviewStepAfter: 1,
      answeredAt: new Date().toISOString(),
      responseTimeMs: body.responseTimeMs ?? 0,
      selectedOptionMeaningId: body.selectedOptionMeaningId,
      wasHintUsed: body.wasHintUsed ?? false,
      source: body.source ?? "review_session",
      clientAttemptId: body.clientAttemptId,
      nextReviewAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    };
    state.reviewAttemptsByClientAttemptId.set(body.clientAttemptId, {
      meaningId: reviewedMeaningId,
      response,
    });
    jsonResponse(res, 200, response);
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/v1/sentence-feedback") {
    if (!checkCsrf(req, cookies, res, logLine)) {
      return;
    }
    let body = {};
    try {
      body = await readJsonBody(req);
    } catch {
      logLine(req, 400, { reason: "malformed-json" });
      jsonResponse(res, 400, { error: "invalid_json" });
      return;
    }
    const state = getSessionState(cookies);
    const sentenceId = generateId("sent");
    const targetWord = body.attemptId
      ? lookupTargetWord(body.attemptId, state)
      : "pour";
    const evaluation = evaluateSentenceFeedback({
      sentence: body.sentenceText,
      targetWord,
    });
    state.sentenceAttempts.push({
      sentenceId,
      attemptId: body.attemptId,
      sentenceText: body.sentenceText,
      evaluation,
    });
    if (!evaluation.errorCode) {
      state.sentenceCount += 1;
    }
    logLine(req, 200, {
      action: "submit-sentence",
      status: evaluation.status,
      errorCode: evaluation.errorCode,
    });
    jsonResponse(res, 200, {
      sentenceId,
      attemptId: body.attemptId,
      status: evaluation.status,
      originalSentence: body.sentenceText,
      correctedSentence:
        evaluation.status === "correct" ? body.sentenceText : undefined,
      explanation: evaluation.explanation,
      improvementTip:
        evaluation.status === "needs_improvement"
          ? "Try using the target word naturally in your sentence."
          : undefined,
      // Sentence feedback can award sentence activity, but it never completes a
      // daily mission. Keep this deterministic browser fixture aligned with the
      // public API contract in docs/engineering/09-ai-features.md §2.
      missionCompleted: false,
      canRetry: Boolean(evaluation.errorCode),
      reported: false,
      errorCode: evaluation.errorCode,
      errorMessage: evaluation.errorMessage,
    });
    return;
  }

  if (
    req.method === "POST" &&
    url.pathname.startsWith("/api/v1/sentence-feedback/") &&
    url.pathname.endsWith("/reports")
  ) {
    if (!checkCsrf(req, cookies, res, logLine)) {
      return;
    }
    logLine(req, 204, { action: "report-sentence" });
    emptyResponse(res, 204);
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/v1/daily-mission") {
    const state = getSessionState(cookies);
    const hold = waitForReadHold(state, cookies, "home");
    if (hold) await hold;
    const mission = buildDailyMission(state);
    logLine(req, 200, { reviewsCompleted: mission.reviewsCompleted });
    jsonResponse(res, 200, mission);
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/v1/progress") {
    const state = getSessionState(cookies);
    const hold = waitForReadHold(state, cookies, "progress");
    if (hold) await hold;
    if (consumeReadFailureFixture(state, cookies, "progress")) {
      logLine(req, 500, {
        reason: "fixture-read-failure",
        fixture: "progress",
      });
      jsonResponse(res, 500, { error: "fixture_read_failure" });
      return;
    }
    const progress =
      cookies.e2e_progress_fixture === "first-mission"
        ? FIRST_MISSION_PROGRESS
        : buildProgress(state);
    logLine(req, 200, { reviewedCount: state.reviewedCount });
    jsonResponse(res, 200, progress);
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/v1/journey-situations") {
    const state = getSessionState(cookies);
    const readHold = waitForReadHold(state, cookies, "discover");
    if (readHold) {
      await readHold;
    }
    if (consumeReadFailureFixture(state, cookies, "discover")) {
      logLine(req, 500, {
        reason: "fixture-read-failure",
        fixture: "discover",
      });
      jsonResponse(res, 500, { error: "fixture_read_failure" });
      return;
    }
    logLine(req, 200);
    jsonResponse(
      res,
      200,
      buildJourneySituations(
        cookies.e2e_journey_fixture,
        url.searchParams.get("after"),
      ),
    );
    return;
  }

  if (
    req.method === "GET" &&
    url.pathname.startsWith("/api/v1/journey-situations/")
  ) {
    const state = getSessionState(cookies);
    if (consumeReadFailureFixture(state, cookies, "discover")) {
      logLine(req, 500, {
        reason: "fixture-read-failure",
        fixture: "discover",
      });
      jsonResponse(res, 500, { error: "fixture_read_failure" });
      return;
    }
    const slug = decodeURIComponent(
      url.pathname.slice("/api/v1/journey-situations/".length),
    );
    const response = buildSituationResponse(
      state,
      slug,
      cookies.e2e_situation_fixture,
    );
    if (!response) {
      logLine(req, 404, { slug });
      jsonResponse(res, 404, { error: "not_found", slug });
      return;
    }
    logLine(req, 200, { slug });
    jsonResponse(res, 200, response);
    return;
  }

  if (
    req.method === "GET" &&
    url.pathname.startsWith("/api/v1/canonical-words/")
  ) {
    const slug = decodeURIComponent(
      url.pathname.slice("/api/v1/canonical-words/".length),
    );
    const state = getSessionState(cookies);
    if (consumeReadFailureFixture(state, cookies, "discover")) {
      logLine(req, 500, {
        reason: "fixture-read-failure",
        fixture: "discover",
      });
      jsonResponse(res, 500, { error: "fixture_read_failure" });
      return;
    }
    const response = buildWordDetailResponse(
      state,
      slug,
      cookies.e2e_word_detail_review_state,
      cookies.e2e_word_detail_fixture,
    );
    if (!response) {
      logLine(req, 404, { slug });
      jsonResponse(res, 404, { error: "not_found", slug });
      return;
    }
    if (
      ["library", "canonical-without-list"].includes(
        cookies.e2e_saved_words_fixture,
      ) &&
      slug === "pour"
    ) {
      response.word.meanings = response.word.meanings.map((meaning) =>
        meaning.id === "mean-pour"
          ? {
              ...meaning,
              saved: true,
              userWordId: "e2e-library-user-word-11",
              reviewState: "due",
            }
          : meaning,
      );
    }
    if (cookies.e2e_saved_words_fixture === "library" && slug === "bank") {
      response.word.meanings = response.word.meanings.map((meaning) => ({
        ...meaning,
        saved: true,
        userWordId:
          meaning.id === "mean-bank-river"
            ? "e2e-library-bank-river"
            : "e2e-library-bank-money",
        reviewState: "due",
      }));
    }
    logLine(req, 200, { slug });
    jsonResponse(res, 200, response);
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/v1/settings") {
    const state = getSessionState(cookies);
    const settingsHold = waitForReadHold(state, cookies, "settings");
    if (settingsHold) await settingsHold;
    if (consumeReadFailureFixture(state, cookies, "settings")) {
      logLine(req, 500, {
        reason: "fixture-read-failure",
        fixture: "settings",
      });
      jsonResponse(res, 500, { error: "fixture_read_failure" });
      return;
    }
    logLine(req, 200);
    jsonResponse(res, 200, buildSettings(state));
    return;
  }

  if (req.method === "PATCH" && url.pathname === "/api/v1/settings") {
    if (!checkCsrf(req, cookies, res, logLine)) {
      return;
    }
    const state = getSessionState(cookies);
    const hold = waitForSettingsPatchHold(state, cookies);
    if (hold) {
      await hold;
    }
    if (
      cookies.e2e_settings_patch_failure === "retry" &&
      !state.consumedSettingsPatchFailure
    ) {
      state.consumedSettingsPatchFailure = true;
      logLine(req, 500, { reason: "fixture-settings-patch-failure" });
      jsonResponse(res, 500, {
        title: "Test settings save failure",
        detail: "Unable to save settings. Please try again.",
      });
      return;
    }
    let body = {};
    try {
      body = await readJsonBody(req);
    } catch {
      logLine(req, 400, { reason: "malformed-json" });
      jsonResponse(res, 400, { error: "invalid_json" });
      return;
    }
    try {
      state.settings = applySettingsPatch(state.settings, body);
    } catch (error) {
      const status = error.code === 400 ? 400 : 500;
      logLine(req, status, { reason: "invalid-settings-patch" });
      jsonResponse(res, status, { error: error.message });
      return;
    }
    logLine(req, 200, { action: "patch-settings" });
    jsonResponse(res, 200, buildSettings(state));
    return;
  }

  if (
    req.method === "POST" &&
    url.pathname === "/api/v1/settings/email-change-links"
  ) {
    if (!checkCsrf(req, cookies, res, logLine)) {
      return;
    }
    const state = getSessionState(cookies);
    const hold = waitForEmailChangeHold(state, cookies, "request");
    if (hold) {
      await hold;
    }
    if (consumeEmailChangeFailure(state, cookies, "request")) {
      logLine(req, 500, { reason: "fixture-email-change-request-failure" });
      jsonResponse(res, 500, { error: "fixture_email_change_request_failure" });
      return;
    }
    logLine(req, 204, { action: "request-email-change" });
    emptyResponse(res, 204);
    return;
  }

  if (
    req.method === "POST" &&
    url.pathname === "/api/v1/settings/email-change-links/consume"
  ) {
    if (!checkCsrf(req, cookies, res, logLine)) {
      return;
    }
    const state = getSessionState(cookies);
    if (consumeEmailChangeFailure(state, cookies, "consume")) {
      logLine(req, 500, { reason: "fixture-email-change-consume-failure" });
      jsonResponse(res, 500, { error: "fixture_email_change_consume_failure" });
      return;
    }
    logLine(req, 200, { action: "consume-email-change" });
    jsonResponse(res, 200, {
      email: DEFAULT_USER.email,
      previousEmail: DEFAULT_USER.email,
      changedAt: new Date().toISOString(),
    });
    return;
  }

  if (
    req.method === "POST" &&
    url.pathname === "/api/v1/account-deletion-requests"
  ) {
    if (!checkCsrf(req, cookies, res, logLine)) {
      return;
    }
    const state = getSessionState(cookies);
    const hold = waitForAccountDeletionHold(state, cookies);
    if (hold) {
      await hold;
    }
    if (
      cookies.e2e_account_deletion_failure === "retry" &&
      !state.consumedAccountDeletionFailure
    ) {
      state.consumedAccountDeletionFailure = true;
      logLine(req, 500, { reason: "fixture-account-deletion-failure" });
      jsonResponse(res, 500, { error: "fixture_account_deletion_failure" });
      return;
    }
    const sessionId = cookies[SESSION_COOKIE_NAME];
    if (sessionId) {
      sessions.delete(sessionId);
    }
    logLine(req, 200, { action: "account-deletion" });
    const requestedAt = new Date();
    const purgeAfter = new Date(
      requestedAt.getTime() + 30 * 24 * 60 * 60 * 1000,
    );
    jsonResponse(
      res,
      200,
      {
        status: "deactivated",
        userId: "user-fixture",
        requestedAt: requestedAt.toISOString(),
        purgeAfter: purgeAfter.toISOString(),
        idempotencyKey: req.headers["idempotency-key"] ?? "",
        replayed: false,
      },
      { "Set-Cookie": buildClearSessionCookie() },
    );
    return;
  }

  logLine(req, 404);
  jsonResponse(res, 404, { error: "not_found", path: url.pathname });
});

function lookupTargetWord(attemptId, state) {
  if (typeof attemptId !== "string") {
    return "pour";
  }
  return state.feedbackTargets.get(attemptId) ?? "pour";
}

function checkCsrf(req, cookies, res, logLineRef) {
  const method = req.method ?? "";
  if (!["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
    return true;
  }
  const csrfCookie = cookies[CSRF_COOKIE_NAME];
  const headerToken = req.headers["x-csrf-token"];
  if (csrfCookie && headerToken && csrfCookie === headerToken) {
    return true;
  }
  logLineRef(req, 403, { reason: "csrf-failed" });
  jsonResponse(res, 403, { error: "invalid_csrf_token" });
  return false;
}

server.listen(PORT, HOST, () => {
  process.stderr.write(`[mock-api] listening on http://${HOST}:${PORT}\n`);
});

function shutdown(signal) {
  process.stderr.write(`[mock-api] received ${signal}, shutting down\n`);
  server.close(() => {
    process.exit(0);
  });
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
