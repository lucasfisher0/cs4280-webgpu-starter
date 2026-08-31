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

  if (_blockSize === 0)
    return _imageData;

  // JPEG uses 8x8 blocks, edges by default are padded by extending edges
  // const numBlocks = Math.ceil(_imageData.width / _blockSize);

  // Calculate block position (X, Y)
  // Sum using line by line,
  let blockSums = []

  for (let y = 0; y < _imageData.height; y++) {

  }

  /*
  let startPos = {
    x: (numBlocks % 2 !== 0) ? Math.ceil(_blockSize/2) : 0,
    y: (numBlocks % 2 !== 0) ? -Math.ceil(_blockSize/2) : 0
  };

  for (let i = 0; i < numBlocks**2; i++) {
    let targetPos = {
      x: startPos.x + i % numBlocks,
      y: startPos.y + Math.floor(i / numBlocks)
    }

    const colorSum = [0, 0, 0, 0] // RGBA
    for(let ix = 0; ix < _blockSize**2; i++) {
      const index = ((targetPos.x + ix) + (targetPos.y + ix % _blockSize) * _imageData.width) * 4;
      colorSum[0] += _imageData[index]
      colorSum[1] += _imageData[index+1]
      colorSum[2] += _imageData[index+2]
      colorSum[3] += _imageData[index+3]
    }

    for(let ix = 0; ix < _blockSize**2; i++) {
      const index = ((targetPos.x + ix) + (targetPos.y + ix % _blockSize) * _imageData.width) * 4;
      _imageData[index] = colorSum[0]
      _imageData[index+1] = colorSum[1]
      _imageData[index+2] = colorSum[2]
      _imageData[index+3] = colorSum[3]
    }
  }*/











  return _imageData;
}
