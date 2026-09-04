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
};

export default nextConfig;
