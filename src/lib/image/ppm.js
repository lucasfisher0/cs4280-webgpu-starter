/**
 * PPM (P6, binary) export — Assignment 1's uncompressed baseline, as a
 * real file rather than just a formula. `encodePPM` throws until you
 * implement it; `downloadBytes` (triggering a browser file download) is
 * given.
 */

/**
 * Encodes `imageData` (RGBA) as a binary PPM (P6): an ASCII header
 * (`P6\n{width} {height}\n255\n`), then one raw RGB byte triple per pixel
 * (alpha dropped), in row-major order.
 *
 * @param {ImageData} imageData
 * @returns {Uint8Array}
 */
export function encodePPM(_imageData) {
  throw new Error("encodePPM: not implemented");
}

/** Triggers a browser download of `bytes` as `filename`. */
export function downloadBytes(bytes, filename) {
  const blob = new Blob([bytes], { type: "application/octet-stream" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
