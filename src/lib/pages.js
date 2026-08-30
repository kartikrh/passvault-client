import axiosInstance from "./api";

// POST /vault/page (PassVaultapi) -- a lean, public, whitelisted-fields
// endpoint (see controller/vault/page.js) that returns every CMS-managed
// page so the [...slug] catch-all route can resolve one by alias.
let cachedPagesPromise = null;

// Cached for the life of the page load -- the CMS content doesn't change
// between landing on one page and navigating to another, same convention as
// fetchWhitelabel in ./whitelabel.js.
export const fetchPages = () => {
  if (!cachedPagesPromise) {
    cachedPagesPromise = axiosInstance
      .post("/vault/page", {})
      .then((response) => (Array.isArray(response?.result) ? response.result : []))
      .catch(() => []);
  }
  return cachedPagesPromise;
};
