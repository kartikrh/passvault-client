"use client";

import { useEffect, useState } from "react";
import { GoogleOAuthProvider, useGoogleLogin } from "@react-oauth/google";
import { Alert, Badge } from "reactstrap";
import { fetchDriveStatus, connectDrive } from "@/lib/drive";

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

// Whether a client has granted Drive access is server-side state (a
// refresh token stored against tblClient, set only once POST
// /vault/auth/drive/connect succeeds) -- Google Sign-In alone never grants
// it, so this always asks the API rather than inferring anything from the
// sign-in step.
export default function DriveConnectionStatus({ googleClientId, onConnected }) {
  const [status, setStatus] = useState("loading"); // "loading" | "connected" | "disconnected" | "error"

  // Mount-time load: state already starts "loading", so the effect only
  // needs to resolve it -- no synchronous setState in the effect body.
  useEffect(() => {
    let cancelled = false;
    fetchDriveStatus()
      .then((connected) => {
        if (!cancelled) setStatus(connected ? "connected" : "disconnected");
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Re-check after the user just finished the consent popup -- this one's
  // an event-callback, not an effect body, so setting "loading" up front
  // here is fine.
  const loadStatus = () => {
    setStatus("loading");
    fetchDriveStatus()
      .then((connected) => {
        setStatus(connected ? "connected" : "disconnected");
        if (connected) onConnected?.();
      })
      .catch(() => setStatus("error"));
  };

  return (
    <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
      <div>
        <div className="fw-semibold">Google Drive</div>
        <div className="text-muted small">Your vault is stored as one encrypted file in your own Drive.</div>
      </div>

      {status === "loading" ? (
        <Badge color="secondary">Checking...</Badge>
      ) : status === "connected" ? (
        <Badge color="success">
          <i className="bx bx-check me-1" />
          Connected
        </Badge>
      ) : status === "error" ? (
        <Badge color="secondary">Unable to check status</Badge>
      ) : googleClientId ? (
        <GoogleOAuthProvider clientId={googleClientId}>
          <ConnectButton onConnected={loadStatus} />
        </GoogleOAuthProvider>
      ) : (
        <Badge color="warning">Not connected (Drive OAuth not configured)</Badge>
      )}
    </div>
  );
}
