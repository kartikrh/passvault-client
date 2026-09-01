"use client";

import Skeleton from "@/components/Skeleton";

const CARD_COUNT = 6;

const GRID_STYLE = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
  gap: "1rem",
};

// Shown in place of NotesGrid while useVault's initial GET /vault/data +
// decrypt is in flight -- same composer/search/card-grid shape as the real
// thing (see NotesGrid.js) so the layout doesn't jump once real notes
// replace it.
export default function NotesGridSkeleton() {
  return (
    <div className="placeholder-glow">
      <Skeleton height={90} className="mb-4 border rounded" />
      <Skeleton height={38} className="mb-4" />

      <div style={GRID_STYLE}>
        {Array.from({ length: CARD_COUNT }).map((_, index) => (
          <div key={index} className="border rounded p-3">
            <Skeleton width="70%" height={18} className="mb-2" />
            <Skeleton height={14} className="mb-1" />
            <Skeleton width="90%" height={14} />
          </div>
        ))}
      </div>
    </div>
  );
}
