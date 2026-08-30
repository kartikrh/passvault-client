"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Simple top nav built straight from the CMS page list (usePages/lib/pages.js)
// -- there's no dedicated public menu endpoint yet, and each page already
// carries the alias + display name a nav link needs, so this stays in sync
// with PassVaultpanel's Pages admin screen without extra backend work.
export default function SiteNav({ pages }) {
  const pathname = usePathname();

  // The login page has its own dedicated "Log In" button below, driven by
  // its own CMS alias -- it doesn't also need a plain text entry in the link
  // list, same reasoning as excluding the default/home page (reachable via
  // the brand link instead).
  const loginPage = (pages || []).find((page) => page.linkURL === "login");
  const loginHref = loginPage?.alias ? `/${loginPage.alias.replace(/^\//, "")}` : "/login";

  const navPages = (pages || []).filter(
    (page) => page.alias && !page.isDefault && page.linkURL !== "login"
  );

  return (
    <header className="bg-white border-bottom">
      <div className="container d-flex flex-wrap align-items-center justify-content-between py-3 gap-3">
        <Link href="/" className="fw-bold text-primary text-decoration-none fs-4">
          PassVault
        </Link>

        <nav className="d-flex flex-wrap align-items-center gap-3">
          {navPages.map((page) => {
            const href = `/${page.alias.replace(/^\//, "")}`;
            const isActive = pathname === href;
            return (
              <Link
                key={page.pageId}
                href={href}
                className={`text-decoration-none ${isActive ? "text-primary fw-semibold" : "text-muted"}`}
              >
                {page.pageName}
              </Link>
            );
          })}
          <Link href={loginHref} className="btn btn-primary btn-sm">
            Log In
          </Link>
        </nav>
      </div>
    </header>
  );
}
