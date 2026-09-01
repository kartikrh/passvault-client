"use client";

import { useState } from "react";

// Copies `value` to the clipboard with a brief checkmark confirmation.
// Shared by RevealAccountModal's username/password rows.
export default function CopyButton({ value, label = "value" }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value ?? "");
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
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
