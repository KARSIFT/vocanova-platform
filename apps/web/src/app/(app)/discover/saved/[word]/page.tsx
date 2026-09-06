import { notFound } from "next/navigation";

import { ApiResponseError } from "@vocanova/api-client";

import { createServerApiClient, requireAuthRedirect } from "@/lib/api-server";
import { PageBackLink } from "../../../_components/page-back-link";
import { SentenceFeedback } from "../../../_components/sentence-feedback";

import { RemoveSavedMeaning } from "./_components/remove-saved-meaning";

export default async function SavedWordPage({
  params,
  searchParams,
}: {
  params: Promise<{ word: string }>;
  searchParams: Promise<{ meaning?: string }>;
}) {
  const { word } = await params;
  const { meaning: meaningId } = await searchParams;
  const client = await createServerApiClient();
  let saved;
  let canonical;
  try {
    [saved, canonical] = await Promise.all([
      client.listSavedWords({ limit: 100 }),
      client.getCanonicalWord(word),
    ]);
  } catch (error) {
    if (error instanceof ApiResponseError && error.status === 404) notFound();
    requireAuthRedirect(error, `/discover/saved/${word}`);
  }
  const savedMeaning = saved.data.items.find(
    (item) =>
      item.wordSlug === word && (!meaningId || item.meaningId === meaningId),
  );
  if (!savedMeaning) notFound();
  const meaning = canonical.data.word.meanings.find(
    (item) => item.id === savedMeaning.meaningId,
  );
  if (!meaning) notFound();
  return (
    <div className="p-[var(--spacing-lg)]">
      <PageBackLink href="/discover/saved">
        Back to saved vocabulary
      </PageBackLink>
      <h1 className="mt-[var(--spacing-md)] wrap-break-word text-2xl font-semibold text-neutral-900">
        {canonical.data.word.text}
      </h1>
      <section className="mt-[var(--spacing-lg)] rounded-md border border-neutral-200 bg-neutral-50 p-[var(--spacing-md)]">
        <p className="font-medium text-neutral-900">{meaning.partOfSpeech}</p>
        <p className="mt-[var(--spacing-xs)] wrap-break-word text-base text-neutral-700">
          {meaning.shortDefinition}
        </p>
        {meaning.reviewState ? (
          <p className="mt-[var(--spacing-xs)] text-base text-neutral-700">
            Review state: {meaning.reviewState}
          </p>
        ) : null}
        {meaning.examples.length ? (
          <>
            <h2 className="mt-[var(--spacing-md)] text-lg font-semibold text-neutral-900">
              Example sentences
            </h2>
            <ul className="mt-[var(--spacing-xs)] list-disc pl-[var(--spacing-lg)] text-base text-neutral-700">
              {meaning.examples.map((example) => (
                <li key={example.id} className="wrap-break-word">
                  {example.exampleText}
                </li>
              ))}
            </ul>
          </>
        ) : null}
        {meaning.usageNotes.length ? (
          <>
            <h2 className="mt-[var(--spacing-md)] text-lg font-semibold text-neutral-900">
              Usage notes
            </h2>
            <ul className="mt-[var(--spacing-xs)] space-y-[var(--spacing-xs)] text-base text-neutral-700">
              {meaning.usageNotes.map((note) => (
                <li key={note.id} className="wrap-break-word">
                  {note.noteText}
                </li>
              ))}
            </ul>
          </>
        ) : null}
        <SentenceFeedback
          targetWord={canonical.data.word.text}
          attemptId={savedMeaning.userWordId}
          source="word_detail"
          shortDefinition={meaning.shortDefinition}
        />
        <RemoveSavedMeaning
          meaningId={savedMeaning.meaningId}
          wordText={canonical.data.word.text}
        />
      </section>
    </div>
  );
}
