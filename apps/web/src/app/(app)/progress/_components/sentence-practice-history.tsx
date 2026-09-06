"use client";

import { useEffect, useRef, useState } from "react";

import type { SentenceFeedbackHistoryItem } from "@vocanova/api-client";

import { createApiClient } from "@/lib/api";
import { handleApiError } from "@/lib/session";

interface Props {
  initialItems: SentenceFeedbackHistoryItem[];
  initialNextCursor?: string;
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function SentencePracticeHistory({
  initialItems,
  initialNextCursor,
}: Props) {
  const [items, setItems] = useState(initialItems);
  const [nextCursor, setNextCursor] = useState(initialNextCursor);
  const [loading, setLoading] = useState(false);
  const [reachedEnd, setReachedEnd] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [focusNewItem, setFocusNewItem] = useState<number | null>(null);
  const button = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (focusNewItem !== null) {
      document.getElementById("sentence-history-first-appended")?.focus();
      setFocusNewItem(null);
    }
  }, [focusNewItem, items]);

  async function loadMore() {
    if (!nextCursor || loading) return;
    setLoading(true);
    setError(null);
    try {
      const { data } = await createApiClient().listSentenceFeedbackHistory({
        after: nextCursor,
        limit: 10,
      });
      setFocusNewItem(data.items.length ? items.length : null);
      setItems((current) => [...current, ...data.items]);
      setNextCursor(data.nextCursor);
      setReachedEnd(!data.nextCursor);
    } catch (cause) {
      setError(
        handleApiError(
          cause,
          "We couldn't load more sentence practice. Please try again.",
        ),
      );
      button.current?.focus();
    } finally {
      setLoading(false);
    }
  }

  if (!items.length) {
    return (
      <p className="mt-[var(--spacing-xs)] text-base text-neutral-700">
        No sentence practice yet. Write a sentence from a saved word to see your
        feedback here.
      </p>
    );
  }

  return (
    <>
      <ul className="mt-[var(--spacing-md)] space-y-[var(--spacing-md)]">
        {items.map((item, index) => (
          <li
            key={item.attemptId}
            id={
              index === focusNewItem
                ? "sentence-history-first-appended"
                : undefined
            }
            tabIndex={index === focusNewItem ? -1 : undefined}
            className="min-w-0 rounded-md bg-white p-[var(--spacing-sm)]"
          >
            <p className="wrap-break-word font-semibold text-neutral-900">
              {item.targetWord ?? "Sentence practice"}
            </p>
            {item.targetMeaning ? (
              <p className="wrap-break-word text-sm text-neutral-700">
                {item.targetMeaning}
              </p>
            ) : null}
            <time
              dateTime={item.completedAt}
              className="mt-[var(--spacing-xs)] block text-sm text-neutral-700"
            >
              {formatDate(item.completedAt)}
            </time>
            <p className="mt-[var(--spacing-sm)] text-sm font-medium text-neutral-900">
              Result: {item.status.replaceAll("_", " ")}
            </p>
            <p className="mt-[var(--spacing-xs)] wrap-break-word text-base text-neutral-900">
              Your sentence: {item.originalSentence}
            </p>
            {item.correctedSentence ? (
              <p className="mt-[var(--spacing-xs)] wrap-break-word text-base text-neutral-700">
                Correction: {item.correctedSentence}
              </p>
            ) : null}
            <p className="mt-[var(--spacing-xs)] wrap-break-word text-base text-neutral-700">
              Feedback: {item.explanation}
            </p>
            {item.improvementTip ? (
              <p className="mt-[var(--spacing-xs)] wrap-break-word text-base text-neutral-700">
                Tip: {item.improvementTip}
              </p>
            ) : null}
          </li>
        ))}
      </ul>
      {nextCursor ? (
        <button
          ref={button}
          type="button"
          onClick={loadMore}
          disabled={loading}
          className="mt-[var(--spacing-md)] min-h-[var(--spacing-2xl)] rounded-md border border-neutral-300 bg-white px-[var(--spacing-md)] py-[var(--spacing-sm)] text-base font-medium text-neutral-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-700 disabled:opacity-50"
        >
          {loading
            ? "Loading sentence practice..."
            : "Load more sentence practice"}
        </button>
      ) : null}
      <p
        role="status"
        className="mt-[var(--spacing-sm)] text-base text-neutral-700"
      >
        {reachedEnd ? "All sentence practice is shown." : ""}
      </p>
      {error ? (
        <p
          role="alert"
          className="mt-[var(--spacing-sm)] text-base text-red-700"
        >
          {error}
        </p>
      ) : null}
    </>
  );
}
