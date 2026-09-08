"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

interface HomeAuxiliaryReadRecoveryProps {
  heading: string;
  description: string;
  retryLabel: string;
}

/**
 * Keeps an optional Home read honest without replacing the authoritative daily
 * mission. Retrying refreshes the server projection, so the same authenticated
 * request and redirect boundary remain in use.
 */
export function HomeAuxiliaryReadRecovery({
  heading,
  description,
  retryLabel,
}: HomeAuxiliaryReadRecoveryProps) {
  const router = useRouter();
  const [isRetrying, startTransition] = useTransition();

  return (
    <section
      aria-live="polite"
      className="mt-[var(--spacing-lg)] rounded-md border border-neutral-200 bg-neutral-50 p-[var(--spacing-md)]"
    >
      <h2 className="text-lg font-semibold text-neutral-900">{heading}</h2>
      <p className="mt-[var(--spacing-sm)] text-base text-neutral-700">
        {description}
      </p>
      <button
        type="button"
        disabled={isRetrying}
        onClick={() => startTransition(() => router.refresh())}
        className="mt-[var(--spacing-md)] inline-flex min-h-[var(--spacing-2xl)] min-w-[var(--spacing-2xl)] items-center justify-center rounded-md border border-neutral-300 bg-white px-[var(--spacing-md)] py-[var(--spacing-sm)] text-base font-medium text-neutral-900 transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)] hover:bg-neutral-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-700 disabled:cursor-wait disabled:opacity-70"
      >
        {isRetrying ? "Trying again…" : retryLabel}
      </button>
    </section>
  );
}
