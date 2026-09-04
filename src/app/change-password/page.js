"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardBody, CardHeader, Container } from "reactstrap";
import { useAuthToken } from "@/lib/useAuthToken";
import { useProfile } from "@/lib/useProfile";
import DashboardHeader from "@/components/DashboardHeader";
import ChangePasswordForm from "@/components/ChangePasswordForm";

// Its own page/menu entry rather than a section on /profile -- changing a
// password is a distinct, higher-stakes action from editing name/username,
// and this way it gets its own URL to link/bookmark.
export default function ChangePasswordPage() {
  const router = useRouter();
  const { token, checked } = useAuthToken();
  const { client, setClient, error: loadError } = useProfile(!!token);

  useEffect(() => {
    if (checked && !token) {
      router.replace("/login");
    }
  }, [checked, token, router]);

  if (!token) return null;

  return (
    <div className="min-vh-100">
      <DashboardHeader client={client} onClientUpdated={setClient} />

      <Container className="py-5" style={{ maxWidth: 480 }}>
        {loadError ? (
          <div className="alert alert-danger">{loadError}</div>
        ) : !client ? (
          <div className="text-muted">Loading...</div>
        ) : (
          <Card>
            <CardHeader className="fw-semibold">
              {client.hasPassword ? "Change password" : "Set a password"}
            </CardHeader>
            <CardBody>
              <ChangePasswordForm
                hasPassword={client.hasPassword}
                onChanged={() => setClient((prev) => ({ ...prev, hasPassword: true }))}
              />
            </CardBody>
          </Card>
        )}
      </Container>
    </div>
  );
}
