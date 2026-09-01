"use client";

import { useEffect, useState } from "react";
import { fetchActivity, formatActivityDate } from "@/lib/activity";
import { ActivityType, ENTRY_ACTIVITY_TYPES } from "@/lib/activityConstants";
import { useEntryNameLookup } from "@/lib/useEntryNameLookup";

const INITIAL_LIMIT = 15;
const ALL_LIMIT = 500;
// "Show all" can bring back up to ALL_LIMIT rows -- capped to a fixed,
// scrollable height so a long history doesn't push the rest of the Profile
// page down indefinitely.
const SHOW_ALL_MAX_HEIGHT = 480;

// Top 15 by default (already sorted newest-first server-side -- see
// listClientActivityLogsQuery's ORDER BY), "Show all" re-fetches with a
// much higher limit rather than paging, since a client's own activity list
// is small enough that a second round trip is simpler than pagination UI.
export default function RecentActivity() {
  const [activity, setActivity] = useState(null);
  const [error, setError] = useState(null);
  const [showingAll, setShowingAll] = useState(false);
  const [isLoadingAll, setIsLoadingAll] = useState(false);
  const namesById = useEntryNameLookup(true);

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
      <ul
        className="list-unstyled mb-2"
        style={showingAll ? { maxHeight: SHOW_ALL_MAX_HEIGHT, overflowY: "auto" } : undefined}
      >
        {activity.map((row) => (
          <li key={row.activityLogId} className="d-flex justify-content-between align-items-start py-1 border-bottom">
            <div>
              <div>{row.activityLabel}</div>
              {/* refId is a page path for PAGE_VIEWED rows, and a vault
                  entry id (resolved to its title, when we have one loaded --
                  see useEntryNameLookup) for account/note rows. Anything
                  else's refId isn't meaningful to a person, so it stays
                  out of the label. A deleted entry's row just won't
                  resolve a name -- there's nowhere left to look it up.
                  Shown on its own line below the label rather than inline
                  -- easier to scan down a list of names this way. */}
              {row.activityType === ActivityType.PAGE_VIEWED && row.refId ? (
                <div className="text-muted small">{row.refId}</div>
              ) : ENTRY_ACTIVITY_TYPES.has(row.activityType) && namesById[row.refId] ? (
                <div className="text-muted small">{namesById[row.refId]}</div>
              ) : null}
              {/* Only present on login-completing rows (login, google,
                  register, failed attempt, lockout -- see
                  services/vaultAuth.js's requireGeolocation). A plain link,
                  not a button behind a confirm step -- one click opens the
                  map in a new tab straight away, so a client can tell at a
                  glance whether a login was really them. */}
              {row.latitude != null && row.longitude != null ? (
                <a
                  href={`https://www.google.com/maps?q=${row.latitude},${row.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted small d-inline-flex align-items-center gap-1"
                >
                  <i className="bx bx-map" />
                  View location
                </a>
              ) : null}
            </div>
            <span className="text-muted small flex-shrink-0 ms-3">{formatActivityDate(row.createdDate)}</span>
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
