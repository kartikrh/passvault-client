"use client";

import { useSyncExternalStore } from "react";
import { getStoredToken } from "./api";

const noopSubscribe = () => () => {};
// Distinct from both a real token (string) and "confirmed logged out"
// (null, what getStoredToken returns once it actually runs client-side).
// undefined only ever comes from this SSR placeholder.
const UNCHECKED = undefined;
const getServerSnapshot = () => UNCHECKED;

// Every protected page used to read the token via
// useSyncExternalStore(noopSubscribe, getStoredToken, () => null) directly,
// then redirect to /login the moment that value was falsy. The bug: null
// was both the SSR-placeholder value on the very first paint AND the
// "definitely logged out" value, so on a hard reload the redirect effect
// could fire on that first-paint render before React reconciled with the
// real localStorage read -- bouncing a signed-in client straight back to
// /login. Using `undefined` as the placeholder instead keeps that
// distinguishable: callers only treat the token as absent once `checked`
// is true.
export function useAuthToken() {
  const token = useSyncExternalStore(noopSubscribe, getStoredToken, getServerSnapshot);
  return { token: token === UNCHECKED ? null : token, checked: token !== UNCHECKED };
}
