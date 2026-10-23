const isDev = process.env.NODE_ENV !== "production";
// Origin only (scheme://host:port) -- inlined at build time, like the client's
// own axios baseURL.
const apiOrigin = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_API_BASE_URL).origin;
  } catch {
    return "";
  }
})();

const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} https://accounts.google.com https://www.google.com https://www.gstatic.com`,
  "style-src 'self' 'unsafe-inline' https://accounts.google.com https://unpkg.com https://fonts.googleapis.com",
  "font-src 'self' data: https://unpkg.com https://fonts.gstatic.com",
  // White-label logos/favicons are served from the operator's file server.
  "img-src 'self' data: blob: https:",
  `connect-src 'self' ${apiOrigin} https://accounts.google.com https://www.google.com`,
  "frame-src https://accounts.google.com https://www.google.com https://recaptcha.google.com",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Turbopack (this version's default) can't resolve Bootstrap's own
  // internal relative @import (bootstrap/scss/_variables.scss importing
  // "variables-dark") -- "Can't find stylesheet to import" every time.
  // package.json's dev/build scripts pass --webpack to route around it;
  // safe to drop once that's fixed upstream.

  // Docker/Railway deploy: traces only the files each page actually needs
  // into .next/standalone (own minimal server.js, no full node_modules) --
  // see Dockerfile's runner stage, which runs that server.js directly
  // instead of `next start`.
  output: "standalone",

  // Security headers. The CSP follows this Next version's "Without Nonces"
  // guide (node_modules/next/dist/docs/01-app/02-guides/content-security-policy.md):
  // nonces would force every page to dynamic rendering, so inline scripts
  // (Next's own bootstrap + the brand-color preload) are allowed, but script,
  // frame and fetch destinations are pinned to this app, the API and Google
  // Sign-In / reCAPTCHA. No COOP header: it would break the Google OAuth popup.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: contentSecurityPolicy },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(self), payment=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
