/**
 * Block-based lossy compression — part of Assignment 1's deliverable. Split
 * the image into `blockSize x blockSize` blocks and replace every pixel in
 * a block with that block's average color — conceptually the same idea as
 * JPEG's DCT blocks, just without the frequency transform, so the
 * blockiness stays fully visible. Throws until you implement it.
 *
 * @param {ImageData} imageData
 * @param {number} blockSize edge length of each square block, in pixels
 * @returns {ImageData}
 */
export function averageBlocks(_imageData, _blockSize) {
  throw new Error("averageBlocks: not implemented");
}
