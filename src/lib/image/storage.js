/**
 * Storage-size and compression-ratio bookkeeping for Assignment 1. These
 * are simplified, easy-to-explain models (no header overhead, no entropy
 * coding) — the point is to make the *relative* cost of each technique
 * legible, not to reproduce a real codec's exact byte count.
 */

/** Baseline: one byte per channel, no alpha, no compression at all. */
export function rawStorageBytes(width, height) {
  return width * height * 3;
}

/** Bits needed to index a palette of `paletteSize` colors (at least 1). */
export function bitsForPaletteSize(paletteSize) {
  return Math.max(1, Math.ceil(Math.log2(Math.max(2, paletteSize))));
}

/** Indexed-color storage: a small RGB palette plus one index per pixel. */
export function paletteStorageBytes(width, height, paletteSize) {
  const indexBits = bitsForPaletteSize(paletteSize);
  const indexBytes = Math.ceil((width * height * indexBits) / 8);
  const paletteBytes = paletteSize * 3;
  return indexBytes + paletteBytes;
}

/** Uniform quantization storage: `levelsPerChannel` levels, still one value per channel per pixel. */
export function quantizedStorageBytes(width, height, levelsPerChannel) {
  const bitsPerChannel = Math.max(1, Math.ceil(Math.log2(Math.max(2, levelsPerChannel))));
  return Math.ceil((width * height * 3 * bitsPerChannel) / 8);
}

/** Block-average storage: one RGB triple per block instead of per pixel. */
export function blockStorageBytes(width, height, blockSize) {
  const blocksX = Math.ceil(width / blockSize);
  const blocksY = Math.ceil(height / blockSize);
  return blocksX * blocksY * 3;
}

export function compressionRatio(originalBytes, compressedBytes) {
  return compressedBytes > 0 ? originalBytes / compressedBytes : Number.POSITIVE_INFINITY;
}

export function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
