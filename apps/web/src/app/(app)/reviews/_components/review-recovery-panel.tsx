"use client";

import { useEffect, useState } from "react";

import { readSentenceRecovery } from "@/lib/sentence-recovery";
import { SentenceFeedback } from "../../_components/sentence-feedback";
import { useAuthenticatedUserId } from "../../_components/identity-context";

export function ReviewRecoveryPanel() {
  const userId = useAuthenticatedUserId();
  const [attempt, setAttempt] = useState<{
    attemptId: string;
    targetWord: string;
    shortDefinition?: string;
  } | null>(null);
  useEffect(() => {
    if (!userId) return;
    const record = readSentenceRecovery(userId);
    if (record?.path === "/reviews" && record.source === "review") {
      setAttempt({
        attemptId: record.attemptId,
        targetWord: record.targetWord,
        shortDefinition: record.shortDefinition,
      });
    }
  }, [userId]);
  if (!attempt) return null;
  return (
    <section
      className="mb-[var(--spacing-lg)]"
      aria-labelledby="review-recovery-heading"
    >
      <h2
        id="review-recovery-heading"
        className="text-lg font-semibold text-neutral-900"
      >
        Resume sentence practice
      </h2>
      <SentenceFeedback
        targetWord={attempt.targetWord}
        attemptId={attempt.attemptId}
        source="review"
        shortDefinition={attempt.shortDefinition}
      />
    </section>
  );
}
