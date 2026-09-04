// Mirrors PassVaultapi's utilities/vaultConstants.js VaultActivityCodes --
// just the values the client needs to know client-side, to decide what to
// show alongside an activity row's refId on the /activity page.
export const ActivityType = {
  ACCOUNT_CREATED: 110,
  ACCOUNT_UPDATED: 111,
  ACCOUNT_DELETED: 112,
  NOTE_CREATED: 160,
  NOTE_UPDATED: 161,
  NOTE_DELETED: 162,
  ACCOUNT_PASSWORD_VIEWED: 170,
  PAGE_VIEWED: 171,
};

// refId on these rows is a vault entry id -- resolvable to a name via
// useEntryNameLookup. Everything else's refId (login/2FA/profile rows use
// the client's own id; PAGE_VIEWED's is a page path, handled separately)
// isn't an entry id and has nothing to resolve.
export const ENTRY_ACTIVITY_TYPES = new Set([
  ActivityType.ACCOUNT_CREATED,
  ActivityType.ACCOUNT_UPDATED,
  ActivityType.ACCOUNT_DELETED,
  ActivityType.NOTE_CREATED,
  ActivityType.NOTE_UPDATED,
  ActivityType.NOTE_DELETED,
  ActivityType.ACCOUNT_PASSWORD_VIEWED,
]);
