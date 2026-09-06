"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import type { SavedMeaning } from "@vocanova/api-client";

import { createApiClient } from "@/lib/api";
import { formatReviewDateTime, isDueReview } from "@/lib/review-schedule";
import { handleApiError } from "@/lib/session";

interface SavedVocabularyListProps {
  initialItems: SavedMeaning[];
  initialNextCursor?: string;
}

export function SavedVocabularyList({
  initialItems,
  initialNextCursor,
}: SavedVocabularyListProps) {
  const [items, setItems] = useState(initialItems);
  const [nextCursor, setNextCursor] = useState(initialNextCursor);
  const [isLoading, setIsLoading] = useState(false);
  const [reachedEnd, setReachedEnd] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const loadMoreButton = useRef<HTMLButtonElement>(null);
  const [shouldRefocusLoadMore, setShouldRefocusLoadMore] = useState(false);
  const [focusItemIndex, setFocusItemIndex] = useState<number | null>(null);

  useEffect(() => {
    const focusedItemLink = document.getElementById(
      "saved-vocabulary-first-appended",
    );
    if (
      focusItemIndex !== null &&
      focusedItemLink instanceof HTMLAnchorElement
    ) {
      focusedItemLink.focus();
      setFocusItemIndex(null);
    }
  }, [focusItemIndex, items]);

  useEffect(() => {
    if (shouldRefocusLoadMore && !isLoading) {
      loadMoreButton.current?.focus();
      setShouldRefocusLoadMore(false);
    }
  }, [isLoading, shouldRefocusLoadMore]);

  async function loadMore() {
    if (!nextCursor || isLoading) return;
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const { data } = await createApiClient().listSavedWords({
        after: nextCursor,
        limit: 10,
      });
      setFocusItemIndex(
        data.items.length > 0 ? items.length : items.length - 1,
      );
      setReachedEnd(!data.nextCursor);
      setItems((current) => [...current, ...data.items]);
      setNextCursor(data.nextCursor);
    } catch (error) {
      setErrorMessage(
        handleApiError(
          error,
          "We couldn't load more saved words. Please try again.",
        ),
      );
      setShouldRefocusLoadMore(true);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <ul className="mt-[var(--spacing-lg)] space-y-[var(--spacing-md)]">
        {items.map((item, index) => (
          <li key={item.userWordId}>
            <Link
              id={
                index === focusItemIndex
                  ? "saved-vocabulary-first-appended"
                  : undefined
              }
              href={`/discover/saved/${encodeURIComponent(item.wordSlug)}?meaning=${encodeURIComponent(item.meaningId)}`}
              className="block rounded-md border border-neutral-200 bg-neutral-50 p-[var(--spacing-md)] shadow-sm hover:border-primary-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-primary-600"
            >
              <p className="wrap-break-word text-lg font-semibold text-neutral-900">
                {item.wordText}
              </p>
              <p className="mt-[var(--spacing-xs)] wrap-break-word text-sm text-neutral-600">
                {item.partOfSpeech}
              </p>
              <p className="mt-[var(--spacing-xs)] wrap-break-word text-base text-neutral-700">
                {item.shortDefinition}
              </p>
              {item.nextReviewAt !== undefined ? (
                <p className="mt-[var(--spacing-xs)] text-sm text-neutral-700">
                  {item.nextReviewAt === null || isDueReview(item.nextReviewAt)
                    ? "Due now"
                    : `Next review: ${formatReviewDateTime(item.nextReviewAt)}`}
                </p>
              ) : null}
            </Link>
          </li>
        ))}
      </ul>
      {nextCursor ? (
        <button
          ref={loadMoreButton}
          type="button"
          onClick={loadMore}
          disabled={isLoading}
          className="mt-[var(--spacing-lg)] min-h-[var(--spacing-2xl)] rounded-md border border-neutral-300 bg-white px-[var(--spacing-md)] py-[var(--spacing-sm)] text-base font-medium text-neutral-900 disabled:opacity-50"
        >
          {isLoading ? "Loading saved words..." : "Load more saved words"}
        </button>
      ) : null}
      <p
        role="status"
        className="mt-[var(--spacing-sm)] text-base text-neutral-700"
      >
        {reachedEnd ? "All saved words are shown." : ""}
      </p>
      {errorMessage ? (
        <p
          role="alert"
          className="mt-[var(--spacing-sm)] text-base text-red-700"
        >
          {errorMessage}
        </p>
      ) : null}
    </>
  );
}
