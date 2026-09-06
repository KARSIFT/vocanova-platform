"use client";

import Link from "next/link";

interface MissionActionLinkProps {
  href: string;
  label: string;
}

const ACTION_CLASS_NAME =
  "mt-[var(--spacing-md)] inline-flex min-h-[var(--spacing-2xl)] min-w-[var(--spacing-2xl)] items-center justify-center rounded-md bg-primary-600 px-[var(--spacing-md)] py-[var(--spacing-sm)] text-base font-medium text-neutral-50 transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)] hover:bg-primary-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-700";

export function MissionActionLink({ href, label }: MissionActionLinkProps) {
  function focusSentencePracticeSelector() {
    if (href !== "#saved-word-practice-heading") return;
    document
      .getElementById("home-practice-word")
      ?.focus({ preventScroll: true });
  }

  return (
    <Link
      href={href}
      onClick={focusSentencePracticeSelector}
      className={ACTION_CLASS_NAME}
    >
      {label}
    </Link>
  );
}
