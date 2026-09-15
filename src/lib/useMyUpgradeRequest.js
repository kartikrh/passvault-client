"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchMyUpgradeRequest } from "./plan";

// Mirrors useClientPackage.js -- backed by GET /vault/plan/upgradeRequest/mine.
// Exposes a refetch so UpgradePlanModal's caller can refresh this the moment
// a new request is submitted, without a full page reload.
export function useMyUpgradeRequest(enabled) {
  const [request, setRequest] = useState(null);
  const [error, setError] = useState(null);

  const refetch = useCallback(() => {
    if (!enabled) return;
    fetchMyUpgradeRequest()
      .then((result) => setRequest(result))
      .catch((err) => setError(err?.message || "Could not load your upgrade request."));
  }, [enabled]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { request, error, refetch };
}
