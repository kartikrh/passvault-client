"use client";

import { useState } from "react";

// Soft refresh -- calls the caller's own refresh (useVault's `refresh`,
// i.e. re-fetches + re-decrypts GET /vault/data) and re-renders just the
// list. No full page reload.
export default function RefreshButton({ onRefresh }) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleClick = async () => {
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <button
      type="button"
      className="btn btn-light btn-sm border"
      onClick={handleClick}
      disabled={isRefreshing}
      aria-label="Refresh"
      title="Refresh"
    >
      <i className={`bx bx-refresh ${isRefreshing ? "bx-spin" : ""}`} />
    </button>
  );
}
