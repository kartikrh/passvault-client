"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Alert, Card, CardBody, CardHeader, Container, Label } from "reactstrap";
import { getStoredToken } from "@/lib/api";
import { useProfile } from "@/lib/useProfile";
import { useWhitelabel } from "@/lib/useWhitelabel";
import DashboardHeader from "@/components/DashboardHeader";
import ProfileForm from "@/components/ProfileForm";
import DriveConnectionStatus from "@/components/DriveConnectionStatus";
import VaultKeySetup from "@/components/VaultKeySetup";
import RecentActivity from "@/components/RecentActivity";

const noopSubscribe = () => () => {};
const getServerSnapshot = () => null;

export default function ProfilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // Set by useVault when /accounts found no vault key yet and sent the
  // client here to set one up first -- once it's ready, bounce straight
  // back instead of leaving them stranded on Profile.
  const cameFromVaultSetup = searchParams.get("setupVault") === "1";
  // Same hydration-safe token read as /dashboard -- see that page's comment.
  const token = useSyncExternalStore(noopSubscribe, getStoredToken, getServerSnapshot);
  const { client, setClient, error: loadError } = useProfile(!!token);
  // Same whitelabel.googleKey the Drive OAuth client reuses server-side
  // (see PassVaultapi's services/vaultDrive.js) -- there is no separate
  // Drive-only client id anymore.
  const { whitelabel } = useWhitelabel();

  useEffect(() => {
    if (!token) {
      router.replace("/login");
    }
  }, [token, router]);

  const handleVaultKeyReady = () => {
    if (cameFromVaultSetup) {
      router.replace("/accounts");
    }
  };

  if (!token) return null;

  return (
    <div className="min-vh-100 bg-light">
      <DashboardHeader client={client} />

      <Container className="py-5" style={{ maxWidth: 560 }}>
        {loadError ? (
          <div className="alert alert-danger">{loadError}</div>
        ) : !client ? (
          <div className="text-muted">Loading...</div>
        ) : (
          <>
            <Card className="mb-3">
              <CardHeader className="fw-semibold">Email</CardHeader>
              <CardBody>
                {/* Sign-in identity -- not user-editable by design. */}
                <Label className="form-label mb-0">Email</Label>
                <div>{client.email}</div>
              </CardBody>
            </Card>

            <Card className="mb-3">
              <CardHeader className="fw-semibold">Profile</CardHeader>
              <CardBody>
                <ProfileForm client={client} onUpdated={setClient} />
              </CardBody>
            </Card>

            <Card className="mb-3">
              <CardHeader className="fw-semibold">Vault security</CardHeader>
              <CardBody>
                {cameFromVaultSetup ? (
                  <Alert color="info" className="py-2 px-3 mb-3">
                    Set up your vault encryption key below to start saving accounts.
                  </Alert>
                ) : null}
                <VaultKeySetup onReady={handleVaultKeyReady} />
              </CardBody>
            </Card>

            <Card className="mb-3">
              <CardBody>
                <DriveConnectionStatus googleClientId={whitelabel?.googleKey} />
              </CardBody>
            </Card>

            <Card>
              <CardHeader className="fw-semibold">Recent activity</CardHeader>
              <CardBody>
                <RecentActivity />
              </CardBody>
            </Card>
          </>
        )}
      </Container>
    </div>
  );
}
