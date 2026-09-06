"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { createApiClient } from "@/lib/api";
import { CSRF_COOKIE_NAME, getCookieValue } from "@/lib/cookies";
import { handleApiError } from "@/lib/session";
import { requestWordDetailPracticeFocus } from "@/lib/word-detail-practice-focus";

interface MeaningSaveButtonProps {
  meaningId: string;
  source: "journey";
  initialSaved: boolean;
  wordText: string;
  shortDefinition: string;
}

export function MeaningSaveButton({
  meaningId,
  source,
  initialSaved,
  wordText,
  shortDefinition,
}: MeaningSaveButtonProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [saved, setSaved] = useState(initialSaved);
  const [status, setStatus] = useState<
    "idle" | "saving" | "removing" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (status === "error") buttonRef.current?.focus();
  }, [status]);

  async function toggleSave() {
    const csrfToken = getCookieValue(CSRF_COOKIE_NAME);
    if (!csrfToken) {
      setStatus("error");
      setErrorMessage("Session is not ready. Please refresh the page.");
      return;
    }

    setStatus(saved ? "removing" : "saving");
    setErrorMessage("");

    const client = createApiClient();
    try {
      if (saved) {
        await client.unsaveUserWord(meaningId, {
          headers: { "X-CSRF-Token": csrfToken },
        });
        setSaved(false);
      } else {
        const idempotencyKey = generateIdempotencyKey();
        const { data } = await client.saveUserWord(
          { meaningId, source },
          idempotencyKey,
          {
            headers: { "X-CSRF-Token": csrfToken },
          },
        );
        requestWordDetailPracticeFocus(data.meaningId, pathname);
        setSaved(true);
      }
      setStatus("idle");
      router.refresh();
    } catch (error) {
      setStatus("error");
      // handleApiError detects 401 and routes the learner to
      // re-authentication (session expiry mid-flow). For any
      // other failure it returns a stable, caller-supplied message.
      setErrorMessage(
        handleApiError(
          error,
          "Unable to update saved state. Please try again.",
        ),
      );
    }
  }

  const label = saved ? "Saved" : "Save";
  const isSaving = status === "saving";
  const isRemoving = status === "removing";
  const isLoading = isSaving || isRemoving;
  const ariaLabel = isSaving
    ? `Saving ${wordText}: ${shortDefinition}`
    : isRemoving
      ? `Removing ${wordText} from saved words`
      : saved
        ? `Remove ${wordText} from saved words`
        : `Save ${wordText}: ${shortDefinition}`;
  const pendingMessage = isSaving
    ? `Saving ${wordText}.`
    : isRemoving
      ? `Removing ${wordText} from saved words.`
      : null;

  return (
    <div className="flex flex-col items-end gap-[var(--spacing-xs)]">
      <button
        ref={buttonRef}
        type="button"
        onClick={toggleSave}
        disabled={isLoading}
        aria-pressed={saved}
        aria-label={ariaLabel}
        aria-busy={isLoading}
        className="min-h-[var(--spacing-2xl)] min-w-[var(--spacing-2xl)] rounded-md border border-neutral-200 bg-neutral-50 px-[var(--spacing-md)] py-[var(--spacing-sm)] text-base font-medium text-neutral-700 transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)] hover:bg-neutral-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSaving ? "Saving..." : isRemoving ? "Removing..." : label}
      </button>
      {pendingMessage ? (
        <p role="status" className="sr-only">
          {pendingMessage}
        </p>
      ) : null}
      {errorMessage ? (
        <p role="alert" aria-live="polite" className="text-sm text-red-700">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}

function generateIdempotencyKey(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
