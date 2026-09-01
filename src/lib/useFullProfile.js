"use client";

import { useEffect, useState } from "react";
import { fetchFullProfile } from "./profile";

// Mirrors useProfile.js exactly, just backed by GET /vault/auth/profile/full
// (adds mobileNo/address) -- used only by /profile, the one screen that
// displays those via ProfileForm. Every other protected page keeps using
// the lighter useProfile.
export function useFullProfile(enabled) {
  const [client, setClient] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    fetchFullProfile()
      .then((result) => {
        if (!cancelled) setClient(result);
      })
      .catch((err) => {
        if (!cancelled) setError(err?.message || "Could not load your profile.");
      });
    return () => {
      cancelled = true;
    };
  }, [enabled]);

  return { client, setClient, error };
}
