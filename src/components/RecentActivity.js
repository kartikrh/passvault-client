"use client";

import { useEffect, useState } from "react";
import { fetchActivity, formatActivityDate } from "@/lib/activity";

const INITIAL_LIMIT = 10;
const ALL_LIMIT = 500;

// Last 10 by default (already sorted newest-first server-side -- see
// listClientActivityLogsQuery's ORDER BY), "Show all" re-fetches with a
// much higher limit rather than paging, since a client's own activity list
// is small enough that a second round trip is simpler than pagination UI.
export default function RecentActivity() {
  const [activity, setActivity] = useState(null);
  const [error, setError] = useState(null);
  const [showingAll, setShowingAll] = useState(false);
  const [isLoadingAll, setIsLoadingAll] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchActivity(INITIAL_LIMIT)
      .then((rows) => {
        if (!cancelled) setActivity(rows);
      })
      .catch((err) => {
        if (!cancelled) setError(err?.message || "Could not load recent activity.");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleShowAll = async () => {
    setIsLoadingAll(true);
    try {
      const rows = await fetchActivity(ALL_LIMIT);
      setActivity(rows);
      setShowingAll(true);
    } catch (err) {
      setError(err?.message || "Could not load recent activity.");
    } finally {
      setIsLoadingAll(false);
    }
  };

  if (error) return <div className="text-danger small">{error}</div>;
  if (!activity) return <div className="text-muted small">Loading...</div>;
  if (activity.length === 0) return <div className="text-muted small">No activity yet.</div>;

  return (
    <div>
      <ul className="list-unstyled mb-2">
        {activity.map((row) => (
          <li key={row.activityLogId} className="d-flex justify-content-between py-1 border-bottom">
            <span>{row.activityLabel}</span>
            <span className="text-muted small">{formatActivityDate(row.createdDate)}</span>
          </li>
        ))}
      </ul>

      {!showingAll ? (
        <button
          type="button"
          className="btn btn-link btn-sm px-0"
          onClick={handleShowAll}
          disabled={isLoadingAll}
        >
          {isLoadingAll ? "Loading..." : "Show all"}
        </button>
      ) : null}
    </div>
  );
}
