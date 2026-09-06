import Link from "next/link";

import { ApiResponseError } from "@vocanova/api-client";

import { createServerApiClient, requireAuthRedirect } from "@/lib/api-server";
import { PageBackLink } from "../_components/page-back-link";
import { formatReviewDateTime } from "@/lib/review-schedule";

import { ReviewSession } from "./_components/review-session";

export default async function ReviewsPage() {
  const client = await createServerApiClient();
  let dueResponse: Awaited<ReturnType<typeof client.listDueWords>>;
  let dailyMissionResponse: Awaited<ReturnType<typeof client.getDailyMission>>;
  const timezonePromise = client
    .getSettings()
    .then(({ data }) => data.timezone)
    .catch((error) => {
      if (error instanceof ApiResponseError && error.status === 401) {
        requireAuthRedirect(error, "/reviews");
      }
      return undefined;
    });
  try {
    [dueResponse, dailyMissionResponse] = await Promise.all([
      client.listDueWords({ limit: 50 }),
      client.getDailyMission(),
    ]);
  } catch (error) {
    requireAuthRedirect(error, "/reviews");
  }

  const { items: dueWords, totalCount, nextReviewAt } = dueResponse.data;
  const { reviewTarget, reviewsCompleted } = dailyMissionResponse.data;
  const timezone = await timezonePromise;
  let savedWordCount: number | undefined;
  if (dueWords.length === 0 && nextReviewAt === null) {
    try {
      savedWordCount = (await client.listSavedWords({ limit: 1 })).data.items
        .length;
    } catch (error) {
      if (error instanceof ApiResponseError && error.status === 401)
        requireAuthRedirect(error, "/reviews");
      savedWordCount = undefined;
    }
  }
  const hasNoSavedVocabulary =
    dueWords.length === 0 && nextReviewAt === null && savedWordCount === 0;

  return (
    <div className="p-[var(--spacing-lg)]">
      <div className="mb-[var(--spacing-md)] flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-neutral-900">Review</h1>
        <PageBackLink href="/home">Back to Home</PageBackLink>
      </div>

      {dueWords.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-[var(--spacing-2xl)] text-center">
          <h2 className="text-xl font-semibold text-neutral-900">
            You&apos;re all caught up
          </h2>
          <p className="mt-[var(--spacing-sm)] text-base text-neutral-700">
            {nextReviewAt
              ? `Your next review is ${formatReviewDateTime(nextReviewAt, timezone)}.`
              : nextReviewAt === undefined
                ? "No words are due for review right now."
                : savedWordCount === 0
                  ? "Save a word to start reviewing."
                  : savedWordCount === undefined
                    ? "No words are due for review right now."
                    : "No active reviews are scheduled right now."}
          </p>
          <Link
            href={hasNoSavedVocabulary ? "/discover" : "/home"}
            className="mt-[var(--spacing-lg)] inline-flex min-h-[var(--spacing-2xl)] min-w-[var(--spacing-2xl)] items-center justify-center rounded-md bg-primary-600 px-[var(--spacing-md)] py-[var(--spacing-sm)] text-base font-medium text-neutral-50 transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)] hover:bg-primary-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-700"
          >
            {hasNoSavedVocabulary
              ? "Explore Journey and save a word"
              : "Back to Home"}
          </Link>
        </div>
      ) : (
        <ReviewSession
          initialDueWords={dueWords}
          initialTotalCount={totalCount}
          reviewTarget={reviewTarget}
          reviewsCompleted={reviewsCompleted}
          timezone={timezone}
        />
      )}
    </div>
  );
}
