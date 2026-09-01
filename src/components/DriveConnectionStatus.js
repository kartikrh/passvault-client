"use client";

import { useState } from "react";
import { GoogleOAuthProvider, useGoogleLogin } from "@react-oauth/google";
import { Alert, Badge } from "reactstrap";
import { connectDrive } from "@/lib/drive";

// The drive.appdata scope requested from this domain's White Label Google
// client (whitelabel.googleKey) -- the same "Web application" OAuth client
// LoginForm uses for Sign-In, just consented for a different scope here.
const DRIVE_SCOPE = "https://www.googleapis.com/auth/drive.appdata";

function ConnectButton({ onConnected }) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);

  // flow: "auth-code" is the one-time authorization *code* PassVaultapi
  // needs (POST /vault/auth/drive/connect) to exchange server-side for a
  // refresh token -- not the access token useGoogleLogin's default
  // "implicit" flow would hand back, which the frontend could use but the
  // backend could never refresh once it expires.
  const requestDriveAccess = useGoogleLogin({
    flow: "auth-code",
    scope: DRIVE_SCOPE,
    onSuccess: async ({ code }) => {
      setError(null);
      setIsConnecting(true);
      try {
        // connectDrive's own { driveConnected: true } response is proof
        // enough -- no need to re-query GET /vault/auth/drive/status right
        // after to confirm what the POST itself already confirmed.
        await connectDrive(code);
        onConnected();
      } catch (err) {
        setError(err?.message || "Could not connect Google Drive. Please try again.");
      } finally {
        setIsConnecting(false);
      }
    },
    onError: () => setError("Google Drive permission was not granted."),
  });

  return (
    <div>
      {error ? (
        <Alert color="danger" className="py-2 px-3 mb-2">
          {error}
        </Alert>
      ) : null}
      <button
        type="button"
        className="btn btn-primary btn-sm"
        disabled={isConnecting}
        onClick={() => requestDriveAccess()}
      >
        {isConnecting ? "Connecting..." : "Connect Google Drive"}
      </button>
    </div>
  );
}

// connected: sourced from the caller's own client.driveConnected (see
// useProfile/useOnboardingStatus) rather than this component checking GET
// /vault/auth/drive/status itself -- every call site already has that from
// its own profile fetch, so re-checking here would just be a second,
// redundant request. onConnected fires once a brand-new connection
// succeeds, so the caller can patch its own client.driveConnected in sync
// (see OnboardingWizardModal/accounts/page.js).
export default function DriveConnectionStatus({ googleClientId, connected, onConnected }) {
  // Gives instant visual feedback the moment a new connection succeeds,
  // without waiting on the caller's own state update to flow back down as
  // a prop -- `connected` becoming true later is a harmless no-op overlap.
  const [justConnected, setJustConnected] = useState(false);
  const isConnected = connected || justConnected;

  const handleConnected = () => {
    setJustConnected(true);
    onConnected?.();
  };

  return (
    <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
      <div>
        <div className="fw-semibold">Google Drive</div>
        <div className="text-muted small">Your vault is stored as one encrypted file in your own Drive.</div>
      </div>

      {isConnected ? (
        <Badge color="success">
          <i className="bx bx-check me-1" />
          Connected
        </Badge>
      ) : googleClientId ? (
        <GoogleOAuthProvider clientId={googleClientId}>
          <ConnectButton onConnected={handleConnected} />
        </GoogleOAuthProvider>
      ) : (
        <Badge color="warning">Not connected (Drive OAuth not configured)</Badge>
      )}
    </div>
  );
}
