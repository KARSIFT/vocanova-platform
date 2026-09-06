import Link from "next/link";

import { createServerApiClient, requireAuthRedirect } from "@/lib/api-server";
import { PageBackLink } from "../../_components/page-back-link";

import { SavedVocabularyList } from "./_components/saved-vocabulary-list";

export default async function SavedVocabularyPage() {
  const client = await createServerApiClient();
  let response: Awaited<ReturnType<typeof client.listSavedWords>>;
  try {
    response = await client.listSavedWords({ limit: 10 });
  } catch (error) {
    requireAuthRedirect(error, "/discover/saved");
  }
  const { items, nextCursor } = response.data;
  return (
    <div className="p-[var(--spacing-lg)]">
      <PageBackLink href="/discover">Back to Journey</PageBackLink>
      <h1 className="mt-[var(--spacing-md)] text-2xl font-semibold text-neutral-900">
        Saved vocabulary
      </h1>
      <p className="mt-[var(--spacing-xs)] text-base text-neutral-700">
        Review and manage every word you have saved.
      </p>
      {items.length ? (
        <SavedVocabularyList
          initialItems={items}
          initialNextCursor={nextCursor}
        />
      ) : (
        <section className="mt-[var(--spacing-lg)] rounded-md border border-neutral-200 bg-neutral-50 p-[var(--spacing-md)]">
          <h2 className="text-lg font-semibold text-neutral-900">
            No saved words yet
          </h2>
          <p className="mt-[var(--spacing-xs)] text-base text-neutral-700">
            Save words from a journey to build your vocabulary library.
          </p>
          <Link
            href="/discover"
            className="mt-[var(--spacing-md)] inline-flex min-h-[var(--spacing-2xl)] items-center rounded-md bg-primary-600 px-[var(--spacing-md)] py-[var(--spacing-sm)] text-base font-medium text-neutral-50"
          >
            Explore journeys
          </Link>
        </section>
      )}
    </div>
  );
}
