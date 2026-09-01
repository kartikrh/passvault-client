"use client";

import { useEffect, useState } from "react";
import { fetchVaultEntries } from "./vaultData";

// Best-effort entryId -> title map so RecentActivity can show "Gmail"
// instead of a raw entry id for account/note activity rows. Deliberately
// not useVault -- this doesn't need (or want) its vault-key-missing
// redirect; if the key isn't set up yet, Drive isn't connected, or the
// fetch just fails, this silently yields an empty map and RecentActivity
// falls back to showing the plain activity label, same as before this
// existed.
export function useEntryNameLookup(enabled) {
  const [namesById, setNamesById] = useState({});

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    fetchVaultEntries()
      .then(({ entries }) => {
        if (cancelled) return;
        const map = {};
        entries.forEach((entry) => {
          map[entry.id] = entry.title;
        });
        setNamesById(map);
      })
      .catch(() => {
        // Vault key not set up, Drive not connected, decrypt failure, etc.
      });
    return () => {
      cancelled = true;
    };
  }, [enabled]);

  return namesById;
}
