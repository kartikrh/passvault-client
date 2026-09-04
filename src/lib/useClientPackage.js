"use client";

import { useEffect, useState } from "react";
import { fetchClientPackage } from "./profile";

// Mirrors useFullProfile.js -- backed by GET /vault/auth/profile/package.
// Only /profile's Subscription card needs this, so it's a separate fetch
// rather than folded into useFullProfile's already-trimmed response.
export function useClientPackage(enabled) {
  const [pkg, setPkg] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    fetchClientPackage()
      .then((result) => {
        if (!cancelled) setPkg(result);
      })
      .catch((err) => {
        if (!cancelled) setError(err?.message || "Could not load your subscription.");
      });
    return () => {
      cancelled = true;
    };
  }, [enabled]);

  return { package: pkg, error };
}
