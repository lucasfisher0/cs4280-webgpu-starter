/**
 * Indexed-color (palette) compression via the median-cut algorithm — part
 * of Assignment 1's deliverable. Pick a small set of colors *tailored to
 * this image's actual color distribution* (unlike `quantize.js`'s uniform
 * posterize), then map every pixel to its nearest palette entry. Every
 * function below throws until you implement it.
 */

/**
 * Builds a `paletteSize`-color palette from `imageData` by recursively
 * splitting the most color-varied "box" of pixels in half (at its median,
 * along its widest channel) until there are enough boxes, then averaging
 * each box into one representative color.
 *
 * @param {ImageData} imageData
 * @param {number} paletteSize
 * @returns {number[][]} array of `[r, g, b]` palette colors
 */
export function medianCutPalette(_imageData, _paletteSize) {
  throw new Error("medianCutPalette: not implemented");
}

/** Index of the palette entry closest to `color` in RGB Euclidean distance. */
export function nearestPaletteIndex(_color, _palette) {
  throw new Error("nearestPaletteIndex: not implemented");
}

/**
 * Maps every pixel of `imageData` to its nearest `palette` color.
 * @returns {{ imageData: ImageData, indices: Uint8Array }}
 */
export function applyPalette(_imageData, _palette) {
  throw new Error("applyPalette: not implemented");
}
