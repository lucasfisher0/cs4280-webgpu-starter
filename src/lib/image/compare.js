/**
 * Image-quality metrics — Assignment 1's deliverable, alongside the
 * storage-cost formulas in storage.js. Unlike those formulas (which only
 * depend on image size and a technique's parameter), these measure actual
 * per-pixel error, so they're sensitive to image content. Every function
 * below throws until you implement it.
 */

/**
 * Mean squared error across R/G/B (alpha ignored) between two same-size
 * `ImageData` objects.
 *
 * @param {ImageData} original
 * @param {ImageData} compressed
 * @returns {number}
 */
export function meanSquaredError(_original, _compressed) {
  throw new Error("meanSquaredError: not implemented");
}

/**
 * Peak signal-to-noise ratio, in decibels: `10 * log10(255^2 / MSE)`.
 * Higher is better (closer to the original); returns `Infinity` when
 * `meanSquaredError` is `0` (pixel-identical).
 *
 * @param {ImageData} original
 * @param {ImageData} compressed
 * @returns {number}
 */
export function psnr(_original, _compressed) {
  throw new Error("psnr: not implemented");
}
