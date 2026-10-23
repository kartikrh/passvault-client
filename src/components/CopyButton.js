"use client";

import { useRef, useState } from "react";

// Copied secrets are wiped from the clipboard after this long, so a password
// doesn't sit there to be pasted (or read by another app) indefinitely.
const CLIPBOARD_CLEAR_MS = 30000;

// Copies `value` to the clipboard with a brief checkmark confirmation.
// Shared by RevealAccountModal's username/password rows.
export default function CopyButton({ value, label = "value" }) {
  const [copied, setCopied] = useState(false);
  // Not cleared on unmount on purpose: the reveal modal auto-closes, and the
  // clipboard still has to be wiped after it does.
  const clearTimer = useRef(null);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value ?? "");
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
      clearTimeout(clearTimer.current);
      clearTimer.current = setTimeout(() => {
        // Fails silently if the tab isn't focused by then -- best effort.
        navigator.clipboard.writeText("").catch(() => {});
      }, CLIPBOARD_CLEAR_MS);
    } catch {
      // Clipboard API unavailable (e.g. insecure context) -- nothing to recover from.
    }
  };

  return (
    <button
      type="button"
      className="btn btn-light btn-sm border flex-shrink-0"
      onClick={handleCopy}
      aria-label={`Copy ${label}`}
    >
      {copied ? <i className="bx bx-check text-success" /> : <i className="bx bx-copy" />}
    </button>
  );
}
