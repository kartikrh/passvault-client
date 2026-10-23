import axiosInstance, { onSessionCleared } from "./api";
import { createKeyCheck, deriveVaultKeyFromPassword, generateKdfSalt, verifyKeyCheck } from "./vaultCrypto";

// Zero-knowledge vault key: the server stores only the KDF salt and a key
// check (see PassVaultapi's services/vaultKey.js), never the key. It is
// derived here from the vault password on every unlock and kept in memory
// only -- not localStorage/sessionStorage, where an XSS could read it -- so a
// page reload or a new tab asks for the vault password again. There is no
// server-side recovery: a forgotten vault password means a locked vault.
let cachedVaultKey = null;

export const clearCachedVaultKey = () => {
  cachedVaultKey = null;
};

// Every sign-out path goes through api.js's setStoredToken(null).
onSessionCleared(clearCachedVaultKey);

export class VaultLockedError extends Error {
  constructor() {
    super("Your vault is locked -- enter your vault password to unlock it.");
    this.code = "VAULT_LOCKED";
  }
}

const fetchKeyParams = async () => {
  const { result } = await axiosInstance.post("/vault/key/params");
  return result;
};

// exists: a vault key has been set up for this account (drives the Profile
// "Set up" badge and the onboarding gate). unlocked: this tab holds the key.
export const getVaultKeyStatus = async () => {
  if (cachedVaultKey) return { exists: true, unlocked: true, vaultKey: cachedVaultKey };
  const params = await fetchKeyParams();
  return { exists: !!params?.exists, unlocked: false, vaultKey: null };
};

export const isVaultUnlocked = () => cachedVaultKey !== null;

// Derives the key from the vault password and checks it. Accounts created
// before the zero-knowledge change still have an escrowed key on the server:
// the first unlock proves the password via /vault/key/migrate (same password
// + salt => same key), which stores this device-made key check and deletes
// the server's copy.
export const unlockVault = async (vaultPassword) => {
  const params = await fetchKeyParams();
  if (!params?.exists) {
    throw new Error("Vault encryption key is not set up yet -- set it up on your Profile page first.");
  }

  const vaultKey = await deriveVaultKeyFromPassword(vaultPassword, params.kdfSalt);

  if (params.needsMigration) {
    const keyCheck = await createKeyCheck(vaultKey);
    await axiosInstance.post("/vault/key/migrate", { vaultKey, keyCheck });
  } else if (!(await verifyKeyCheck(vaultKey, params.keyCheck))) {
    throw new Error("Incorrect vault password");
  }

  cachedVaultKey = vaultKey;
  return vaultKey;
};

// The one-time, explicit setup action (Profile page's "Set up vault key"
// form): only the salt and key check go to the server.
export const setupVaultKey = async (vaultPassword) => {
  const kdfSalt = generateKdfSalt();
  const vaultKey = await deriveVaultKeyFromPassword(vaultPassword, kdfSalt);
  const keyCheck = await createKeyCheck(vaultKey);
  await axiosInstance.post("/vault/key/setup", { kdfSalt, keyCheck });
  cachedVaultKey = vaultKey;
  return vaultKey;
};

// For encrypt/decrypt call sites -- the page must have unlocked the vault
// first (useVault exposes vaultLocked + unlock for that).
export const requireVaultKey = async () => {
  if (!cachedVaultKey) throw new VaultLockedError();
  return cachedVaultKey;
};
