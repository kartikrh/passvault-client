"use client";

// Plain in-page anchor links -- no scroll-tracking/active-highlighting,
// just lets the user jump straight to a section instead of scrolling the
// long Profile page manually. Sticky so it stays visible while the right
// column scrolls past it.
export default function ProfileSectionNav({ sections }) {
  return (
    <nav className="list-group" style={{ position: "sticky", top: 20 }}>
      {sections.map(({ id, label }) => (
        <a key={id} href={`#${id}`} className="list-group-item list-group-item-action">
          {label}
        </a>
      ))}
    </nav>
  );
}
