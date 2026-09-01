"use client";

import { useMemo, useState } from "react";
import { Input } from "reactstrap";
import AddNoteForm from "@/components/AddNoteForm";
import NoteCard from "@/components/NoteCard";

function matchesSearch(entry, search) {
  if (!search) return true;
  const needle = search.toLowerCase();
  const haystacks = [entry.title, entry.body, ...(entry.tags || [])];
  return haystacks.some((value) => value && value.toLowerCase().includes(needle));
}

const GRID_STYLE = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
  gap: "1rem",
};

// entries: note vault entries only (pre-filtered by the caller, see
// useVault's `notes`). onAdd/onUpdate/onDelete mirror useVault's
// addNote/updateNote/deleteEntry.
export default function NotesGrid({ entries, onAdd, onUpdate, onDelete }) {
  const [search, setSearch] = useState("");
  const [showArchived, setShowArchived] = useState(false);

  const filtered = useMemo(() => entries.filter((entry) => matchesSearch(entry, search)), [entries, search]);
  const active = useMemo(() => filtered.filter((entry) => !entry.archived), [filtered]);
  const archived = useMemo(() => filtered.filter((entry) => entry.archived), [filtered]);
  const pinned = useMemo(() => active.filter((entry) => entry.pinned), [active]);
  const others = useMemo(() => active.filter((entry) => !entry.pinned), [active]);

  return (
    <div>
      <AddNoteForm onAdd={onAdd} />

      <Input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search notes"
        className="mb-4"
      />

      {!entries.length ? <p className="text-muted mb-0">No notes yet -- add your first one above.</p> : null}

      {entries.length && !filtered.length ? <p className="text-muted mb-0">No notes match your search.</p> : null}

      {pinned.length ? (
        <div className="mb-4">
          <h6 className="text-muted small text-uppercase mb-2">Pinned</h6>
          <div style={GRID_STYLE}>
            {pinned.map((entry) => (
              <NoteCard
                key={entry.id}
                entry={entry}
                onUpdate={(fields) => onUpdate(entry.id, fields)}
                onDelete={() => onDelete(entry.id, entry.type)}
              />
            ))}
          </div>
        </div>
      ) : null}

      {others.length ? (
        <div className="mb-4">
          {pinned.length ? <h6 className="text-muted small text-uppercase mb-2">Others</h6> : null}
          <div style={GRID_STYLE}>
            {others.map((entry) => (
              <NoteCard
                key={entry.id}
                entry={entry}
                onUpdate={(fields) => onUpdate(entry.id, fields)}
                onDelete={() => onDelete(entry.id, entry.type)}
              />
            ))}
          </div>
        </div>
      ) : null}

      {archived.length ? (
        <div>
          <button
            type="button"
            className="btn btn-light btn-sm border mb-2"
            onClick={() => setShowArchived((v) => !v)}
          >
            {showArchived ? "Hide" : "Show"} archived ({archived.length})
          </button>
          {showArchived ? (
            <div style={GRID_STYLE}>
              {archived.map((entry) => (
                <NoteCard
                  key={entry.id}
                  entry={entry}
                  onUpdate={(fields) => onUpdate(entry.id, fields)}
                  onDelete={() => onDelete(entry.id, entry.type)}
                />
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
