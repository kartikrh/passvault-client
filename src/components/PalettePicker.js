"use client";

import { useEffect, useState } from "react";
import { PALETTES, applyPalette, readStoredPalette } from "@/lib/palette";

// Three glass palettes (lib/palette.js). Remembered per browser; every
// mounted picker stays in sync through the "passvault:palette" event.
// compact: swatch dots only (header dropdown); otherwise labelled tiles.
export default function PalettePicker({ compact = false }) {
  const [current, setCurrent] = useState(null);

  useEffect(() => {
    // Deferred so the first render matches the server markup.
    Promise.resolve().then(() => setCurrent(readStoredPalette()));
    const onChange = (e) => setCurrent(e.detail);
    window.addEventListener("passvault:palette", onChange);
    return () => window.removeEventListener("passvault:palette", onChange);
  }, []);

  return (
    <div className={`pv-palette-picker ${compact ? "pv-palette-picker--compact" : ""}`} role="radiogroup" aria-label="Colour palette">
      {PALETTES.map((palette) => {
        const selected = current === palette.id;
        return (
          <button
            key={palette.id}
            type="button"
            role="radio"
            aria-checked={selected}
            title={palette.label}
            className={`pv-palette-option ${selected ? "is-selected" : ""}`}
            onClick={() => applyPalette(palette.id)}
          >
            <span
              className="pv-palette-swatch"
              style={{ background: `linear-gradient(135deg, ${palette.swatch.join(", ")})` }}
              aria-hidden="true"
            />
            {compact ? null : (
              <span className="pv-palette-text">
                <span className="fw-semibold">{palette.label}</span>
                <span className="small text-muted d-block">{palette.description}</span>
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
