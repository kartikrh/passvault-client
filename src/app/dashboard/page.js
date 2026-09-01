"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardBody, Container } from "reactstrap";
import { useAuthToken } from "@/lib/useAuthToken";
import { useProfile } from "@/lib/useProfile";
import { useWhitelabel } from "@/lib/useWhitelabel";
import { useOnboardingStatus } from "@/lib/useOnboardingStatus";
import DashboardHeader from "@/components/DashboardHeader";
import OnboardingWizardModal from "@/components/OnboardingWizardModal";

// Landing spot after sign-in, and the one place that drives the mandatory
// setup wizard (see useOnboardingStatus/OnboardingWizardModal) -- until
// username, password, vault key, and Drive are all set up, this page shows
// the wizard instead of the welcome card, and DashboardHeader hides the
// Accounts/Notes nav links off the same status.
export default function DashboardPage() {
  const router = useRouter();
  const { token, checked } = useAuthToken();
  const { client, setClient } = useProfile(!!token);
  const { whitelabel } = useWhitelabel();
  const { step, stepIndex, stepCount, refresh } = useOnboardingStatus(client, !!token);

  useEffect(() => {
    if (checked && !token) {
      router.replace("/login");
    }
  }, [checked, token, router]);

  if (!token) return null;

  return (
    <div className="min-vh-100">
      <DashboardHeader client={client} />

      <OnboardingWizardModal
        client={client}
        step={step}
        stepIndex={stepIndex}
        stepCount={stepCount}
        googleClientId={whitelabel?.googleKey}
        onUpdated={setClient}
        onRefresh={refresh}
      />

      <Container fluid className="py-5 px-4">
        <Card className="mx-auto" style={{ maxWidth: 480 }}>
          <CardBody className="p-4 text-center">
            <i className="bx bx-shield-quarter text-primary" style={{ fontSize: "2.5rem" }} />
            <h4 className="mt-3">Welcome{client?.name ? `, ${client.name}` : ""}</h4>
            <p className="text-muted">Manage your saved accounts and passwords.</p>
            <Link href="/accounts" className="btn btn-primary btn-sm">
              Go to your accounts
            </Link>
          </CardBody>
        </Card>
      </Container>
    </div>
  );
}
