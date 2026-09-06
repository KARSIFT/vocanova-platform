"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { createApiClient } from "@/lib/api";
import { CSRF_COOKIE_NAME, deleteCookie, getCookieValue } from "@/lib/cookies";
import { handleApiError } from "@/lib/session";

export function AppHeader() {
  const logoutButton = useRef<HTMLButtonElement>(null);
  const [status, setStatus] = useState<{
    type: "idle" | "loading" | "error";
    message: string;
  }>({
    type: "idle",
    message: "",
  });

  useEffect(() => {
    if (status.type === "error") {
      logoutButton.current?.focus();
    }
  }, [status.type]);

  async function handleLogout() {
    setStatus({ type: "loading", message: "" });
    const csrfToken = getCookieValue(CSRF_COOKIE_NAME);
    if (!csrfToken) {
      setStatus({
        type: "error",
        message: "Unable to log out. Please try again.",
      });
      return;
    }

    const client = createApiClient();
    try {
      await client.logout({
        headers: { "X-CSRF-Token": csrfToken },
      });
      deleteCookie(CSRF_COOKIE_NAME);
      window.location.href = "/signin";
    } catch (error) {
      // A 401 on logout is the documented "session already
      // expired" case — clear the local session cookie anyway and
      // route the learner to sign in, matching the same
      // session-expiry mid-flow handler used by the core loop.
      setStatus({
        type: "error",
        message: handleApiError(error, "Unable to log out. Please try again."),
      });
    }
  }

  return (
    <header className="sticky top-0 z-10 flex min-h-14 items-center gap-[var(--spacing-sm)] border-b border-neutral-200 bg-white px-[var(--spacing-md)] py-[var(--spacing-xs)]">
      <span className="shrink-0 text-lg font-semibold text-neutral-900">
        Vocanova
      </span>
      <div className="ml-auto flex max-w-full flex-wrap items-center justify-end gap-[var(--spacing-sm)]">
        <Link
          href="/settings"
          className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md border border-neutral-300 px-[var(--spacing-md)] py-[var(--spacing-xs)] text-sm font-medium text-neutral-900 transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)] hover:bg-neutral-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-700"
        >
          Settings
        </Link>
        <button
          ref={logoutButton}
          type="button"
          onClick={handleLogout}
          disabled={status.type === "loading"}
          aria-busy={status.type === "loading"}
          className="min-h-11 rounded-md border border-neutral-300 px-[var(--spacing-md)] py-[var(--spacing-xs)] text-sm font-medium text-neutral-900 transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)] hover:bg-neutral-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {status.type === "loading" ? "Signing out..." : "Log out"}
        </button>
        {status.message ? (
          <p
            role="alert"
            aria-live="polite"
            className="basis-full text-right text-sm text-red-700"
          >
            {status.message}
          </p>
        ) : null}
      </div>
    </header>
  );
}
