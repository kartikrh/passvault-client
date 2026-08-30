"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardBody, Container } from "reactstrap";
import { getStoredToken } from "@/lib/api";
import { useProfile } from "@/lib/useProfile";
import DashboardHeader from "@/components/DashboardHeader";

const noopSubscribe = () => () => {};
const getServerSnapshot = () => null;

// Landing spot after sign-in -- the vault itself (listing, filter, add,
// edit) lives on /accounts, which handles its own vault-key/Drive gating
// (see useVault). This page only needs the sign-in check.
export default function DashboardPage() {
  const router = useRouter();
  // localStorage is an external, non-React source, so useSyncExternalStore
  // -- not useState+useEffect -- is the hydration-safe way to read it:
  // React renders getServerSnapshot's value (null) for the first client
  // paint to match SSR, then swaps in the real client snapshot right after,
  // with no flash and no synchronous setState-in-effect.
  const token = useSyncExternalStore(noopSubscribe, getStoredToken, getServerSnapshot);
  const { client } = useProfile(!!token);

  useEffect(() => {
    if (!token) {
      router.replace("/login");
    }
  }, [token, router]);

  if (!token) return null;

  return (
    <div className="min-vh-100 bg-light">
      <DashboardHeader client={client} />

      <Container className="py-5">
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
