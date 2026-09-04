"use client";

import { useCallback, useEffect, useState } from "react";
import { getVaultKeyStatus } from "./vaultKey";
import { OTPType } from "./otpConstants";

export const OnboardingStep = {
  PROFILE: "profile",
  OTP_SETUP: "otpSetup",
  VAULT_KEY: "vaultKey",
  DRIVE: "drive",
};

// OTP_SETUP sits right after PROFILE -- mirrors the order verify-email/page.js
// already enforces right after a brand-new signup sets its password (2FA
// enrollment happens there before /dashboard is ever reached). This is the
// same gate reused for the case that matters here: a client mid-session
// resets their authenticator (TwoFactorSettings' Reset button) and leaves
// before finishing re-enrollment -- hasOtpSecret goes back to false, and
// every other protected page (not just /profile) needs to block on it too.
const STEP_ORDER = [OnboardingStep.PROFILE, OnboardingStep.OTP_SETUP, OnboardingStep.VAULT_KEY, OnboardingStep.DRIVE];

// Vault-key status still needs its own check -- it lives in
// tblClientVaultKey, not tblClient, so it can't ride along with the
// profile fetch the way driveConnected now does (see PassVaultapi's
// CLIENT_SELECT_COLUMNS). getVaultKeyStatus() is already sessionStorage-
// cached, so calling it from both here and useVault is cheap.
//
// driveConnected, on the other hand, is read straight off `client` --
// every page already fetches that via useProfile/useFullProfile, and
// DashboardHeader receives the same `client` as a prop, so deriving it
// here instead of calling GET /vault/auth/drive/status a second time
// avoids duplicating that request on every page load.
export function useOnboardingStatus(client, enabled) {
  const [vaultKeyReady, setVaultKeyReady] = useState(null); // null = checking

  const refreshVaultKey = useCallback(() => {
    if (!enabled) return;
    getVaultKeyStatus()
      .then(({ exists }) => setVaultKeyReady(exists))
      .catch(() => setVaultKeyReady(false));
  }, [enabled]);

  useEffect(() => {
    refreshVaultKey();
  }, [refreshVaultKey]);

  const driveConnected = client?.driveConnected ?? null;
  const statusKnown = !!client && vaultKeyReady !== null && driveConnected !== null;

  const needsProfile = !!client && (!client.username || !client.hasPassword);
  // otpEnabled/otpType/hasOtpSecret all ride along on `client` already
  // (CLIENT_SELECT_COLUMNS), same as driveConnected -- no extra fetch
  // needed. A MAIL-otpType client has nothing to "set up" (there's no
  // secret to scan), so this only ever fires for Google Authenticator.
  const needsOtpSetup =
    !!client && client.otpEnabled && client.otpType === OTPType.GOOGLE_AUTHENTICATOR && !client.hasOtpSecret;
  const needsVaultKey = vaultKeyReady === false;
  const needsDrive = driveConnected === false;

  const step = !statusKnown
    ? null
    : needsProfile
      ? OnboardingStep.PROFILE
      : needsOtpSetup
        ? OnboardingStep.OTP_SETUP
        : needsVaultKey
          ? OnboardingStep.VAULT_KEY
          : needsDrive
            ? OnboardingStep.DRIVE
            : null;

  return {
    step,
    stepIndex: step ? STEP_ORDER.indexOf(step) : -1,
    stepCount: STEP_ORDER.length,
    isComplete: statusKnown && step === null,
    // Only re-checks the vault key -- Drive/profile fields update by
    // patching `client` itself (see OnboardingWizardModal), which flows
    // back down through useProfile's setClient.
    refresh: refreshVaultKey,
  };
}
