import axiosInstance from "./api";

// code: the one-time authorization code from the drive.appdata consent
// screen (see DriveConnectionStatus, flow: "auth-code"). The server exchanges
// it for a refresh token and stores it -- this is the step that actually
// grants Drive access, distinct from signing in. Its own { driveConnected:
// true } response is trusted directly (see DriveConnectionStatus) rather
// than re-querying GET /vault/auth/drive/status afterward -- whether Drive
// is connected now rides along on the profile response instead (see
// PassVaultapi's CLIENT_SELECT_COLUMNS/getProfileService), which is also
// what every page already reads to know if this needs calling at all.
export const connectDrive = async (code) => {
  const { result } = await axiosInstance.post("/vault/auth/drive/connect", { code });
  return !!result?.driveConnected;
};
