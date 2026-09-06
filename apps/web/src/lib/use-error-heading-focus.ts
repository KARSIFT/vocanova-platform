"use client";

import { useEffect, useRef } from "react";

export function useErrorHeadingFocus() {
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  return headingRef;
}
