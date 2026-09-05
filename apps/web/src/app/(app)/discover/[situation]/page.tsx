import Link from "next/link";
import { notFound } from "next/navigation";

import { ApiResponseError } from "@vocanova/api-client";

import { createServerApiClient, requireAuthRedirect } from "@/lib/api-server";
import { PageBackLink } from "../../_components/page-back-link";

interface SituationDiscoverPageProps {
  params: Promise<{ situation: string }>;
}

export default async function SituationDiscoverPage({
  params,
}: SituationDiscoverPageProps) {
  const { situation } = await params;
  const client = await createServerApiClient();
  let response: Awaited<ReturnType<typeof client.getJourneySituation>>;
  try {
    response = await client.getJourneySituation(situation);
  } catch (error) {
    if (error instanceof ApiResponseError && error.status === 404) {
      notFound();
    }
    requireAuthRedirect(error, `/discover/${situation}`);
  }

  const { situation: situationData, meanings } = response.data;

  return (
    <div className="p-[var(--spacing-lg)]">
      <PageBackLink href="/discover">Back to Journey</PageBackLink>
      <h1 className="mt-[var(--spacing-md)] text-2xl font-semibold text-neutral-900">
        {situationData.title}
      </h1>
      <p className="mt-[var(--spacing-xs)] text-base text-neutral-700">
        Words already saved are marked below.
      </p>

      {meanings.length > 0 ? (
        <ul className="mt-[var(--spacing-lg)] space-y-[var(--spacing-md)]">
          {meanings.map((meaning) => (
            <li key={meaning.meaningId}>
              <Link
                href={`/discover/${situation}/${meaning.wordSlug}`}
                className="block rounded-md border border-neutral-200 bg-neutral-50 p-[var(--spacing-md)] shadow-sm hover:border-primary-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-primary-600"
              >
                <div className="flex items-start justify-between gap-[var(--spacing-md)]">
                  <div>
                    <p className="text-lg font-semibold text-neutral-900">
                      {meaning.wordText}
                    </p>
                    <p className="mt-[var(--spacing-xs)] text-base text-neutral-700">
                      {meaning.shortDefinition}
                    </p>
                  </div>
                  {meaning.saved ? (
                    <span className="shrink-0 rounded-full bg-primary-100 px-[var(--spacing-sm)] py-[var(--spacing-xs)] text-sm font-semibold text-primary-800">
                      <span aria-hidden="true">✓</span> Saved
                    </span>
                  ) : null}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <section
          aria-labelledby="journey-situation-empty-heading"
          className="mt-[var(--spacing-lg)] rounded-md border border-neutral-200 bg-neutral-50 p-[var(--spacing-md)]"
        >
          <h2
            id="journey-situation-empty-heading"
            className="text-lg font-semibold text-neutral-900"
          >
            No new words in this situation right now
          </h2>
          <p className="mt-[var(--spacing-xs)] text-base text-neutral-700">
            Choose another journey to explore more practical vocabulary.
          </p>
          <Link
            href="/discover"
            className="mt-[var(--spacing-md)] inline-flex min-h-[var(--spacing-2xl)] min-w-[var(--spacing-2xl)] items-center justify-center rounded-md border border-neutral-300 bg-white px-[var(--spacing-md)] py-[var(--spacing-sm)] text-base font-medium text-neutral-900 transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)] hover:bg-neutral-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-700"
          >
            Choose another journey
          </Link>
        </section>
      )}
    </div>
  );
}
