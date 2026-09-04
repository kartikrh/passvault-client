"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getVaultKeyStatus } from "./vaultKey";
import {
  VaultEntryType,
  VaultFileKind,
  fetchVaultEntries,
  addVaultAccount as addVaultAccountEntry,
  updateVaultAccount as updateVaultAccountEntry,
  addVaultNote as addVaultNoteEntry,
  updateVaultNote as updateVaultNoteEntry,
  deleteVaultEntry as deleteVaultEntryEntry,
} from "./vaultData";

// Gate order: vault key first (it's a one-time, per-client setup that
// doesn't depend on Drive at all -- see VaultKeySetup on the Profile page),
// then Drive (entries live in the client's own Drive file, so nothing can
// be listed/added until that's connected).
//
// driveConnected is a parameter, not state this hook fetches itself --
// it now rides along on the profile response (see PassVaultapi's
// CLIENT_SELECT_COLUMNS/getProfileService), so every caller already has
// client.driveConnected before it ever calls this hook. Pass
// `client?.driveConnected ?? null` (null while the profile is still
// loading, to match this hook's old "still checking" state).
// fileKind: which Drive file this page actually needs (VaultFileKind.ACCOUNTS
// for /accounts, VaultFileKind.NOTES for /notes) -- loadEntries fetches only
// that one file, so visiting Accounts never also pulls the Notes file from
// Drive (and vice versa). Defaults to both for any future caller that wants
// the old combined behavior.
export function useVault(enabled, driveConnected, fileKind = [VaultFileKind.ACCOUNTS, VaultFileKind.NOTES]) {
  const router = useRouter();
  const [vaultKeyReady, setVaultKeyReady] = useState(null); // null=checking, false=redirecting to /profile, true=ready
  const [entries, setEntries] = useState([]);
  // One Drive revision id per file (Accounts+Groups, Notes -- see
  // vaultData.js's VaultFileKind), since each is now a separate file.
  const [revisionIds, setRevisionIds] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileKinds = useMemo(() => (Array.isArray(fileKind) ? fileKind : [fileKind]), [fileKind]);

  const loadEntries = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { entries: loaded, revisionIds: revs } = await fetchVaultEntries(fileKinds);
      setEntries(loaded);
      setRevisionIds(revs);
    } catch (err) {
      setError(err?.message || "Could not load your vault.");
    } finally {
      setLoading(false);
    }
  }, [fileKinds]);

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

  // Step 2: once the key is confirmed, load entries if the caller's own
  // profile fetch already says Drive is connected. Deferred a microtask
  // out, same as this file's other effects, rather than calling the
  // (setState-touching) loadEntries synchronously in the effect body.
  useEffect(() => {
    if (!vaultKeyReady || !driveConnected) return;
    Promise.resolve().then(() => loadEntries());
  }, [vaultKeyReady, driveConnected, loadEntries]);

  // Called by DriveConnectionStatus right after a brand-new connection
  // succeeds -- the caller patches its own client.driveConnected (see
  // accounts/page.js), this just kicks the entries load off immediately
  // rather than waiting for that to flow back down as a prop.
  const onDriveConnected = useCallback(() => {
    loadEntries();
  }, [loadEntries]);

  const addAccount = useCallback(
    async (account) => {
      const result = await addVaultAccountEntry({ entries, revisionIds, account });
      setEntries(result.entries);
      setRevisionIds(result.revisionIds);
    },
    [entries, revisionIds]
  );

  const updateAccount = useCallback(
    async (entryId, account) => {
      const result = await updateVaultAccountEntry({ entries, revisionIds, entryId, account });
      setEntries(result.entries);
      setRevisionIds(result.revisionIds);
    },
    [entries, revisionIds]
  );

  const addNote = useCallback(
    async (note) => {
      const result = await addVaultNoteEntry({ entries, revisionIds, note });
      setEntries(result.entries);
      setRevisionIds(result.revisionIds);
    },
    [entries, revisionIds]
  );

  const updateNote = useCallback(
    async (entryId, note) => {
      const result = await updateVaultNoteEntry({ entries, revisionIds, entryId, note });
      setEntries(result.entries);
      setRevisionIds(result.revisionIds);
    },
    [entries, revisionIds]
  );

  const deleteEntry = useCallback(
    async (entryId, entryType) => {
      const result = await deleteVaultEntryEntry({ entries, revisionIds, entryId, entryType });
      setEntries(result.entries);
      setRevisionIds(result.revisionIds);
    },
    [entries, revisionIds]
  );

  const accounts = useMemo(() => entries.filter((entry) => entry.type === VaultEntryType.ACCOUNT), [entries]);
  const notes = useMemo(() => entries.filter((entry) => entry.type === VaultEntryType.NOTE), [entries]);

  return {
    vaultKeyReady,
    driveConnected,
    entries,
    accounts,
    notes,
    loading,
    error,
    addAccount,
    updateAccount,
    addNote,
    updateNote,
    deleteEntry,
    onDriveConnected,
    refresh: loadEntries,
  };
}
