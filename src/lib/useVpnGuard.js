"use client";

import { useEffect, useRef } from "react";
import axiosInstance from "@/lib/api";

// Login/register/google already check once, at the moment of signing in
// (PassVaultapi's requireNoVpn) -- this catches a client turning a VPN on
// mid-session by polling GET /vault/auth/vpnStatus every few minutes while
// signed in. onDetected is read from a ref, same as useIdleLogout's onIdle,
// so the caller doesn't need to memoize it.
const CHECK_INTERVAL_MS = 4 * 60 * 1000;

export function useVpnGuard(enabled, onDetected) {
  const onDetectedRef = useRef(onDetected);

  useEffect(() => {
    onDetectedRef.current = onDetected;
  }, [onDetected]);

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;

    const check = async () => {
      try {
        const { result } = await axiosInstance.get("/vault/auth/vpnStatus");
        if (!cancelled && result?.vpnDetected) {
          onDetectedRef.current();
        }
      } catch {
        // Network hiccup or a 401 mid-rotation -- not worth acting on here,
        // the next interval tick tries again.
      }
    };

    const timer = setInterval(check, CHECK_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [enabled]);
}
