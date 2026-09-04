"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardBody, Container } from "reactstrap";
import { useAuthToken } from "@/lib/useAuthToken";
import { useProfile } from "@/lib/useProfile";
import { useWhitelabel } from "@/lib/useWhitelabel";
import { useVault } from "@/lib/useVault";
import DashboardHeader from "@/components/DashboardHeader";
import DriveConnectionStatus from "@/components/DriveConnectionStatus";
import NotesGrid from "@/components/NotesGrid";
import NotesGridSkeleton from "@/components/NotesGridSkeleton";
import RefreshButton from "@/components/RefreshButton";

// Google Keep-style notes, living in the same encrypted vault as Accounts
// (see useVault) -- gated the same way: vault key first, then Drive.
export default function NotesPage() {
  const router = useRouter();
  const { token, checked } = useAuthToken();
  const { client, setClient } = useProfile(!!token);
  const { whitelabel } = useWhitelabel();
  const {
    vaultKeyReady,
    driveConnected,
    notes,
    loading,
    error,
    addNote,
    updateNote,
    deleteEntry,
    onDriveConnected,
    refresh,
  } = useVault(!!token, client?.driveConnected ?? null);

  useEffect(() => {
    if (checked && !token) {
      router.replace("/login");
    }
  }, [checked, token, router]);

  // Same reasoning as accounts/page.js's handleDriveConnected -- keeps
  // client.driveConnected (and DashboardHeader's nav-visibility off of it)
  // in sync without a fresh profile fetch.
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
                <h5 className="mb-0">Your notes</h5>
                <RefreshButton onRefresh={refresh} />
              </div>

              {error ? <p className="text-danger small">{error}</p> : null}
              {loading ? (
                <NotesGridSkeleton />
              ) : (
                <NotesGrid entries={notes} onAdd={addNote} onUpdate={updateNote} onDelete={deleteEntry} />
              )}
            </CardBody>
          </Card>
        ) : null}
      </Container>
    </div>
  );
}
