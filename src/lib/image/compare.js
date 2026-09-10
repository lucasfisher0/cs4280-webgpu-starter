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
  // MSE = avg((original - compressed)**2);
  let MSE = 0;

  for (let i = 0; i < _original.data.length; i++) {
    if ((i + 1) % 4 === 0) continue;

    MSE += (_original.data[i] - _compressed.data[i]) ** 2;
  }

  return (MSE / _original.data.length) * 0.75; // 0.75 represents 3/4 channels, hence 3/4 the bytes
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
  const MSE = meanSquaredError(_original, _compressed);
  return MSE === 0 ? Infinity : 10 * Math.log10(255 ** 2 / MSE);
}
