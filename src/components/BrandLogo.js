"use client";

import Link from "next/link";
import { useWhitelabel } from "@/lib/useWhitelabel";

// Renders the current White Label's logo (tblWhitelabel.wrLogo, uploaded via
// PassVaultpanel's White Label admin screen) as the site's brand link, or the
// "PassVault" wordmark when no logo has been set for this domain.
export default function BrandLogo() {
  const { whitelabel } = useWhitelabel();

  if (whitelabel?.logo) {
    return (
      <Link href="/" className="text-decoration-none d-inline-flex align-items-center">
        <img src={whitelabel.logo} alt="Logo" style={{ height: 48 }} />
      </Link>
    );
  }

  return (
    <Link
      href="/"
      className="fw-bold text-decoration-none fs-3"
      style={{ color: "var(--brand-accent-contrast, #ffffff)" }}
    >
      PassVault
    </Link>
  );
}
