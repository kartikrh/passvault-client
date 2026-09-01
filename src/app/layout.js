import "@/assets/scss/theme.scss";
import "@/assets/scss/brand-theme.scss";
import DevToolsShortcutBlocker from "@/components/DevToolsShortcutBlocker";
import WhitelabelFavicon from "@/components/WhitelabelFavicon";
import { BRAND_COLOR_CACHE_KEY } from "@/lib/brandColorCache";

export const metadata = {
  title: "PassVault",
  description: "Sign in to your PassVault account",
};

// Plain string, not JSX/next/script -- next/script's strategy="beforeInteractive"
// turns out to route through Next's RSC flight-data payload in this app-router
// version (confirmed by inspecting the actual response HTML: the script's source
// arrives as an escaped string inside Next's own bootstrap payload, not as a
// literal <script> tag), so the browser's main.js runtime has to parse that
// payload and inject the tag before it runs -- already after first paint,
// i.e. too late to prevent the flash this exists to avoid. A raw <script> tag
// rendered directly by this server component has no such indirection: it's
// emitted as literal HTML, so the parser executes it synchronously, blocking,
// before anything after it (including first paint of <body>).
const BRAND_COLOR_PRELOAD_SCRIPT = `
(function () {
  try {
    var raw = localStorage.getItem(${JSON.stringify(BRAND_COLOR_CACHE_KEY)});
    if (!raw) return;
    var c = JSON.parse(raw);
    var root = document.documentElement.style;
    if (c.primary) root.setProperty("--bs-primary", c.primary);
    if (c.primaryRgb) root.setProperty("--bs-primary-rgb", c.primaryRgb);
    if (c.linkColor) root.setProperty("--bs-link-color", c.linkColor);
    if (c.linkColorRgb) root.setProperty("--bs-link-color-rgb", c.linkColorRgb);
    if (c.linkHoverColor) root.setProperty("--bs-link-hover-color", c.linkHoverColor);
    if (c.contrast) root.setProperty("--brand-accent-contrast", c.contrast);
  } catch (e) {}
})();
`;

export default function RootLayout({ children }) {
  return (
    // suppressHydrationWarning: the preload script above intentionally sets
    // inline CSS custom properties on this element before React hydrates
    // (same technique next-themes uses to avoid a dark-mode flash), so its
    // style attribute legitimately differs from the server-rendered markup
    // -- without this, React logs a hydration-mismatch warning for an
    // attribute that's supposed to differ.
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Applies the brand color cached by WhitelabelFavicon's last
            successful favicon extraction immediately, so a reload shows the
            real brand color right away instead of flashing Bootstrap's
            compiled default teal while useWhitelabel's fetch + the
            favicon's canvas extraction are still in flight. Only a
            brand-new browser (no cache yet) still sees that one-time
            flash. Placed first in <head>, before any stylesheet, so it's
            the very first thing the parser executes. */}
        <script
          id="brand-color-preload"
          dangerouslySetInnerHTML={{ __html: BRAND_COLOR_PRELOAD_SCRIPT }}
        />
        <link
          href="https://unpkg.com/boxicons@2.0.7/css/boxicons.min.css"
          rel="stylesheet"
        />
      </head>
      <body>
        <DevToolsShortcutBlocker />
        <WhitelabelFavicon />
        {children}
      </body>
    </html>
  );
}
