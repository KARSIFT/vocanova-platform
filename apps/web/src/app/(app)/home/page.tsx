import Link from "next/link";

import { createServerApiClient, requireAuthRedirect } from "@/lib/api-server";
import { MissionActionLink } from "./_components/mission-action-link";
import { SavedWordPracticeSelector } from "./_components/saved-word-practice-selector";

export default async function HomePage() {
  const client = await createServerApiClient();
  let savedWordsResponse: Awaited<ReturnType<typeof client.listSavedWords>>;
  let dueResponse: Awaited<ReturnType<typeof client.listDueWords>>;
  let dailyMissionResponse: Awaited<ReturnType<typeof client.getDailyMission>>;
  try {
    savedWordsResponse = await client.listSavedWords({ limit: 10 });
    dueResponse = await client.listDueWords({ limit: 1 });
    dailyMissionResponse = await client.getDailyMission();
  } catch (error) {
    requireAuthRedirect(error, "/home");
  }

  const { items: savedWords } = savedWordsResponse.data;
  const dueReviewWords = dueResponse.data.totalCount;
  const {
    reviewTarget: missionTargetWords,
    reviewsCompleted: reviewedWordsToday,
    newWordTarget,
    newWordsCompleted,
    sentencePracticeTarget,
    sentencePracticesCompleted,
    status: missionStatus,
    streak,
  } = dailyMissionResponse.data;
  const missionProgressPercent = Math.min(
    100,
    Math.round((reviewedWordsToday / missionTargetWords) * 100),
  );
  const remainingReviews = Math.max(missionTargetWords - reviewedWordsToday, 0);
  const remainingNewWords = getRemainingTarget(
    newWordTarget,
    newWordsCompleted,
  );
  const remainingSentencePractices = getRemainingTarget(
    sentencePracticeTarget,
    sentencePracticesCompleted,
  );
  const primaryAction = getPrimaryAction({
    missionStatus,
    dueReviewWords,
    remainingReviews,
    remainingNewWords,
    remainingSentencePractices,
    hasSavedWords: savedWords.length > 0,
  });

  return (
    <div className="p-[var(--spacing-lg)]">
      <section
        aria-labelledby="todays-mission-heading"
        className="rounded-md border border-neutral-200 bg-neutral-50 p-[var(--spacing-md)] shadow-sm"
      >
        <h1
          id="todays-mission-heading"
          className="text-xl font-semibold text-neutral-900"
        >
          Today&apos;s Mission
        </h1>
        <p className="mt-[var(--spacing-sm)] text-base text-neutral-700">
          Review target: {missionTargetWords} words
        </p>
        <p className="mt-[var(--spacing-xs)] text-base text-neutral-700">
          {reviewedWordsToday} of {missionTargetWords} words reviewed today (
          {missionProgressPercent}%)
        </p>
        <ul className="mt-[var(--spacing-sm)] space-y-[var(--spacing-xs)] text-base text-neutral-700">
          <li>{remainingReviews} reviews remaining</li>
          {remainingNewWords !== null ? (
            <li>{remainingNewWords} new words remaining</li>
          ) : null}
          {remainingSentencePractices !== null ? (
            <li>
              {remainingSentencePractices} sentence
              {remainingSentencePractices === 1
                ? " practice"
                : " practices"}{" "}
              remaining
            </li>
          ) : null}
        </ul>
        <div
          aria-hidden="true"
          className="mt-[var(--spacing-md)] h-[var(--spacing-sm)] w-full rounded-full bg-neutral-200"
        >
          <div
            className="h-full rounded-full bg-primary-600"
            style={{ width: `${missionProgressPercent}%` }}
          />
        </div>
        {missionStatus === "completed" ? (
          <p className="mt-[var(--spacing-md)] text-base font-medium text-green-800">
            Today&apos;s mission is complete.
          </p>
        ) : null}
      </section>

      <section
        aria-labelledby="next-action-heading"
        className="mt-[var(--spacing-lg)] rounded-md border border-neutral-200 bg-white p-[var(--spacing-md)] shadow-sm"
      >
        <h2
          id="next-action-heading"
          className="text-lg font-semibold text-neutral-900"
        >
          Next step
        </h2>
        <p className="mt-[var(--spacing-sm)] text-base text-neutral-700">
          {primaryAction.description}
        </p>
        <MissionActionLink
          href={primaryAction.href}
          label={primaryAction.label}
        />
        {primaryAction.href !== "/reviews" && dueReviewWords > 0 ? (
          <Link
            href="/reviews"
            className="mt-[var(--spacing-md)] inline-flex min-h-[var(--spacing-2xl)] min-w-[var(--spacing-2xl)] items-center justify-center rounded-md border border-neutral-300 bg-white px-[var(--spacing-md)] py-[var(--spacing-sm)] text-base font-medium text-neutral-900 transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)] hover:bg-neutral-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-700"
          >
            Review due words
          </Link>
        ) : null}
      </section>

      <section
        aria-label="Today's learning summary"
        className="mt-[var(--spacing-lg)] space-y-[var(--spacing-xs)] text-base text-neutral-800"
      >
        <p>{streak.currentStreakCount}-day streak</p>
        <p>{dueReviewWords} words due for review</p>
      </section>

      <Link
        href="/discover/saved"
        className="mt-[var(--spacing-md)] inline-flex min-h-[var(--spacing-2xl)] items-center text-base font-medium text-primary-700 underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-700"
      >
        View all saved vocabulary
      </Link>

      {savedWords.length > 0 ? (
        <SavedWordPracticeSelector savedWords={savedWords} />
      ) : (
        <section
          id="saved-word-practice-heading"
          className="mt-[var(--spacing-lg)] rounded-md border border-neutral-200 bg-neutral-50 p-[var(--spacing-md)]"
        >
          <h2 className="text-lg font-semibold text-neutral-900">
            Practice a saved word
          </h2>
          <p className="mt-[var(--spacing-sm)] text-base text-neutral-700">
            Save a word from a journey to practice it in a sentence here.
          </p>
        </section>
      )}
    </div>
  );
}

