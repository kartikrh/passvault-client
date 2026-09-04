"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardBody, CardHeader, Container } from "reactstrap";
import { useAuthToken } from "@/lib/useAuthToken";
import { useProfile } from "@/lib/useProfile";
import { fetchActivity, formatActivityDate, activityRowsToCsv, downloadCsv } from "@/lib/activity";
import { ActivityType, ENTRY_ACTIVITY_TYPES } from "@/lib/activityConstants";
import { useEntryNameLookup } from "@/lib/useEntryNameLookup";
import DashboardHeader from "@/components/DashboardHeader";

const PAGE_SIZE = 20;
// Export pulls everything in one request rather than paging through --
// same 5000-row ceiling services/vaultActivity.js already caps at.
const EXPORT_PAGE_SIZE = 5000;

// Own page/menu entry (moved out of the Profile screen's "Recent activity"
// card, which only ever showed the first 15-500 rows inline with no real
// paging) -- a proper paginated listing plus a CSV export of the client's
// full activity history.
export default function ActivityPage() {
  const router = useRouter();
  const { token, checked } = useAuthToken();
  const { client, setClient } = useProfile(!!token);
  const namesById = useEntryNameLookup(!!token);

  const [page, setPage] = useState(1);
  const [activity, setActivity] = useState(null);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [error, setError] = useState(null);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    if (checked && !token) {
      router.replace("/login");
    }
  }, [checked, token, router]);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    setError(null);
    fetchActivity({ page, pageSize: PAGE_SIZE })
      .then((result) => {
        if (cancelled) return;
        setActivity(result.activity);
        setTotal(result.total);
        setTotalPages(result.totalPages);
      })
      .catch((err) => {
        if (!cancelled) setError(err?.message || "Could not load recent activity.");
      });
    return () => {
      cancelled = true;
    };
  }, [token, page]);

  const handleExport = async () => {
    setError(null);
    setIsExporting(true);
    try {
      const { activity: allRows } = await fetchActivity({ page: 1, pageSize: EXPORT_PAGE_SIZE });
      downloadCsv(`activity-${new Date().toISOString().slice(0, 10)}.csv`, activityRowsToCsv(allRows, namesById));
    } catch (err) {
      setError(err?.message || "Could not export activity.");
    } finally {
      setIsExporting(false);
    }
  };

  if (!token) return null;

  return (
    <div className="min-vh-100">
      <DashboardHeader client={client} onClientUpdated={setClient} />

      <Container fluid className="py-5 px-4">
        <Card>
          <CardHeader className="d-flex align-items-center justify-content-between flex-wrap gap-2">
            <span className="fw-semibold">Recent activity</span>
            <button
              type="button"
              className="btn btn-outline-primary btn-sm"
              onClick={handleExport}
              disabled={isExporting || !total}
            >
              <i className="bx bx-download me-1" />
              {isExporting ? "Exporting..." : "Export CSV"}
            </button>
          </CardHeader>
          <CardBody>
            {error ? <div className="alert alert-danger py-2 px-3 mb-3">{error}</div> : null}

            {!activity ? (
              <div className="text-muted small">Loading...</div>
            ) : activity.length === 0 ? (
              <div className="text-muted small">No activity yet.</div>
            ) : (
              <>
                <div className="table-responsive">
                  <table className="table table-sm align-middle mb-0">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Activity</th>
                        <th>Details</th>
                        <th>IP address</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activity.map((row) => (
                        <tr key={row.activityLogId}>
                          <td className="text-nowrap">{formatActivityDate(row.createdDate)}</td>
                          <td>{row.activityLabel}</td>
                          <td>
                            {/* refId is a page path for PAGE_VIEWED rows. For
                                account/note rows, entryName is the title as of
                                the time of this row (server-stored -- see
                                sql/vault/012_activity_log_entry_name.sql),
                                preferred over namesById's best-effort *current*
                                lookup (useEntryNameLookup), which can't resolve
                                an entry that's since been renamed or deleted --
                                only older rows recorded before entryName
                                existed fall back to it. */}
                            {row.activityType === ActivityType.PAGE_VIEWED && row.refId ? (
                              <span className="text-muted small">{row.refId}</span>
                            ) : ENTRY_ACTIVITY_TYPES.has(row.activityType) && (row.entryName || namesById[row.refId]) ? (
                              <span className="text-muted small">{row.entryName || namesById[row.refId]}</span>
                            ) : null}
                            {/* Only present on login-completing rows (login,
                                google, register, failed attempt, lockout --
                                see services/vaultAuth.js's
                                requireGeolocation). A plain link, not a
                                button behind a confirm step -- one click
                                opens the map in a new tab straight away. */}
                            {row.latitude != null && row.longitude != null ? (
                              <a
                                href={`https://www.google.com/maps?q=${row.latitude},${row.longitude}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-muted small d-inline-flex align-items-center gap-1 ms-2"
                              >
                                <i className="bx bx-map" />
                                View location
                              </a>
                            ) : null}
                          </td>
                          <td className="text-muted small">{row.ipAddress || "--"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {totalPages > 1 ? (
                  <div className="d-flex align-items-center justify-content-between mt-3">
                    <button
                      type="button"
                      className="btn btn-outline-secondary btn-sm"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                      <i className="bx bx-chevron-left" /> Previous
                    </button>
                    <span className="text-muted small">
                      Page {page} of {totalPages} ({total} total)
                    </span>
                    <button
                      type="button"
                      className="btn btn-outline-secondary btn-sm"
                      disabled={page >= totalPages}
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    >
                      Next <i className="bx bx-chevron-right" />
                    </button>
                  </div>
                ) : null}
              </>
            )}
          </CardBody>
        </Card>
      </Container>
    </div>
  );
}
