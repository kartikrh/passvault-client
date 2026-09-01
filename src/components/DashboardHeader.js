"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from "reactstrap";
import { setStoredToken } from "@/lib/api";
import BrandLogo from "./BrandLogo";
import { useOnboardingStatus } from "@/lib/useOnboardingStatus";
import { usePageViewLogging } from "@/lib/usePageViewLogging";
import { useIdleLogout } from "@/lib/useIdleLogout";
import { IDLE_TIMEOUT_MS } from "@/lib/idleConfig";
import { useVpnGuard } from "@/lib/useVpnGuard";

// Profile lives only in the account dropdown below (Profile + Log out) --
// not duplicated here as a separate nav link. Dashboard always shows (it's
// where the setup wizard lives); Accounts/Notes only appear once
// useOnboardingStatus reports everything is set up -- see dashboard/page.js
// for the wizard that drives the same status to completion.
const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/accounts", label: "Accounts", requiresOnboarding: true },
  { href: "/notes", label: "Notes", requiresOnboarding: true },
];

// Signed-in area's own header -- SiteNav (src/components/SiteNav.js) is for
// the public CMS-driven pages only and isn't mounted here (see
// src/app/layout.js), so /dashboard and /profile need their own bar with
// the menu + profile/logout affordance instead of reusing it.
export default function DashboardHeader({ client }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { isComplete: onboardingComplete } = useOnboardingStatus(client, !!client);
  const navLinks = NAV_LINKS.filter((link) => !link.requiresOnboarding || onboardingComplete);
  // Mounted here, once, rather than per-page -- DashboardHeader is present
  // on every protected page already.
  usePageViewLogging(!!client);

  const handleLogout = useCallback(() => {
    setStoredToken(null);
    router.push("/login");
  }, [router]);

  const handleIdleLogout = useCallback(() => {
    setStoredToken(null);
    router.push("/login?reason=idle");
  }, [router]);

  // Duration configured via NEXT_PUBLIC_IDLE_TIMEOUT_MINUTES (see
  // idleConfig.js) -- also mounted here for the same reason as
  // usePageViewLogging above.
  useIdleLogout(!!client, IDLE_TIMEOUT_MS, handleIdleLogout);

  const handleVpnLogout = useCallback(() => {
    setStoredToken(null);
    router.push("/login?reason=vpn");
  }, [router]);

  // Login/register/google already reject a VPN at sign-in time -- this
  // catches one turned on mid-session (polls every few minutes, see
  // useVpnGuard).
  useVpnGuard(!!client, handleVpnLogout);

  // Name first (what a person actually recognizes themselves by), falling
  // back to username, then email, for accounts that haven't set a name yet.
  const displayName = client?.name || client?.username || client?.email || "Account";
  const initial = displayName.trim().charAt(0).toUpperCase();

  const renderNavLinks = (extraClassName) => (
    <nav className={`d-flex flex-wrap align-items-center gap-2 ${extraClassName}`}>
      {navLinks.map(({ href, label }) => {
        const isActive = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className="header-nav-link text-decoration-none px-3 py-1 rounded-pill"
            style={{
              color: "var(--brand-accent-contrast, #ffffff)",
              opacity: isActive ? 1 : 0.75,
              fontWeight: isActive ? 600 : 400,
              backgroundColor: isActive
                ? "color-mix(in srgb, var(--brand-accent-contrast, #ffffff) 20%, transparent)"
                : "transparent",
            }}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );

  const profileDropdown = (
    <Dropdown isOpen={isProfileOpen} toggle={() => setIsProfileOpen((open) => !open)}>
      <DropdownToggle
        tag="button"
        className="btn btn-light d-flex align-items-center gap-2 border"
      >
        <span
          className="bg-primary d-inline-flex align-items-center justify-content-center"
          style={{
            width: 28,
            height: 28,
            fontSize: 14,
            borderRadius: "50%",
            color: "var(--brand-accent-contrast, #ffffff)",
          }}
        >
          {initial}
        </span>
        <span className="d-none d-sm-inline text-truncate" style={{ maxWidth: 180 }}>
          {displayName}
        </span>
        <i className="mdi mdi-chevron-down" />
      </DropdownToggle>
      <DropdownMenu end>
        <DropdownItem header>{displayName}</DropdownItem>
        <DropdownItem divider />
        <DropdownItem tag={Link} href="/profile" active={pathname === "/profile"}>
          <i className="bx bx-user me-2" />
          Profile
        </DropdownItem>
        <DropdownItem tag={Link} href="/change-password" active={pathname === "/change-password"}>
          <i className="bx bx-lock-alt me-2" />
          Change password
        </DropdownItem>
        <DropdownItem onClick={handleLogout} className="text-danger">
          <i className="bx bx-log-out me-2" />
          Log out
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );

  return (
    <header
      className="bg-primary"
      style={{ position: "sticky", top: 0, zIndex: 1020, boxShadow: "0 1px 4px rgba(0, 0, 0, 0.15)" }}
    >
      <div className="container-fluid py-2 px-4">
        {/* Top row, every breakpoint: logo, then (desktop only) the nav
            links immediately beside it, then the profile dropdown pushed all
            the way to the right via the nav's own me-md-auto -- on mobile
            this keeps the avatar in the top-right corner instead of it
            wrapping below the nav links into its own centered row. */}
        <div className="d-flex align-items-center gap-2 gap-md-4">
          <div className="flex-grow-1 flex-md-grow-0 d-flex justify-content-center justify-content-md-start">
            <BrandLogo />
          </div>
          {renderNavLinks("d-none d-md-flex me-md-auto")}
          {profileDropdown}
        </div>

        {/* Second row, mobile only: the nav links, centered under the logo/avatar row. */}
        {renderNavLinks("d-md-none justify-content-center pt-2")}
      </div>
    </header>
  );
}
