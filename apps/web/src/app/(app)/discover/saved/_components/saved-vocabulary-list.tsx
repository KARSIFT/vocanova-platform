"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";

import type { SavedMeaning } from "@vocanova/api-client";

import { createApiClient } from "@/lib/api";
import { formatReviewDateTime, isDueReview } from "@/lib/review-schedule";
import { handleApiError } from "@/lib/session";

interface SavedVocabularyListProps {
  initialItems: SavedMeaning[];
  initialNextCursor?: string;
  timezone?: string;
}

export function SavedVocabularyList({
  initialItems,
  initialNextCursor,
  timezone,
}: SavedVocabularyListProps) {
  const [items, setItems] = useState(initialItems);
  const [nextCursor, setNextCursor] = useState(initialNextCursor);
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingAction, setLoadingAction] = useState<"search" | "more" | null>(
    null,
  );
  const [reachedEnd, setReachedEnd] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [searchFailed, setSearchFailed] = useState(false);
  const loadMoreButton = useRef<HTMLButtonElement>(null);
  const resultsHeading = useRef<HTMLHeadingElement>(null);
  const [shouldRefocusLoadMore, setShouldRefocusLoadMore] = useState(false);
  const [shouldFocusResults, setShouldFocusResults] = useState(false);
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

  useEffect(() => {
    if (shouldFocusResults && !isLoading) {
      resultsHeading.current?.focus();
      setShouldFocusResults(false);
    }
  }, [isLoading, shouldFocusResults]);

  async function search(nextQuery: string) {
    if (isLoading) return;
    setIsLoading(true);
    setLoadingAction("search");
    setErrorMessage(null);
    setSearchFailed(false);
    try {
      const { data } = await createApiClient().listSavedWords({
        limit: 10,
        ...(nextQuery && { query: nextQuery }),
      });
      setItems(data.items);
      setNextCursor(data.nextCursor);
      setSubmittedQuery(nextQuery);
      setReachedEnd(!data.nextCursor);
      setShouldFocusResults(true);
    } catch (error) {
      setErrorMessage(
        handleApiError(
          error,
          "We couldn't search saved words. Please try again.",
        ),
      );
      setSearchFailed(true);
    } finally {
      setIsLoading(false);
      setLoadingAction(null);
    }
  }

  async function loadMore() {
    if (!nextCursor || isLoading) return;
    setIsLoading(true);
    setLoadingAction("more");
    setErrorMessage(null);
    setSearchFailed(false);
    try {
      const { data } = await createApiClient().listSavedWords({
        after: nextCursor,
        limit: 10,
        ...(submittedQuery && { query: submittedQuery }),
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
      setLoadingAction(null);
    }
  }

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void search(query);
  }

  function clearSearch() {
    setQuery("");
    void search("");
  }

  const hasSearch = submittedQuery.trim().length > 0;
  const showEmptyLibrary = items.length === 0 && !hasSearch;
  const showNoMatches = items.length === 0 && hasSearch;

  return (
    <section className="mt-[var(--spacing-lg)]" aria-busy={isLoading}>
      <form
        className="flex flex-wrap gap-[var(--spacing-sm)]"
        onSubmit={submitSearch}
      >
        <label className="flex min-w-[min(100%,18rem)] flex-1 flex-col gap-[var(--spacing-xs)] text-base font-medium text-neutral-900">
          Search saved vocabulary
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Word or short definition"
            className="min-h-[var(--spacing-2xl)] rounded-md border border-neutral-300 bg-white px-[var(--spacing-md)] py-[var(--spacing-sm)] text-base font-normal text-neutral-900 placeholder:text-neutral-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-700"
          />
        </label>
        <div className="flex items-end gap-[var(--spacing-sm)]">
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex min-h-[var(--spacing-2xl)] items-center justify-center rounded-md bg-primary-600 px-[var(--spacing-md)] py-[var(--spacing-sm)] text-base font-medium text-neutral-50 transition-colors hover:bg-primary-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Search
          </button>
          {(query || hasSearch) && (
            <button
              type="button"
              onClick={clearSearch}
              disabled={isLoading}
              className="inline-flex min-h-[var(--spacing-2xl)] items-center justify-center rounded-md border border-neutral-300 bg-white px-[var(--spacing-md)] py-[var(--spacing-sm)] text-base font-medium text-neutral-900 transition-colors hover:bg-neutral-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Clear search
            </button>
          )}
        </div>
      </form>
      {!showEmptyLibrary ? (
        <>
          <h2
            ref={resultsHeading}
            tabIndex={-1}
            className="mt-[var(--spacing-lg)] text-xl font-semibold text-neutral-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-700"
          >
            {hasSearch ? "Search results" : "Saved words"}
          </h2>
          <p
            role="status"
            className="mt-[var(--spacing-xs)] text-base text-neutral-700"
          >
            {isLoading
              ? loadingAction === "search"
                ? "Searching saved words..."
                : "Loading more saved words..."
              : reachedEnd
                ? "All saved words are shown."
                : ""}
          </p>
        </>
      ) : null}
      {showEmptyLibrary ? (
        <section className="mt-[var(--spacing-lg)] rounded-md border border-neutral-200 bg-neutral-50 p-[var(--spacing-md)]">
          <h2 className="text-lg font-semibold text-neutral-900">
            No saved words yet
          </h2>
          <p className="mt-[var(--spacing-xs)] text-base text-neutral-700">
            Save words from a journey to build your vocabulary library.
          </p>
          <Link
            href="/discover"
            className="mt-[var(--spacing-md)] inline-flex min-h-[var(--spacing-2xl)] items-center rounded-md bg-primary-600 px-[var(--spacing-md)] py-[var(--spacing-sm)] text-base font-medium text-neutral-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-700"
          >
            Explore journeys
          </Link>
        </section>
      ) : null}
      {showNoMatches ? (
        <section className="mt-[var(--spacing-lg)] rounded-md border border-neutral-200 bg-neutral-50 p-[var(--spacing-md)]">
          <h3 className="text-lg font-semibold text-neutral-900">
            No saved words match your search
          </h3>
          <p className="mt-[var(--spacing-xs)] text-base text-neutral-700">
            This filter found no saved words. Clear the search to see your full
            vocabulary library.
          </p>
          <button
            type="button"
            onClick={clearSearch}
            disabled={isLoading}
            className="mt-[var(--spacing-md)] inline-flex min-h-[var(--spacing-2xl)] items-center rounded-md border border-neutral-300 bg-white px-[var(--spacing-md)] py-[var(--spacing-sm)] text-base font-medium text-neutral-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Clear search
          </button>
        </section>
      ) : null}
      {items.length ? (
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
                    {item.nextReviewAt === null ||
                    isDueReview(item.nextReviewAt)
                      ? "Due now"
                      : `Next review: ${formatReviewDateTime(item.nextReviewAt, timezone)}`}
                  </p>
                ) : null}
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
      {nextCursor ? (
        <button
          ref={loadMoreButton}
          type="button"
          onClick={loadMore}
          disabled={isLoading}
          aria-busy={isLoading}
          className="mt-[var(--spacing-lg)] inline-flex min-h-[var(--spacing-2xl)] min-w-[var(--spacing-2xl)] items-center justify-center rounded-md border border-neutral-300 bg-white px-[var(--spacing-md)] py-[var(--spacing-sm)] text-base font-medium text-neutral-900 transition-colors hover:bg-neutral-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Load more saved words
        </button>
      ) : null}
      {errorMessage ? (
        <div className="mt-[var(--spacing-sm)]">
          <p role="alert" className="text-base text-red-700">
            {errorMessage}
          </p>
          {searchFailed ? (
            <button
              type="button"
              onClick={() => void search(query)}
              className="mt-[var(--spacing-sm)] inline-flex min-h-[var(--spacing-2xl)] items-center rounded-md border border-neutral-300 bg-white px-[var(--spacing-md)] py-[var(--spacing-sm)] text-base font-medium text-neutral-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-700"
            >
              Try search again
            </button>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
