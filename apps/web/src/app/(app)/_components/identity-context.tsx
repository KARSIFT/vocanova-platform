"use client";
import { useEffect, useState } from "react";

import { createApiClient } from "@/lib/api";
import { createIdentityRefresh } from "@/lib/identity-refresh";

export function useAuthenticatedUserId() {
  const [userId, setUserId] = useState<string>();

  useEffect(() => {
    let active = true;
    const refreshLatestIdentity = createIdentityRefresh((nextUserId) => {
      if (active) setUserId(nextUserId);
    });
    function refreshIdentity() {
      void refreshLatestIdentity(() =>
        createApiClient()
          .getCurrentUser({ cache: "no-store" })
          .then(({ data }) => data.userId),
      );
    }
    refreshIdentity();
    window.addEventListener("focus", refreshIdentity);
    window.addEventListener("pageshow", refreshIdentity);
    return () => {
      active = false;
      window.removeEventListener("focus", refreshIdentity);
      window.removeEventListener("pageshow", refreshIdentity);
    };
  }, []);

  return userId;
}
