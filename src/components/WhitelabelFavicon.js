"use client";

import { useEffect } from "react";
import { useWhitelabel } from "@/lib/useWhitelabel";

// Swaps the browser tab's favicon for the current White Label's
// tblWhitelabel.wrFavicon once it's fetched -- mounted once in RootLayout.
// (Colours no longer come from the favicon: the glass palettes in
// lib/palette.js own the colour scheme; White Labels keep their logo/favicon.)
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
    // Builds before the palettes cached a favicon-derived colour here.
    try {
      localStorage.removeItem("passvault.brandColors");
    } catch {
      // storage disabled
    }
  }, []);

  return null;
}
