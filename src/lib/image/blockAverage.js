/**
 * Block-based lossy compression — part of Assignment 1's deliverable. Split
 * the image into `blockSize x blockSize` blocks and replace every pixel in
 * a block with that block's average color — conceptually the same idea as
 * JPEG's DCT blocks, just without the frequency transform, so the
 * blockiness stays fully visible. Throws until you implement it.
 *
 * @param {ImageData} _imageData
 * @param {number} _blockSize edge length of each square block, in pixels
 * @returns {ImageData}
 */
export function averageBlocks(_imageData, _blockSize) {

  if (_blockSize <= 1)
    return _imageData;

  let blocks_vertical = Math.ceil(_imageData.height / _blockSize);
  let blocks_horizontal = Math.ceil(_imageData.width / _blockSize);
  let pixels = new Uint8ClampedArray(_imageData.data);

  for (let by = 0; by < blocks_vertical; by++) {
    for (let bx = 0; bx < blocks_horizontal; bx++) {

      // Iterate block lines
      let R = 0, G = 0, B = 0;
      let blockOffset = (by * _blockSize * _imageData.width * 4) + (bx * _blockSize * 4);
      for (let cy = 0; cy < _blockSize; cy++) {
        let offset = blockOffset + (cy * _imageData.width * 4);
        if (offset >= _imageData.data.length)
          break;

        for (let cx = 0; cx < _blockSize; cx++) {
          if (offset + (cx * 4) % (_imageData.width * 4) === 0)
            continue;

          R += pixels[offset + (cx * 4)];
          G += pixels[offset + (cx * 4) + 1];
          B += pixels[offset + (cx * 4) + 2];
        }
      }

      R /= _blockSize * _blockSize;
      G /= _blockSize * _blockSize;
      B /= _blockSize * _blockSize;

      // Apply average color
      for (let cy = 0; cy < _blockSize; cy++) {
        let offset = blockOffset + (cy * _imageData.width * 4);
        if (offset >= _imageData.data.length)
          break;

        for (let cx = 0; cx < _blockSize; cx++) {
          if (offset + (cx * 4) % (_imageData.width * 4) === 0)
            continue;

          pixels[offset + (cx * 4)] = R;
          pixels[offset + (cx * 4) + 1] = G;
          pixels[offset + (cx * 4) + 2] = B;
        }
      }
    }
  }

  return new ImageData(pixels, _imageData.width, _imageData.height);
}
