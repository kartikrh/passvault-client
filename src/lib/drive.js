import axiosInstance from "./api";

// Google Sign-In (the ID-token flow in LoginForm) only proves identity --
// it never asks for Drive access. Whether this client has separately
// granted the drive.appdata consent lives server-side as a refresh token
// on tblClient (see PassVaultapi's GET /vault/auth/drive/status), so that's
// the only reliable place to ask; there's no client-side signal for it.
export const fetchDriveStatus = async () => {
  const { result } = await axiosInstance.get("/vault/auth/drive/status");
  return !!result?.driveConnected;
};

// code: the one-time authorization code from the drive.appdata consent
// screen (see DriveConnectButton, flow: "auth-code"). The server exchanges
// it for a refresh token and stores it -- this is the step that actually
// grants Drive access, distinct from signing in.
export const connectDrive = async (code) => {
  const { result } = await axiosInstance.post("/vault/auth/drive/connect", { code });
  return !!result?.driveConnected;
};
