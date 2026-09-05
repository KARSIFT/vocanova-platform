"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import type { Situation } from "@vocanova/api-client";

import { createApiClient } from "@/lib/api";
import { handleApiError } from "@/lib/session";

interface JourneySituationListProps {
  initialItems: Situation[];
  initialNextCursor?: string;
}

export function JourneySituationList({
  initialItems,
  initialNextCursor,
}: JourneySituationListProps) {
  const [items, setItems] = useState(initialItems);
  const [nextCursor, setNextCursor] = useState(initialNextCursor);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [focusIndex, setFocusIndex] = useState<number | null>(null);
  const appendedJourneyRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (focusIndex !== null) {
      appendedJourneyRef.current?.focus();
      setFocusIndex(null);
    }
  }, [focusIndex, items]);

  async function loadMore() {
    if (!nextCursor || isLoading) return;

    setIsLoading(true);
    setErrorMessage(null);
    try {
      const { data } = await createApiClient().listJourneySituations({
        after: nextCursor,
      });
      setFocusIndex(data.items.length > 0 ? items.length : items.length - 1);
      setItems((current) => [...current, ...data.items]);
      setNextCursor(data.nextCursor);
    } catch (error) {
      setErrorMessage(
        handleApiError(
          error,
          "We couldn't load more journeys. Please try again.",
        ),
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <ul className="mt-[var(--spacing-lg)] grid grid-cols-1 gap-[var(--spacing-md)] sm:grid-cols-2">
        {items.map((situation, index) => (
          <li key={situation.slug}>
            <Link
              href={`/discover/${situation.slug}`}
              ref={index === focusIndex ? appendedJourneyRef : undefined}
              className="block rounded-md border border-neutral-200 bg-neutral-50 p-[var(--spacing-md)] shadow-sm hover:border-primary-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-primary-600"
            >
              <h2 className="text-lg font-semibold text-neutral-900">
                {situation.title}
              </h2>
              <p className="mt-[var(--spacing-xs)] text-base text-neutral-700">
                {situation.shortDescription}
              </p>
            </Link>
          </li>
        ))}
      </ul>
      {nextCursor ? (
        <div className="mt-[var(--spacing-lg)]">
          <button
            type="button"
            onClick={loadMore}
            disabled={isLoading}
            aria-busy={isLoading}
            className="inline-flex min-h-[var(--spacing-2xl)] min-w-[var(--spacing-2xl)] items-center justify-center rounded-md border border-neutral-300 bg-white px-[var(--spacing-md)] py-[var(--spacing-sm)] text-base font-medium text-neutral-900 transition-colors hover:bg-neutral-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? "Loading journeys..." : "Load more journeys"}
          </button>
        </div>
      ) : null}
      {errorMessage ? (
        <p
          role="alert"
          aria-live="polite"
          className="mt-[var(--spacing-sm)] text-base text-red-700"
        >
          {errorMessage}
        </p>
      ) : null}
    </>
  );
}
