"use client";

import DOMPurify from "dompurify";
import { Badge } from "reactstrap";

// Matches PassVaultpanel's PackageConst.js intervalType options (1 = DAY,
// 2 = MONTHLY, 3 = YEARLY) -- the only three values an admin can set.
const INTERVAL_LABELS = { 1: "day", 2: "month", 3: "year" };

const formatPrice = (price, currency, intervalType, intervalCount) => {
  const amount = Number(price) || 0;
  const unit = INTERVAL_LABELS[intervalType] || null;
  const perLabel = unit ? `/ ${intervalCount > 1 ? `${intervalCount} ${unit}s` : unit}` : "";
  return `${currency || ""} ${amount.toFixed(2)} ${perLabel}`.trim();
};

// null maxAccounts/maxGroups/maxNotes means unlimited, per tblPackages'
// convention (see PassVaultapi's getClientPackageQuery).
const formatLimit = (value) => (value === null || value === undefined ? "Unlimited" : value);

export default function SubscriptionCard({ pkg, error }) {
  if (error) {
    return <div className="alert alert-danger py-2 px-3 mb-0">{error}</div>;
  }

  if (!pkg) {
    return <div className="text-muted small">No active subscription plan.</div>;
  }

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-2">
        <div>
          <div className="fw-semibold fs-5">{pkg.name}</div>
          {/* PassVaultpanel's Package form authors this as rich text
              (TinyMCE), so it arrives as HTML, not plain text -- render it
              sanitized instead of dumping raw markup as a string. */}
          {pkg.description ? (
            <div
              className="text-muted small subscription-description"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(pkg.description) }}
            />
          ) : null}
        </div>
        <Badge color="primary" className="fs-6">
          {formatPrice(pkg.price, pkg.currency, pkg.intervalType, pkg.intervalCount)}
        </Badge>
      </div>

      <div className="row text-center mt-3">
        <div className="col-4">
          <div className="fw-semibold">{formatLimit(pkg.maxAccounts)}</div>
          <div className="text-muted small">Accounts</div>
        </div>
        <div className="col-4">
          <div className="fw-semibold">{formatLimit(pkg.maxGroups)}</div>
          <div className="text-muted small">Groups</div>
        </div>
        <div className="col-4">
          <div className="fw-semibold">{formatLimit(pkg.maxNotes)}</div>
          <div className="text-muted small">Notes</div>
        </div>
      </div>

      <style jsx>{`
        .subscription-description :global(p) {
          margin: 0;
        }
      `}</style>
    </div>
  );
}
