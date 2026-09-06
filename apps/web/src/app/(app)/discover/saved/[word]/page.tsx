import { notFound } from "next/navigation";

import { ApiResponseError } from "@vocanova/api-client";

import { createServerApiClient, requireAuthRedirect } from "@/lib/api-server";
import { PageBackLink } from "../../../_components/page-back-link";
import { SentenceFeedback } from "../../../_components/sentence-feedback";
import { formatReviewDateTime, isDueReview } from "@/lib/review-schedule";

import { RemoveSavedMeaning } from "./_components/remove-saved-meaning";

export default async function SavedWordPage({
  params,
  searchParams,
}: {
  params: Promise<{ word: string }>;
  searchParams: Promise<{ meaning?: string }>;
}) {
  const { word: wordSegment } = await params;
  let word: string;
  try {
    word = decodeURIComponent(wordSegment);
  } catch {
    notFound();
  }
  const { meaning: meaningId } = await searchParams;
  const client = await createServerApiClient();
  let canonical;
  try {
    canonical = await client.getCanonicalWord(word);
  } catch (error) {
    if (error instanceof ApiResponseError && error.status === 404) notFound();
    requireAuthRedirect(
      error,
      `/discover/saved/${encodeURIComponent(word)}?meaning=${encodeURIComponent(meaningId ?? "")}`,
    );
  }
  if (!meaningId) notFound();
  const meaning = canonical.data.word.meanings.find(
    (item) => item.id === meaningId && item.saved && item.userWordId,
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
      <p className="mt-[var(--spacing-xs)] wrap-break-word text-base text-neutral-700">
        {canonical.data.word.wordType}
        {canonical.data.word.difficultyLevel
          ? ` · ${canonical.data.word.difficultyLevel}`
          : null}
      </p>
      <section className="mt-[var(--spacing-lg)] rounded-md border border-neutral-200 bg-neutral-50 p-[var(--spacing-md)]">
        <p className="font-medium text-neutral-900">{meaning.partOfSpeech}</p>
        <p className="mt-[var(--spacing-xs)] wrap-break-word text-base text-neutral-700">
          {meaning.shortDefinition}
        </p>
        {meaning.learnerDefinition ? (
          <p className="mt-[var(--spacing-xs)] wrap-break-word text-base text-neutral-600">
            {meaning.learnerDefinition}
          </p>
        ) : null}
        {meaning.reviewState ? (
          <p className="mt-[var(--spacing-xs)] text-base text-neutral-700">
            Review state: {reviewStateLabel(meaning.reviewState)}
          </p>
        ) : null}
        {meaning.nextReviewAt !== undefined ? (
          <p className="mt-[var(--spacing-xs)] text-base text-neutral-700">
            {meaning.reviewState === "due" ||
            meaning.nextReviewAt === null ||
            isDueReview(meaning.nextReviewAt)
              ? "Due now"
              : `Next review: ${formatReviewDateTime(meaning.nextReviewAt)}`}
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
                <li key={note.id}>
                  <h3 className="wrap-break-word text-sm font-semibold text-neutral-800">
                    {formatNoteType(note.noteType)}
                  </h3>
                  <p className="wrap-break-word">{note.noteText}</p>
                </li>
              ))}
            </ul>
          </>
        ) : null}
        <SentenceFeedback
          meaningId={meaning.id}
          targetWord={canonical.data.word.text}
          attemptId={meaning.userWordId!}
          source="word_detail"
          shortDefinition={meaning.shortDefinition}
          clearMismatchedRecovery
          recoveryAttemptIds={[meaning.userWordId!]}
        />
        <RemoveSavedMeaning
          meaningId={meaning.id}
          wordText={canonical.data.word.text}
        />
      </section>
    </div>
  );
}

function reviewStateLabel(
  state: NonNullable<import("@vocanova/api-client").WordMeaning["reviewState"]>,
) {
  return {
    due: "Due now",
    new: "New",
    learning: "Learning",
    reviewing: "Reviewing",
    mastered: "Mastered",
    not_reviewing: "Not in review",
  }[state];
}

function formatNoteType(noteType: string) {
  return noteType
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
