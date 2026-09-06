"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { createApiClient } from "@/lib/api";
import { CSRF_COOKIE_NAME, getCookieValue } from "@/lib/cookies";
import { handleApiError } from "@/lib/session";

export function RemoveSavedMeaning({
  meaningId,
  wordText,
}: {
  meaningId: string;
  wordText: string;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState("");
  const buttonRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (status === "error") buttonRef.current?.focus();
  }, [status]);
  async function remove() {
    if (status === "loading") return;
    const csrf = getCookieValue(CSRF_COOKIE_NAME);
    if (!csrf) {
      setStatus("error");
      setError("Session is not ready. Please refresh the page.");
      return;
    }
    setStatus("loading");
    setError("");
    try {
      await createApiClient().unsaveUserWord(meaningId, {
        headers: { "X-CSRF-Token": csrf },
      });
      router.push("/discover/saved");
      router.refresh();
    } catch (caught) {
      setStatus("error");
      setError(
        handleApiError(
          caught,
          "Unable to remove this saved word. Please try again.",
        ),
      );
    }
  }
  return (
    <div className="mt-[var(--spacing-md)]">
      <button
        ref={buttonRef}
        type="button"
        onClick={remove}
        disabled={status === "loading"}
        className="min-h-[var(--spacing-2xl)] rounded-md border border-neutral-300 bg-white px-[var(--spacing-md)] py-[var(--spacing-sm)] text-base font-medium text-neutral-900 disabled:opacity-50"
      >
        {status === "loading"
          ? "Removing..."
          : `Remove ${wordText} from saved words`}
      </button>
      {error ? (
        <p role="alert" className="mt-[var(--spacing-xs)] text-sm text-red-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}
