// Glass/prism colour palettes. Plain module (no "use client") so the server
// layout can build its pre-paint script from these constants, while the
// client-side PalettePicker uses the same list and helpers.
//
// A palette is just two attributes on <html>:
//  - data-palette  -> picks the --pv-* tokens in assets/scss/glass-theme.scss
//  - data-bs-theme -> Bootstrap's own light/dark colour mode for text,
//                     borders and form controls underneath the glass
export const PALETTES = [
  {
    id: "amethyst",
    label: "Amethyst",
    description: "Deep violet glass",
    mode: "dark",
    themeColor: "#1a0b2e",
    swatch: ["#2d1b4e", "#8b5cf6", "#e879f9"],
  },
  {
    id: "rose",
    label: "Rose Quartz",
    description: "Rose pink with emerald",
    mode: "light",
    themeColor: "#fbe4ec",
    swatch: ["#fbcfe8", "#f472b6", "#059669"],
  },
  {
    id: "frost",
    label: "Frost",
    description: "Monochrome frosted glass",
    mode: "light",
    themeColor: "#e8edf3",
    swatch: ["#f8fafc", "#94a3b8", "#334155"],
  },
];

export const DEFAULT_PALETTE = "amethyst";
export const PALETTE_STORAGE_KEY = "passvault.palette";

const byId = (id) => PALETTES.find((p) => p.id === id) || PALETTES.find((p) => p.id === DEFAULT_PALETTE);

export const getPalette = (id) => byId(id);

// Inline <script> run before first paint (see app/layout.js) -- applies the
// remembered palette so a reload never flashes the default one.
export const PALETTE_PRELOAD_SCRIPT = `
(function () {
  try {
    var palettes = ${JSON.stringify(Object.fromEntries(PALETTES.map((p) => [p.id, p.mode])))};
    var id = localStorage.getItem(${JSON.stringify(PALETTE_STORAGE_KEY)});
    if (!palettes[id]) return;
    document.documentElement.setAttribute("data-palette", id);
    document.documentElement.setAttribute("data-bs-theme", palettes[id]);
  } catch (e) {}
})();
`;

export const readStoredPalette = () => {
  try {
    const id = localStorage.getItem(PALETTE_STORAGE_KEY);
    return PALETTES.some((p) => p.id === id) ? id : DEFAULT_PALETTE;
  } catch {
    return DEFAULT_PALETTE;
  }
};

export const applyPalette = (id) => {
  const palette = byId(id);
  const root = document.documentElement;
  root.setAttribute("data-palette", palette.id);
  root.setAttribute("data-bs-theme", palette.mode);
  let meta = document.querySelector("meta[name='theme-color']");
  if (!meta) {
    meta = document.createElement("meta");
    meta.name = "theme-color";
    document.head.appendChild(meta);
  }
  meta.content = palette.themeColor;
  try {
    localStorage.setItem(PALETTE_STORAGE_KEY, palette.id);
  } catch {
    // Storage disabled -- the choice just won't survive a reload.
  }
  window.dispatchEvent(new CustomEvent("passvault:palette", { detail: palette.id }));
};
