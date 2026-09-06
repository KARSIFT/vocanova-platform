"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import { DueWord, SubmitReviewBody } from "@vocanova/api-client";

import { createApiClient } from "@/lib/api";
import { CSRF_COOKIE_NAME, getCookieValue } from "@/lib/cookies";
import { formatReviewDateTime } from "@/lib/review-schedule";
import { handleApiError } from "@/lib/session";
import { SentenceFeedback } from "../../_components/sentence-feedback";

type Rating = "again" | "hard" | "good" | "easy";

type PromptPhase = "prompt" | "feedback" | "rate";

const RATING_LABELS: Record<Rating, string> = {
  again: "Again",
  hard: "Hard",
  good: "Good",
  easy: "Easy",
};

const RATING_ORDER: Rating[] = ["again", "hard", "good", "easy"];

interface ReviewOption {
  meaningId: string;
  label: string;
}

interface PendingReviewSubmission {
  body: SubmitReviewBody;
  clientAttemptId: string;
  card: DueWord;
}

interface ReviewSessionProps {
  initialDueWords: DueWord[];
  initialTotalCount: number;
  reviewTarget: number;
  reviewsCompleted: number;
  timezone?: string;
}

export function ReviewSession({
  initialDueWords,
  initialTotalCount,
  reviewTarget,
  reviewsCompleted,
  timezone,
}: ReviewSessionProps) {
  const initialSessionLimit = Math.min(
    Math.max(0, reviewTarget - reviewsCompleted),
    initialTotalCount,
  );
  const [dueWords, setDueWords] = useState<DueWord[]>(initialDueWords);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [remainingCount, setRemainingCount] = useState(initialTotalCount);
  const [nextReviewAt, setNextReviewAt] = useState<string | null | undefined>(
    undefined,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRefetching, setIsRefetching] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [completed, setCompleted] = useState(initialSessionLimit === 0);
  const [awaitingNextPage, setAwaitingNextPage] = useState(false);
  const [completedReviewCount, setCompletedReviewCount] = useState(0);
  const [totalSuccessfulReviewCount, setTotalSuccessfulReviewCount] =
    useState(0);
  const [sessionLimit, setSessionLimit] = useState(initialSessionLimit);
  const [phase, setPhase] = useState<PromptPhase>("prompt");
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [lastReviewedCard, setLastReviewedCard] = useState<DueWord | null>(
    null,
  );
  const [lastReviewAttemptId, setLastReviewAttemptId] = useState<string | null>(
    null,
  );
  const submissionInFlight = useRef(false);
  const pendingSubmission = useRef<PendingReviewSubmission | null>(null);
  const shouldFocusNextCard = useRef(false);
  const currentCardHeadingRef = useRef<HTMLHeadingElement>(null);
  const completionHeadingRef = useRef<HTMLHeadingElement>(null);
  const nextActionRef = useRef<HTMLButtonElement>(null);
  const retrySubmissionRef = useRef<HTMLButtonElement>(null);
  const retryLoadingReviewsRef = useRef<HTMLButtonElement>(null);

  const currentCard = dueWords[currentIndex];

  const promptType = currentCard
    ? determinePromptType(dueWords, currentIndex)
    : null;
  const options = useMemo(
    () =>
      currentCard && promptType === "multiple_choice"
        ? buildMultipleChoiceOptions(dueWords, currentIndex)
        : null,
    [currentCard, currentIndex, dueWords, promptType],
  );

  useEffect(() => {
    setPhase("prompt");
    setSelectedOption(null);
    setErrorMessage(null);
    setStartTime(Date.now());
  }, [completed, currentIndex, dueWords]);

  useEffect(() => {
    const heading = currentCardHeadingRef.current;
    if (
      !completed &&
      !isRefetching &&
      !awaitingNextPage &&
      shouldFocusNextCard.current &&
      heading
    ) {
      heading.focus();
      shouldFocusNextCard.current = false;
    }
  }, [completed, currentIndex, dueWords, isRefetching, awaitingNextPage]);

  useEffect(() => {
    if (completed && shouldFocusNextCard.current) {
      completionHeadingRef.current?.focus();
      shouldFocusNextCard.current = false;
    }
  }, [completed]);

  useEffect(() => {
    if (
      phase === "feedback" ||
      (promptType === "self_check" && phase === "rate")
    ) {
      nextActionRef.current?.focus();
    }
  }, [phase, promptType]);

  useEffect(() => {
    if (errorMessage && pendingSubmission.current && !isSubmitting) {
      retrySubmissionRef.current?.focus();
    }
  }, [errorMessage, isSubmitting]);

  useEffect(() => {
    if (awaitingNextPage && !isRefetching) {
      retryLoadingReviewsRef.current?.focus();
    }
  }, [awaitingNextPage, isRefetching]);

  const loadNextPage = () => {
    setAwaitingNextPage(false);
    setErrorMessage(null);
    setIsRefetching(true);
    const client = createApiClient();
    void client
      .listDueWords({ limit: 50 })
      .then(({ data }) => {
        setNextReviewAt(data.nextReviewAt);
        if (data.items.length > 0) {
          setDueWords(data.items);
          setRemainingCount(data.totalCount);
          setCurrentIndex(0);
        } else {
          setRemainingCount(0);
          setCompleted(true);
        }
      })
      .catch((error) => {
        setAwaitingNextPage(true);
        setErrorMessage(
          handleApiError(error, "Unable to load more words. Please try again."),
        );
      })
      .finally(() => {
        setIsRefetching(false);
      });
  };

  const advance = (
    nextCompletedReviewCount: number,
    nextRemainingCount: number,
  ) => {
    if (currentIndex + 1 < dueWords.length) {
      setCurrentIndex((index) => index + 1);
      return;
    }

    if (nextRemainingCount === 0) {
      loadNextPage();
      return;
    }

    if (nextCompletedReviewCount >= sessionLimit) {
      setCompleted(true);
      return;
    }

    loadNextPage();
  };

  const startOptionalSession = () => {
    const nextSessionLimit = Math.min(reviewTarget, remainingCount);
    if (nextSessionLimit === 0) {
      return;
    }
    setCompletedReviewCount(0);
    setSessionLimit(nextSessionLimit);
    setCompleted(false);
    setAwaitingNextPage(false);
    setErrorMessage(null);
    shouldFocusNextCard.current = true;
    const nextCardIndex = sessionLimit > 0 ? currentIndex + 1 : currentIndex;
    if (nextCardIndex < dueWords.length) {
      setCurrentIndex(nextCardIndex);
    } else {
      loadNextPage();
    }
  };

  const submitAttempt = async (attempt?: {
    result: "correct" | "incorrect";
    rating: Rating;
    selectedOptionMeaningId?: string;
  }) => {
    if (submissionInFlight.current) {
      return;
    }

    let submission = pendingSubmission.current;
    if (!submission) {
      if (!attempt || !currentCard) {
        return;
      }

      const csrfToken = getCookieValue(CSRF_COOKIE_NAME);
      if (!csrfToken) {
        setErrorMessage("Session is not ready. Please refresh the page.");
        return;
      }

      const clientAttemptId = generateClientAttemptId();
      submission = {
        card: currentCard,
        clientAttemptId,
        body: {
          userWordId: currentCard.userWordId,
          meaningId: currentCard.meaningId,
          attemptType: "review",
          promptType:
            promptType === "multiple_choice" ? "multiple_choice" : "self_check",
          result: attempt.result,
          rating: attempt.rating,
          answeredAt: new Date().toISOString(),
          responseTimeMs: Math.max(0, Date.now() - startTime),
          selectedOptionMeaningId: attempt.selectedOptionMeaningId,
          wasHintUsed: false,
          source: "review_session",
          clientAttemptId,
        },
      };
      pendingSubmission.current = submission;
    }

    const csrfToken = getCookieValue(CSRF_COOKIE_NAME);
    if (!csrfToken) {
      setErrorMessage("Session is not ready. Please refresh the page.");
      return;
    }

    submissionInFlight.current = true;
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const client = createApiClient();
      const { data } = await client.submitReview(
        submission.body,
        submission.clientAttemptId,
        { headers: { "X-CSRF-Token": csrfToken } },
      );
      pendingSubmission.current = null;
      setLastReviewedCard(submission.card);
      setLastReviewAttemptId(data.attemptId);
      const nextCompletedReviewCount = completedReviewCount + 1;
      const nextRemainingCount = Math.max(0, remainingCount - 1);
      setCompletedReviewCount(nextCompletedReviewCount);
      setTotalSuccessfulReviewCount((count) => count + 1);
      setRemainingCount(nextRemainingCount);
      shouldFocusNextCard.current = true;
      advance(nextCompletedReviewCount, nextRemainingCount);
    } catch (error) {
      setErrorMessage(
        handleApiError(
          error,
          "Unable to submit your answer. Please try again.",
        ),
      );
    } finally {
      submissionInFlight.current = false;
      setIsSubmitting(false);
    }
  };

  const isLoading = isSubmitting || isRefetching;

  if (dueWords.length === 0 || completed) {
    const hasRemainingDueWords = remainingCount > 0;
    const sessionWasStarted = sessionLimit > 0;
    const canContinue = hasRemainingDueWords && sessionWasStarted;
    const canStartOptionalPractice = hasRemainingDueWords && !sessionWasStarted;
    const reviewTargetReached =
      reviewsCompleted + totalSuccessfulReviewCount >= reviewTarget;
    return (
      <div className="flex flex-col items-center justify-center py-[var(--spacing-2xl)] text-center">
        <h2
          ref={completionHeadingRef}
          tabIndex={-1}
          className="text-xl font-semibold text-neutral-900"
        >
          {sessionWasStarted
            ? "Review session complete"
            : "Review target reached"}
        </h2>
        <p className="mt-[var(--spacing-sm)] text-base text-neutral-700">
          {nextReviewAt
            ? `Your next review is ${formatReviewDateTime(nextReviewAt, timezone)}.`
            : sessionWasStarted
              ? reviewTargetReached
                ? "You reached today’s review target."
                : "No more due words are available for this session."
              : "You’ve already reached today’s review target."}
        </p>
        {sessionWasStarted ? (
          <p className="mt-[var(--spacing-xs)] text-base text-neutral-700">
            You completed {completedReviewCount} review
            {completedReviewCount === 1 ? "" : "s"} in this session.
          </p>
        ) : null}
        <Link
          href="/home"
          className="mt-[var(--spacing-lg)] inline-flex min-h-[var(--spacing-2xl)] min-w-[var(--spacing-2xl)] items-center justify-center rounded-md bg-primary-600 px-[var(--spacing-md)] py-[var(--spacing-sm)] text-base font-medium text-neutral-50 transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)] hover:bg-primary-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-700"
        >
          Back to Home
        </Link>
        {canContinue || canStartOptionalPractice ? (
          <button
            type="button"
            onClick={startOptionalSession}
            className="mt-[var(--spacing-md)] min-h-[var(--spacing-2xl)] rounded-md border border-neutral-300 bg-white px-[var(--spacing-md)] py-[var(--spacing-sm)] text-base font-medium text-neutral-900 transition-colors hover:bg-neutral-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-700"
          >
            {canStartOptionalPractice
              ? `Start optional practice (up to ${Math.min(reviewTarget, remainingCount)} reviews)`
              : `Continue with up to ${Math.min(reviewTarget, remainingCount)} more reviews`}
          </button>
        ) : null}
        {lastReviewedCard && lastReviewAttemptId ? (
          // max-w-[28rem] (not max-w-md): see the token-collision note on
          // /onboarding's page.tsx - tokens.generated.css's --spacing-md
          // (16px) shadows the intended 28rem max-w-md container size,
          // which otherwise collapses this section to a near-zero-width
          // column (confirmed via core-loop test: the
          // "Practice with pour" heading word-wrapped to 0px measured
          // width and Playwright reported it as hidden).
          <div className="mt-[var(--spacing-lg)] w-full max-w-[28rem] text-left">
            <SentenceFeedback
              targetWord={lastReviewedCard.wordText}
              attemptId={lastReviewAttemptId}
              source="review"
              shortDefinition={lastReviewedCard.shortDefinition}
            />
          </div>
        ) : null}
      </div>
    );
  }

  if (!currentCard) {
    return null;
  }

  if (isRefetching) {
    return (
      <p role="status" className="text-base text-neutral-700">
        Loading more reviews…
      </p>
    );
  }

  if (awaitingNextPage) {
    return (
      <div className="rounded-md border border-neutral-200 bg-white p-[var(--spacing-md)]">
        <p role="alert" className="text-sm text-red-700">
          {errorMessage}
        </p>
        <button
          ref={retryLoadingReviewsRef}
          type="button"
          onClick={loadNextPage}
          disabled={isRefetching}
          className="mt-[var(--spacing-md)] min-h-[var(--spacing-2xl)] rounded-md bg-primary-600 px-[var(--spacing-md)] py-[var(--spacing-sm)] text-base font-medium text-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Retry loading reviews
        </button>
      </div>
    );
  }

  const isMultipleChoiceCorrect =
    promptType === "multiple_choice" &&
    selectedOption === currentCard.meaningId;
  const isMultipleChoiceIncorrect =
    promptType === "multiple_choice" &&
    selectedOption !== null &&
    selectedOption !== currentCard.meaningId;

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-neutral-600">
          {Math.max(0, sessionLimit - completedReviewCount)} review
          {sessionLimit - completedReviewCount === 1 ? "" : "s"} remaining in
          this session
        </p>
        <p className="text-sm text-neutral-500">
          Card {completedReviewCount + 1} of {sessionLimit}
        </p>
      </div>

      {isSubmitting ? (
        <p
          role="status"
          aria-live="polite"
          className="mt-[var(--spacing-md)] text-sm text-neutral-700"
        >
          Submitting review…
        </p>
      ) : null}

      <div className="mt-[var(--spacing-md)] rounded-md border border-neutral-200 bg-white p-[var(--spacing-md)] shadow-sm">
        <div className="mb-[var(--spacing-lg)] text-center">
          <span className="inline-block max-w-full wrap-break-word rounded-full bg-neutral-100 px-[var(--spacing-sm)] py-[var(--spacing-xs)] text-sm text-neutral-700">
            {currentCard.partOfSpeech}
          </span>
          <h2
            ref={currentCardHeadingRef}
            tabIndex={-1}
            className="mt-[var(--spacing-sm)] wrap-break-word text-3xl font-semibold text-neutral-900"
          >
            {currentCard.wordText}
          </h2>
          {promptType === "self_check" && phase !== "rate" ? (
            <p className="mt-[var(--spacing-sm)] text-base text-neutral-600">
              Think of the meaning, then reveal the answer.
            </p>
          ) : null}
          {promptType === "multiple_choice" ? (
            <p className="mt-[var(--spacing-sm)] text-base text-neutral-700">
              Select the matching meaning.
            </p>
          ) : null}
        </div>

        {promptType === "self_check" && phase === "rate" ? (
          <div className="mb-[var(--spacing-lg)] rounded-md bg-primary-50 p-[var(--spacing-md)] text-center">
            <p className="text-sm font-medium text-primary-900">Answer</p>
            <p className="mt-[var(--spacing-xs)] wrap-break-word text-lg text-primary-900">
              {currentCard.shortDefinition}
            </p>
            <p role="status" aria-live="polite" className="sr-only">
              Answer revealed. Choose how well you knew this word.
            </p>
          </div>
        ) : null}

        {promptType === "multiple_choice" && options ? (
          <fieldset className="mb-[var(--spacing-lg)] min-w-0">
            <legend className="sr-only">
              Choose the meaning for {currentCard.wordText}
            </legend>
            <div className="space-y-[var(--spacing-sm)]">
              {options.map((option) => {
                const isSelected = selectedOption === option.meaningId;
                const isCorrect = option.meaningId === currentCard.meaningId;
                const showCorrectness = phase === "feedback";
                const isDisabled = isLoading || phase === "feedback";
                return (
                  <button
                    key={option.meaningId}
                    type="button"
                    aria-pressed={isSelected}
                    disabled={isDisabled}
                    onClick={() => {
                      if (phase === "prompt") {
                        setSelectedOption(option.meaningId);
                        setPhase("feedback");
                      }
                    }}
                    className={`min-h-[var(--spacing-2xl)] w-full rounded-md border px-[var(--spacing-md)] py-[var(--spacing-sm)] text-left text-base transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-700 disabled:cursor-not-allowed disabled:opacity-60 ${
                      showCorrectness && isCorrect
                        ? "border-primary-500 bg-primary-50 text-primary-900"
                        : showCorrectness && isSelected && !isCorrect
                          ? "border-red-300 bg-red-50 text-red-900"
                          : "border-neutral-200 bg-neutral-50 text-neutral-900 hover:bg-neutral-100"
                    }`}
                  >
                    <span className="wrap-break-word font-medium">
                      {option.label}
                    </span>
                    {showCorrectness && isCorrect ? (
                      <span className="ml-[var(--spacing-sm)] text-sm">
                        (correct)
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </fieldset>
        ) : null}

        {promptType === "self_check" && phase === "prompt" ? (
          <button
            type="button"
            onClick={() => setPhase("rate")}
            disabled={isLoading}
            className="min-h-[var(--spacing-2xl)] w-full rounded-md border border-neutral-200 bg-neutral-50 px-[var(--spacing-md)] py-[var(--spacing-sm)] text-base font-medium text-neutral-900 transition-colors hover:bg-neutral-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Show answer
          </button>
        ) : null}

        {phase === "feedback" && isMultipleChoiceIncorrect ? (
          <div className="mb-[var(--spacing-lg)] rounded-md border border-red-200 bg-red-50 p-[var(--spacing-md)]">
            <p role="status" aria-live="polite" className="sr-only">
              Incorrect. The correct answer is shown. Continue to record this
              review.
            </p>
            <p className="font-medium text-red-900">Not quite</p>
            <p className="mt-[var(--spacing-xs)] wrap-break-word text-base text-red-800">
              The correct answer was: {currentCard.shortDefinition}
            </p>
            <button
              ref={nextActionRef}
              type="button"
              onClick={() =>
                submitAttempt({
                  result: "incorrect",
                  rating: "again",
                  selectedOptionMeaningId: selectedOption ?? undefined,
                })
              }
              disabled={isLoading}
              className="mt-[var(--spacing-md)] min-h-[var(--spacing-2xl)] w-full rounded-md bg-primary-600 px-[var(--spacing-md)] py-[var(--spacing-sm)] text-base font-medium text-neutral-50 transition-colors hover:bg-primary-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Continue
            </button>
          </div>
        ) : null}

        {(phase === "feedback" && isMultipleChoiceCorrect) ||
        (promptType === "self_check" && phase === "rate") ? (
          <div className="mb-[var(--spacing-lg)]">
            {isMultipleChoiceCorrect ? (
              <p
                role="status"
                aria-live="polite"
                className="mb-[var(--spacing-md)] text-center text-lg font-medium text-primary-900"
              >
                Correct. Choose how well you knew this word.
              </p>
            ) : null}
            <fieldset>
              <legend className="sr-only">
                {isMultipleChoiceCorrect
                  ? "How well did you know this word?"
                  : "How well did you know this word?"}
              </legend>
              <div
                className={`grid gap-[var(--spacing-sm)] ${
                  isMultipleChoiceCorrect ? "grid-cols-3" : "grid-cols-2"
                }`}
              >
                {(isMultipleChoiceCorrect
                  ? RATING_ORDER.filter((rating) => rating !== "again")
                  : RATING_ORDER
                ).map((rating, index) => (
                  <button
                    key={rating}
                    ref={index === 0 ? nextActionRef : undefined}
                    type="button"
                    onClick={() =>
                      submitAttempt({
                        result: rating === "again" ? "incorrect" : "correct",
                        rating,
                        selectedOptionMeaningId:
                          promptType === "multiple_choice"
                            ? currentCard.meaningId
                            : undefined,
                      })
                    }
                    disabled={isLoading}
                    className="min-h-[var(--spacing-2xl)] rounded-md border border-neutral-200 bg-neutral-50 px-[var(--spacing-md)] py-[var(--spacing-sm)] text-base font-medium text-neutral-900 transition-colors hover:bg-neutral-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {RATING_LABELS[rating]}
                  </button>
                ))}
              </div>
            </fieldset>
          </div>
        ) : null}

        {errorMessage ? (
          <p
            role="alert"
            aria-live="polite"
            className="mt-[var(--spacing-md)] rounded-md bg-red-50 p-[var(--spacing-sm)] text-sm text-red-700"
          >
            {errorMessage}
          </p>
        ) : null}
        {errorMessage && pendingSubmission.current ? (
          <button
            ref={retrySubmissionRef}
            type="button"
            onClick={() => void submitAttempt()}
            disabled={isLoading}
            className="mt-[var(--spacing-md)] min-h-[var(--spacing-2xl)] rounded-md bg-primary-600 px-[var(--spacing-md)] py-[var(--spacing-sm)] text-base font-medium text-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Retry submission
          </button>
        ) : null}
      </div>
    </div>
  );
}

function determinePromptType(
  dueWords: DueWord[],
  currentIndex: number,
): "multiple_choice" | "self_check" {
  // Build a mix of both prompt types when possible: even-indexed cards use
  // multiple-choice if enough distractors exist, otherwise fall back to self-check.
  if (
    availableChoiceCount(dueWords, currentIndex) >= 4 &&
    currentIndex % 2 === 0
  ) {
    return "multiple_choice";
  }
  return "self_check";
}

function availableChoiceCount(
  dueWords: DueWord[],
  currentIndex: number,
): number {
  return dueWords[currentIndex] ? Math.min(dueWords.length, 4) : 0;
}

function buildMultipleChoiceOptions(
  dueWords: DueWord[],
  currentIndex: number,
): ReviewOption[] {
  const current = dueWords[currentIndex];
  if (!current) {
    return [];
  }
  const distractors = dueWords
    .filter((_, index) => index !== currentIndex)
    .slice(0, 3)
    .map((dueWord) => ({
      meaningId: dueWord.meaningId,
      label: `${dueWord.partOfSpeech} — ${dueWord.shortDefinition}`,
    }));
  const all = [
    {
      meaningId: current.meaningId,
      label: `${current.partOfSpeech} — ${current.shortDefinition}`,
    },
    ...distractors,
  ];
  return shuffleArray(all);
}

function shuffleArray<T>(items: readonly T[]): T[] {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index--) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    const temp = result[index]!;
    result[index] = result[swapIndex]!;
    result[swapIndex] = temp;
  }
  return result;
}

function generateClientAttemptId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
