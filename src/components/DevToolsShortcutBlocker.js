"use client";

import { useEffect } from "react";

// Best-effort deterrent only -- see the caveat where this is mounted
// (layout.js). Blocks F12 and the common "open DevTools to a specific
// panel" combos: Ctrl/Cmd+Shift+I (Elements/Inspect), +J (Console), +C
// (pick an element); Cmd+Option+I/J/C covers Mac browsers that use Option
// instead of Shift for the same shortcuts. Does not, and cannot, block
// DevTools opened from the browser's own menu, a remapped shortcut, or a
// detached window.
const isBlockedCombo = (e) => {
  const key = e.key?.toLowerCase();
  if (key === "f12") return true;
  const modifierCombo = (e.ctrlKey || e.metaKey) && (e.shiftKey || e.altKey);
  return modifierCombo && ["i", "j", "c"].includes(key);
};

export default function DevToolsShortcutBlocker() {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isBlockedCombo(e)) e.preventDefault();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return null;
}
