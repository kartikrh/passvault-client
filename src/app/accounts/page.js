"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { Card, CardBody, Container } from "reactstrap";
import { getStoredToken } from "@/lib/api";
import { useProfile } from "@/lib/useProfile";
import { useWhitelabel } from "@/lib/useWhitelabel";
import { useVault } from "@/lib/useVault";
import DashboardHeader from "@/components/DashboardHeader";
import DriveConnectionStatus from "@/components/DriveConnectionStatus";
import AddAccountForm from "@/components/AddAccountForm";
import VaultAccountList from "@/components/VaultAccountList";

const noopSubscribe = () => () => {};
const getServerSnapshot = () => null;

// The vault's real home -- listing, filtering, adding, and editing saved
// accounts. Gated the same way /dashboard used to be: vault key first (see
// useVault), then Drive, before anything here can render.
export default function AccountsPage() {
  const router = useRouter();
  const token = useSyncExternalStore(noopSubscribe, getStoredToken, getServerSnapshot);
  const { client } = useProfile(!!token);
  const { whitelabel } = useWhitelabel();
  const { vaultKeyReady, driveConnected, entries, loading, error, addAccount, updateAccount, onDriveConnected } =
    useVault(!!token);

  useEffect(() => {
    if (!token) {
      router.replace("/login");
    }
  }, [token, router]);

  if (!token) return null;

  return (
    <div className="min-vh-100 bg-light">
      <DashboardHeader client={client} />

      <Container className="py-5" style={{ maxWidth: 900 }}>
        {vaultKeyReady === null ? <p className="text-muted">Checking your vault...</p> : null}

        {/* Drive must be connected before a vault can exist -- once it is,
            this prompt has nothing left to say and gets out of the way. */}
        {vaultKeyReady && driveConnected === false ? (
          <Card className="mb-3">
            <CardBody className="p-4">
              <DriveConnectionStatus googleClientId={whitelabel?.googleKey} onConnected={onDriveConnected} />
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
              </div>

              <AddAccountForm onAdd={addAccount} />

              {error ? <p className="text-danger small">{error}</p> : null}
              {loading ? (
                <p className="text-muted mb-0">Loading your vault...</p>
              ) : (
                <VaultAccountList entries={entries} onUpdate={updateAccount} />
              )}
            </CardBody>
          </Card>
        ) : null}
      </Container>
    </div>
  );
}
