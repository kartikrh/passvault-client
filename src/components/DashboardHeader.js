"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from "reactstrap";
import { setStoredToken } from "@/lib/api";

// Profile lives only in the account dropdown below (Profile + Log out) --
// not duplicated here as a separate nav link.
const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/accounts", label: "Accounts" },
];

// Signed-in area's own header -- SiteNav (src/components/SiteNav.js) is for
// the public CMS-driven pages only and isn't mounted here (see
// src/app/layout.js), so /dashboard and /profile need their own bar with
// the menu + profile/logout affordance instead of reusing it.
export default function DashboardHeader({ client }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleLogout = () => {
    setStoredToken(null);
    router.push("/login");
  };

  // Name first (what a person actually recognizes themselves by), falling
  // back to username, then email, for accounts that haven't set a name yet.
  const displayName = client?.name || client?.username || client?.email || "Account";
  const initial = displayName.trim().charAt(0).toUpperCase();

  return (
    <header className="bg-white border-bottom">
      <div className="container d-flex align-items-center justify-content-between py-3 gap-3">
        <Link href="/" className="fw-bold text-primary text-decoration-none fs-4">
          PassVault
        </Link>

        <nav className="d-flex flex-wrap align-items-center gap-3">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`text-decoration-none ${pathname === href ? "text-primary fw-semibold" : "text-muted"}`}
            >
              {label}
            </Link>
          ))}

          <Dropdown isOpen={isProfileOpen} toggle={() => setIsProfileOpen((open) => !open)}>
            <DropdownToggle
              tag="button"
              className="btn btn-light d-flex align-items-center gap-2 border"
            >
              <span
                className="rounded-circle bg-primary text-white d-inline-flex align-items-center justify-content-center"
                style={{ width: 28, height: 28, fontSize: 14 }}
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
        </nav>
      </div>
    </header>
  );
}