function getRemainingTarget(
  target: number | undefined,
  completed: number | undefined,
) {
  return target === undefined ? null : Math.max(target - (completed ?? 0), 0);
}

function getPrimaryAction({
  missionStatus,
  dueReviewWords,
  remainingReviews,
  remainingNewWords,
  remainingSentencePractices,
  hasSavedWords,
}: {
  missionStatus: "open" | "completed" | "missed" | "protected";
  dueReviewWords: number;
  remainingReviews: number;
  remainingNewWords: number | null;
  remainingSentencePractices: number | null;
  hasSavedWords: boolean;
}) {
  if (missionStatus === "completed") {
    return {
      href: "/progress",
      label: "View your progress",
      description: "See the progress you completed today.",
    };
  }
  if (remainingReviews > 0 && dueReviewWords > 0) {
    return {
      href: "/reviews",
      label: "Start review",
      description: `${dueReviewWords} ${dueReviewWords === 1 ? "word is" : "words are"} ready for review.`,
    };
  }
  if (remainingNewWords !== null && remainingNewWords > 0) {
    return {
      href: "/discover",
      label: "Explore a journey",
      description: `${remainingNewWords} ${remainingNewWords === 1 ? "new word is" : "new words are"} still part of today’s mission.`,
    };
  }
  if (remainingSentencePractices !== null && remainingSentencePractices > 0) {
    return hasSavedWords
      ? {
          href: "#saved-word-practice-heading",
          label: "Practice a saved word",
          description: `${remainingSentencePractices} ${remainingSentencePractices === 1 ? "sentence practice is" : "sentence practices are"} still part of today’s mission.`,
        }
      : {
          href: "/discover",
          label: "Explore a journey",
          description: "Save a word to complete today’s sentence practice.",
        };
  }
  return {
    href: "/discover",
    label: "Explore a journey",
    description: "Find a useful word to save for your next practice session.",
  };
}
