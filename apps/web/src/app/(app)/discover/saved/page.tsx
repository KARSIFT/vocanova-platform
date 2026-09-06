import { ApiResponseError } from "@vocanova/api-client";

import { createServerApiClient, requireAuthRedirect } from "@/lib/api-server";
import { PageBackLink } from "../../_components/page-back-link";

import { SavedVocabularyList } from "./_components/saved-vocabulary-list";

export default async function SavedVocabularyPage() {
  const client = await createServerApiClient();
  let response: Awaited<ReturnType<typeof client.listSavedWords>>;
  const timezonePromise = client
    .getSettings()
    .then(({ data }) => data.timezone)
    .catch((error) => {
      if (error instanceof ApiResponseError && error.status === 401) {
        requireAuthRedirect(error, "/discover/saved");
      }
      return undefined;
    });
  try {
    response = await client.listSavedWords({ limit: 10 });
  } catch (error) {
    requireAuthRedirect(error, "/discover/saved");
  }
  const { items, nextCursor } = response.data;
  const timezone = await timezonePromise;
  return (
    <div className="p-[var(--spacing-lg)]">
      <PageBackLink href="/discover">Back to Journey</PageBackLink>
      <h1 className="mt-[var(--spacing-md)] text-2xl font-semibold text-neutral-900">
        Saved vocabulary
      </h1>
      <p className="mt-[var(--spacing-xs)] text-base text-neutral-700">
        Review and manage every word you have saved.
      </p>
      <SavedVocabularyList
        initialItems={items}
        initialNextCursor={nextCursor}
        timezone={timezone}
      />
    </div>
  );
}
