"use client";

// A single pulsing placeholder bar, built on Bootstrap 5.3's own
// .placeholder utility class -- composed into full loading-state layouts
// by AccountListSkeleton/NotesGridSkeleton/ProfileSkeleton/HomeSkeleton/
// CmsPageSkeleton. Wrap a group of these in a `placeholder-glow` container
// (Bootstrap's own class) for the pulse animation.
//
// display defaults to "block" (not "inline-block") so consecutive Skeletons
// always stack one per line regardless of their widths -- callers relying
// on wrap-by-overflow would otherwise silently break the moment two narrow
// widths (e.g. a small icon circle next to a text bar) happen to fit on the
// same row. It's set via the style prop (not a className) specifically so a
// caller can still override it with their own style prop if an inline
// layout is ever genuinely wanted -- a plain class couldn't win against
// this inline style.
export default function Skeleton({ width = "100%", height = 14, className = "", style = {} }) {
  return (
    <span
      className={`placeholder ${className}`}
      style={{ width, height, display: "block", borderRadius: 4, ...style }}
    />
  );
}
