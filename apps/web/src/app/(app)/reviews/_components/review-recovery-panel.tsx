"use client";

import { useEffect, useState } from "react";

import { readSentenceRecovery } from "@/lib/sentence-recovery";
import { SentenceFeedback } from "../../_components/sentence-feedback";
import { useAuthenticatedUserId } from "../../_components/identity-context";

export function ReviewRecoveryPanel() {
  const userId = useAuthenticatedUserId();
  const [attempt, setAttempt] = useState<{
    ownerId: string;
    attemptId: string;
    targetWord: string;
    shortDefinition?: string;
  } | null>(null);
  useEffect(() => {
    if (!userId) {
      setAttempt(null);
      return;
    }
    const record = readSentenceRecovery(userId);
    if (record?.path === "/reviews" && record.source === "review") {
      setAttempt({
        ownerId: record.ownerId,
        attemptId: record.attemptId,
        targetWord: record.targetWord,
        shortDefinition: record.shortDefinition,
      });
      return;
    }
    setAttempt(null);
  }, [userId]);
  if (!attempt || attempt.ownerId !== userId) return null;
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
