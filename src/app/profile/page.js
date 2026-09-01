"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Alert, Card, CardBody, CardHeader, Col, Container, Label, Row } from "reactstrap";
import { useAuthToken } from "@/lib/useAuthToken";
import { useFullProfile } from "@/lib/useFullProfile";
import { useWhitelabel } from "@/lib/useWhitelabel";
import DashboardHeader from "@/components/DashboardHeader";
import ProfileForm from "@/components/ProfileForm";
import ContactInfoForm from "@/components/ContactInfoForm";
import DriveConnectionStatus from "@/components/DriveConnectionStatus";
import VaultKeySetup from "@/components/VaultKeySetup";
import RecentActivity from "@/components/RecentActivity";
import TwoFactorSettings from "@/components/TwoFactorSettings";
import ProfileSectionNav from "@/components/ProfileSectionNav";
import ProfileSkeleton from "@/components/ProfileSkeleton";
import AccountDangerZone from "@/components/AccountDangerZone";

const SECTIONS = [
  { id: "profile-email", label: "Email" },
  { id: "profile-basics", label: "Profile" },
  { id: "profile-contact", label: "Contact info" },
  { id: "profile-vault-key", label: "Vault security" },
  { id: "profile-2fa", label: "Two-factor authentication" },
  { id: "profile-drive", label: "Google Drive" },
  { id: "profile-activity", label: "Recent activity" },
  { id: "profile-danger-zone", label: "Danger zone" },
];

export default function ProfilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // Set by useVault when /accounts found no vault key yet and sent the
  // client here to set one up first -- once it's ready, bounce straight
  // back instead of leaving them stranded on Profile.
  const cameFromVaultSetup = searchParams.get("setupVault") === "1";
  const { token, checked } = useAuthToken();
  const { client, setClient, error: loadError } = useFullProfile(!!token);
  // Same whitelabel.googleKey the Drive OAuth client reuses server-side
  // (see PassVaultapi's services/vaultDrive.js) -- there is no separate
  // Drive-only client id anymore.
  const { whitelabel } = useWhitelabel();

  useEffect(() => {
    if (checked && !token) {
      router.replace("/login");
    }
  }, [checked, token, router]);

  const handleVaultKeyReady = () => {
    if (cameFromVaultSetup) {
      router.replace("/accounts");
    }
  };

  if (!token) return null;

  return (
    <div className="min-vh-100">
      <DashboardHeader client={client} />

      <Container fluid className="py-5 px-4">
        {loadError ? (
          <div className="alert alert-danger">{loadError}</div>
        ) : !client ? (
          <ProfileSkeleton />
        ) : (
          <Row>
            {/* Jump-to-section links so the user can go straight to a
                card instead of scrolling this whole page by hand. Hidden
                below md -- on a narrow screen the cards just stack in
                order and scrolling is short enough not to need it. */}
            <Col md={3} className="d-none d-md-block mb-3">
              <ProfileSectionNav sections={SECTIONS} />
            </Col>

            <Col md={9}>
              <Card className="mb-3" id="profile-email">
                <CardHeader className="fw-semibold">Email</CardHeader>
                <CardBody>
                  {/* Sign-in identity -- not user-editable by design. */}
                  <Label className="form-label mb-0">Email</Label>
                  <div>{client.email}</div>
                </CardBody>
              </Card>

              <Card className="mb-3" id="profile-basics">
                <CardHeader className="fw-semibold">Profile</CardHeader>
                <CardBody>
                  <ProfileForm client={client} onUpdated={setClient} />
                </CardBody>
              </Card>

              <Card className="mb-3" id="profile-contact">
                <CardHeader className="fw-semibold">Contact info</CardHeader>
                <CardBody>
                  <ContactInfoForm client={client} onUpdated={setClient} />
                </CardBody>
              </Card>

              <Card className="mb-3" id="profile-vault-key">
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

              <Card className="mb-3" id="profile-2fa">
                <CardHeader className="fw-semibold">Two-factor authentication</CardHeader>
                <CardBody>
                  <TwoFactorSettings client={client} onUpdated={setClient} />
                </CardBody>
              </Card>

              <Card className="mb-3" id="profile-drive">
                <CardBody>
                  <DriveConnectionStatus
                    googleClientId={whitelabel?.googleKey}
                    connected={client?.driveConnected === true}
                    onConnected={() => setClient((prev) => prev && { ...prev, driveConnected: true })}
                  />
                </CardBody>
              </Card>

              <Card className="mb-3" id="profile-activity">
                <CardHeader className="fw-semibold">Recent activity</CardHeader>
                <CardBody>
                  <RecentActivity />
                </CardBody>
              </Card>

              <Card id="profile-danger-zone" className="border-danger">
                <CardHeader className="fw-semibold text-danger">Danger zone</CardHeader>
                <CardBody>
                  <AccountDangerZone otpEnabled={client?.otpEnabled} />
                </CardBody>
              </Card>
            </Col>
          </Row>
        )}
      </Container>
    </div>
  );
}
