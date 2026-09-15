"use client";

import { useState } from "react";
import { Alert, Input, Modal } from "reactstrap";
import NoteColorSwatches, { noteColorSwatch } from "@/components/NoteColorSwatches";
import TagsEditor from "@/components/TagsEditor";

const formatEditedDate = (isoString) =>
  isoString ? new Date(isoString).toLocaleDateString(undefined, { month: "short", day: "numeric" }) : null;

// entry: a decrypted note vault entry (see useVault/vaultData.js).
// onUpdate: async (fields) => void -- partial note fields to merge.
// onDelete: async () => void
export default function NoteCard({ entry, onUpdate, onDelete }) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState(entry.title || "");
  const [body, setBody] = useState(entry.body || "");
  const [color, setColor] = useState(entry.color || null);
  const [tags, setTags] = useState(entry.tags || []);
  const [hidden, setHidden] = useState(entry.hidden || false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  const openNote = () => {
    setTitle(entry.title || "");
    setBody(entry.body || "");
    setColor(entry.color || null);
    setTags(entry.tags || []);
    setHidden(entry.hidden || false);
    setError(null);
    setIsOpen(true);
  };

  const isDirty =
    title.trim() !== (entry.title || "") ||
    body.trim() !== (entry.body || "") ||
    color !== (entry.color || null) ||
    hidden !== (entry.hidden || false) ||
    tags.length !== (entry.tags || []).length ||
    tags.some((tag, i) => tag !== (entry.tags || [])[i]);

  // Keep has no explicit Save -- edits are committed when the note closes
  // (backdrop click, Esc, or the Close button), so `toggle` itself saves.
  const closeAndSave = async () => {
    if (!isDirty) {
      setIsOpen(false);
      return;
    }
    setError(null);
    setIsSaving(true);
    try {
      await onUpdate({ title: title.trim(), body: body.trim(), color, tags, hidden });
      setIsOpen(false);
    } catch (err) {
      setError(err?.message || "Could not save this note. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const togglePinned = async () => {
    try {
      await onUpdate({ pinned: !entry.pinned });
    } catch {
      // Best-effort -- pin state is non-critical, a silent no-op is fine here.
    }
  };

  const toggleArchived = async () => {
    try {
      await onUpdate({ archived: !entry.archived });
    } catch {
      // Best-effort, same as togglePinned.
    }
  };

  const handleDelete = async () => {
    setIsOpen(false);
    await onDelete();
  };

  return (
    <>
      <div
        className="border rounded p-3 h-100 d-flex flex-column"
        style={{ backgroundColor: noteColorSwatch(entry.color) }}
      >
        <div className="flex-grow-1" onClick={openNote} role="button">
          {entry.title ? (
            <h6 className="fw-semibold mb-2">
              {entry.title}
              {entry.hidden ? (
                <span className="badge bg-light text-dark border ms-2 fw-normal">
                  <i className="bx bx-hide me-1" />
                  Hidden
                </span>
              ) : null}
            </h6>
          ) : null}
          <p className="mb-2 small" style={{ whiteSpace: "pre-wrap" }}>
            {entry.body}
          </p>
          {entry.tags?.length ? (
            <div className="d-flex flex-wrap gap-1 mb-2">
              {entry.tags.map((tag) => (
                <span key={tag} className="badge bg-light text-dark border">
                  {tag}
                </span>
              ))}
            </div>
          ) : null}
        </div>

        <div className="d-flex justify-content-end gap-2 mt-2">
          <button
            type="button"
            className={`btn btn-sm border ${entry.pinned ? "btn-primary" : "btn-light"}`}
            onClick={togglePinned}
            aria-label={entry.pinned ? "Unpin note" : "Pin note"}
          >
            <i className="bx bx-pin" />
          </button>
          <button
            type="button"
            className="btn btn-light btn-sm border"
            onClick={toggleArchived}
            aria-label={entry.archived ? "Unarchive note" : "Archive note"}
          >
            <i className="bx bx-archive-in" />
          </button>
          <button type="button" className="btn btn-light btn-sm border" onClick={onDelete} aria-label="Delete note">
            <i className="bx bx-trash" />
          </button>
        </div>
      </div>

      {/* Keep-style note detail: title + pin up top, body in the middle, a
          slim color/archive/delete toolbar along the bottom, Close on the
          right -- no separate Save button, closing is what commits edits. */}
      <Modal
        isOpen={isOpen}
        toggle={closeAndSave}
        centered
        size="lg"
        contentClassName="border-0 shadow-lg overflow-hidden"
      >
        <div style={{ backgroundColor: noteColorSwatch(color) }}>
          <div className="d-flex align-items-start justify-content-between px-4 pt-4">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title"
              className="border-0 px-0 bg-transparent fs-5 fw-semibold"
              autoFocus
            />
            <button
              type="button"
              className={`btn btn-sm border-0 bg-transparent flex-shrink-0 ${entry.pinned ? "text-primary" : "text-muted"}`}
              onClick={togglePinned}
              aria-label={entry.pinned ? "Unpin note" : "Pin note"}
            >
              <i className={`bx ${entry.pinned ? "bxs-pin" : "bx-pin"} fs-5`} />
            </button>
          </div>

          <div className="px-4 pb-2" style={{ maxHeight: "65vh", overflowY: "auto" }}>
            {error ? (
              <Alert color="danger" className="py-2 px-3">
                {error}
              </Alert>
            ) : null}
            <Input
              type="textarea"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Note"
              className="border-0 px-0 bg-transparent"
              rows={10}
            />
            <TagsEditor value={tags} onChange={setTags} />
            {entry.updatedAt || entry.createdAt ? (
              <p className="text-muted small text-end mb-0">Edited {formatEditedDate(entry.updatedAt || entry.createdAt)}</p>
            ) : null}
          </div>

          <div className="d-flex align-items-center justify-content-between border-top px-3 py-2">
            <div className="d-flex align-items-center gap-3">
              <NoteColorSwatches value={color} onChange={setColor} />
              <button
                type="button"
                className={`btn btn-sm border-0 bg-transparent ${hidden ? "text-primary" : "text-muted"}`}
                onClick={() => setHidden((v) => !v)}
                aria-label={hidden ? "Unhide this note" : "Hide this note"}
                title={hidden ? "This note is hidden -- click to unhide" : "Hide this note (requires 2FA to show later)"}
              >
                <i className={`bx ${hidden ? "bx-hide" : "bx-show"} fs-5`} />
              </button>
              <button
                type="button"
                className="btn btn-sm border-0 bg-transparent text-muted"
                onClick={toggleArchived}
                aria-label={entry.archived ? "Unarchive note" : "Archive note"}
              >
                <i className="bx bx-archive-in fs-5" />
              </button>
              <button
                type="button"
                className="btn btn-sm border-0 bg-transparent text-muted"
                onClick={handleDelete}
                aria-label="Delete note"
              >
                <i className="bx bx-trash fs-5" />
              </button>
            </div>
            <button type="button" className="btn btn-sm fw-semibold" onClick={closeAndSave} disabled={isSaving}>
              {isSaving ? "Saving..." : "Close"}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
