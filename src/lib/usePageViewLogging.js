"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { logPageView } from "./activity";

// Mounted once in DashboardHeader (present on every protected page), not
// per-page -- reports each route change to PassVaultapi's activity log
// (PAGE_VIEWED, see logPageViewService) so "which page he visited" shows
// up in the same Recent Activity feed as account/2FA/profile events.
// Fire-and-forget: a failed log shouldn't block or flash an error over
// what is, from the user's perspective, just navigating.
export function usePageViewLogging(enabled) {
  const pathname = usePathname();

  useEffect(() => {
    if (!enabled || !pathname) return;
    logPageView(pathname).catch(() => {});
  }, [enabled, pathname]);
}
