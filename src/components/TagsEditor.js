"use client";

import { useState } from "react";
import { Badge, FormGroup, Input, Label } from "reactstrap";

// value: string[], onChange: (next) => void -- controlled multi-tag chip
// input, shared by AddAccountForm and EditAccountForm. Enter or "," commits
// the current text as a new tag; duplicates (case-insensitive) are ignored.
export default function TagsEditor({ value, onChange }) {
  const [draft, setDraft] = useState("");

  const commitDraft = () => {
    const tag = draft.trim();
    if (!tag) return;
    if (!value.some((existing) => existing.toLowerCase() === tag.toLowerCase())) {
      onChange([...value, tag]);
    }
    setDraft("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      commitDraft();
    }
  };

  const removeTag = (tag) => onChange(value.filter((t) => t !== tag));

  return (
    <FormGroup className="mb-2">
      <Label className="form-label">Tags (optional)</Label>

      {value.length ? (
        <div className="d-flex flex-wrap gap-2 mb-2">
          {value.map((tag) => (
            <Badge key={tag} color="light" className="text-dark border d-inline-flex align-items-center gap-1 py-1 px-2">
              {tag}
              <button
                type="button"
                className="btn-close"
                style={{ fontSize: 8 }}
                onClick={() => removeTag(tag)}
                aria-label={`Remove tag ${tag}`}
              />
            </Badge>
          ))}
        </div>
      ) : null}

      <div className="d-flex gap-2">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add a tag and press Enter"
        />
        <button type="button" className="btn btn-light btn-sm border flex-shrink-0" onClick={commitDraft}>
          Add
        </button>
      </div>
    </FormGroup>
  );
}
