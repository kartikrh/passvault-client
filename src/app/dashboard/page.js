"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Alert, Card, CardBody, CardHeader, Container } from "reactstrap";
import { useAuthToken } from "@/lib/useAuthToken";
import { useProfile } from "@/lib/useProfile";
import { useClientPackage } from "@/lib/useClientPackage";
import { useMyUpgradeRequest } from "@/lib/useMyUpgradeRequest";
import DashboardHeader from "@/components/DashboardHeader";
import SubscriptionCard from "@/components/SubscriptionCard";
import UpgradePlanModal from "@/components/UpgradePlanModal";

// Landing spot after sign-in. The mandatory setup wizard (username/2FA/
// vault key/Drive -- see useOnboardingStatus/OnboardingWizardModal) is
// mounted once inside DashboardHeader itself now, so it gates every
// protected page, not just this one; DashboardHeader also hides the
// Accounts/Notes nav links off that same status.
export default function DashboardPage() {
  const router = useRouter();
  const { token, checked } = useAuthToken();
  const { client, setClient } = useProfile(!!token);
  const { package: subscription, error: packageError } = useClientPackage(!!token);
  const { request: upgradeRequest, refetch: refetchUpgradeRequest } = useMyUpgradeRequest(!!token);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

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

        <Card className="mx-auto mt-4" style={{ maxWidth: 480 }}>
          <CardHeader className="fw-semibold">Current Plan</CardHeader>
          <CardBody>
            <SubscriptionCard pkg={subscription} error={packageError} />

            {upgradeRequest?.status === "PENDING" ? (
              <Alert color="info" className="py-2 px-3 mt-3 mb-0">
                Your upgrade to <strong>{upgradeRequest.requestedPackageName}</strong> is pending review.
              </Alert>
            ) : (
              <>
                {upgradeRequest?.status === "REJECTED" ? (
                  <Alert color="warning" className="py-2 px-3 mt-3 mb-3">
                    Your last upgrade request was rejected
                    {upgradeRequest.rejectionReason ? `: ${upgradeRequest.rejectionReason}` : "."}
                  </Alert>
                ) : null}
                <div className="mt-3">
                  <button type="button" className="btn btn-primary btn-sm" onClick={() => setShowUpgradeModal(true)}>
                    Upgrade plan
                  </button>
                </div>
              </>
            )}
          </CardBody>
        </Card>

        {showUpgradeModal ? (
          <UpgradePlanModal
            currentPackageId={subscription?.packageId}
            onClose={() => setShowUpgradeModal(false)}
            onSubmitted={refetchUpgradeRequest}
          />
        ) : null}
      </Container>
    </div>
  );
}
