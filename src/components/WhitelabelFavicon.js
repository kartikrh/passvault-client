"use client";

import { useEffect } from "react";
import { useWhitelabel } from "@/lib/useWhitelabel";
import { getDominantColor, isLightColor, shadeColor, toRgbString, toRgbTriplet } from "@/lib/dominantColor";
import { BRAND_COLOR_CACHE_KEY } from "@/lib/brandColorCache";

// Swaps the browser tab's favicon for the current White Label's
// tblWhitelabel.wrFavicon once it's fetched, and derives the site's accent
// color from that same image (average of its opaque pixels) -- mounted once
// in RootLayout so both apply across the whole app, same as
// DevToolsShortcutBlocker.
//
// The color is written onto Bootstrap's OWN CSS variables, not a separate
// custom one:
//  - --bs-primary / --bs-primary-rgb: .text-primary, .bg-primary and
//    .border-primary already read --bs-primary-rgb at runtime (see
//    node_modules/bootstrap/dist/css/bootstrap.css), so those utilities
//    re-theme for free.
//  - --bs-link-color / --bs-link-color-rgb / --bs-link-hover-color: plain
//    <a> tags and .btn-link (e.g. "Back to sign in") read these SEPARATELY
//    from --bs-primary -- Bootstrap bakes $link-color to its own literal
//    value at build time even though it defaults from $primary, so it does
//    NOT move when --bs-primary changes. Needs its own override.
// .btn-primary's tokens are baked to a fixed hex at build time too, so
// brand-theme.scss overrides those explicitly to follow --bs-primary.
export default function WhitelabelFavicon() {
  const { whitelabel } = useWhitelabel();

  useEffect(() => {
    if (!whitelabel?.favicon) return;

    let link = document.querySelector("link[rel='icon']");
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }
    link.href = whitelabel.favicon;
  }, [whitelabel?.favicon]);

  useEffect(() => {
    if (!whitelabel?.favicon) return;

    let cancelled = false;
    getDominantColor(whitelabel.favicon)
      .then((rgb) => {
        if (cancelled) return;
        const root = document.documentElement.style;
        const hoverRgb = shadeColor(rgb, -0.15); // darken 15% for :hover, same idea as Bootstrap's own link-shade

        const cssVars = {
          primary: toRgbString(rgb),
          primaryRgb: toRgbTriplet(rgb),
          linkColor: toRgbString(rgb),
          linkColorRgb: toRgbTriplet(rgb),
          linkHoverColor: toRgbString(hoverRgb),
          contrast: isLightColor(rgb) ? "#111111" : "#ffffff",
        };

        root.setProperty("--bs-primary", cssVars.primary);
        root.setProperty("--bs-primary-rgb", cssVars.primaryRgb);
        root.setProperty("--bs-link-color", cssVars.linkColor);
        root.setProperty("--bs-link-color-rgb", cssVars.linkColorRgb);
        root.setProperty("--bs-link-hover-color", cssVars.linkHoverColor);
        root.setProperty("--brand-accent-contrast", cssVars.contrast);

        // Cached so the very next load can apply the real brand color
        // synchronously (see the "brand-color-preload" beforeInteractive
        // script in app/layout.js) instead of flashing Bootstrap's compiled
        // default teal while this fetch + canvas extraction is in flight.
        try {
          localStorage.setItem(BRAND_COLOR_CACHE_KEY, JSON.stringify(cssVars));
        } catch {
          // Storage disabled/full -- the flash-prevention is a nice-to-have,
          // not worth failing theming over.
        }
      })
      .catch(() => {
        // CORS-tainted canvas, load failure, or an all-transparent favicon --
        // leave Bootstrap's compiled default colors in place.
      });

    return () => {
      cancelled = true;
    };
  }, [whitelabel?.favicon]);

  return null;
}
