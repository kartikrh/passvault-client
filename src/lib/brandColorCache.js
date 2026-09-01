// Plain constant, deliberately NOT in a "use client" module -- WhitelabelFavicon.js
// (client component) writes to this localStorage key after a successful favicon
// color extraction, and app/layout.js's "brand-color-preload" beforeInteractive
// script (rendered from a server component) reads it back before hydration.
// A named export from a "use client" module doesn't survive that server-component
// import (it resolves to undefined there), so the key has to live here instead.
export const BRAND_COLOR_CACHE_KEY = "passvault.brandColors";
