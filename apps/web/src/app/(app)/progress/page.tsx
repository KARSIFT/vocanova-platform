import Link from "next/link";

import { createServerApiClient, requireAuthRedirect } from "@/lib/api-server";

import { SentencePracticeHistory } from "./_components/sentence-practice-history";

function formatMissionDate(localDate: string): string {
  const date = new Date(`${localDate}T00:00:00Z`);
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(date);
}

function getMissionStatusLabel(
  status: "open" | "completed" | "missed" | "protected" | undefined,
): string | undefined {
  switch (status) {
    case "open":
      return "In progress";
    case "completed":
      return "Completed";
    case "missed":
      return "Missed";
    case "protected":
      return "Streak protected";
    default:
      return undefined;
  }
}

export default async function ProgressPage() {
  const client = await createServerApiClient();
  let savedWordsResponse: Awaited<ReturnType<typeof client.listSavedWords>>;
  let progressResponse: Awaited<ReturnType<typeof client.getProgress>>;
  let sentenceHistoryResponse: Awaited<
    ReturnType<typeof client.listSentenceFeedbackHistory>
  >;
  try {
    [savedWordsResponse, progressResponse, sentenceHistoryResponse] =
      await Promise.all([
        client.listSavedWords({ limit: 10 }),
        client.getProgress(),
        client.listSentenceFeedbackHistory({ limit: 10 }),
      ]);
  } catch (error) {
    requireAuthRedirect(error, "/progress");
  }

  const { items: savedWords } = savedWordsResponse.data;

  const {
    confidencePointsBalance: confidencePointsTotal,
    streak,
    completionHistory,
  } = progressResponse.data;
  const {
    currentStreakCount: currentStreakDays,
    longestStreakCount: longestStreakDays,
  } = streak;

  const historyWithLabels = completionHistory.map((day) => ({
    ...day,
    formattedDate: formatMissionDate(day.localDate),
    statusLabel:
      getMissionStatusLabel(day.status) ??
      (day.completed ? "Completed or protected" : "Not completed"),
  }));

  return (
    <div className="p-[var(--spacing-lg)]">
      <h1 className="text-2xl font-semibold text-neutral-900">Progress</h1>
      <p className="mt-[var(--spacing-xs)] text-base text-neutral-700">
        Every practice session builds your confidence.
      </p>

      <section
        aria-labelledby="confidence-points-heading"
        className="mt-[var(--spacing-lg)] rounded-md border border-primary-200 bg-primary-50 p-[var(--spacing-md)] shadow-sm"
      >
        <p
          id="confidence-points-heading"
          className="text-sm font-medium text-primary-900"
        >
          Confidence Points
        </p>
        <p className="mt-[var(--spacing-xs)] text-3xl font-semibold text-primary-900">
          {confidencePointsTotal.toLocaleString()}
        </p>
      </section>

      <section
        aria-labelledby="streak-heading"
        className="mt-[var(--spacing-md)] rounded-md border border-neutral-200 bg-neutral-50 p-[var(--spacing-md)] shadow-sm"
      >
        <h2
          id="streak-heading"
          className="text-lg font-semibold text-neutral-900"
        >
          Your streaks
        </h2>
        <p className="mt-[var(--spacing-sm)] text-base text-neutral-800">
          {currentStreakDays}-day streak
        </p>
        <p className="mt-[var(--spacing-xs)] text-base text-neutral-700">
          Longest streak: {longestStreakDays} days
        </p>
        <p className="mt-[var(--spacing-xs)] text-base text-neutral-700">
          Grace days available: {streak.graceDayBalance}
        </p>
        <p className="mt-[var(--spacing-xs)] text-sm text-neutral-600">
          A grace day protects your streak when you miss a mission.
        </p>
      </section>

      <section
        aria-labelledby="saved-vocabulary-heading"
        className="mt-[var(--spacing-md)] rounded-md border border-neutral-200 bg-neutral-50 p-[var(--spacing-md)] shadow-sm"
      >
        <h2
          id="saved-vocabulary-heading"
          className="text-lg font-semibold text-neutral-900"
        >
          Recently saved vocabulary
        </h2>
        <Link
          href="/discover/saved"
          className="mt-[var(--spacing-xs)] inline-flex min-h-[var(--spacing-2xl)] items-center text-base font-medium text-primary-700 underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-700"
        >
          View all saved vocabulary
        </Link>
        {savedWords.length > 0 ? (
          <>
            <p className="mt-[var(--spacing-xs)] text-base text-neutral-700">
              A preview of up to 10 recently saved words.
            </p>
            <ul className="mt-[var(--spacing-md)] space-y-[var(--spacing-xs)]">
              {savedWords.map((savedWord) => (
                <li
                  key={savedWord.userWordId}
                  className="rounded-md p-[var(--spacing-sm)]"
                >
                  <p className="wrap-break-word font-medium text-neutral-900">
                    {savedWord.wordText}
                  </p>
                  <p className="wrap-break-word text-base text-neutral-700">
                    {savedWord.shortDefinition}
                  </p>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className="mt-[var(--spacing-xs)] text-base text-neutral-700">
            No saved words yet. Save words from a journey to track your
            vocabulary here.
          </p>
        )}
      </section>

      <section
        aria-labelledby="sentence-practice-history-heading"
        className="mt-[var(--spacing-md)] rounded-md border border-neutral-200 bg-neutral-50 p-[var(--spacing-md)] shadow-sm"
      >
        <h2
          id="sentence-practice-history-heading"
          className="text-lg font-semibold text-neutral-900"
        >
          Recent sentence practice
        </h2>
        <p className="mt-[var(--spacing-xs)] text-base text-neutral-700">
          Your completed sentence feedback, newest first.
        </p>
        <SentencePracticeHistory
          initialItems={sentenceHistoryResponse.data.items}
          initialNextCursor={sentenceHistoryResponse.data.nextCursor}
        />
      </section>

      <section
        aria-labelledby="completion-history-heading"
        className="mt-[var(--spacing-md)] rounded-md border border-neutral-200 bg-neutral-50 p-[var(--spacing-md)] shadow-sm"
      >
        <h2
          id="completion-history-heading"
          className="text-lg font-semibold text-neutral-900"
        >
          Recent missions
        </h2>
        <p className="mt-[var(--spacing-xs)] text-base text-neutral-700">
          Your recent missions, newest first.
        </p>
        {historyWithLabels.length > 0 ? (
          <ul className="mt-[var(--spacing-md)] space-y-[var(--spacing-xs)]">
            {historyWithLabels.map((day) => (
              <li
                key={day.localDate}
                className="rounded-md bg-white p-[var(--spacing-sm)] text-neutral-900"
              >
                <time
                  dateTime={day.localDate}
                  className="text-sm font-semibold"
                >
                  {day.formattedDate}
                </time>
                <p className="mt-[var(--spacing-xs)] text-sm text-neutral-700">
                  {day.statusLabel}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-[var(--spacing-md)] text-base text-neutral-700">
            No mission history yet. Complete your first daily mission to start
            building your streak.
          </p>
        )}
      </section>
    </div>
  );
}
