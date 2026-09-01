"use client";

import { useEffect, useRef } from "react";

const ACTIVITY_EVENTS = ["mousemove", "mousedown", "keydown", "scroll", "touchstart", "wheel"];

// Fires onIdle after `timeoutMs` with none of the above activity -- the
// timer resets on every one of them. onIdle is read from a ref rather than
// taken as a dependency, so the caller doesn't need to memoize it with
// useCallback for this to avoid needlessly tearing down and re-adding six
// window listeners on every render.
export function useIdleLogout(enabled, timeoutMs, onIdle) {
  const timerRef = useRef(null);
  const onIdleRef = useRef(onIdle);

  useEffect(() => {
    onIdleRef.current = onIdle;
  }, [onIdle]);

  useEffect(() => {
    if (!enabled || !timeoutMs) return;

    const resetTimer = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => onIdleRef.current(), timeoutMs);
    };

    resetTimer();
    ACTIVITY_EVENTS.forEach((event) => window.addEventListener(event, resetTimer, { passive: true }));

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      ACTIVITY_EVENTS.forEach((event) => window.removeEventListener(event, resetTimer));
    };
  }, [enabled, timeoutMs]);
}
