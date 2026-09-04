"use client";

import { useEffect, useState } from "react";
import { Alert, Modal, ModalBody, Progress } from "reactstrap";
import axiosInstance from "@/lib/api";
import { OnboardingStep } from "@/lib/useOnboardingStatus";
import ProfileForm from "@/components/ProfileForm";
import ChangePasswordForm from "@/components/ChangePasswordForm";
import TwoFactorChallenge from "@/components/TwoFactorChallenge";
import VaultKeySetup from "@/components/VaultKeySetup";
import DriveConnectionStatus from "@/components/DriveConnectionStatus";

const STEP_LABELS = {
  [OnboardingStep.PROFILE]: "Profile",
  [OnboardingStep.OTP_SETUP]: "Two-factor authentication",
  [OnboardingStep.VAULT_KEY]: "Vault key",
  [OnboardingStep.DRIVE]: "Google Drive",
};

// Mandatory, non-dismissible setup gate -- mounted once in DashboardHeader
// (so it's present on every protected page, not just /dashboard) until
// username/password, two-factor auth, vault key, and Drive are all in
// place. See useOnboardingStatus for how `step` is derived (also reused by
// DashboardHeader to hide the Accounts/Notes nav links until complete).
export default function OnboardingWizardModal({ client, step, stepIndex, stepCount, googleClientId, onUpdated, onRefresh }) {
  const [otpChallenge, setOtpChallenge] = useState(null);
  const [otpError, setOtpError] = useState(null);

  // Fetches a fresh QR code the moment this step becomes active -- covers
  // both a client who never finished enrollment and one who reset their
  // authenticator (TwoFactorSettings' Reset button) and left before
  // re-scanning; either way hasOtpSecret is false and there's no pending
  // QR to reuse.
  useEffect(() => {
    if (step !== OnboardingStep.OTP_SETUP) return;
    setOtpError(null);
    axiosInstance
      .post("/vault/auth/2fa/setup")
      .then(({ result }) => setOtpChallenge(result))
      .catch((err) => setOtpError(err?.message || "Could not start two-factor setup. Please try again."));
  }, [step]);

  if (!step) return null;

  return (
    <Modal isOpen backdrop="static" keyboard={false} centered>
      <ModalBody className="p-4">
        <div className="text-center mb-3">
          <h5 className="mb-1">Finish setting up your vault</h5>
          <p className="text-muted small mb-0">
            Step {stepIndex + 1} of {stepCount} -- {STEP_LABELS[step]}
          </p>
        </div>

        <Progress className="mb-4" value={((stepIndex + 1) / stepCount) * 100} />

        {/* Sequential, not both-at-once: username first (its own screen --
            ProfileForm is Name + Username only, Mobile number/Address live
            on the profile page in their own card, see ContactInfoForm),
            then password only once client.username comes back set (onUpdated
            below re-renders this with the fresh client, which flips this
            branch on its own). */}
        {step === OnboardingStep.PROFILE ? (
          !client?.username ? (
            <div>
              <h6 className="fw-semibold mb-2">Choose a username</h6>
              <ProfileForm client={client} onUpdated={onUpdated} />
            </div>
          ) : !client?.hasPassword ? (
            <div>
              <h6 className="fw-semibold mb-2">Set a password</h6>
              <ChangePasswordForm
                hasPassword={client?.hasPassword}
                onChanged={() => onUpdated({ ...client, hasPassword: true })}
              />
            </div>
          ) : null
        ) : null}

        {step === OnboardingStep.OTP_SETUP ? (
          <div>
            <h6 className="fw-semibold mb-2 text-center">Set up two-factor authentication</h6>
            {otpError ? <Alert color="danger">{otpError}</Alert> : null}
            {/* No onCancel -- there's nothing valid to fall back to once
                the old secret is gone (or was never set), so this can't be
                dismissed short of finishing it. */}
            {otpChallenge ? (
              <TwoFactorChallenge
                pendingToken={otpChallenge.pendingToken}
                qrCode={otpChallenge.qrCode}
                otpType={otpChallenge.otpType}
                onVerified={onUpdated}
              />
            ) : null}
          </div>
        ) : null}

        {step === OnboardingStep.VAULT_KEY ? (
          <>
            <h6 className="fw-semibold mb-2">Set your vault encryption key</h6>
            <VaultKeySetup onReady={onRefresh} />
          </>
        ) : null}

        {step === OnboardingStep.DRIVE ? (
          <>
            <h6 className="fw-semibold mb-2">Connect Google Drive</h6>
            {/* driveConnected now rides along on the profile response (see
                useOnboardingStatus) -- patch `client` directly instead of
                re-fetching GET /vault/auth/drive/status separately. */}
            <DriveConnectionStatus
              googleClientId={googleClientId}
              connected={client?.driveConnected === true}
              onConnected={() => onUpdated({ ...client, driveConnected: true })}
            />
          </>
        ) : null}
      </ModalBody>
    </Modal>
  );
}
