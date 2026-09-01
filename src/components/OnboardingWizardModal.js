"use client";

import { Modal, ModalBody, Progress } from "reactstrap";
import { OnboardingStep } from "@/lib/useOnboardingStatus";
import ProfileForm from "@/components/ProfileForm";
import ChangePasswordForm from "@/components/ChangePasswordForm";
import VaultKeySetup from "@/components/VaultKeySetup";
import DriveConnectionStatus from "@/components/DriveConnectionStatus";

const STEP_LABELS = {
  [OnboardingStep.PROFILE]: "Profile",
  [OnboardingStep.VAULT_KEY]: "Vault key",
  [OnboardingStep.DRIVE]: "Google Drive",
};

// Mandatory, non-dismissible setup gate shown on /dashboard until username,
// password, vault key, and Drive are all in place -- see useOnboardingStatus
// for how `step` is derived (also reused by DashboardHeader to hide the
// Accounts/Notes nav links until this same status is complete).
export default function OnboardingWizardModal({ client, step, stepIndex, stepCount, googleClientId, onUpdated, onRefresh }) {
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
