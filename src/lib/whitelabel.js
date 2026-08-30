import axiosInstance from "./api";

// tblWhitelabel (PassVaultpanel's "White Label" admin module) is where an
// operator turns Google login / reCAPTCHA on or off per domain and supplies
// the keys. This calls POST /vault/whitelabel -- a lean, public,
// whitelisted-fields endpoint (domain/isGoogleLogin/googleKey/isRecatchEnable
// /recatchKey/isDefault only), NOT the staff-only POST /admin/whitelabel/all,
// which returns the full row (clientOTP, OTP auth keys, encrypted ids, ...)
// and would otherwise leak straight into this browser's network tab.
let cachedWhitelabelPromise = null;

const pickWhitelabel = (list) => {
  if (!Array.isArray(list) || list.length === 0) return null;
  // "domain" stores a full origin (e.g. "http://localhost:3001"), not a bare hostname.
  const origin = typeof window !== "undefined" ? window.location.origin : null;
  return (
    list.find((item) => item.domain === origin) ||
    list.find((item) => item.isDefault) ||
    list[0]
  );
};

// Cached for the life of the page load -- the config doesn't change between
// a client landing on /login and clicking a button a few seconds later.
export const fetchWhitelabel = () => {
  if (!cachedWhitelabelPromise) {
    cachedWhitelabelPromise = axiosInstance
      .post("/vault/whitelabel", {})
      .then((response) => pickWhitelabel(response?.result))
      .catch(() => null);
  }
  return cachedWhitelabelPromise;
};
