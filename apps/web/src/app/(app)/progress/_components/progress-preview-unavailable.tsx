"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

interface ProgressPreviewUnavailableProps {
  preview: string;
}

export function ProgressPreviewUnavailable({
  preview,
}: ProgressPreviewUnavailableProps) {
  const router = useRouter();
  const [isRetrying, startTransition] = useTransition();

  return (
    <div className="mt-[var(--spacing-md)]">
      <p role="alert" className="text-base text-red-700">
        We couldn&apos;t load {preview}. This preview is unavailable right now.
      </p>
      <button
        type="button"
        onClick={() => startTransition(() => router.refresh())}
        disabled={isRetrying}
        className="mt-[var(--spacing-sm)] inline-flex min-h-[var(--spacing-2xl)] items-center rounded-md border border-neutral-300 bg-white px-[var(--spacing-md)] py-[var(--spacing-sm)] text-base font-medium text-neutral-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-700 disabled:opacity-50"
      >
        {isRetrying ? `Loading ${preview}...` : `Try loading ${preview} again`}
      </button>
    </div>
  );
}
