import "@/assets/scss/theme.scss";
import "@/assets/scss/brand-theme.scss";
import "@/assets/scss/glass-theme.scss";
import DevToolsShortcutBlocker from "@/components/DevToolsShortcutBlocker";
import PrismBackground from "@/components/PrismBackground";
import WhitelabelFavicon from "@/components/WhitelabelFavicon";
import { DEFAULT_PALETTE, PALETTE_PRELOAD_SCRIPT, getPalette } from "@/lib/palette";

export const metadata = {
  title: "PassVault",
  description: "Sign in to your PassVault account",
};

export const viewport = {
  themeColor: getPalette(DEFAULT_PALETTE).themeColor,
};

export default function RootLayout({ children }) {
  const defaultPalette = getPalette(DEFAULT_PALETTE);
  return (
    // The server renders the default palette; the preload script below swaps
    // in the visitor's saved one before first paint (same technique
    // next-themes uses), so these attributes legitimately differ from the
    // server markup -- hence suppressHydrationWarning.
    <html lang="en" data-palette={defaultPalette.id} data-bs-theme={defaultPalette.mode} suppressHydrationWarning>
      <head>
        {/* A raw <script> (not next/script, which in this app-router version
            is injected via the RSC payload -- after first paint), placed first
            in <head> so it runs before anything renders. */}
        <script id="palette-preload" dangerouslySetInnerHTML={{ __html: PALETTE_PRELOAD_SCRIPT }} />
        <link href="https://unpkg.com/boxicons@2.0.7/css/boxicons.min.css" rel="stylesheet" />
      </head>
      <body>
        <PrismBackground />
        <DevToolsShortcutBlocker />
        <WhitelabelFavicon />
        {children}
      </body>
    </html>
  );
}
