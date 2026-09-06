"use client";
import { useEffect, useState } from "react";

import { createApiClient } from "@/lib/api";

export function useAuthenticatedUserId() {
  const [userId, setUserId] = useState<string>();

  useEffect(() => {
    let active = true;
    function refreshIdentity() {
      void createApiClient()
        .getCurrentUser({ cache: "no-store" })
        .then(({ data }) => {
          if (active) setUserId(data.userId);
        })
        .catch(() => {
          if (active) setUserId(undefined);
        });
    }
    refreshIdentity();
    window.addEventListener("focus", refreshIdentity);
    return () => {
      active = false;
      window.removeEventListener("focus", refreshIdentity);
    };
  }, []);

  return userId;
}
