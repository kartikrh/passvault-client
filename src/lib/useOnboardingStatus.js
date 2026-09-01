"use client";

import { useCallback, useEffect, useState } from "react";
import { getVaultKeyStatus } from "./vaultKey";

export const OnboardingStep = {
  PROFILE: "profile",
  VAULT_KEY: "vaultKey",
  DRIVE: "drive",
};

const STEP_ORDER = [OnboardingStep.PROFILE, OnboardingStep.VAULT_KEY, OnboardingStep.DRIVE];

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
  const needsVaultKey = vaultKeyReady === false;
  const needsDrive = driveConnected === false;

  const step = !statusKnown
    ? null
    : needsProfile
      ? OnboardingStep.PROFILE
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
