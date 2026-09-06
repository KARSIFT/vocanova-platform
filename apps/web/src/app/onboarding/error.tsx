"use client";

import { useRouter } from "next/navigation";

import { useErrorHeadingFocus } from "@/lib/use-error-heading-focus";

interface OnboardingErrorProps {
  reset: () => void;
}

export default function OnboardingError({ reset }: OnboardingErrorProps) {
  const router = useRouter();
  const headingRef = useErrorHeadingFocus();

  function retry() {
    reset();
    router.refresh();
  }

  return (
    <main className="grid min-h-screen place-items-center bg-neutral-50 p-6">
      <div className="w-full max-w-[36rem] space-y-[var(--spacing-lg)] rounded-xl border border-neutral-200 bg-white p-[var(--spacing-lg)] shadow-sm">
        <h1
          ref={headingRef}
          tabIndex={-1}
          className="text-2xl font-semibold text-neutral-900"
        >
          We couldn&apos;t load onboarding
        </h1>
        <p className="text-base text-neutral-700">
          Please try again. Your account has not been changed.
        </p>
        <button
          type="button"
          onClick={retry}
          className="inline-flex min-h-[var(--spacing-2xl)] min-w-[var(--spacing-2xl)] items-center justify-center rounded-md bg-primary-600 px-[var(--spacing-md)] py-[var(--spacing-sm)] text-base font-medium text-neutral-50 transition-colors hover:bg-primary-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-700"
        >
          Try again
        </button>
      </div>
    </main>
  );
}
