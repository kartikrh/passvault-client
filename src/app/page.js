import CmsPageView from "@/components/CmsPageView";

// Root route renders the CMS "home" alias (see PassVaultpanel's Pages admin
// screen) via the same resolver as the [...slug] catch-all, so "/" and
// "/home" always show the same content.
export default function RootPage() {
  return <CmsPageView slug={["home"]} />;
}
