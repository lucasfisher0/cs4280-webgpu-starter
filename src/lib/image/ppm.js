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
  let header = "P6\n";
  header += `${_imageData.width} ${_imageData.height}\n`;
  header += "255\n";

  const headerBytes = new TextEncoder().encode(header);
  const pixelCount = _imageData.width * _imageData.height;

  const bytes = new Uint8Array(headerBytes.byteLength + pixelCount * 3);
  bytes.set(headerBytes);
  for (let i = 0; i < pixelCount; i++) {
    const offset = i * 4;
    const pixel = new Uint8Array([
      _imageData.data[offset],
      _imageData.data[offset + 1],
      _imageData.data[offset + 2],
    ]);
    bytes.set(pixel, headerBytes.byteLength + i * 3);
  }

  return bytes;
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
