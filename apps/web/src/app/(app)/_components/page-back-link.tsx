import Link from "next/link";
import type { ReactNode } from "react";

interface PageBackLinkProps {
  href: string;
  children: ReactNode;
}

export function PageBackLink({ href, children }: PageBackLinkProps) {
  return (
    <Link
      href={href}
      className="inline-flex min-h-[var(--spacing-2xl)] min-w-[var(--spacing-2xl)] items-center justify-center px-[var(--spacing-sm)] text-base font-semibold text-primary-700 hover:text-primary-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
    >
      {children}
    </Link>
  );
}
