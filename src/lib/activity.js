import axiosInstance from "./api";
import { ActivityType, ENTRY_ACTIVITY_TYPES } from "./activityConstants";

// PassVaultapi returns createdDate as a UTC ISO timestamp either way (see
// services/vaultActivity.js) -- formatting it in the viewer's local
// timezone happens entirely client-side, in formatActivityDate below.
// Paginated -- see the dedicated /activity page (also used there with a
// large pageSize for the Export CSV button, since it's the same endpoint).
export const fetchActivity = async ({ page = 1, pageSize } = {}) => {
  const { result } = await axiosInstance.get("/vault/auth/activity", { params: { page, pageSize } });
  return {
    activity: result?.activity || [],
    page: result?.page || page,
    pageSize: result?.pageSize || pageSize,
    total: result?.total || 0,
    totalPages: result?.totalPages || 0,
  };
};

// Fire-and-forget page-view report (see usePageViewLogging) -- there's no
// server-side action to log this against the way account/note edits ride
// along on putVaultDataService, since navigating between pages is a
// client-only event.
export const logPageView = async (page) => {
  await axiosInstance.post("/vault/auth/activity/pageView", { page });
};

export const formatActivityDate = (isoString) =>
  new Date(isoString).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });

const csvEscape = (value) => {
  const str = value === null || value === undefined ? "" : String(value);
  // Quote (and double up embedded quotes) only when the value actually
  // needs it -- keeps the common case (plain dates/labels) readable as raw
  // CSV, per RFC 4180.
  return /[",\r\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
};

// namesById: same entryId -> title map the on-screen list already resolves
// via useEntryNameLookup, passed in so an exported row shows "Gmail"
// instead of a bare vault entry id, matching what's on screen.
export const activityRowsToCsv = (rows, namesById = {}) => {
  const header = ["Date", "Activity", "Details", "IP address", "Location"];
  const lines = [header.map(csvEscape).join(",")];
  rows.forEach((row) => {
    const details =
      row.activityType === ActivityType.PAGE_VIEWED
        ? row.refId || ""
        : ENTRY_ACTIVITY_TYPES.has(row.activityType)
          ? // entryName is the title as of the time of this row (server-stored,
            // see sql/vault/012_activity_log_entry_name.sql) -- preferred over
            // namesById, which only reflects the entry's *current* title and
            // can't resolve one that's since been renamed or deleted.
            row.entryName || namesById[row.refId] || ""
          : "";
    const location = row.latitude != null && row.longitude != null ? `${row.latitude}, ${row.longitude}` : "";
    lines.push(
      [formatActivityDate(row.createdDate), row.activityLabel, details, row.ipAddress || "", location]
        .map(csvEscape)
        .join(",")
    );
  });
  return lines.join("\r\n");
};

// Plain client-side download -- no server round trip beyond the data fetch
// itself, no extra dependency (Blob + a throwaway <a download> is all this
// needs).
export const downloadCsv = (filename, csvText) => {
  const blob = new Blob([csvText], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
