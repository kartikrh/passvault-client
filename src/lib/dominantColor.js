// Samples an image's average color via a small offscreen canvas. Used to
// derive the site's accent color from the current White Label's favicon
// (tblWhitelabel.wrFavicon) so the header can theme itself without an admin
// having to pick a color separately.
//
// The favicon is hosted on the file-upload service (utilities/Images.js'
// storeImageOnServer), a different origin than this app, so the browser
// treats the canvas as "tainted" unless that service sends CORS headers --
// if it doesn't, getImageData throws and we just skip theming (the caller
// falls back to the default brand color), never crash the page over it.
export function getDominantColor(imageUrl) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const SAMPLE_SIZE = 16;
        const canvas = document.createElement("canvas");
        canvas.width = SAMPLE_SIZE;
        canvas.height = SAMPLE_SIZE;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, SAMPLE_SIZE, SAMPLE_SIZE);
        const { data } = ctx.getImageData(0, 0, SAMPLE_SIZE, SAMPLE_SIZE);

        let r = 0;
        let g = 0;
        let b = 0;
        let count = 0;
        for (let i = 0; i < data.length; i += 4) {
          const alpha = data[i + 3];
          // Skip fully/near transparent pixels (favicons are often padded
          // with transparency) so they don't wash the average toward grey.
          if (alpha < 32) continue;
          r += data[i];
          g += data[i + 1];
          b += data[i + 2];
          count += 1;
        }

        if (count === 0) {
          reject(new Error("Favicon has no opaque pixels to sample"));
          return;
        }

        resolve({
          r: Math.round(r / count),
          g: Math.round(g / count),
          b: Math.round(b / count),
        });
      } catch (err) {
        reject(err);
      }
    };
    img.onerror = () => reject(new Error("Failed to load favicon image"));
    img.src = imageUrl;
  });
}

// Perceived brightness (ITU-R BT.601) -- decides whether text drawn over the
// accent color should be light or dark.
export function isLightColor({ r, g, b }) {
  return (r * 299 + g * 587 + b * 114) / 1000 > 150;
}

// Darkens/lightens a color by a fraction (0-1) toward black/white -- used
// for hover shades (mirrors Bootstrap's own shift-color() Sass function,
// just done at runtime instead of build time).
export function shadeColor({ r, g, b }, amount) {
  const clamp = (v) => Math.max(0, Math.min(255, Math.round(v)));
  const towards = amount < 0 ? 0 : 255;
  const pct = Math.abs(amount);
  return {
    r: clamp(r + (towards - r) * pct),
    g: clamp(g + (towards - g) * pct),
    b: clamp(b + (towards - b) * pct),
  };
}

export function toRgbString({ r, g, b }) {
  return `rgb(${r}, ${g}, ${b})`;
}

export function toRgbTriplet({ r, g, b }) {
  return `${r}, ${g}, ${b}`;
}
