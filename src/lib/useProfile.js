"use client";

import { useEffect, useState } from "react";
import { fetchProfile } from "./profile";

// Shared by /dashboard, /profile, /change-password -- all three need the
// signed-in client's full profile (for DashboardHeader's name, and for
// each page's own fields), not just the email the JWT already carries.
export function useProfile(enabled) {
  const [client, setClient] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    fetchProfile()
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
