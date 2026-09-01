import axiosInstance from "./api";
import { requireVaultKey } from "./vaultKey";
import { encryptVaultBlob, decryptVaultBlob } from "./vaultCrypto";
import { getCurrentCoords } from "./geolocation";

// Mirrors PassVaultapi's utilities/vaultConstants.js -- entryType/changeType
// are declared by the client on every PUT /vault/data so the server's
// opaque-id ledger (tblClientVaultEntries) can enforce plan quotas and log
// activity without ever decrypting the blob it stores.
export const VaultEntryType = { ACCOUNT: 1, GROUP: 2, NOTE: 3 };
export const VaultChangeType = { CREATE: "create", UPDATE: "update", DELETE: "delete" };

// Accounts (+ Groups) and Notes live in two SEPARATE encrypted files in the
// client's Drive (see findVaultFile/VAULT_FILE_NAMES in PassVaultapi's
// utilities/googleDrive.js) -- each is fetched/saved independently, with its
// own Drive revision id, via GET/PUT /vault/data?vaultType=accounts|notes.
export const VaultFileKind = { ACCOUNTS: "accounts", NOTES: "notes" };

const VAULT_FILE_KIND_BY_ENTRY_TYPE = {
  [VaultEntryType.ACCOUNT]: VaultFileKind.ACCOUNTS,
  [VaultEntryType.GROUP]: VaultFileKind.ACCOUNTS,
  [VaultEntryType.NOTE]: VaultFileKind.NOTES,
};

const fetchVaultFile = async (vaultKey, vaultType) => {
  const { result } = await axiosInstance.get("/vault/data", { params: { vaultType } });
  if (!result?.blob) {
    return { entries: [], revisionId: null };
  }
  const decrypted = await decryptVaultBlob(vaultKey, result.blob);
  return { entries: decrypted.entries || [], revisionId: result.revisionId };
};

// Fetches both files and merges their entries into one array -- callers
// (useVault) still get a single combined list to filter by type, exactly
// like before the file split; only the revisionId (now one per file,
// keyed by VaultFileKind) needs to travel separately alongside it.
export const fetchVaultEntries = async () => {
  const vaultKey = await requireVaultKey();
  const [accountsFile, notesFile] = await Promise.all([
    fetchVaultFile(vaultKey, VaultFileKind.ACCOUNTS),
    fetchVaultFile(vaultKey, VaultFileKind.NOTES),
  ]);
  return {
    entries: [...accountsFile.entries, ...notesFile.entries],
    revisionIds: {
      [VaultFileKind.ACCOUNTS]: accountsFile.revisionId,
      [VaultFileKind.NOTES]: notesFile.revisionId,
    },
  };
};

// Saves only the entries belonging to entryType's file (an Accounts write
// never re-uploads Notes, and vice versa) and returns the full revisionIds
// map with that one file's id refreshed.
const saveVaultEntries = async ({ entries, revisionIds, entryId, entryType, changeType }) => {
  const vaultKey = await requireVaultKey();
  const vaultType = VAULT_FILE_KIND_BY_ENTRY_TYPE[entryType];
  const entriesForFile = entries.filter((entry) => VAULT_FILE_KIND_BY_ENTRY_TYPE[entry.type] === vaultType);
  const blob = await encryptVaultBlob(vaultKey, { entries: entriesForFile });
  // Best-effort -- getCurrentCoords never throws/blocks, resolves null if
  // location can't be read, so a slow/unavailable GPS never holds up the
  // actual save. Rides along on the same activity-log row putVaultDataService
  // already writes for this change (see its getVaultEntryActivityCode call).
  const coords = await getCurrentCoords();
  const { result } = await axiosInstance.put("/vault/data", {
    blob,
    entryId,
    entryType,
    changeType,
    expectedRevisionId: revisionIds?.[vaultType] ?? null,
    latitude: coords?.latitude ?? null,
    longitude: coords?.longitude ?? null,
  });
  return { ...revisionIds, [vaultType]: result.revisionId };
};

// account: { title, username, password, url, securityQuestions }
export const addVaultAccount = async ({ entries, revisionIds, account }) => {
  const newEntry = {
    id: crypto.randomUUID(),
    type: VaultEntryType.ACCOUNT,
    ...account,
    createdAt: new Date().toISOString(),
  };
  const nextEntries = [...entries, newEntry];
  const nextRevisionIds = await saveVaultEntries({
    entries: nextEntries,
    revisionIds,
    entryId: newEntry.id,
    entryType: VaultEntryType.ACCOUNT,
    changeType: VaultChangeType.CREATE,
  });
  return { entries: nextEntries, revisionIds: nextRevisionIds };
};

// account: { title, username, password, url, securityQuestions } -- same
// shape as addVaultAccount, but replaces the existing entry in place
// (keeps its id/type/createdAt) rather than appending a new one.
export const updateVaultAccount = async ({ entries, revisionIds, entryId, account }) => {
  const nextEntries = entries.map((entry) =>
    entry.id === entryId ? { ...entry, ...account, updatedAt: new Date().toISOString() } : entry
  );
  const nextRevisionIds = await saveVaultEntries({
    entries: nextEntries,
    revisionIds,
    entryId,
    entryType: VaultEntryType.ACCOUNT,
    changeType: VaultChangeType.UPDATE,
  });
  return { entries: nextEntries, revisionIds: nextRevisionIds };
};

// note: { title, body, color, pinned, archived, tags }
export const addVaultNote = async ({ entries, revisionIds, note }) => {
  const newEntry = {
    id: crypto.randomUUID(),
    type: VaultEntryType.NOTE,
    ...note,
    createdAt: new Date().toISOString(),
  };
  const nextEntries = [...entries, newEntry];
  const nextRevisionIds = await saveVaultEntries({
    entries: nextEntries,
    revisionIds,
    entryId: newEntry.id,
    entryType: VaultEntryType.NOTE,
    changeType: VaultChangeType.CREATE,
  });
  return { entries: nextEntries, revisionIds: nextRevisionIds };
};

// note: same shape as addVaultNote -- replaces the existing entry in place
// (keeps its id/type/createdAt) rather than appending a new one.
export const updateVaultNote = async ({ entries, revisionIds, entryId, note }) => {
  const nextEntries = entries.map((entry) =>
    entry.id === entryId ? { ...entry, ...note, updatedAt: new Date().toISOString() } : entry
  );
  const nextRevisionIds = await saveVaultEntries({
    entries: nextEntries,
    revisionIds,
    entryId,
    entryType: VaultEntryType.NOTE,
    changeType: VaultChangeType.UPDATE,
  });
  return { entries: nextEntries, revisionIds: nextRevisionIds };
};

// Removes any entry (account, group, or note) by id. entryType must match
// the entry being removed -- PassVaultapi's opaque-id ledger and activity
// log need it to record what kind of thing was deleted (see
// putVaultDataService in services/vaultData.js), and it's also how this
// picks which of the two files to re-save.
export const deleteVaultEntry = async ({ entries, revisionIds, entryId, entryType }) => {
  const nextEntries = entries.filter((entry) => entry.id !== entryId);
  const nextRevisionIds = await saveVaultEntries({
    entries: nextEntries,
    revisionIds,
    entryId,
    entryType,
    changeType: VaultChangeType.DELETE,
  });
  return { entries: nextEntries, revisionIds: nextRevisionIds };
};
