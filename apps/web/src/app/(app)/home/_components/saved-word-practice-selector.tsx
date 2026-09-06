"use client";

import { useEffect, useRef, useState } from "react";

import type { SavedMeaning } from "@vocanova/api-client";

import { SentenceFeedback } from "../../_components/sentence-feedback";
import { readSentenceRecovery } from "@/lib/sentence-recovery";
import { useAuthenticatedUserId } from "../../_components/identity-context";

interface SavedWordPracticeSelectorProps {
  savedWords: SavedMeaning[];
}

export function SavedWordPracticeSelector({
  savedWords,
}: SavedWordPracticeSelectorProps) {
  const userId = useAuthenticatedUserId();
  const [selectedUserWordId, setSelectedUserWordId] = useState(
    savedWords[0]?.userWordId ?? "",
  );
  const [pendingUserWordId, setPendingUserWordId] = useState<string | null>(
    null,
  );
  const [selectionNotice, setSelectionNotice] = useState<string | null>(null);
  const hasDraftRef = useRef(false);
  const selectorRef = useRef<HTMLSelectElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const record = readSentenceRecovery(userId);
    if (
      record?.path === "/home" &&
      record.source === "daily_mission" &&
      savedWords.some(
        (word) =>
          word.userWordId === record.attemptId &&
          word.wordText === record.targetWord,
      )
    )
      setSelectedUserWordId(record.attemptId);
  }, [savedWords, userId]);

  const selectedWord = savedWords.find(
    (savedWord) => savedWord.userWordId === selectedUserWordId,
  );

  if (!selectedWord) return null;

  function selectWord(nextUserWordId: string) {
    if (nextUserWordId === selectedUserWordId) return;
    if (isSubmitting) {
      setSelectionNotice(
        "Your sentence is being checked. Keep this word selected until it is finished.",
      );
      return;
    }
    if (hasDraftRef.current) {
      setSelectionNotice(null);
      setPendingUserWordId(nextUserWordId);
      return;
    }
    setSelectionNotice(null);
    setPendingUserWordId(null);
    setSelectedUserWordId(nextUserWordId);
  }

  function discardDraftAndChangeWord() {
    if (!pendingUserWordId || isSubmitting) return;
    hasDraftRef.current = false;
    setSelectionNotice(null);
    setSelectedUserWordId(pendingUserWordId);
    setPendingUserWordId(null);
    selectorRef.current?.focus();
  }

  return (
    <section
      id="saved-word-practice-heading"
      aria-labelledby="saved-word-practice-title"
      className="mt-[var(--spacing-lg)] rounded-md border border-neutral-200 bg-neutral-50 p-[var(--spacing-md)] shadow-sm"
    >
      <h2
        id="saved-word-practice-title"
        className="text-lg font-semibold text-neutral-900"
      >
        Practice a saved word
      </h2>
      <div className="mt-[var(--spacing-md)] min-w-0">
        <label
          htmlFor="home-practice-word"
          className="text-base font-medium text-neutral-900"
        >
          Choose a saved word to practice
        </label>
        <select
          ref={selectorRef}
          id="home-practice-word"
          value={selectedUserWordId}
          onChange={(event) => selectWord(event.target.value)}
          className="mt-[var(--spacing-xs)] min-h-[var(--spacing-2xl)] w-full min-w-0 rounded-md border border-neutral-300 bg-white px-[var(--spacing-md)] py-[var(--spacing-sm)] text-base text-neutral-900 focus:border-primary-500 focus:outline focus:outline-2 focus:outline-primary-500/20"
        >
          {savedWords.map((savedWord) => (
            <option key={savedWord.userWordId} value={savedWord.userWordId}>
              {savedWord.wordText} — {savedWord.shortDefinition}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-[var(--spacing-sm)] min-w-0 text-base text-neutral-700">
        <p className="text-sm font-medium text-neutral-700">Selected word</p>
        <p className="wrap-break-word text-neutral-900">
          {selectedWord.wordText}
          <span className="ml-[var(--spacing-xs)] wrap-break-word text-sm text-neutral-600">
            {selectedWord.partOfSpeech}
          </span>
        </p>
        <p className="mt-[var(--spacing-xs)] text-sm font-medium text-neutral-700">
          Meaning
        </p>
        <p className="wrap-break-word">{selectedWord.shortDefinition}</p>
      </div>

      <div
        onInputCapture={(event) => {
          if (event.target instanceof HTMLTextAreaElement) {
            hasDraftRef.current = event.target.value.trim().length > 0;
          }
        }}
      >
        <SentenceFeedback
          key={selectedWord.userWordId}
          targetWord={selectedWord.wordText}
          attemptId={selectedWord.userWordId}
          source="daily_mission"
          shortDefinition={selectedWord.shortDefinition}
          onPendingChange={setIsSubmitting}
          clearMismatchedRecovery
        />
      </div>

      {pendingUserWordId ? (
        <div
          role="alert"
          className="mt-[var(--spacing-md)] rounded-md bg-amber-50 p-[var(--spacing-md)] text-base text-amber-900"
        >
          <p>Discard this draft to change words?</p>
          <div className="mt-[var(--spacing-sm)] flex flex-wrap gap-[var(--spacing-sm)]">
            <button
              type="button"
              onClick={() => {
                setPendingUserWordId(null);
                selectorRef.current?.focus();
              }}
              className="inline-flex min-h-[var(--spacing-2xl)] items-center justify-center rounded-md border border-neutral-300 bg-white px-[var(--spacing-md)] py-[var(--spacing-sm)] text-base font-medium text-neutral-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-700"
            >
              Keep practicing
            </button>
            <button
              type="button"
              onClick={discardDraftAndChangeWord}
              className="inline-flex min-h-[var(--spacing-2xl)] items-center justify-center rounded-md bg-primary-600 px-[var(--spacing-md)] py-[var(--spacing-sm)] text-base font-medium text-neutral-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-700"
            >
              Discard draft and change word
            </button>
          </div>
        </div>
      ) : null}
      {selectionNotice ? (
        <p
          role="status"
          className="mt-[var(--spacing-md)] text-base text-neutral-700"
        >
          {selectionNotice}
        </p>
      ) : null}
    </section>
  );
}
