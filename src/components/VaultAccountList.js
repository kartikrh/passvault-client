"use client";

import { useMemo, useState } from "react";
import { Input } from "reactstrap";
import EditAccountForm from "@/components/EditAccountForm";
import RevealAccountModal from "@/components/RevealAccountModal";
import StepUpGateModal from "@/components/StepUpGateModal";
import ConfirmModal from "@/components/ConfirmModal";

// Only name + tags are ever rendered here -- username, password, and
// security questions stay out of the DOM entirely until the eye icon's
// 2FA step-up (RevealAccountModal) succeeds. The decrypted data is still
// sitting in this page's `entries` state either way (see useVault) since
// the whole vault is one client-decrypted blob; this is a display
// restriction, not a smaller server response.
function matchesSearch(entry, search) {
  if (!search) return true;
  const needle = search.toLowerCase();
  const haystacks = [entry.title, ...(entry.tags || [])];
  return haystacks.some((value) => value && value.toLowerCase().includes(needle));
}

function AccountTableRow({ entry, onUpdate, onDelete, popupIntervalSeconds, otpEnabled }) {
  const [isVerifyingEdit, setIsVerifyingEdit] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isRevealing, setIsRevealing] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isVerifyingDelete, setIsVerifyingDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  const handleSave = async (fields) => {
    await onUpdate(entry.id, fields);
    setIsEditing(false);
  };

  const handleEditVerified = () => {
    setIsVerifyingEdit(false);
    setIsEditing(true);
  };

  const handleDeleteConfirmed = () => {
    setIsConfirmingDelete(false);
    setIsVerifyingDelete(true);
  };

  const handleDeleteVerified = async () => {
    setIsVerifyingDelete(false);
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await onDelete(entry.id, entry.type);
    } catch (err) {
      setDeleteError(err?.message || "Could not delete this account. Please try again.");
      setIsDeleting(false);
    }
    // No finally-set-false-on-success: a successful delete removes this
    // row from `entries` entirely, so there's nothing left to un-disable.
  };

  return (
    <>
      <tr>
        <td className="fw-semibold">{entry.title}</td>
        <td>
          {entry.tags?.length ? (
            <div className="d-flex flex-wrap gap-1">
              {entry.tags.map((tag) => (
                <span key={tag} className="badge bg-light text-dark border">
                  {tag}
                </span>
              ))}
            </div>
          ) : (
            <span className="text-muted">—</span>
          )}
        </td>
        <td className="text-end">
          <div className="d-flex justify-content-end gap-2">
            <button
              type="button"
              className="btn btn-light btn-sm border"
              onClick={() => setIsRevealing(true)}
              aria-label="View account details"
            >
              <i className="bx bx-show" />
            </button>
            <button
              type="button"
              className="btn btn-light btn-sm border"
              onClick={() => setIsVerifyingEdit(true)}
              aria-label="Edit account"
            >
              <i className="bx bx-edit" />
            </button>
            <button
              type="button"
              className="btn btn-light btn-sm border text-danger"
              onClick={() => setIsConfirmingDelete(true)}
              disabled={isDeleting}
              aria-label="Delete account"
            >
              <i className="bx bx-trash" />
            </button>
          </div>
        </td>
      </tr>

      {deleteError ? (
        <tr>
          <td colSpan={3} className="text-danger small border-0 pt-0 pb-2">
            {deleteError}
          </td>
        </tr>
      ) : null}

      {isConfirmingDelete ? (
        <ConfirmModal
          title="Delete this account?"
          body={`"${entry.title}" will be permanently removed from your vault. This can't be undone.`}
          confirmLabel="Delete"
          onConfirm={handleDeleteConfirmed}
          onCancel={() => setIsConfirmingDelete(false)}
        />
      ) : null}

      {isVerifyingDelete ? (
        <StepUpGateModal
          description="Enter your authenticator code to delete this account."
          otpEnabled={otpEnabled}
          onVerified={handleDeleteVerified}
          onCancel={() => setIsVerifyingDelete(false)}
        />
      ) : null}

      {isVerifyingEdit ? (
        <StepUpGateModal
          description="Enter your authenticator code to edit this account."
          otpEnabled={otpEnabled}
          onVerified={handleEditVerified}
          onCancel={() => setIsVerifyingEdit(false)}
        />
      ) : null}

      {isEditing ? (
        <EditAccountForm entry={entry} onSave={handleSave} onCancel={() => setIsEditing(false)} />
      ) : null}

      {isRevealing ? (
        <RevealAccountModal
          entry={entry}
          otpEnabled={otpEnabled}
          popupIntervalSeconds={popupIntervalSeconds}
          onClose={() => setIsRevealing(false)}
        />
      ) : null}
    </>
  );
}

export default function VaultAccountList({ entries, onUpdate, onDelete, popupIntervalSeconds, otpEnabled }) {
  const [search, setSearch] = useState("");
  const filtered = useMemo(() => entries.filter((entry) => matchesSearch(entry, search)), [entries, search]);

  if (!entries.length) {
    return <p className="text-muted mb-0">No accounts saved yet -- add your first one above.</p>;
  }

  return (
    <div>
      <Input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Filter by name or tag"
        className="mb-3"
      />

      {filtered.length ? (
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead>
              <tr className="text-muted small">
                <th>Name</th>
                <th>Tags</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((entry) => (
                <AccountTableRow
                  key={entry.id}
                  entry={entry}
                  onUpdate={onUpdate}
                  onDelete={onDelete}
                  popupIntervalSeconds={popupIntervalSeconds}
                  otpEnabled={otpEnabled}
                />
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-muted mb-0">No accounts match your filter.</p>
      )}
    </div>
  );
}
