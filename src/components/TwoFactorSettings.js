"use client";

import { useState } from "react";
import { Badge, Modal, ModalBody } from "reactstrap";
import axiosInstance from "@/lib/api";
import { OTPType } from "@/lib/otpConstants";
import TwoFactorChallenge from "./TwoFactorChallenge";
import ConfirmModal from "./ConfirmModal";

// Settings-page counterpart to the mandatory post-signup enrollment in
// verify-email/page.js -- lets a client re-scan a QR code after losing
// their device (POST /vault/auth/2fa/reset then /2fa/setup), reusing the
// same TwoFactorChallenge confirm step. Every client defaults to
// WrOTPEnable=true/otpType=GOOGLE_AUTHENTICATOR (sql/vault/005_client_otp.sql),
// so hasOtpSecret should normally already be true by the time anyone sees
// this card -- the "set up now" branch only covers an account that
// somehow reached here without having finished enrollment.
export default function TwoFactorSettings({ client, onUpdated }) {
  const [otpChallenge, setOtpChallenge] = useState(null);
  // "setup" (Set up now, cancellable) vs "reset" (Reset button, mandatory --
  // the old secret is already gone server-side by the time this shows, so
  // there's nothing left to cancel back to).
  const [challengeSource, setChallengeSource] = useState(null);
  const [confirmingReset, setConfirmingReset] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const beginSetup = async () => {
    setErrorMessage(null);
    setIsResetting(true);
    try {
      const { result } = await axiosInstance.post("/vault/auth/2fa/setup");
      setChallengeSource("setup");
      setOtpChallenge(result);
    } catch (err) {
      setErrorMessage(err?.message || "Could not start setup. Please try again.");
    } finally {
      setIsResetting(false);
    }
  };

  // Confirmed via the ConfirmModal below -- POST /vault/auth/2fa/reset
  // clears the old secret and sends the Reset 2FA email (PassVaultapi's
  // resetTwoFactorService) before this ever runs.
  const handleReset = async () => {
    setErrorMessage(null);
    setIsResetting(true);
    try {
      await axiosInstance.post("/vault/auth/2fa/reset");
      const { result } = await axiosInstance.post("/vault/auth/2fa/setup");
      setChallengeSource("reset");
      setOtpChallenge(result);
    } catch (err) {
      setErrorMessage(err?.message || "Could not reset two-factor authentication. Please try again.");
    } finally {
      setIsResetting(false);
      setConfirmingReset(false);
    }
  };

  const handleVerified = (updatedClient) => {
    setOtpChallenge(null);
    setChallengeSource(null);
    onUpdated?.(updatedClient);
  };

  if (otpChallenge) {
    const challenge = (
      <TwoFactorChallenge
        pendingToken={otpChallenge.pendingToken}
        qrCode={otpChallenge.qrCode}
        otpType={otpChallenge.otpType}
        onVerified={handleVerified}
        onCancel={
          challengeSource === "reset"
            ? undefined
            : () => {
                setOtpChallenge(null);
                setChallengeSource(null);
              }
        }
      />
    );

    // Reset just wiped the account's only valid code, so re-enrollment
    // can't be dismissed here -- same non-dismissible pattern as the
    // mandatory onboarding gate (OnboardingWizardModal).
    if (challengeSource === "reset") {
      return (
        <Modal isOpen backdrop="static" keyboard={false} centered>
          <ModalBody className="p-4">{challenge}</ModalBody>
        </Modal>
      );
    }

    return challenge;
  }

  if (!client.otpEnabled) {
    return <div className="text-muted">Two-factor authentication is turned off for your account.</div>;
  }

  return (
    <div>
      {errorMessage ? <div className="alert alert-danger py-2 px-3 mb-3">{errorMessage}</div> : null}

      <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
        <div>
          <div className="fw-semibold">
            {client.otpType === OTPType.MAIL ? "Email code" : "Google Authenticator"}
          </div>
          <div className="text-muted small">
            {client.otpType === OTPType.MAIL
              ? "We email you a code every time you sign in."
              : client.hasOtpSecret
                ? "A code from your authenticator app is required every time you sign in."
                : "Setup isn't finished yet."}
          </div>
        </div>

        {client.otpType === OTPType.GOOGLE_AUTHENTICATOR ? (
          client.hasOtpSecret ? (
            <div className="d-flex align-items-center gap-2">
              <Badge color="success">
                <i className="bx bx-check me-1" />
                Enabled
              </Badge>
              <button
                type="button"
                className="btn btn-danger btn-sm"
                disabled={isResetting}
                onClick={() => setConfirmingReset(true)}
              >
                Reset
              </button>
            </div>
          ) : (
            <button type="button" className="btn btn-primary btn-sm" disabled={isResetting} onClick={beginSetup}>
              {isResetting ? "Starting..." : "Set up now"}
            </button>
          )
        ) : (
          <Badge color="success">
            <i className="bx bx-check me-1" />
            Enabled
          </Badge>
        )}
      </div>

      {confirmingReset ? (
        <ConfirmModal
          title="Reset Google Authenticator?"
          body="This immediately turns off your current authenticator code and emails you a security notice. You'll need to scan a new QR code right away to finish -- two-factor authentication is required on every account."
          confirmLabel={isResetting ? "Resetting..." : "Reset"}
          isConfirming={isResetting}
          onConfirm={handleReset}
          onCancel={() => setConfirmingReset(false)}
        />
      ) : null}
    </div>
  );
}
