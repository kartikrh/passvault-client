"use client";

import { useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import BrandLogo from "./BrandLogo";

// Simple top nav built straight from the CMS page list (usePages/lib/pages.js)
// -- there's no dedicated public menu endpoint yet, and each page already
// carries the alias + display name a nav link needs, so this stays in sync
// with PassVaultpanel's Pages admin screen without extra backend work.
//
// The header itself is filled with the brand color (--bs-primary, derived
// from the current White Label's favicon -- see WhitelabelFavicon.js), so
// every element drawn on top uses --brand-accent-contrast (black or white,
// whichever reads on that color) instead of Bootstrap's text-muted/
// text-primary utilities, which assume a light background.
export default function SiteNav({ pages }) {
  const pathname = usePathname();
  const scrollerRef = useRef(null);

  // The login page has its own dedicated "Log In" button below, driven by
  // its own CMS alias -- it doesn't also need a plain text entry in the link
  // list, same reasoning as excluding the default/home page (reachable via
  // the brand link instead).
  const loginPage = (pages || []).find((page) => page.linkURL === "login");
  const loginHref = loginPage?.alias ? `/${loginPage.alias.replace(/^\//, "")}` : "/login";

  const navPages = (pages || []).filter(
    (page) => page.alias && !page.isDefault && page.linkURL !== "login"
  );

  const scrollNav = (direction) => {
    scrollerRef.current?.scrollBy({ left: direction * 160, behavior: "smooth" });
  };

  const renderLinks = () =>
    navPages.map((page) => {
      const href = `/${page.alias.replace(/^\//, "")}`;
      const isActive = pathname === href;
      return (
        <Link
          key={page.pageId}
          href={href}
          className="header-nav-link text-decoration-none text-nowrap px-3 py-1 rounded-pill"
          style={{
            color: "var(--brand-accent-contrast, #ffffff)",
            opacity: isActive ? 1 : 0.75,
            fontWeight: isActive ? 600 : 400,
            backgroundColor: isActive
              ? "color-mix(in srgb, var(--brand-accent-contrast, #ffffff) 20%, transparent)"
              : "transparent",
          }}
        >
          {page.pageName}
        </Link>
      );
    });

  return (
    <header
      className="bg-primary"
      style={{ position: "sticky", top: 0, zIndex: 1020, boxShadow: "0 1px 4px rgba(0, 0, 0, 0.15)" }}
    >
      <div className="container-fluid py-2 px-4">
        {/* Top row, every breakpoint: logo, then (desktop only) the nav
            links immediately beside it, then "Log In" pushed all the way to
            the right via the nav's own me-md-auto -- mirrors DashboardHeader's
            avatar-stays-top-right treatment, so on mobile the button doesn't
            wrap below the menu into its own row. */}
        <div className="d-flex align-items-center gap-2 gap-md-4">
          <div className="flex-grow-1 flex-md-grow-0 d-flex justify-content-center justify-content-md-start">
            <BrandLogo />
          </div>
          <nav className="d-none d-md-flex flex-wrap align-items-center gap-2 me-md-auto">{renderLinks()}</nav>
          <Link
            href={loginHref}
            className="btn btn-sm fw-semibold flex-shrink-0"
            style={{ backgroundColor: "var(--brand-accent-contrast, #ffffff)", color: "var(--bs-primary)", border: "none" }}
          >
            Log In
          </Link>
        </div>

        {/* Second row, mobile only: the nav links in a horizontally
            scrollable strip. Mobile browsers typically hide the scrollbar
            itself (no visible cue that there's more to see), so these arrow
            buttons are the actual, always-visible way to reach items past
            the edge -- scrolling still works by touch/swipe too. */}
        {navPages.length > 0 && (
          <div className="d-flex d-md-none align-items-center gap-1 pt-2">
            <button
              type="button"
              className="btn btn-sm flex-shrink-0 px-1"
              aria-label="Scroll menu left"
              onClick={() => scrollNav(-1)}
              style={{ color: "var(--brand-accent-contrast, #ffffff)", background: "transparent", border: "none" }}
            >
              <i className="mdi mdi-chevron-left fs-5" />
            </button>
            <div
              ref={scrollerRef}
              className="hide-scrollbar d-flex flex-nowrap align-items-center gap-2 flex-grow-1"
              style={{ overflowX: "auto" }}
            >
              {renderLinks()}
            </div>
            <button
              type="button"
              className="btn btn-sm flex-shrink-0 px-1"
              aria-label="Scroll menu right"
              onClick={() => scrollNav(1)}
              style={{ color: "var(--brand-accent-contrast, #ffffff)", background: "transparent", border: "none" }}
            >
              <i className="mdi mdi-chevron-right fs-5" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
