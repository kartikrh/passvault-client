"use client";

// Shared Keep-style color palette, used by both AddNoteForm and NoteCard's
// edit mode. `null` is the default/no-color option.
export const NOTE_COLORS = [
  { value: null, label: "Default", swatch: "#ffffff" },
  { value: "red", label: "Red", swatch: "#f6cbcb" },
  { value: "orange", label: "Orange", swatch: "#f7dcae" },
  { value: "yellow", label: "Yellow", swatch: "#f9edb0" },
  { value: "green", label: "Green", swatch: "#c9e8c9" },
  { value: "teal", label: "Teal", swatch: "#b6dede" },
  { value: "blue", label: "Blue", swatch: "#bcd6f2" },
  { value: "purple", label: "Purple", swatch: "#d5c9ec" },
  { value: "pink", label: "Pink", swatch: "#f3cfe3" },
  { value: "gray", label: "Gray", swatch: "#e0e0e0" },
];

// Picker swatch colour (opaque) for the colour dots.
export function noteSwatchHex(color) {
  return NOTE_COLORS.find((c) => c.value === color)?.swatch || NOTE_COLORS[0].swatch;
}

// Note background: a translucent tint over the glass card (undefined for the
// default colour, so the glass itself shows).
export function noteColorSwatch(color) {
  if (!color) return undefined;
  return `color-mix(in srgb, ${noteSwatchHex(color)} 45%, transparent)`;
}

// value: string|null, onChange: (next) => void
export default function NoteColorSwatches({ value, onChange }) {
  return (
    <div className="d-flex flex-wrap gap-2">
      {NOTE_COLORS.map((color) => (
        <button
          key={color.label}
          type="button"
          onClick={() => onChange(color.value)}
          aria-label={color.label}
          title={color.label}
          className="rounded-circle border p-0"
          style={{
            width: 24,
            height: 24,
            backgroundColor: color.swatch,
            outline: value === color.value ? "2px solid #6c757d" : "none",
            outlineOffset: 2,
          }}
        />
      ))}
    </div>
  );
}
