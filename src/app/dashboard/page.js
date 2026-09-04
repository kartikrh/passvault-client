"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardBody, Container } from "reactstrap";
import { useAuthToken } from "@/lib/useAuthToken";
import { useProfile } from "@/lib/useProfile";
import DashboardHeader from "@/components/DashboardHeader";

// Landing spot after sign-in. The mandatory setup wizard (username/2FA/
// vault key/Drive -- see useOnboardingStatus/OnboardingWizardModal) is
// mounted once inside DashboardHeader itself now, so it gates every
// protected page, not just this one; DashboardHeader also hides the
// Accounts/Notes nav links off that same status.
export default function DashboardPage() {
  const router = useRouter();
  const { token, checked } = useAuthToken();
  const { client, setClient } = useProfile(!!token);

  useEffect(() => {
    if (checked && !token) {
      router.replace("/login");
    }
  }, [checked, token, router]);

  if (!token) return null;

  return (
    <div className="min-vh-100">
      <DashboardHeader client={client} onClientUpdated={setClient} />

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
