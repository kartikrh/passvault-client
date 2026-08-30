"use client";

import { useMemo, useState } from "react";
import { Input } from "reactstrap";
import EditAccountForm from "@/components/EditAccountForm";

const COLUMN_COUNT = 5;

function matchesSearch(entry, search) {
  if (!search) return true;
  const needle = search.toLowerCase();
  const haystacks = [entry.title, entry.username, ...(entry.tags || [])];
  return haystacks.some((value) => value && value.toLowerCase().includes(needle));
}

function SecurityQuestionItem({ question, answer }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="d-flex align-items-center justify-content-between gap-2 py-1">
      <div className="text-truncate small">
        <span className="text-muted">{question}</span>
      </div>
      <div className="d-flex align-items-center gap-2 flex-shrink-0">
        <code className="small">{visible ? answer : "••••••••"}</code>
        <button
          type="button"
          className="btn btn-light btn-sm border"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide answer" : "Show answer"}
        >
          <i className={`bx ${visible ? "bx-hide" : "bx-show"}`} />
        </button>
      </div>
    </div>
  );
}

function AccountTableRow({ entry, onUpdate }) {
  const [visible, setVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showQuestions, setShowQuestions] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const hasQuestions = entry.securityQuestions?.length > 0;

  const copyPassword = async () => {
    try {
      await navigator.clipboard.writeText(entry.password);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard API unavailable (e.g. insecure context) -- nothing to recover from.
    }
  };

  const handleSave = async (fields) => {
    await onUpdate(entry.id, fields);
    setIsEditing(false);
  };

  return (
    <>
      <tr>
        <td className="fw-semibold">{entry.title}</td>
        <td className="text-muted">{entry.username || "—"}</td>
        <td>
          <div className="d-flex align-items-center gap-2">
            <code className="small text-truncate" style={{ maxWidth: 140, display: "inline-block" }}>
              {visible ? entry.password : "••••••••"}
            </code>
            <button
              type="button"
              className="btn btn-light btn-sm border"
              onClick={() => setVisible((v) => !v)}
              aria-label={visible ? "Hide password" : "Show password"}
            >
              <i className={`bx ${visible ? "bx-hide" : "bx-show"}`} />
            </button>
            <button
              type="button"
              className="btn btn-light btn-sm border"
              onClick={copyPassword}
              aria-label="Copy password"
            >
              {copied ? <i className="bx bx-check text-success" /> : <i className="bx bx-copy" />}
            </button>
          </div>
        </td>
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
              onClick={() => setIsEditing(true)}
              aria-label="Edit account"
            >
              <i className="bx bx-edit" />
            </button>
            {hasQuestions ? (
              <button
                type="button"
                className="btn btn-light btn-sm border"
                onClick={() => setShowQuestions((v) => !v)}
                aria-label={showQuestions ? "Hide security questions" : "Show security questions"}
              >
                <i className={`bx ${showQuestions ? "bx-chevron-up" : "bx-chevron-down"}`} />
              </button>
            ) : null}
          </div>
        </td>
      </tr>

      {hasQuestions && showQuestions ? (
        <tr>
          <td colSpan={COLUMN_COUNT} className="bg-light">
            {entry.securityQuestions.map((q, index) => (
              <SecurityQuestionItem key={index} question={q.question} answer={q.answer} />
            ))}
          </td>
        </tr>
      ) : null}

      {isEditing ? (
        <EditAccountForm entry={entry} onSave={handleSave} onCancel={() => setIsEditing(false)} />
      ) : null}
    </>
  );
}

export default function VaultAccountList({ entries, onUpdate }) {
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
        placeholder="Filter by name, username, or tag"
        className="mb-3"
      />

      {filtered.length ? (
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead>
              <tr className="text-muted small">
                <th>Name</th>
                <th>Username</th>
                <th>Password</th>
                <th>Tags</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((entry) => (
                <AccountTableRow key={entry.id} entry={entry} onUpdate={onUpdate} />
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
