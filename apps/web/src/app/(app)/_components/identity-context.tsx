"use client";
import { useEffect, useState } from "react";

import { createApiClient } from "@/lib/api";

export function useAuthenticatedUserId() {
  const [userId, setUserId] = useState<string>();

  useEffect(() => {
    let active = true;
    void createApiClient()
      .getCurrentUser({ cache: "no-store" })
      .then(({ data }) => {
        if (active) setUserId(data.userId);
      })
      .catch(() => {
        if (active) setUserId(undefined);
      });
    return () => {
      active = false;
    };
  }, []);

  return userId;
}
