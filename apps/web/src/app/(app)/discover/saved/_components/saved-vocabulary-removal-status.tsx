"use client";

import { useEffect, useRef } from "react";

export function SavedVocabularyRemovalStatus() {
  const statusRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    statusRef.current?.focus();
  }, []);

  return (
    <p
      ref={statusRef}
      tabIndex={-1}
      role="status"
      aria-live="polite"
      className="mt-[var(--spacing-sm)] rounded-md bg-green-50 p-[var(--spacing-sm)] text-base text-green-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-700"
    >
      Saved word removed. You can continue managing your vocabulary.
    </p>
  );
}
