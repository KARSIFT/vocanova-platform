"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { createApiClient } from "@/lib/api";

const IdentityContext = createContext<string | undefined>(undefined);
export function IdentityProvider({
  userId,
  children,
}: {
  userId?: string;
  children: ReactNode;
}) {
  const [resolvedUserId, setResolvedUserId] = useState(userId);

  useEffect(() => {
    if (userId) {
      setResolvedUserId(userId);
      return;
    }
    let active = true;
    void createApiClient()
      .getCurrentUser({ cache: "no-store" })
      .then(({ data }) => {
        if (active) setResolvedUserId(data.userId);
      })
      .catch(() => {
        if (active) setResolvedUserId(undefined);
      });
    return () => {
      active = false;
    };
  }, [userId]);

  return (
    <IdentityContext.Provider value={resolvedUserId}>
      {children}
    </IdentityContext.Provider>
  );
}
export function useAuthenticatedUserId() {
  return useContext(IdentityContext);
}
