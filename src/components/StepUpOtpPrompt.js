"use client";

import { useEffect, useRef, useState } from "react";
import { Alert } from "reactstrap";
import axiosInstance from "@/lib/api";
import { getCurrentCoords } from "@/lib/geolocation";
import OtpDigitInput from "@/components/OtpDigitInput";

const CODE_LENGTH = 6;
const EMPTY_DIGITS = Array(CODE_LENGTH).fill("");

// On-demand re-verification for an already-signed-in session -- distinct
// from TwoFactorChallenge, which only ever consumes a login/enrollment
// pendingToken. Hits POST /vault/auth/2fa/verify with a fresh code; no
// token exchange, no QR code, since the client is already fully enrolled
// by the time anything can gate on this. Used to gate revealing a saved
// account's password (see RevealAccountModal).
//
// otpEnabled: the caller's client.otpEnabled (WrOTPEnable) -- when false,
// this client has no 2FA to check a code against (verifyOwnTotpCode on the
// backend skips its own check the same way), so there's nothing to "ask"
// here either: this auto-submits once, with no code, straight past the
// digit-entry UI, and the caller sees onVerified fire almost immediately.
export default function StepUpOtpPrompt({
  title = "Verify it's you",
  description = "Enter the 6-digit code from your authenticator app.",
  entryId,
  otpEnabled = true,
  onVerified,
  onCancel,
}) {
  const [digits, setDigits] = useState(EMPTY_DIGITS);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const autoVerifyFired = useRef(false);

  const isComplete = digits.every((digit) => digit !== "");

  const verify = async (code) => {
    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      // entryId, when given, tells the backend this step-up is gating a
      // specific account's reveal -- it logs ACCOUNT_PASSWORD_VIEWED (with
      // location, best-effort -- see getCurrentCoords) and hands back when
      // that same entry was last viewed before now (see
      // verifyStepUpOtpService). Only worth reading coords for that case --
      // an entryId-less gate (e.g. StepUpGateModal's edit gate) logs nothing
      // location needs.
      const coords = entryId ? await getCurrentCoords() : null;
      const { result } = await axiosInstance.post("/vault/auth/2fa/verify", {
        code,
        entryId,
        latitude: coords?.latitude ?? null,
        longitude: coords?.longitude ?? null,
      });
      onVerified(result);
    } catch (err) {
      setErrorMessage(err?.message || "Invalid or expired code. Please try again.");
      setDigits(EMPTY_DIGITS);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (otpEnabled || autoVerifyFired.current) return;
    autoVerifyFired.current = true;
    verify(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otpEnabled]);

  if (!otpEnabled) {
    return (
      <div className="text-center py-3">
        {errorMessage ? <Alert color="danger">{errorMessage}</Alert> : null}
        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
        <span className="text-muted">One moment...</span>
      </div>
    );
  }

  return (
    <div>
      <h5 className="text-center mb-1">{title}</h5>
      <p className="text-muted text-center small mb-4">{description}</p>

      {errorMessage ? <Alert color="danger">{errorMessage}</Alert> : null}

      <OtpDigitInput digits={digits} onDigitsChange={setDigits} disabled={isSubmitting} onComplete={verify} />

      <div className="d-grid mt-4">
        <button
          type="button"
          className="btn btn-primary d-flex align-items-center justify-content-center gap-2"
          disabled={isSubmitting || !isComplete}
          onClick={() => verify(digits.join(""))}
        >
          {isSubmitting ? (
            <>
              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
              Verifying...
            </>
          ) : (
            "Verify"
          )}
        </button>

        {onCancel ? (
          <button type="button" className="btn btn-link" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </button>
        ) : null}
      </div>
    </div>
  );
}
