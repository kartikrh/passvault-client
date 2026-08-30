"use client";

import { useParams } from "next/navigation";

import CmsPageView from "@/components/CmsPageView";

// Renders CMS-managed pages (About, Terms, FAQ, ...) created in PassVaultpanel's
// Pages admin screen. Resolution happens in CmsPageView, shared with the root
// route (src/app/page.js) so "/" and "/<home-alias>" stay in sync.
export default function DynamicPage() {
  const { slug } = useParams();
  return <CmsPageView slug={slug} />;
}
