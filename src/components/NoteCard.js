"use client";

import { useState } from "react";
import { Alert, Input } from "reactstrap";
import NoteColorSwatches, { noteColorSwatch } from "@/components/NoteColorSwatches";
import TagsEditor from "@/components/TagsEditor";

// entry: a decrypted note vault entry (see useVault/vaultData.js).
// onUpdate: async (fields) => void -- partial note fields to merge.
// onDelete: async () => void
export default function NoteCard({ entry, onUpdate, onDelete }) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(entry.title || "");
  const [body, setBody] = useState(entry.body || "");
  const [color, setColor] = useState(entry.color || null);
  const [tags, setTags] = useState(entry.tags || []);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  const startEditing = () => {
    setTitle(entry.title || "");
    setBody(entry.body || "");
    setColor(entry.color || null);
    setTags(entry.tags || []);
    setError(null);
    setIsEditing(true);
  };

  const handleSave = async () => {
    setError(null);
    setIsSaving(true);
    try {
      await onUpdate({ title: title.trim(), body: body.trim(), color, tags });
      setIsEditing(false);
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

  return (
    <div
      className="border rounded p-3 h-100 d-flex flex-column"
      style={{ backgroundColor: noteColorSwatch(entry.color) }}
    >
      {error ? (
        <Alert color="danger" className="py-2 px-3">
          {error}
        </Alert>
      ) : null}

      {isEditing ? (
        <>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            className="border-0 px-0 mb-2 fw-semibold bg-transparent"
            autoFocus
          />
          <Input
            type="textarea"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Note"
            className="border-0 px-0 bg-transparent"
            rows={4}
          />
          <div className="mt-2">
            <TagsEditor value={tags} onChange={setTags} />
          </div>
          <div className="d-flex align-items-center justify-content-between mt-2">
            <NoteColorSwatches value={color} onChange={setColor} />
            <div className="d-flex gap-2">
              <button
                type="button"
                className="btn btn-light btn-sm border"
                onClick={() => setIsEditing(false)}
                disabled={isSaving}
              >
                Cancel
              </button>
              <button type="button" className="btn btn-primary btn-sm" onClick={handleSave} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="flex-grow-1" onClick={startEditing} role="button">
            {entry.title ? <h6 className="fw-semibold mb-2">{entry.title}</h6> : null}
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
        </>
      )}
    </div>
  );
}
