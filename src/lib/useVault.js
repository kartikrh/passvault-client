"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchDriveStatus } from "./drive";
import { getVaultKeyStatus } from "./vaultKey";
import {
  fetchVaultEntries,
  addVaultAccount as addVaultAccountEntry,
  updateVaultAccount as updateVaultAccountEntry,
} from "./vaultData";

// Gate order: vault key first (it's a one-time, per-client setup that
// doesn't depend on Drive at all -- see VaultKeySetup on the Profile page),
// then Drive (entries live in the client's own Drive file, so nothing can
// be listed/added until that's connected).
export function useVault(enabled) {
  const router = useRouter();
  const [vaultKeyReady, setVaultKeyReady] = useState(null); // null=checking, false=redirecting to /profile, true=ready
  const [driveConnected, setDriveConnected] = useState(null); // null = still checking
  const [entries, setEntries] = useState([]);
  const [revisionId, setRevisionId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadEntries = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { entries: loaded, revisionId: rev } = await fetchVaultEntries();
      setEntries(loaded);
      setRevisionId(rev);
    } catch (err) {
      setError(err?.message || "Could not load your vault.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Step 1: has this client set up its vault encryption key yet? If not,
  // send them to Profile to do that first -- account info is only ever
  // encrypted/decrypted with that key, so there's nothing useful to show
  // here until it exists.
  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    getVaultKeyStatus()
      .then(({ exists }) => {
        if (cancelled) return;
        if (!exists) {
          router.replace("/profile?setupVault=1");
          return;
        }
        setVaultKeyReady(true);
      })
      .catch((err) => {
        if (!cancelled) setError(err?.message || "Could not check your vault encryption key.");
      });
    return () => {
      cancelled = true;
    };
  }, [enabled, router]);

  // Step 2: once the key is confirmed, check Drive and load entries.
  useEffect(() => {
    if (!vaultKeyReady) return;
    let cancelled = false;
    fetchDriveStatus()
      .then((connected) => {
        if (cancelled) return;
        setDriveConnected(connected);
        if (connected) loadEntries();
      })
      .catch(() => {
        if (!cancelled) setDriveConnected(false);
      });
    return () => {
      cancelled = true;
    };
  }, [vaultKeyReady, loadEntries]);

  // Called by DriveConnectionStatus right after the consent popup succeeds --
  // flips the gate immediately instead of waiting for a manual refresh.
  const onDriveConnected = useCallback(() => {
    setDriveConnected(true);
    loadEntries();
  }, [loadEntries]);

  const addAccount = useCallback(
    async (account) => {
      const result = await addVaultAccountEntry({ entries, revisionId, account });
      setEntries(result.entries);
      setRevisionId(result.revisionId);
    },
    [entries, revisionId]
  );

  const updateAccount = useCallback(
    async (entryId, account) => {
      const result = await updateVaultAccountEntry({ entries, revisionId, entryId, account });
      setEntries(result.entries);
      setRevisionId(result.revisionId);
    },
    [entries, revisionId]
  );

  return {
    vaultKeyReady,
    driveConnected,
    entries,
    loading,
    error,
    addAccount,
    updateAccount,
    onDriveConnected,
    refresh: loadEntries,
  };
}
