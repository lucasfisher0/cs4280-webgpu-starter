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
  return medianCutRGB(getImagePixels(_imageData), _paletteSize);
}

function getImagePixels(_imageData) {
  const pixels = [];
  for (let i = 0; i < _imageData.data.length / 4; i++) {
    const R = _imageData.data[i * 4];
    const G = _imageData.data[i * 4 + 1];
    const B = _imageData.data[i * 4 + 2];
    pixels.push([R, G, B]);
  }

  return pixels;
}

/**
 * Builds a `paletteSize`-color palette of an RGB `pixels` array by recursively
 * splitting the most color-varied "box" of pixels in half (at its median,
 * along its widest channel) until there are enough boxes, then averaging
 * each box into one representative color.
 * @param pixels
 * @param _paletteSize
 * @returns {number[][]} array of `[r, g, b]` palette colors, or a single
 */
function medianCutRGB(pixels, _paletteSize) {
  // Return average color of single boxes, simple sum and divide
  if (_paletteSize === 1 || pixels.length === 1) {
    let R = 0;
    let G = 0;
    let B = 0;
    for (let i = 0; i < pixels.length; i++) {
      R += pixels[i][0];
      G += pixels[i][1];
      B += pixels[i][2];
    }

    R = Math.trunc(R / pixels.length);
    G = Math.trunc(G / pixels.length);
    B = Math.trunc(B / pixels.length);

    return [[R, G, B]];
  }

  const channel = selectWidestChannel(pixels);
  pixels.sort((a, b) => a[channel] - b[channel]);
  const median = Math.trunc(pixels.length / 2);

  return [
    ...medianCutRGB(pixels.slice(0, median), _paletteSize / 2),
    ...medianCutRGB(pixels.slice(median), _paletteSize / 2),
  ];
}

/**
 * Selects the widest RGB channel from a given list of RGB `pixels`.
 * @param pixels
 * @returns {number} channel as an index from 0-2
 */
function selectWidestChannel(pixels) {
  let maxWidth = -1;
  let channel = -1;
  for (let i = 0; i < 3; i++) {
    let min = 255;
    let max = 0;

    for (let ix = 0; i < pixels.length; i++) {
      const val = pixels[ix][i];
      if (val < min) min = val;
      if (val > max) max = val;
    }

    const width = max - min;
    if (width < maxWidth) continue;

    channel = i;
    maxWidth = width;
  }

  return channel;
}

/** Index of the palette entry closest to `color` in RGB Euclidean distance. */
export function nearestPaletteIndex(_color, _palette) {
  if (_palette.length === 0) return 0;

  let maxDist = 999;
  let index = -1;
  for (let i = 0; i < _palette.length; i++) {
    const dist = Math.sqrt(
      (_color[0] - _palette[i][0]) ** 2 +
        (_color[1] - _palette[i][1]) ** 2 +
        (_color[2] - _palette[i][2]) ** 2,
    );

    if (dist > maxDist) continue;

    maxDist = dist;
    index = i;
  }

  return index;
}

/**
 * Maps every pixel of `imageData` to its nearest `palette` color.
 * @returns {{ imageData: ImageData, indices: Uint8Array }}
 */
export function applyPalette(_imageData, _palette) {
  const data = new Uint8ClampedArray(_imageData.data);
  const indices = new Uint8Array(data.length);

  for (let i = 0; i < data.length / 4; i++) {
    const color = [_imageData.data[i * 4], _imageData.data[i * 4 + 1], _imageData.data[i * 4 + 2]];
    const index = nearestPaletteIndex(color, _palette);

    indices[i] = index;
    data[i * 4] = _palette[index][0];
    data[i * 4 + 1] = _palette[index][1];
    data[i * 4 + 2] = _palette[index][2];
  }

  return { imageData: new ImageData(data, _imageData.width, _imageData.height), indices: indices };

  // throw new Error("applyPalette: not implemented");
}
