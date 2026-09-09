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

  /*
    Javascript deep copy is structuredClone.
    Uint8ClampedArray <- TypedArray <- ArrayBuffer (array can be CONST as a buffer)
    ImageData.data.slice() will create a shallow copy into a new buffer
    More explicitly you can create a new array and use .set() to copy values
    Spread Operator - const clone = [...array]
   */

  /*
  if (_imageData.width % 2 !== 0 || _imageData.height % 2 !== 0)
    throw new Error("medianCutPalette: support for odd image sizes is not implemented.");
  if (_paletteSize % 2 !== 0)
    throw new Error("medianCutPalette: support for odd palette sizes is not implemented.");
   */

  let colors = getPixelColors(_imageData);

  let channel = selectWidestChannel(_imageData);

  let median = colors[Math.trunc(colors.length / 2)]


  //console.log("Unsorted: " + JSON.stringify(colors));
  colors.sort((a, b) => a[channel] - b[channel]);

  //console.log("Sorted: " + JSON.stringify(colors));
  throw new Error("medianCutPalette: not implemented");
}

function getPixelColors(_imageData) {
  let colors = [];
  for (let i = 0; i < _imageData.data.length / 4; i++) {
    const R = _imageData.data[i];
    const G = _imageData.data[i+1];
    const B = _imageData.data[i+2]
    colors.push([R,G,B]);
  }

  return colors;
}

/**
 * Selects the widest RGB channel from a given list of RGB `pixels`.
 * @param pixels
 * @returns {number} channel as an index from 0-2
 */
function selectWidestChannel(pixels) {
  let maxWidth = -1
  let channel = -1;
  for (let i = 0; i < 3; i++) {
    let min = 255;
    let max = 0;

    for (let ix = 0; i < pixels.length; i++) {
      let val = pixels[ix][i];
      if (val < min)
        min = val;
      if (val > max)
        max = val;
    }

    const width = max-min;
    if (width < maxWidth)
      continue;

    channel = i;
    maxWidth = width;
  }

  return channel;
}

/** Index of the palette entry closest to `color` in RGB Euclidean distance. */
export function nearestPaletteIndex(_color, _palette) {

  // dist = sqrt( (r1-r2)^2 + (g1-g2)^2...
  throw new Error("nearestPaletteIndex: not implemented");
}

/**
 * Maps every pixel of `imageData` to its nearest `palette` color.
 * @returns {{ imageData: ImageData, indices: Uint8Array }}
 */
export function applyPalette(_imageData, _palette) {
  let indices = new Uint8Array(_imageData.length() % 4);

  return { imageData: _imageData, indices: indices };

  // throw new Error("applyPalette: not implemented");
}
