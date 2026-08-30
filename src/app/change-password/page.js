"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { Card, CardBody, CardHeader, Container } from "reactstrap";
import { getStoredToken } from "@/lib/api";
import { useProfile } from "@/lib/useProfile";
import DashboardHeader from "@/components/DashboardHeader";
import ChangePasswordForm from "@/components/ChangePasswordForm";

const noopSubscribe = () => () => {};
const getServerSnapshot = () => null;

// Its own page/menu entry rather than a section on /profile -- changing a
// password is a distinct, higher-stakes action from editing name/username,
// and this way it gets its own URL to link/bookmark.
export default function ChangePasswordPage() {
  const router = useRouter();
  const token = useSyncExternalStore(noopSubscribe, getStoredToken, getServerSnapshot);
  const { client, setClient, error: loadError } = useProfile(!!token);

  useEffect(() => {
    if (!token) {
      router.replace("/login");
    }
  }, [token, router]);

  if (!token) return null;

  return (
    <div className="min-vh-100 bg-light">
      <DashboardHeader client={client} />

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
