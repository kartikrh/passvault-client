"use client";

import { useState } from "react";
import { Alert, Input } from "reactstrap";
import NoteColorSwatches from "@/components/NoteColorSwatches";
import TagsEditor from "@/components/TagsEditor";

// onAdd: async ({ title, body, color, pinned, archived, tags }) => void,
// thrown errors (including PassVaultapi's plan-quota message) are shown
// inline. Collapsed to a single "Take a note..." input until focused, Keep-style.
export default function AddNoteForm({ onAdd }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [color, setColor] = useState(null);
  const [tags, setTags] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  const reset = () => {
    setTitle("");
    setBody("");
    setColor(null);
    setTags([]);
    setError(null);
    setIsExpanded(false);
  };

  const handleSave = async () => {
    if (!title.trim() && !body.trim()) {
      reset();
      return;
    }
    setError(null);
    setIsSaving(true);
    try {
      await onAdd({ title: title.trim(), body: body.trim(), color, pinned: false, archived: false, tags });
      reset();
    } catch (err) {
      setError(err?.message || "Could not save this note. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="border rounded p-3 mb-4" style={{ backgroundColor: color ? undefined : "#fff" }}>
      {error ? (
        <Alert color="danger" className="py-2 px-3">
          {error}
        </Alert>
      ) : null}

      {isExpanded ? (
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          className="border-0 px-0 mb-2 fw-semibold"
          autoFocus
        />
      ) : null}

      <Input
        type="textarea"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        onFocus={() => setIsExpanded(true)}
        placeholder="Take a note..."
        className="border-0 px-0"
        rows={isExpanded ? 3 : 1}
      />

      {isExpanded ? (
        <>
          <div className="mt-2">
            <TagsEditor value={tags} onChange={setTags} />
          </div>

          <div className="d-flex align-items-center justify-content-between mt-2">
            <NoteColorSwatches value={color} onChange={setColor} />
            <div className="d-flex gap-2">
              <button type="button" className="btn btn-light btn-sm border" onClick={reset} disabled={isSaving}>
                Cancel
              </button>
              <button type="button" className="btn btn-primary btn-sm" onClick={handleSave} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save note"}
              </button>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
