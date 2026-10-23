"use client";

import { useId } from "react";

// Faceted crystal emblem: a hexagonal gem split into light/shade facets and
// filled with the active palette's holographic gradient (--pv-holo-*), with
// an optional Boxicons glyph on top. Purely decorative.
export default function CrystalIcon({ icon, size = 56, className = "" }) {
  const id = useId().replace(/:/g, "");
  const holo = `pv-holo-${id}`;
  const shine = `pv-shine-${id}`;

  return (
    <span
      className={`pv-crystal ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 64 64" width={size} height={size}>
        <defs>
          <linearGradient id={holo} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" style={{ stopColor: "var(--pv-holo-1)" }} />
            <stop offset="35%" style={{ stopColor: "var(--pv-crystal-mid, var(--pv-holo-2))" }} />
            <stop offset="70%" style={{ stopColor: "var(--pv-crystal-deep, var(--pv-holo-3))" }} />
            <stop offset="100%" style={{ stopColor: "var(--pv-holo-3)" }} />
          </linearGradient>
          <linearGradient id={shine} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Gem outline */}
        <polygon points="32,2 58,17 58,47 32,62 6,47 6,17" fill={`url(#${holo})`} />
        {/* Facets: top light, sides mid, bottom shade */}
        <polygon points="32,2 58,17 32,24 6,17" fill="#ffffff" opacity="0.38" />
        <polygon points="6,17 32,24 32,62 6,47" fill="#ffffff" opacity="0.12" />
        <polygon points="58,17 58,47 32,62 32,24" fill="#000000" opacity="0.14" />
        <polygon points="18,10 32,2 40,7 24,14" fill={`url(#${shine})`} />
        {/* Edges */}
        <polygon
          points="32,2 58,17 58,47 32,62 6,47 6,17"
          fill="none"
          stroke="#ffffff"
          strokeOpacity="0.55"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
        <polyline points="6,17 32,24 58,17" fill="none" stroke="#ffffff" strokeOpacity="0.45" strokeWidth="1" />
        <line x1="32" y1="24" x2="32" y2="62" stroke="#ffffff" strokeOpacity="0.3" strokeWidth="1" />
      </svg>
      {icon ? <i className={`bx ${icon} pv-crystal-glyph`} style={{ fontSize: size * 0.4 }} /> : null}
    </span>
  );
}
