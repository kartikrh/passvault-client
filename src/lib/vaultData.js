import axiosInstance from "./api";
import { requireVaultKey } from "./vaultKey";
import { encryptVaultBlob, decryptVaultBlob } from "./vaultCrypto";

// Mirrors PassVaultapi's utilities/vaultConstants.js -- entryType/changeType
// are declared by the client on every PUT /vault/data so the server's
// opaque-id ledger (tblClientVaultEntries) can enforce plan quotas and log
// activity without ever decrypting the blob it stores.
export const VaultEntryType = { ACCOUNT: 1, GROUP: 2 };
export const VaultChangeType = { CREATE: "create", UPDATE: "update", DELETE: "delete" };

// The whole vault is one encrypted file in the client's Drive (see
// findVaultFile/updateVaultFile in PassVaultapi's utilities/googleDrive.js)
// -- there's no per-entry endpoint, so every read/write round-trips the
// full entries array.
export const fetchVaultEntries = async () => {
  const vaultKey = await requireVaultKey();
  const { result } = await axiosInstance.get("/vault/data");
  if (!result?.blob) {
    return { entries: [], revisionId: null };
  }
  const decrypted = await decryptVaultBlob(vaultKey, result.blob);
  return { entries: decrypted.entries || [], revisionId: result.revisionId };
};

const saveVaultEntries = async ({ entries, revisionId, entryId, changeType }) => {
  const vaultKey = await requireVaultKey();
  const blob = await encryptVaultBlob(vaultKey, { entries });
  const { result } = await axiosInstance.put("/vault/data", {
    blob,
    entryId,
    entryType: VaultEntryType.ACCOUNT,
    changeType,
    expectedRevisionId: revisionId,
  });
  return result.revisionId;
};

// account: { title, username, password, url, securityQuestions }
export const addVaultAccount = async ({ entries, revisionId, account }) => {
  const newEntry = {
    id: crypto.randomUUID(),
    type: VaultEntryType.ACCOUNT,
    ...account,
    createdAt: new Date().toISOString(),
  };
  const nextEntries = [...entries, newEntry];
  const nextRevisionId = await saveVaultEntries({
    entries: nextEntries,
    revisionId,
    entryId: newEntry.id,
    changeType: VaultChangeType.CREATE,
  });
  return { entries: nextEntries, revisionId: nextRevisionId };
};

// account: { title, username, password, url, securityQuestions } -- same
// shape as addVaultAccount, but replaces the existing entry in place
// (keeps its id/type/createdAt) rather than appending a new one.
export const updateVaultAccount = async ({ entries, revisionId, entryId, account }) => {
  const nextEntries = entries.map((entry) =>
    entry.id === entryId ? { ...entry, ...account, updatedAt: new Date().toISOString() } : entry
  );
  const nextRevisionId = await saveVaultEntries({
    entries: nextEntries,
    revisionId,
    entryId,
    changeType: VaultChangeType.UPDATE,
  });
  return { entries: nextEntries, revisionId: nextRevisionId };
};
