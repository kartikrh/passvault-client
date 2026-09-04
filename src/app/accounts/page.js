"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardBody, Container } from "reactstrap";
import { useAuthToken } from "@/lib/useAuthToken";
import { useProfile } from "@/lib/useProfile";
import { useWhitelabel } from "@/lib/useWhitelabel";
import { useVault } from "@/lib/useVault";
import { VaultFileKind } from "@/lib/vaultData";
import DashboardHeader from "@/components/DashboardHeader";
import DriveConnectionStatus from "@/components/DriveConnectionStatus";
import AddAccountForm from "@/components/AddAccountForm";
import VaultAccountList from "@/components/VaultAccountList";
import AccountListSkeleton from "@/components/AccountListSkeleton";
import RefreshButton from "@/components/RefreshButton";

// The vault's real home -- listing, filtering, adding, and editing saved
// accounts. Gated the same way /dashboard used to be: vault key first (see
// useVault), then Drive, before anything here can render.
export default function AccountsPage() {
  const router = useRouter();
  const { token, checked } = useAuthToken();
  const { client, setClient } = useProfile(!!token);
  const { whitelabel } = useWhitelabel();
  const {
    vaultKeyReady,
    driveConnected,
    accounts,
    loading,
    error,
    addAccount,
    updateAccount,
    deleteEntry,
    onDriveConnected,
    refresh,
  } = useVault(!!token, client?.driveConnected ?? null, VaultFileKind.ACCOUNTS);

  useEffect(() => {
    if (checked && !token) {
      router.replace("/login");
    }
  }, [checked, token, router]);

  // Patches the profile's driveConnected in sync with useVault's own
  // gating state -- keeps DashboardHeader's nav-visibility (which reads
  // client.driveConnected via useOnboardingStatus) correct without waiting
  // on a fresh profile fetch.
  const handleDriveConnected = () => {
    setClient((prev) => prev && { ...prev, driveConnected: true });
    onDriveConnected();
  };

  if (!token) return null;

  return (
    <div className="min-vh-100">
      <DashboardHeader client={client} onClientUpdated={setClient} />

      <Container fluid className="py-5 px-4">
        {vaultKeyReady === null ? <p className="text-muted">Checking your vault...</p> : null}

        {/* Drive must be connected before a vault can exist -- once it is,
            this prompt has nothing left to say and gets out of the way. */}
        {vaultKeyReady && driveConnected === false ? (
          <Card className="mb-3">
            <CardBody className="p-4">
              <DriveConnectionStatus
                googleClientId={whitelabel?.googleKey}
                connected={driveConnected === true}
                onConnected={handleDriveConnected}
              />
            </CardBody>
          </Card>
        ) : null}

        {vaultKeyReady && driveConnected === null ? (
          <p className="text-muted">Checking your Google Drive connection...</p>
        ) : null}

        {vaultKeyReady && driveConnected ? (
          <Card>
            <CardBody className="p-4">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <h5 className="mb-0">Your accounts</h5>
                <div className="d-flex align-items-center gap-2">
                  <RefreshButton onRefresh={refresh} />
                  <AddAccountForm onAdd={addAccount} />
                </div>
              </div>

              {error ? <p className="text-danger small">{error}</p> : null}
              {loading ? (
                <AccountListSkeleton />
              ) : (
                <VaultAccountList
                  entries={accounts}
                  onUpdate={updateAccount}
                  onDelete={deleteEntry}
                  popupIntervalSeconds={client?.popupIntervalSeconds}
                  otpEnabled={client?.otpEnabled}
                />
              )}
            </CardBody>
          </Card>
        ) : null}
      </Container>
    </div>
  );
}
