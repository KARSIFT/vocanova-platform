"use client";
import { useEffect, useState } from "react";

import { createApiClient } from "@/lib/api";

export function useAuthenticatedUserId() {
  const [userId, setUserId] = useState<string>();

  useEffect(() => {
    let active = true;
    let requestVersion = 0;
    function refreshIdentity() {
      const currentRequest = ++requestVersion;
      setUserId(undefined);
      void createApiClient()
        .getCurrentUser({ cache: "no-store" })
        .then(({ data }) => {
          if (active && currentRequest === requestVersion)
            setUserId(data.userId);
        })
        .catch(() => {
          if (active && currentRequest === requestVersion) setUserId(undefined);
        });
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
